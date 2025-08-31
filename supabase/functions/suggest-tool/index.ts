import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ToolSuggestionRequest {
  tool_name: string;
  rationale?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { tool_name, rationale }: ToolSuggestionRequest = await req.json();

    if (!tool_name) {
      throw new Error('Tool name is required');
    }

    console.log(`Tool suggestion from user ${user.id}: ${tool_name}`);

    // Check if this tool already exists
    const { data: existingTool } = await supabase
      .from('tools_master')
      .select('id')
      .ilike('name', tool_name)
      .single();

    if (existingTool) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'Tool already exists in our catalog'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already suggested this tool
    const { data: existingSuggestion } = await supabase
      .from('admin_tool_suggestions')
      .select('id')
      .eq('user_id', user.id)
      .ilike('tool_name', tool_name)
      .single();

    if (existingSuggestion) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'You have already suggested this tool'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert the suggestion
    const { data, error } = await supabase
      .from('admin_tool_suggestions')
      .insert({
        user_id: user.id,
        tool_name: tool_name.trim(),
        rationale: rationale?.trim(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting tool suggestion:', error);
      throw new Error('Failed to submit suggestion');
    }

    console.log(`Tool suggestion submitted successfully: ${data.id}`);

    return new Response(JSON.stringify({
      ok: true,
      suggestion_id: data.id,
      message: 'Thank you for your suggestion! Our team will review it.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in suggest-tool function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});