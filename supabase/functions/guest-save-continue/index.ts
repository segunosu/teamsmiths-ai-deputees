import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveContinuePayload {
  email: string;
  crData: any; // The draft CR data to save
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

    const payload: SaveContinuePayload = await req.json();
    
    // Validation
    if (!payload.email || !payload.email.includes('@')) {
      throw new Error('Valid email address required');
    }

    if (!payload.crData) {
      throw new Error('CR data required');
    }

    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save draft CR with token
    const crData = {
      project_title: payload.crData.title || 'Draft Request',
      custom_requirements: payload.crData.description || '',
      budget_range: payload.crData.budgetTypical ? 
        `${payload.crData.budgetMin || payload.crData.budgetTypical}-${payload.crData.budgetMax || payload.crData.budgetTypical}` : 
        null,
      timeline_preference: payload.crData.desiredStartDate || null,
      urgency_level: 'standard',
      user_id: null, // Guest
      contact_email: payload.email,
      status: 'draft',
      additional_context: JSON.stringify({
        ...payload.crData,
        saveToken: token,
        tokenExpiresAt: expiresAt.toISOString()
      })
    };

    const { data: cr, error: crError } = await supabase
      .from('customization_requests')
      .insert(crData)
      .select()
      .single();

    if (crError) {
      console.error('Error saving draft CR:', crError);
      throw new Error('Failed to save draft');
    }

    // Generate continue URL
    const continueUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/continue?token=${token}&cr=${cr.id}`;

    // Send email (in production, this would integrate with your email service)
    console.log('Save & Continue email would be sent to:', payload.email);
    console.log('Continue URL:', continueUrl);
    console.log('Token expires:', expiresAt);

    // For demo purposes, we'll simulate email sending
    // In production, integrate with SendGrid, Mailgun, etc.
    const emailData = {
      to: payload.email,
      subject: 'Continue Your Custom Quote Request',
      html: `
        <h2>Continue Your Request</h2>
        <p>You started a custom quote request but didn't finish. Click the link below to continue where you left off:</p>
        <p><a href="${continueUrl}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Continue My Request</a></p>
        <p>This link expires in 7 days.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `
    };

    // In production, send actual email here
    // await sendEmail(emailData);

    console.log('Draft CR saved successfully:', {
      crId: cr.id,
      email: payload.email,
      token: token.substring(0, 8) + '...' // Log partial token for debugging
    });

    return new Response(
      JSON.stringify({
        success: true,
        crId: cr.id,
        message: 'Draft saved successfully. Check your email for a link to continue.',
        expiresAt: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Save & Continue error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'SAVE_CONTINUE_FAILED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});