import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

// Schema validation for proposals
const ProposalZ = {
  parse: (data: any) => {
    // Validate required fields
    if (!Array.isArray(data.roles) || data.roles.length === 0) {
      throw new Error('Invalid roles');
    }
    if (!Array.isArray(data.milestones) || data.milestones.length < 3) {
      throw new Error('Invalid milestones - need at least 3');
    }
    if (typeof data.timeline_weeks !== 'number' || data.timeline_weeks <= 0) {
      throw new Error('Invalid timeline_weeks');
    }
    if (typeof data.budget_band !== 'string' || data.budget_band.length === 0) {
      throw new Error('Invalid budget_band');
    }
    if (!Array.isArray(data.success_metrics) || data.success_metrics.length === 0) {
      throw new Error('Invalid success_metrics');
    }
    
    // Validate milestone structure
    data.milestones.forEach((m: any, i: number) => {
      if (typeof m.title !== 'string' || m.title.length === 0) {
        throw new Error(`Invalid milestone ${i} title`);
      }
      if (!Array.isArray(m.outcomes) || m.outcomes.length === 0) {
        throw new Error(`Invalid milestone ${i} outcomes`);
      }
      if (typeof m.eta_days !== 'number' || m.eta_days <= 0) {
        throw new Error(`Invalid milestone ${i} eta_days`);
      }
    });
    
    return data;
  }
};

// Fallback proposal when AI generation fails
function createFallbackProposal() {
  return {
    roles: ["Business Consultant", "Project Manager"],
    timeline_weeks: 4,
    budget_band: "£6k–£10k",
    success_metrics: [
      "Clear project roadmap delivered",
      "Key stakeholders aligned",
      "Success criteria defined"
    ],
    milestones: [
      {
        title: "Discovery & Requirements",
        outcomes: [
          "Stakeholder interviews completed",
          "Requirements document finalized",
          "Success criteria defined"
        ],
        eta_days: 7
      },
      {
        title: "Strategy & Planning",
        outcomes: [
          "Strategic plan developed",
          "Implementation roadmap created",
          "Resource requirements identified"
        ],
        eta_days: 10
      },
      {
        title: "Implementation & Handover",
        outcomes: [
          "Initial implementation completed",
          "Team training delivered",
          "Documentation and handover completed"
        ],
        eta_days: 10
      }
    ],
    assured_addon_note: "QA + replacement eligibility; ~12% uplift"
  };
}

// Repair function to fix incomplete proposals
function repairProposal(rawProposal: any) {
  const fallback = createFallbackProposal();
  
  return {
    roles: Array.isArray(rawProposal.roles) && rawProposal.roles.length > 0 
      ? rawProposal.roles 
      : fallback.roles,
    timeline_weeks: typeof rawProposal.timeline_weeks === 'number' && rawProposal.timeline_weeks > 0
      ? rawProposal.timeline_weeks
      : fallback.timeline_weeks,
    budget_band: typeof rawProposal.budget_band === 'string' && rawProposal.budget_band.length > 0
      ? rawProposal.budget_band
      : fallback.budget_band,
    success_metrics: Array.isArray(rawProposal.success_metrics) && rawProposal.success_metrics.length > 0
      ? rawProposal.success_metrics
      : fallback.success_metrics,
    milestones: Array.isArray(rawProposal.milestones) && rawProposal.milestones.length >= 3
      ? rawProposal.milestones.map((m: any) => ({
          title: typeof m.title === 'string' && m.title.length > 0 ? m.title : 'Project Milestone',
          outcomes: Array.isArray(m.outcomes) && m.outcomes.length > 0 ? m.outcomes : ['Outcome to be defined'],
          eta_days: typeof m.eta_days === 'number' && m.eta_days > 0 ? m.eta_days : 7
        }))
      : fallback.milestones,
    assured_addon_note: rawProposal.assured_addon_note || fallback.assured_addon_note
  };
}

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

CRITICAL: You must respond with valid JSON only. Do not include any markdown formatting, explanations, or text outside the JSON.

Required JSON format:
{
  "roles": ["Role 1", "Role 2"],
  "milestones": [
    {
      "title": "Discovery & Research",
      "outcomes": ["Stakeholder interviews completed", "Requirements gathered", "Success criteria defined"],
      "eta_days": 7
    },
    {
      "title": "Strategy Development",
      "outcomes": ["Strategic plan developed", "Implementation roadmap created", "Resource requirements identified"],
      "eta_days": 10
    },
    {
      "title": "Implementation",
      "outcomes": ["Solution implemented", "Testing completed", "Documentation delivered"],
      "eta_days": 14
    }
  ],
  "timeline_weeks": 6,
  "budget_band": "£6k–£10k",
  "success_metrics": ["Metric 1", "Metric 2", "Metric 3"],
  "assured_addon_note": "QA + replacement eligibility; ~12% uplift"
}

Requirements:
- Include exactly 1-3 expert roles based on the brief requirements
- Create exactly 3-5 milestones with specific, actionable outcomes (minimum 3 outcomes per milestone)
- Each milestone must have a realistic eta_days (5-21 days)
- Total timeline_weeks should be 2-12 weeks
- Use these budget bands only: £1k-£3k, £3k-£6k, £6k-£10k, £10k-£15k, £15k+
- Include 3-5 specific, measurable success metrics
- Keep assured_addon_note exactly as shown above`;

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

    // Parse and validate the JSON response
    let proposalJson;
    try {
      // Clean the response text to extract only JSON
      let cleanResponse = proposalText.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      proposalJson = JSON.parse(cleanResponse);
      console.log('Parsed proposal JSON:', proposalJson);
      
      // Validate the proposal structure
      try {
        proposalJson = ProposalZ.parse(proposalJson);
      } catch (validationError) {
        console.warn('Proposal validation failed, attempting repair:', validationError);
        proposalJson = repairProposal(proposalJson);
        console.log('Repaired proposal:', proposalJson);
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', proposalText);
      console.log('Using fallback proposal due to parse error');
      proposalJson = createFallbackProposal();
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