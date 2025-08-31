import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchingRequest {
  brief_id: string;
  min_score?: number;
  max_results?: number;
  widen?: boolean;
}

interface MatchingCandidate {
  expert_id: string;
  full_name: string;
  score: number;
  reasons: string[];
  flags: string[];
  outcome_band_min?: number;
  outcome_band_max?: number;
  tools: string[];
  certifications?: Array<{ code: string; status: string; title?: string }>;
}

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

    const { brief_id, min_score = 0.65, max_results = 5, widen = false }: MatchingRequest = await req.json();

    console.log(`Computing matches for brief ${brief_id} with min_score=${min_score}, max_results=${max_results}`);

    // Get brief details
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', brief_id)
      .single();

    if (briefError || !brief) {
      console.error('Brief not found:', briefError);
      return new Response(JSON.stringify({ 
        ok: true, 
        candidates: [],
        error: 'Brief not found' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get matching settings from admin_settings
    const { data: settingsData } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'outcome_weight', 'tools_weight', 'industry_weight', 'availability_weight', 
        'history_weight', 'cert_boost', 'tool_synonyms', 'industry_synonyms'
      ]);

    // Default weights matching specification
    const settings = settingsData?.reduce((acc, s) => ({
      ...acc,
      [s.setting_key]: s.setting_value
    }), {}) || {};

    const weights = {
      outcomes: Number(settings.outcome_weight) || 0.40,
      tools: Number(settings.tools_weight) || 0.30,
      industry: Number(settings.industry_weight) || 0.15,
      availability: Number(settings.availability_weight) || 0.10,
      history: Number(settings.history_weight) || 0.05
    };

    const certBoost = Number(settings.cert_boost) || 0.10;
    const toolSynonyms = settings.tool_synonyms || {};
    const industrySynonyms = settings.industry_synonyms || {};

    console.log('Using weights:', weights);

    // Extract requirements from brief
    const structuredBrief = brief.structured_brief || {};
    const requiredOutcomes = extractOutcomesFromBrief(structuredBrief);
    const requiredTools = extractToolsFromBrief(structuredBrief);
    const requiredIndustries = extractIndustriesFromBrief(structuredBrief);
    const budgetRange = parseBudgetRange(structuredBrief.budget?.range || '');

    console.log('Brief requirements:', { requiredOutcomes, requiredTools, requiredIndustries, budgetRange });

    // Get all freelancer profiles with related data
    const { data: freelancers, error: freelancersError } = await supabase
      .from('freelancer_profiles')
      .select(`
        *,
        profiles:profiles!inner(full_name, email),
        freelancer_certifications(
          cert_code,
          status,
          academy_certifications(title, tool_slug)
        ),
        case_studies(
          outcome_preferences,
          tools,
          industries,
          is_verified
        )
      `);

    if (freelancersError) {
      console.error('Error fetching freelancers:', freelancersError);
      return new Response(JSON.stringify({ 
        ok: true, 
        candidates: [],
        error: 'Failed to fetch freelancers' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const candidates: MatchingCandidate[] = [];

    for (const freelancer of freelancers || []) {
      const outcomeScore = calculateOutcomeScore(
        requiredOutcomes,
        freelancer.outcome_preferences || [],
        industrySynonyms
      );

      const toolsScore = calculateToolsScore(
        requiredTools,
        freelancer.tools || [],
        toolSynonyms
      );

      const industryScore = calculateIndustryScore(
        requiredIndustries,
        freelancer.industries || [],
        industrySynonyms
      );

      const availabilityScore = calculateAvailabilityScore(
        structuredBrief.timeline?.urgency || 'standard',
        freelancer.availability_weekly_hours || 40
      );

      const historyScore = calculateHistoryScore(
        requiredOutcomes,
        freelancer.case_studies || []
      );

      // Check for verified certifications
      const verifiedCerts = (freelancer.freelancer_certifications || [])
        .filter(cert => cert.status === 'verified');
      
      const certificationBonus = verifiedCerts.some(cert => 
        requiredTools.some(tool => 
          normalizeWithSynonyms(tool, toolSynonyms).includes(
            normalizeWithSynonyms(cert.academy_certifications?.tool_slug || '', toolSynonyms)
          )
        )
      ) ? certBoost : 0;

      // Calculate total score
      const totalScore = 
        weights.outcomes * outcomeScore +
        weights.tools * toolsScore +
        weights.industry * industryScore +
        weights.availability * availabilityScore +
        weights.history * historyScore +
        certificationBonus;

      if (totalScore >= min_score) {
        const reasons = [];
        const flags = [];

        // Build reasons (max 4)
        if (outcomeScore > 0.5) {
          const matchingOutcomes = requiredOutcomes.filter(ro => 
            (freelancer.outcome_preferences || []).some(fp => 
              normalizeWithSynonyms(ro, industrySynonyms).includes(normalizeWithSynonyms(fp, industrySynonyms))
            )
          );
          if (matchingOutcomes.length > 0) {
            reasons.push(`Outcome focus matches: ${matchingOutcomes.join(', ')}`);
          }
        }

        if (toolsScore > 0.5) {
          const matchingTools = requiredTools.filter(rt =>
            (freelancer.tools || []).some(ft =>
              normalizeWithSynonyms(rt, toolSynonyms).includes(normalizeWithSynonyms(ft, toolSynonyms))
            )
          );
          if (matchingTools.length > 0) {
            reasons.push(`Hands-on tools: ${matchingTools.join(', ')}`);
          }
        }

        if (industryScore > 0.5) {
          const matchingIndustries = requiredIndustries.filter(ri =>
            (freelancer.industries || []).some(fi =>
              normalizeWithSynonyms(ri, industrySynonyms).includes(normalizeWithSynonyms(fi, industrySynonyms))
            )
          );
          if (matchingIndustries.length > 0) {
            reasons.push(`Industry match: ${matchingIndustries.join(', ')}`);
          }
        }

        if (certificationBonus > 0) {
          const verifiedTools = verifiedCerts
            .map(cert => cert.academy_certifications?.tool_slug)
            .filter(Boolean);
          if (verifiedTools.length > 0) {
            reasons.push(`Verified on ${verifiedTools.join(', ')} (Teamsmiths)`);
          }
        }

        // Build flags
        if (budgetRange.max && freelancer.outcome_band_min && freelancer.outcome_band_min > budgetRange.max) {
          flags.push('Outcome band may exceed brief budget');
        }

        if (availabilityScore < 0.5) {
          flags.push('Availability < requested window');
        }

        const hasUnverifiedTools = requiredTools.some(tool =>
          (freelancer.tools || []).includes(tool) &&
          !verifiedCerts.some(cert => cert.academy_certifications?.tool_slug === tool)
        );

        if (hasUnverifiedTools) {
          flags.push('Tool familiarity is declared, not verified');
        }

        candidates.push({
          expert_id: freelancer.user_id,
          full_name: freelancer.profiles?.full_name || 'Unknown',
          score: Math.round(totalScore * 1000) / 1000,
          reasons: reasons.slice(0, 4),
          flags,
          outcome_band_min: freelancer.outcome_band_min,
          outcome_band_max: freelancer.outcome_band_max,
          tools: freelancer.tools || [],
          certifications: freelancer.freelancer_certifications?.map(cert => ({
            code: cert.cert_code,
            status: cert.status,
            title: cert.academy_certifications?.title
          })) || []
        });
      }
    }

    // Sort by score (descending) and limit results
    candidates.sort((a, b) => b.score - a.score);
    const finalCandidates = candidates.slice(0, max_results);

    // Log matching run
    await supabase.from('matching_runs').insert({
      brief_id,
      min_score,
      max_invites: max_results,
      candidates_found: finalCandidates.length,
      metadata: {
        weights,
        total_evaluated: freelancers?.length || 0,
        widen_applied: widen
      }
    });

    console.log(`Found ${finalCandidates.length} candidates for brief ${brief_id}`);

    return new Response(JSON.stringify({
      ok: true,
      candidates: finalCandidates,
      metadata: {
        total_evaluated: freelancers?.length || 0,
        candidates_found: finalCandidates.length,
        weights_used: weights
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in compute-matching:', error);
    return new Response(JSON.stringify({ 
      ok: true, 
      candidates: [],
      error: 'Internal server error' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function normalizeWithSynonyms(term: string, synonyms: Record<string, string[]>): string[] {
  const normalized = term.toLowerCase().trim();
  const result = [normalized];
  
  for (const [key, syns] of Object.entries(synonyms)) {
    if (key.toLowerCase() === normalized || syns.map(s => s.toLowerCase()).includes(normalized)) {
      result.push(key.toLowerCase(), ...syns.map(s => s.toLowerCase()));
    }
  }
  
  return [...new Set(result)];
}

function extractOutcomesFromBrief(structuredBrief: any): string[] {
  const outcomes = [];
  
  if (structuredBrief.goal?.outcome_focus) {
    outcomes.push(...structuredBrief.goal.outcome_focus);
  }
  
  if (structuredBrief.goal?.interpreted) {
    // Extract outcome keywords from goal text
    const goalText = structuredBrief.goal.interpreted.toLowerCase();
    const outcomeKeywords = [
      'sales uplift', 'lead generation', 'customer support automation',
      'ops automation', 'reporting & analytics', 'content scale-up',
      'data cleanup', 'ai enablement'
    ];
    
    outcomes.push(...outcomeKeywords.filter(keyword => goalText.includes(keyword)));
  }
  
  return [...new Set(outcomes)];
}

function extractToolsFromBrief(structuredBrief: any): string[] {
  const tools = [];
  
  if (structuredBrief.requirements?.tools) {
    tools.push(...structuredBrief.requirements.tools);
  }
  
  if (structuredBrief.technical?.tools) {
    tools.push(...structuredBrief.technical.tools);
  }
  
  return [...new Set(tools)];
}

function extractIndustriesFromBrief(structuredBrief: any): string[] {
  const industries = [];
  
  if (structuredBrief.context?.industry) {
    industries.push(structuredBrief.context.industry);
  }
  
  return [...new Set(industries)];
}

function parseBudgetRange(budgetString: string): { min?: number; max?: number } {
  const match = budgetString.match(/£?(\d+(?:,\d+)*)\s*-\s*£?(\d+(?:,\d+)*)/);
  if (match) {
    return {
      min: parseInt(match[1].replace(/,/g, '')),
      max: parseInt(match[2].replace(/,/g, ''))
    };
  }
  return {};
}

function calculateOutcomeScore(requiredOutcomes: string[], candidateOutcomes: string[], synonyms: Record<string, string[]>): number {
  if (requiredOutcomes.length === 0) return 0.5;
  
  const matches = requiredOutcomes.filter(ro =>
    candidateOutcomes.some(co =>
      normalizeWithSynonyms(ro, synonyms).some(norm =>
        normalizeWithSynonyms(co, synonyms).includes(norm)
      )
    )
  );
  
  return matches.length / requiredOutcomes.length;
}

function calculateToolsScore(requiredTools: string[], candidateTools: string[], synonyms: Record<string, string[]>): number {
  if (requiredTools.length === 0) return 0.5;
  
  const matches = requiredTools.filter(rt =>
    candidateTools.some(ct =>
      normalizeWithSynonyms(rt, synonyms).some(norm =>
        normalizeWithSynonyms(ct, synonyms).includes(norm)
      )
    )
  );
  
  return matches.length / requiredTools.length;
}

function calculateIndustryScore(requiredIndustries: string[], candidateIndustries: string[], synonyms: Record<string, string[]>): number {
  if (requiredIndustries.length === 0) return 0.5;
  
  const matches = requiredIndustries.filter(ri =>
    candidateIndustries.some(ci =>
      normalizeWithSynonyms(ri, synonyms).some(norm =>
        normalizeWithSynonyms(ci, synonyms).includes(norm)
      )
    )
  );
  
  return matches.length / requiredIndustries.length;
}

function calculateAvailabilityScore(urgency: string, weeklyHours: number): number {
  const urgencyMap = {
    'asap': 50,
    'urgent': 40,
    'standard': 30,
    'flexible': 20
  };
  
  const requiredHours = urgencyMap[urgency as keyof typeof urgencyMap] || 30;
  return Math.min(weeklyHours / requiredHours, 1);
}

function calculateHistoryScore(requiredOutcomes: string[], caseStudies: any[]): number {
  if (requiredOutcomes.length === 0 || caseStudies.length === 0) return 0;
  
  const verifiedCases = caseStudies.filter(cs => cs.is_verified);
  if (verifiedCases.length === 0) return 0;
  
  const relevantCases = verifiedCases.filter(cs =>
    requiredOutcomes.some(ro =>
      (cs.outcome_preferences || []).includes(ro)
    )
  );
  
  return relevantCases.length > 0 ? 0.5 : 0;
}