import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const {
      practical_skills,
      tools,
      outcome_preferences,
      outcome_band_min,
      outcome_band_max,
      locales,
      industries,
      availability_weekly_hours,
      certifications
    } = requestData;

    // Upsert freelancer profile with proper conflict handling
    const { data: profile, error: profileError } = await supabase
      .from('freelancer_profiles')
      .upsert({
        user_id: user.id,
        practical_skills: practical_skills || [],
        tools: tools || [],
        outcome_preferences: outcome_preferences || [],
        outcome_band_min,
        outcome_band_max,
        locales: locales || [],
        industries: industries || [],
        availability_weekly_hours: availability_weekly_hours || 40,
        price_band_min: requestData.price_band_min || null,
        price_band_max: requestData.price_band_max || null,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error saving freelancer profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to save profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle certifications if provided
    if (certifications && Array.isArray(certifications)) {
      for (const cert of certifications) {
        const { data: existingCert } = await supabase
          .from('freelancer_certifications')
          .select('id')
          .eq('user_id', user.id)
          .eq('cert_code', cert.cert_code)
          .single();

        if (!existingCert) {
          await supabase
            .from('freelancer_certifications')
            .insert({
              user_id: user.id,
              cert_code: cert.cert_code,
              status: 'declared',
              evidence_url: cert.evidence_url
            });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile,
        message: 'Profile saved successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});