import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all matching-related settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'outcome_weight',
        'tools_weight', 
        'industry_weight',
        'availability_weight',
        'history_weight',
        'min_score_default',
        'max_invites_default',
        'cert_boost',
        'boost_verified_certs',
        'normalize_region_rates',
        'hide_hourly_rates',
        'tool_synonyms',
        'industry_synonyms'
      ]);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert to object with defaults
    const settings = settingsData?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, any>) || {};

    // Apply defaults for missing values
    const defaults = {
      outcome_weight: 0.40,
      tools_weight: 0.30,
      industry_weight: 0.15,
      availability_weight: 0.10,
      history_weight: 0.05,
      min_score_default: 0.65,
      max_invites_default: 5,
      cert_boost: 0.10,
      boost_verified_certs: true,
      normalize_region_rates: true,
      hide_hourly_rates: true,
      tool_synonyms: {},
      industry_synonyms: {}
    };

    const finalSettings = { ...defaults, ...settings };

    console.log('Retrieved matching settings for admin');

    return new Response(JSON.stringify({
      success: true,
      settings: finalSettings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-get-matching-settings:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});