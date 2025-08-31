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
    const { tool_name, category, description, use_case } = await req.json();

    if (!tool_name || !category) {
      return new Response(
        JSON.stringify({ error: 'Tool name and category are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin_tool_suggestions table if it doesn't exist, then insert suggestion
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.admin_tool_suggestions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          suggested_by UUID NOT NULL,
          tool_name TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          use_case TEXT,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMPTZ DEFAULT now(),
          reviewed_at TIMESTAMPTZ,
          reviewed_by UUID
        );

        ALTER TABLE public.admin_tool_suggestions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS ats_insert ON public.admin_tool_suggestions;
        CREATE POLICY ats_insert ON public.admin_tool_suggestions
          FOR INSERT WITH CHECK (suggested_by = auth.uid());
          
        DROP POLICY IF EXISTS ats_select ON public.admin_tool_suggestions
          FOR SELECT USING (suggested_by = auth.uid() OR public.is_admin(auth.uid()));
      `
    });

    // Insert the suggestion
    const { data: suggestion, error: insertError } = await supabase
      .from('admin_tool_suggestions')
      .insert({
        suggested_by: user.id,
        tool_name,
        category,
        description: description || null,
        use_case: use_case || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting tool suggestion:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save tool suggestion' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a notification for admins (simple approach)
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: null, // System notification for admins
        type: 'tool_suggestion',
        title: 'New Tool Suggestion',
        message: `${tool_name} suggested for ${category} category`,
        related_id: suggestion.id
      });

    if (notificationError) {
      console.warn('Failed to create notification:', notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestion,
        message: 'Tool suggestion submitted successfully' 
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