import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchingRequest {
  brief_id: string;
  min_score?: number;
  max_invites?: number;
  widen?: boolean;
}

interface MatchingCandidate {
  expert_id: string;
  score: number;
  reasons: string[];
  flags: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { brief_id, min_score = 0.65, max_invites = 5, widen = false }: MatchingRequest = await req.json();

    console.log(`Computing matches for brief ${brief_id} with min_score=${min_score}, max_invites=${max_invites}`);

    // Fetch brief details
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', brief_id)
      .single();

    if (briefError || !brief) {
      throw new Error(`Brief not found: ${briefError?.message}`);
    }

    // Fetch admin settings for weights and synonyms
    const { data: settings, error: settingsError } = await supabase.rpc('admin_get_matching_settings');
    
    if (settingsError) {
      console.error('Settings error:', settingsError);
    }

    const weights = {
      outcomes: 0.40,
      tools: 0.30,
      industries: 0.15,
      availability: 0.10,
      history: 0.05,
      cert_bonus: 0.10,
      ...settings
    };

    const toolSynonyms = settings?.tool_synonyms || {};
    const industrySynonyms = settings?.industry_synonyms || {};

    // Extract requirements from brief
    const outcomes = extractOutcomesFromBrief(brief);
    const tools = extractToolsFromBrief(brief);
    const industries = extractIndustriesFromBrief(brief);
    const budgetRange = parseBudgetRange(brief.budget_range);

    console.log(`Brief requirements - Outcomes: ${outcomes.length}, Tools: ${tools.length}, Industries: ${industries.length}`);

    // Fetch all experts with their data using service role
    const { data: experts, error: expertsError } = await supabase
      .from('v_experts')
      .select('*');

    if (expertsError) {
      console.error('Error fetching experts:', expertsError);
      throw new Error(`Failed to fetch experts: ${expertsError.message}`);
    }

    // Also fetch certifications and case studies for scoring
    const { data: certifications } = await supabase
      .from('freelancer_certifications')
      .select('user_id, cert_code, status')
      .eq('status', 'verified');

    const { data: caseStudies } = await supabase
      .from('case_studies')
      .select('user_id, tools, industries, is_verified')
      .eq('is_verified', true);

    // Group by user_id for efficient lookup
    const certsByUser = new Map<string, string[]>();
    certifications?.forEach(cert => {
      if (!certsByUser.has(cert.user_id)) {
        certsByUser.set(cert.user_id, []);
      }
      certsByUser.get(cert.user_id)?.push(cert.cert_code);
    });

    const caseStudiesByUser = new Map<string, any[]>();
    caseStudies?.forEach(cs => {
      if (!caseStudiesByUser.has(cs.user_id)) {
        caseStudiesByUser.set(cs.user_id, []);
      }
      caseStudiesByUser.get(cs.user_id)?.push(cs);
    });

    const candidates: MatchingCandidate[] = [];

    // Score each expert
    for (const expert of experts || []) {
      try {
        const reasons: string[] = [];
        const flags: string[] = [];
        
        // Calculate individual scores
        const outcomeScore = calculateOutcomeScore(outcomes, expert.outcome_preferences || [], toolSynonyms);
        const toolsScore = calculateToolsScore(tools, [...(expert.tools || []), ...(expert.practical_skills || [])], toolSynonyms);
        const industryScore = calculateIndustryScore(industries, expert.industries || [], industrySynonyms);
        const availabilityScore = calculateAvailabilityScore(expert.availability_weekly_hours, brief.urgency_level);
        const historyScore = calculateHistoryScore(caseStudiesByUser.get(expert.expert_id) || [], outcomes, tools);
        
        // Calculate weighted total
        let totalScore = (
          outcomeScore * weights.outcomes +
          toolsScore * weights.tools +
          industryScore * weights.industries +
          availabilityScore * weights.availability +
          historyScore * weights.history
        );

        // Add certification bonus
        const expertCerts = certsByUser.get(expert.expert_id) || [];
        let certBonus = 0;
        if (expertCerts.length > 0 && settings?.boost_verified_certs) {
          certBonus = Math.min(expertCerts.length * 0.05, weights.cert_bonus);
          totalScore = Math.min(1.0, totalScore + certBonus);
        }

        // Generate reasons
        if (outcomeScore > 0.5) {
          const matchedOutcomes = outcomes.filter(outcome => 
            expert.outcome_preferences?.some(pref => 
              normalizeWithSynonyms(outcome, toolSynonyms).toLowerCase().includes(
                normalizeWithSynonyms(pref, toolSynonyms).toLowerCase()
              )
            )
          );
          if (matchedOutcomes.length > 0) {
            reasons.push(`Outcome fit: ${matchedOutcomes.slice(0, 2).join(', ')}`);
          }
        }

        if (toolsScore > 0.5) {
          const matchedTools = tools.filter(tool =>
            [...(expert.tools || []), ...(expert.practical_skills || [])].some(expertTool =>
              normalizeWithSynonyms(tool, toolSynonyms).toLowerCase().includes(
                normalizeWithSynonyms(expertTool, toolSynonyms).toLowerCase()
              )
            )
          );
          if (matchedTools.length > 0) {
            reasons.push(`Tools: ${matchedTools.slice(0, 3).join(', ')}`);
          }
        }

        if (availabilityScore > 0.5) {
          reasons.push(`Availability OK`);
        }

        if (certBonus > 0) {
          reasons.push(`${expertCerts.length} verified cert${expertCerts.length > 1 ? 's' : ''}`);
        }

        // Generate flags
        if (budgetRange.min && expert.outcome_band_min && expert.outcome_band_min > budgetRange.max) {
          flags.push('Budget band misaligned');
        }

        if (outcomes.length > 0 && outcomeScore < 0.3) {
          flags.push('Limited outcome match');
        }

        if (tools.length > 0 && toolsScore < 0.3) {
          const missingTools = tools.filter(tool =>
            ![...(expert.tools || []), ...(expert.practical_skills || [])].some(expertTool =>
              normalizeWithSynonyms(tool, toolSynonyms).toLowerCase().includes(
                normalizeWithSynonyms(expertTool, toolSynonyms).toLowerCase()
              )
            )
          );
          if (missingTools.length > 0) {
            flags.push(`Missing: ${missingTools.slice(0, 2).join(', ')}`);
          }
        }

        // Only include if meets minimum score
        if (totalScore >= min_score) {
          candidates.push({
            expert_id: expert.expert_id,
            score: Math.round(totalScore * 100) / 100,
            reasons: reasons.slice(0, 3), // Limit to top 3 reasons
            flags: flags.slice(0, 2)     // Limit to top 2 flags
          });
        }

      } catch (error) {
        console.error(`Error scoring expert ${expert.expert_id}:`, error);
        continue;
      }
    }

    // Sort by score descending and limit results
    const sortedCandidates = candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, max_invites);

    console.log(`Found ${candidates.length} eligible candidates, returning top ${sortedCandidates.length}`);

    // Log the matching run
    await supabase
      .from('matching_runs')
      .insert({
        brief_id,
        candidates_found: sortedCandidates.length,
        min_score,
        max_invites,
        metadata: { 
          total_experts: experts?.length || 0,
          weights,
          widen_applied: widen
        }
      });

    return new Response(JSON.stringify({
      ok: true,
      brief_id,
      candidates: sortedCandidates,
      metadata: {
        total_evaluated: experts?.length || 0,
        candidates_found: sortedCandidates.length,
        min_score_used: min_score
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in compute-matches function:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions
function normalizeWithSynonyms(term: string, synonyms: Record<string, string[]>): string {
  const normalized = term.toLowerCase().trim();
  
  // Check if any synonym maps to this term
  for (const [key, values] of Object.entries(synonyms)) {
    if (values.some(v => v.toLowerCase() === normalized)) {
      return key.toLowerCase();
    }
    if (key.toLowerCase() === normalized) {
      return key.toLowerCase();
    }
  }
  
  return normalized;
}

function extractOutcomesFromBrief(brief: any): string[] {
  const outcomes: string[] = [];
  
  if (brief.structured_brief?.outcomes) {
    outcomes.push(...brief.structured_brief.outcomes);
  }
  
  // Extract from other fields using keyword matching
  const outcomeKeywords = [
    'Sales Uplift', 'Lead Gen', 'Support Automation', 'Back-Office Automation',
    'Marketing Content', 'Ops Efficiency', 'Data Extraction', 'Recruiting',
    'Finance Automation', 'Knowledge Base', 'Sales Playbooks', 'Quality Assurance'
  ];
  
  const briefText = `${brief.project_title || ''} ${JSON.stringify(brief.structured_brief || {})}`.toLowerCase();
  
  outcomeKeywords.forEach(keyword => {
    if (briefText.includes(keyword.toLowerCase())) {
      outcomes.push(keyword);
    }
  });
  
  return [...new Set(outcomes)];
}

function extractToolsFromBrief(brief: any): string[] {
  const tools: string[] = [];
  
  if (brief.structured_brief?.tools) {
    tools.push(...brief.structured_brief.tools);
  }
  
  // Extract from text using common tool names
  const toolKeywords = [
    'N8N', 'MCP', 'OpenAI', 'Anthropic', 'Claude', 'GPT', 'ElevenLabs',
    'Whisper', 'Pinecone', 'LangChain', 'Supabase', 'Airtable', 'Zapier',
    'Make', 'Retool', 'Bubble'
  ];
  
  const briefText = `${brief.project_title || ''} ${JSON.stringify(brief.structured_brief || {})}`.toLowerCase();
  
  toolKeywords.forEach(tool => {
    if (briefText.includes(tool.toLowerCase())) {
      tools.push(tool);
    }
  });
  
  return [...new Set(tools)];
}

function extractIndustriesFromBrief(brief: any): string[] {
  const industries: string[] = [];
  
  if (brief.structured_brief?.industries) {
    industries.push(...brief.structured_brief.industries);
  }
  
  return [...new Set(industries)];
}

function parseBudgetRange(budgetRange: string | null): { min: number; max: number } {
  if (!budgetRange) return { min: 0, max: Infinity };
  
  const matches = budgetRange.match(/[\d,]+/g);
  if (!matches) return { min: 0, max: Infinity };
  
  const numbers = matches.map(m => parseInt(m.replace(/,/g, '')));
  
  return {
    min: numbers[0] || 0,
    max: numbers[1] || numbers[0] || Infinity
  };
}

function calculateOutcomeScore(briefOutcomes: string[], expertOutcomes: string[], synonyms: Record<string, string[]>): number {
  if (briefOutcomes.length === 0 || expertOutcomes.length === 0) return 0;
  
  let matches = 0;
  briefOutcomes.forEach(briefOutcome => {
    const normalizedBrief = normalizeWithSynonyms(briefOutcome, synonyms);
    const hasMatch = expertOutcomes.some(expertOutcome => {
      const normalizedExpert = normalizeWithSynonyms(expertOutcome, synonyms);
      return normalizedBrief === normalizedExpert || 
             normalizedBrief.includes(normalizedExpert) ||
             normalizedExpert.includes(normalizedBrief);
    });
    if (hasMatch) matches++;
  });
  
  return Math.min(1.0, matches / briefOutcomes.length);
}

function calculateToolsScore(briefTools: string[], expertTools: string[], synonyms: Record<string, string[]>): number {
  if (briefTools.length === 0) return 1; // No specific tools required
  if (expertTools.length === 0) return 0;
  
  let matches = 0;
  briefTools.forEach(briefTool => {
    const normalizedBrief = normalizeWithSynonyms(briefTool, synonyms);
    const hasMatch = expertTools.some(expertTool => {
      const normalizedExpert = normalizeWithSynonyms(expertTool, synonyms);
      return normalizedBrief === normalizedExpert || 
             normalizedBrief.includes(normalizedExpert) ||
             normalizedExpert.includes(normalizedBrief);
    });
    if (hasMatch) matches++;
  });
  
  return Math.min(1.0, matches / briefTools.length);
}

function calculateIndustryScore(briefIndustries: string[], expertIndustries: string[], synonyms: Record<string, string[]>): number {
  if (briefIndustries.length === 0) return 1; // No specific industry required
  if (expertIndustries.length === 0) return 0.5; // Neutral if expert has no industry specified
  
  let matches = 0;
  briefIndustries.forEach(briefIndustry => {
    const normalizedBrief = normalizeWithSynonyms(briefIndustry, synonyms);
    const hasMatch = expertIndustries.some(expertIndustry => {
      const normalizedExpert = normalizeWithSynonyms(expertIndustry, synonyms);
      return normalizedBrief === normalizedExpert || 
             normalizedBrief.includes(normalizedExpert) ||
             normalizedExpert.includes(normalizedBrief);
    });
    if (hasMatch) matches++;
  });
  
  return Math.min(1.0, matches / briefIndustries.length);
}

function calculateAvailabilityScore(weeklyHours: number | null, urgency: string | null): number {
  if (!weeklyHours) return 0.5; // Neutral if not specified
  
  const urgencyThresholds = {
    'urgent': 30,
    'standard': 20,
    'flexible': 10
  };
  
  const threshold = urgencyThresholds[urgency?.toLowerCase() as keyof typeof urgencyThresholds] || 20;
  
  return weeklyHours >= threshold ? 1.0 : Math.max(0.2, weeklyHours / threshold);
}

function calculateHistoryScore(caseStudies: any[], briefOutcomes: string[], briefTools: string[]): number {
  if (caseStudies.length === 0) return 0.3; // Neutral score for no case studies
  
  let relevantCases = 0;
  
  caseStudies.forEach(cs => {
    const hasRelevantOutcome = briefOutcomes.some(outcome =>
      cs.industries?.some((industry: string) => 
        industry.toLowerCase().includes(outcome.toLowerCase())
      )
    );
    
    const hasRelevantTool = briefTools.some(tool =>
      cs.tools?.some((csTool: string) => 
        csTool.toLowerCase().includes(tool.toLowerCase()) ||
        tool.toLowerCase().includes(csTool.toLowerCase())
      )
    );
    
    if (hasRelevantOutcome || hasRelevantTool) {
      relevantCases++;
    }
  });
  
  return Math.min(1.0, 0.3 + (relevantCases / caseStudies.length) * 0.7);
}