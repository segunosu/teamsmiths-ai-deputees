import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchingRequest {
  brief_id: string;
  force_recompute?: boolean;
}

interface FreelancerProfile {
  user_id: string;
  skills: string[];
  industries: string[];
  tools: string[];
  price_band_min: number;
  price_band_max: number;
  certifications: string[];
  locales: string[];
  availability_weekly_hours: number;
  outcome_history: {
    csat_score?: number;
    on_time_rate?: number;
    revision_rate?: number;
    pass_at_qa_rate?: number;
    dispute_rate?: number;
  };
}

interface CustomizationRequest {
  id: string;
  project_title: string;
  custom_requirements: string;
  budget_range: string;
  timeline_preference: string;
}

interface MatchingWeights {
  skills: number;
  domain: number;
  outcomes: number;
  availability: number;
  locale: number;
  price: number;
  vetting: number;
  history: number;
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

    const { brief_id, force_recompute = false }: MatchingRequest = await req.json();

    console.log(`Computing matches for brief ${brief_id}`);

    // Check if we already have recent matching results (unless forced)
    if (!force_recompute) {
      const { data: existingBrief } = await supabase
        .from("briefs")
        .select("matching_results, matched_at")
        .eq("id", brief_id)
        .single();

      if (existingBrief?.matching_results && 
          existingBrief.matching_results.length > 0 &&
          existingBrief.matched_at &&
          new Date(existingBrief.matched_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        return new Response(JSON.stringify({ 
          status: "success",
          brief_id,
          candidates: existingBrief.matching_results,
          message: "Using cached matching results from less than 24h ago"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get matching configuration from admin settings
    const { data: adminSettings } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "matching_config")
      .single();

    const config = adminSettings?.setting_value || {};
    const weights: MatchingWeights = config.matching_weights || {
      skills: 0.25,
      domain: 0.15,
      outcomes: 0.20,
      availability: 0.15,
      locale: 0.05,
      price: 0.10,
      vetting: 0.07,
      history: 0.03
    };

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
        brief_id
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all freelancer profiles
    const { data: freelancers, error: freelancersError } = await supabase
      .from("freelancer_profiles")
      .select(`
        *,
        profiles!freelancer_profiles_user_id_fkey(full_name, email)
      `);

    if (freelancersError) {
      return new Response(JSON.stringify({
        status: "error",
        message: `Failed to fetch freelancers: ${freelancersError.message}`,
        brief_id
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${freelancers?.length || 0} freelancers to evaluate`);

    // Extract brief context for matching from structured_brief
    const structuredBrief = brief.structured_brief || {};
    const requestSkills = extractSkillsFromText(
      [
        structuredBrief.goal?.interpreted || '',
        structuredBrief.context?.interpreted || '',
        structuredBrief.constraints?.interpreted || ''
      ].join(' ')
    );
    const requestBudget = parseBudgetRange(structuredBrief.budget_range || '');
    const requestIndustries = extractIndustriesFromText(
      [
        structuredBrief.goal?.interpreted || '',
        structuredBrief.context?.interpreted || ''
      ].join(' ')
    );

    // Score each freelancer
    const scoredCandidates = freelancers?.map((freelancer: any) => {
      const profile: FreelancerProfile = freelancer;
      
      const scores = {
        skills: calculateSkillsScore(profile.skills, requestSkills),
        domain: calculateDomainScore(profile.industries, profile.tools, requestIndustries),
        outcomes: calculateOutcomesScore(profile.outcome_history),
        availability: calculateAvailabilityScore(profile.availability_weekly_hours),
        locale: calculateLocaleScore(profile.locales),
        price: calculatePriceScore(profile.price_band_min, profile.price_band_max, requestBudget),
        vetting: calculateVettingScore(profile.certifications),
        history: 0.5 // Placeholder for client history
      };

      const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
        return sum + (weights[key as keyof MatchingWeights] * score);
      }, 0);

      return {
        user_id: profile.user_id,
        score: Math.round(totalScore * 100) / 100,
        breakdown: scores,
        profile: {
          full_name: freelancer.profiles?.full_name,
          email: freelancer.profiles?.email,
          skills: profile.skills,
          price_range: `£${profile.price_band_min/100}-${profile.price_band_max/100}`,
          availability: `${profile.availability_weekly_hours}h/week`
        }
      };
    }) || [];

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    const shortlistSize = config.shortlist_size_default || 3;
    const shortlist = scoredCandidates.slice(0, shortlistSize);

    console.log(`Created shortlist of ${shortlist.length} candidates`);

    // Store results in brief
    const { error: updateError } = await supabase
      .from("briefs")
      .update({
        matching_results: shortlist,
        matched_at: new Date().toISOString()
      })
      .eq("id", brief_id);

    if (updateError) {
      console.error('Error updating brief with matching results:', updateError);
    }

    console.log(`Generated ${shortlist.length} candidates for brief ${brief_id}`);

    return new Response(JSON.stringify({
      status: "success",
      brief_id,
      candidates: shortlist,
      weights_used: weights,
      shortlist_size: shortlistSize,
      message: `Successfully matched ${shortlist.length} candidates`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in compute-matching:", error);
    
    // Log error to brief_events table if we have a brief_id
    const body = await req.json().catch(() => ({}));
    if (body.brief_id) {
      try {
        await supabase.from('brief_events').insert({
          brief_id: body.brief_id,
          type: 'matching_error',
          payload: { 
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      status: "error",
      message: error.message || 'Failed to compute matching results',
      brief_id: body.brief_id
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper functions for scoring
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    'react', 'vue', 'angular', 'javascript', 'typescript', 'python', 'java',
    'ui/ux', 'design', 'marketing', 'seo', 'content', 'copywriting',
    'project management', 'agile', 'scrum', 'analytics', 'data',
    'automation', 'crm', 'hubspot', 'salesforce', 'stripe', 'payment'
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
  
  const numbers = matches.map(m => parseInt(m.replace(/,/g, '')) * 100); // Convert to pence
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers)
  };
}

function calculateSkillsScore(freelancerSkills: string[], requestSkills: string[]): number {
  if (!requestSkills.length) return 0.5;
  
  const matches = requestSkills.filter(skill => 
    freelancerSkills.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
  );
  
  return Math.min(matches.length / requestSkills.length, 1.0);
}

function calculateDomainScore(industries: string[], tools: string[], requestIndustries: string[]): number {
  let score = 0;
  
  // Industry match
  if (requestIndustries.length) {
    const industryMatches = requestIndustries.filter(ri => 
      industries.some(i => i.toLowerCase().includes(ri.toLowerCase()))
    );
    score += (industryMatches.length / requestIndustries.length) * 0.7;
  }
  
  // Tools bonus
  score += Math.min(tools.length / 10, 0.3);
  
  return Math.min(score, 1.0);
}

function calculateOutcomesScore(history: any): number {
  if (!history) return 0.5;
  
  let score = 0;
  let count = 0;
  
  if (history.csat_score) {
    score += history.csat_score / 5; // Assume 5-point scale
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
    score += (1 - history.revision_rate); // Lower revision rate is better
    count++;
  }
  
  return count > 0 ? score / count : 0.5;
}

function calculateAvailabilityScore(weeklyHours: number): number {
  // Optimal range is 20-40 hours per week
  if (weeklyHours >= 20 && weeklyHours <= 40) return 1.0;
  if (weeklyHours < 10) return 0.2;
  if (weeklyHours > 50) return 0.6;
  return 0.8;
}

function calculateLocaleScore(locales: string[]): number {
  // For now, just check if they have any locale preference
  return locales.length > 0 ? 0.8 : 0.5;
}

function calculatePriceScore(minPrice: number, maxPrice: number, requestBudget: { min: number; max: number }): number {
  if (!minPrice || !maxPrice) return 0.5;
  
  // Check overlap between freelancer range and request budget
  const overlapMin = Math.max(minPrice, requestBudget.min);
  const overlapMax = Math.min(maxPrice, requestBudget.max);
  
  if (overlapMin > overlapMax) return 0.1; // No overlap
  
  const overlapSize = overlapMax - overlapMin;
  const freelancerRange = maxPrice - minPrice;
  const requestRange = requestBudget.max - requestBudget.min;
  
  return Math.min(overlapSize / Math.min(freelancerRange, requestRange), 1.0);
}

function calculateVettingScore(certifications: string[]): number {
  // Basic vetting score based on certifications
  return Math.min(certifications.length / 3, 1.0);
}