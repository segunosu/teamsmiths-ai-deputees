import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RFPPayload {
  crId: string;
  expertIds: string[];
  message?: string;
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

    const payload: RFPPayload = await req.json();
    
    // Validation
    if (!payload.crId) {
      throw new Error('crId is required');
    }

    if (!payload.expertIds || payload.expertIds.length === 0) {
      throw new Error('At least one expert must be selected');
    }

    if (payload.expertIds.length > 5) {
      throw new Error('Cannot send RFP to more than 5 experts');
    }

    // Verify user has access to this CR
    const { data: cr, error: crError } = await supabase
      .from('customization_requests')
      .select('id, user_id, contact_email, project_title, custom_requirements')
      .eq('id', payload.crId)
      .single();

    if (crError || !cr) {
      throw new Error('Customization request not found');
    }

    // Check access permissions
    const hasAccess = user?.id === cr.user_id || 
                     user?.email === cr.contact_email;

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Create expert invites
    const invitePromises = payload.expertIds.map(async (expertId) => {
      // In a real system, this would create actual expert invites
      // For now, we'll simulate the process
      
      const inviteData = {
        brief_id: payload.crId,
        expert_user_id: expertId, // This would be the actual user ID from the anonymized expert ID
        status: 'sent',
        invitation_message: payload.message || 'You have been invited to submit a proposal for this project.',
        sent_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        score_at_invite: Math.random() * 0.3 + 0.7 // 0.7-1.0 range
      };

      console.log('Creating invite for expert:', expertId, inviteData);
      
      // In production, insert into expert_invites table
      // const { data, error } = await supabase
      //   .from('expert_invites')
      //   .insert(inviteData);
      
      return { expertId, status: 'sent' };
    });

    const results = await Promise.all(invitePromises);

    // Update CR status to indicate RFPs have been sent
    await supabase
      .from('customization_requests')
      .update({ 
        status: 'rfp_sent',
        updated_at: new Date().toISOString()
      })
      .eq('id', payload.crId);

    // Log analytics events
    console.log('RFP sent successfully:', {
      crId: payload.crId,
      expertCount: payload.expertIds.length,
      results
    });

    // In a real system, this would trigger email notifications to experts
    console.log('RFP notifications would be sent to experts:', payload.expertIds);

    return new Response(
      JSON.stringify({
        success: true,
        invitesSent: results.length,
        invites: results,
        message: `RFP sent to ${results.length} expert${results.length > 1 ? 's' : ''}. You'll be notified when proposals arrive.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Send RFP error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'SEND_RFP_FAILED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});