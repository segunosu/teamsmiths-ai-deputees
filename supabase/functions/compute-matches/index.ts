import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchingRequest {
  brief_id: string;
  min_score?: number;
  max_results?: number;
  widen?: {
    tools?: boolean;
    industry?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { brief_id, min_score = 0.65, max_results = 5, widen }: MatchingRequest = await req.json();

    console.log(`Computing matches for brief ${brief_id}, min_score: ${min_score}, max_results: ${max_results}`);

    // Get the brief details
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", brief_id)
      .single();

    if (briefError || !brief) {
      return new Response(JSON.stringify({
        status: "error",
        message: "Brief not found",
        debug_id: brief_id
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all experts using the resilient view
    const { data: freelancers, error: freelancersError } = await supabase
      .from("v_experts")
      .select("*");

    if (freelancersError) {
      return new Response(JSON.stringify({
        status: "error",
        message: `Failed to fetch experts: ${freelancersError.message}`,
        debug_id: brief_id
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${freelancers?.length || 0} experts to evaluate`);

    // Extract brief context from structured_brief
    const structuredBrief = brief.structured_brief || {};
    const requestSkills = extractSkillsFromText(
      [
        structuredBrief.goal?.interpreted || '',
        structuredBrief.context?.interpreted || '',
        structuredBrief.constraints?.interpreted || ''
      ].join(' ')
    );
    
    // Apply widening if requested
    if (widen?.tools) {
      requestSkills.push(...['automation', 'integration', 'api', 'workflow']);
    }

    const requestBudget = parseBudgetRange(structuredBrief.budget_range || '');
    const requestIndustries = extractIndustriesFromText(
      [
        structuredBrief.goal?.interpreted || '',
        structuredBrief.context?.interpreted || ''
      ].join(' ')
    );

    // Get matching weights
    const { data: adminSettings } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "matching_config")
      .single();

    const config = adminSettings?.setting_value || {};
    const weights = config.matching_weights || {
      skills: 0.25,
      domain: 0.15,
      outcomes: 0.20,
      availability: 0.15,
      locale: 0.05,
      price: 0.10,
      vetting: 0.07,
      history: 0.03
    };

    // Score each freelancer
    const scoredCandidates = freelancers?.map((freelancer: any) => {
      const scores = {
        skills: calculateSkillsScore(freelancer.skills, requestSkills),
        domain: calculateDomainScore(freelancer.industries, freelancer.tools, requestIndustries),
        outcomes: calculateOutcomesScore(freelancer.outcome_history),
        availability: calculateAvailabilityScore(freelancer.availability_weekly_hours),
        locale: calculateLocaleScore(freelancer.locales),
        price: calculatePriceScore(freelancer.price_band_min, freelancer.price_band_max, requestBudget),
        vetting: calculateVettingScore(freelancer.certifications),
        history: 0.5
      };

      const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
        return sum + (weights[key as keyof typeof weights] * score);
      }, 0);

      // Create reasons array based on scores
      const reasons = [];
      if (scores.skills > 0.7) {
        const matchedSkills = requestSkills.filter(skill => 
          freelancer.skills?.some((fs: string) => fs.toLowerCase().includes(skill.toLowerCase()))
        );
        if (matchedSkills.length > 0) {
          reasons.push({ label: "Skills", value: `+${matchedSkills.slice(0, 2).join(', ')}` });
        }
      }
      if (scores.domain > 0.6) {
        reasons.push({ label: "Domain", value: "+Industry match" });
      }
      if (scores.outcomes > 0.8) {
        reasons.push({ label: "Track Record", value: "+Excellent outcomes" });
      }

      const red_flags = [];
      if (scores.price < 0.3) {
        red_flags.push("Budget mismatch");
      }
      if (scores.availability < 0.4) {
        red_flags.push("Limited availability");
      }

      // expert_id is already computed in the view
      const expert_user_id = freelancer.expert_id;
      
      return {
        expert_user_id,
        score: Math.round(totalScore * 100) / 100,
        reasons,
        red_flags,
        profile: {
          full_name: freelancer.full_name,
          email: freelancer.email,
          skills: freelancer.skills,
          price_range: `£${Math.floor(freelancer.price_band_min/100)}-${Math.floor(freelancer.price_band_max/100)}`,
          availability: `${freelancer.availability_weekly_hours}h/week`
        }
      };
    }) || [];

    // Filter by minimum score and sort
    const eligibleCandidates = scoredCandidates
      .filter(candidate => candidate.score >= min_score)
      .sort((a, b) => b.score - a.score)
      .slice(0, max_results);

    console.log(`Found ${eligibleCandidates.length} eligible candidates (≥${min_score})`);

    // Log matching event to both tables
    await Promise.all([
      supabase.from('brief_events').insert({
        brief_id,
        type: 'matching_computed',
        payload: {
          total_evaluated: scoredCandidates.length,
          eligible_count: eligibleCandidates.length,
          min_score,
          max_results
        }
      }),
      supabase.from('matching_runs').insert({
        brief_id,
        candidates_found: eligibleCandidates.length,
        min_score,
        max_invites: max_results,
        metadata: { total_evaluated: scoredCandidates.length }
      })
    ]);

    return new Response(JSON.stringify({
      ok: true,
      brief_id,
      candidates: eligibleCandidates
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in compute-matches:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message || "Matching computation failed",
      debug_id: `error-${Date.now()}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java',
    'ui/ux', 'design', 'marketing', 'seo', 'content', 'copywriting',
    'project management', 'agile', 'scrum', 'analytics', 'data',
    'automation', 'crm', 'hubspot', 'salesforce', 'stripe', 'payment',
    'notion', 'zapier', 'integration', 'api', 'workflow'
  ];
  
  const found = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return found.length ? found : ['general'];
}

function extractIndustriesFromText(text: string): string[] {
  const industries = [
    'fintech', 'healthcare', 'education', 'ecommerce', 'saas',
    'consulting', 'agency', 'startup', 'enterprise', 'nonprofit'
  ];
  
  return industries.filter(industry => 
    text.toLowerCase().includes(industry.toLowerCase())
  );
}

function parseBudgetRange(budgetRange: string): { min: number; max: number } {
  const matches = budgetRange.match(/[\d,]+/g);
  if (!matches) return { min: 0, max: 999999 };
  
  const numbers = matches.map(m => parseInt(m.replace(/,/g, '')) * 100);
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}

function calculateSkillsScore(freelancerSkills: string[], requestSkills: string[]): number {
  if (!requestSkills.length) return 0.5;
  
  const matches = requestSkills.filter(skill => 
    freelancerSkills?.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
  );
  
  return Math.min(matches.length / requestSkills.length, 1.0);
}

function calculateDomainScore(industries: string[], tools: string[], requestIndustries: string[]): number {
  let score = 0;
  
  if (requestIndustries.length) {
    const industryMatches = requestIndustries.filter(ri => 
      industries?.some(i => i.toLowerCase().includes(ri.toLowerCase()))
    );
    score += (industryMatches.length / requestIndustries.length) * 0.7;
  }
  
  score += Math.min((tools?.length || 0) / 10, 0.3);
  
  return Math.min(score, 1.0);
}

function calculateOutcomesScore(history: any): number {
  if (!history) return 0.5;
  
  let score = 0;
  let count = 0;
  
  if (history.csat_score) {
    score += history.csat_score / 5;
    count++;
  }
  if (history.on_time_rate) {
    score += history.on_time_rate;
    count++;
  }
  if (history.pass_at_qa_rate) {
    score += history.pass_at_qa_rate;
    count++;
  }
  if (history.revision_rate) {
    score += (1 - history.revision_rate);
    count++;
  }
  
  return count > 0 ? score / count : 0.5;
}

function calculateAvailabilityScore(weeklyHours: number): number {
  if (weeklyHours >= 20 && weeklyHours <= 40) return 1.0;
  if (weeklyHours < 10) return 0.2;
  if (weeklyHours > 50) return 0.6;
  return 0.8;
}

function calculateLocaleScore(locales: string[]): number {
  return (locales?.length || 0) > 0 ? 0.8 : 0.5;
}

function calculatePriceScore(minPrice: number, maxPrice: number, requestBudget: { min: number; max: number }): number {
  if (!minPrice || !maxPrice) return 0.5;
  
  const overlapMin = Math.max(minPrice, requestBudget.min);
  const overlapMax = Math.min(maxPrice, requestBudget.max);
  
  if (overlapMin > overlapMax) return 0.1;
  
  const overlapSize = overlapMax - overlapMin;
  const freelancerRange = maxPrice - minPrice;
  const requestRange = requestBudget.max - requestBudget.min;
  
  return Math.min(overlapSize / Math.min(freelancerRange, requestRange), 1.0);
}

function calculateVettingScore(certifications: string[]): number {
  return Math.min((certifications?.length || 0) / 3, 1.0);
}