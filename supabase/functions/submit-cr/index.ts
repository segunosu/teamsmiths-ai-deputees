import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CRPayload {
  title: string;
  description: string;
  deliverables?: Array<{ title: string }>;
  milestones?: Array<{
    name: string;
    durationDays?: number;
    acceptanceCriteria?: string;
    paymentPercent?: number;
  }>;
  budgetMin?: number;
  budgetTypical?: number;
  budgetMax?: number;
  requiredSkills?: string[];
  desiredStartDate?: string;
  attachments?: string[];
  anonymityFlag?: boolean;
  guestEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    const payload: CRPayload = await req.json();
    
    // Validation
    if (!payload.title || payload.title.length < 5 || payload.title.length > 120) {
      throw new Error('Title must be between 5-120 characters');
    }
    
    if (!payload.description || payload.description.length < 20 || payload.description.length > 2000) {
      throw new Error('Description must be between 20-2000 characters');
    }

    // Validate milestone payment percentages sum to ≤100
    if (payload.milestones?.length) {
      const totalPercent = payload.milestones
        .filter(m => m.paymentPercent)
        .reduce((sum, m) => sum + (m.paymentPercent || 0), 0);
      
      if (totalPercent > 100) {
        throw new Error('Milestone payment percentages cannot exceed 100%');
      }
    }

    // Validate budget range
    if (payload.budgetMin && payload.budgetTypical && payload.budgetMax) {
      if (payload.budgetMin > payload.budgetTypical || payload.budgetTypical > payload.budgetMax) {
        throw new Error('Budget range must be: min ≤ typical ≤ max');
      }
    }

    // For guests, require email
    if (!user && !payload.guestEmail) {
      throw new Error('Email required for guest submissions');
    }

    // Create customization request
    const crData = {
      project_title: payload.title,
      custom_requirements: payload.description,
      budget_range: payload.budgetTypical ? 
        `${payload.budgetMin || payload.budgetTypical}-${payload.budgetMax || payload.budgetTypical}` : 
        null,
      timeline_preference: payload.desiredStartDate || null,
      urgency_level: 'standard',
      user_id: user?.id || null,
      contact_email: payload.guestEmail || user?.email || '',
      status: 'submitted',
      additional_context: JSON.stringify({
        deliverables: payload.deliverables || [],
        milestones: payload.milestones || [],
        requiredSkills: payload.requiredSkills || [],
        anonymityFlag: payload.anonymityFlag ?? true,
        attachments: payload.attachments || []
      })
    };

    const { data: cr, error: crError } = await supabase
      .from('customization_requests')
      .insert(crData)
      .select()
      .single();

    if (crError) {
      console.error('Error creating CR:', crError);
      throw new Error('Failed to create customization request');
    }

    console.log('Created CR:', cr.id);

    // Trigger auto-matching by calling compute-matches function
    const { data: matchData, error: matchError } = await supabase.functions.invoke('compute-matches', {
      body: { briefId: cr.id }
    });

    if (matchError) {
      console.error('Error triggering matching:', matchError);
      // Don't fail the request - matching can be retried
    }

    const matchJobId = matchData?.jobId || `job_${cr.id}`;

    // Log analytics event
    console.log('CR submitted successfully:', {
      crId: cr.id,
      userType: user ? 'user' : 'guest',
      matchJobId
    });

    return new Response(
      JSON.stringify({
        crId: cr.id,
        matchJobId,
        status: 'submitted'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Submit CR error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'SUBMIT_CR_FAILED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});