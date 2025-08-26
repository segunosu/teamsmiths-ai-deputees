import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  if (!openAIApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing required environment variables');
    return new Response('Server configuration error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { brief_id } = await req.json();

    if (!brief_id) {
      return new Response('brief_id is required', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    console.log('Building proposal for brief:', brief_id);

    // Fetch the brief
    const { data: brief, error: fetchError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', brief_id)
      .single();

    if (fetchError || !brief) {
      console.error('Error fetching brief:', fetchError);
      return new Response('Brief not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Check if proposal already exists (idempotency)
    if (brief.proposal_json) {
      console.log('Proposal already exists for brief:', brief_id);
      return new Response(JSON.stringify({ 
        status: 'already_exists',
        proposal: brief.proposal_json 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const structuredBrief = brief.structured_brief || {};

    // Build prompt for OpenAI
    const systemPrompt = `You are Deputee™ AI, an expert proposal generator. Generate a structured proposal based on the client's brief.

You must respond with valid JSON in this exact format:
{
  "roles": ["Role 1", "Role 2"],
  "milestones": [
    {
      "title": "Milestone Name",
      "outcomes": ["Outcome 1", "Outcome 2"],
      "eta_days": 5
    }
  ],
  "timeline_weeks": 4,
  "budget_band": "£6k–£10k",
  "success_metrics": ["Metric 1", "Metric 2"],
  "assured_addon_note": "QA + replacement eligibility; ~12% uplift"
}

Guidelines:
- Suggest 1-3 expert roles based on the brief
- Create 3-5 milestones with realistic timelines
- Total timeline should be 2-12 weeks
- Budget bands: £1k-£3k, £3k-£6k, £6k-£10k, £10k-£15k, £15k+
- Include 3-5 success metrics
- Keep assured_addon_note consistent`;

    const userPrompt = `Client Brief Analysis:
Goal: ${structuredBrief.goal?.interpreted || 'Not specified'}
Context: ${structuredBrief.context?.interpreted || 'Not specified'}  
Constraints: ${structuredBrief.constraints?.interpreted || 'Not specified'}
Timeline: ${structuredBrief.timeline || 'Not specified'}
Budget Range: ${structuredBrief.budget_range || 'Not specified'}
Urgency: ${structuredBrief.urgency || 'Standard'}
Expert Style: ${structuredBrief.expert_style || 'Collaborative'}

Generate a proposal that addresses their specific needs.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const openAIData = await response.json();
    const proposalText = openAIData.choices[0].message.content;

    // Parse the JSON response
    let proposalJson;
    try {
      proposalJson = JSON.parse(proposalText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', proposalText);
      throw new Error('Invalid JSON response from AI');
    }

    // Update the brief with the proposal
    const { error: updateError } = await supabase
      .from('briefs')
      .update({
        proposal_json: proposalJson,
        status: 'proposal_ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', brief_id);

    if (updateError) {
      console.error('Error updating brief with proposal:', updateError);
      throw updateError;
    }

    // Insert brief event
    await supabase
      .from('brief_events')
      .insert({
        brief_id: brief_id,
        type: 'proposal_generated',
        payload: {
          model: 'gpt-4o-mini',
          roles_count: proposalJson.roles?.length || 0,
          milestones_count: proposalJson.milestones?.length || 0,
          timeline_weeks: proposalJson.timeline_weeks
        }
      });

    console.log('Proposal generated successfully for brief:', brief_id);

    // TODO: Send "Proposal Ready" email
    // This would call another edge function to send the email notification

    return new Response(JSON.stringify({ 
      status: 'success',
      proposal: proposalJson 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in build-proposal function:', error);
    
    // Insert error event
    try {     
      await supabase
        .from('brief_events')
        .insert({
          brief_id: req.json().then(body => body.brief_id).catch(() => 'unknown'),
          type: 'proposal_generation_failed',
          payload: {
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
    } catch (eventError) {
      console.error('Failed to log error event:', eventError);
    }

    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});