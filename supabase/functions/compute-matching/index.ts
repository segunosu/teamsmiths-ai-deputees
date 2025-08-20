import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchingRequest {
  request_id: string;
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

    const { request_id, force_recompute = false }: MatchingRequest = await req.json();

    console.log(`Computing matches for request ${request_id}`);

    // Check if we already have a recent matching snapshot (unless forced)
    if (!force_recompute) {
      const { data: existingSnapshot } = await supabase
        .from("matching_snapshots")
        .select("*")
        .eq("request_id", request_id)
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // 1 hour
        .single();

      if (existingSnapshot) {
        return new Response(JSON.stringify({ 
          success: true, 
          snapshot_id: existingSnapshot.id,
          message: "Using existing snapshot" 
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

    // Get the customization request details
    const { data: request, error: requestError } = await supabase
      .from("customization_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (requestError || !request) {
      throw new Error("Customization request not found");
    }

    // Get all freelancer profiles
    const { data: freelancers, error: freelancersError } = await supabase
      .from("freelancer_profiles")
      .select(`
        *,
        profiles!inner(full_name, email)
      `);

    if (freelancersError) {
      throw new Error(`Failed to fetch freelancers: ${freelancersError.message}`);
    }

    console.log(`Found ${freelancers?.length || 0} freelancers to evaluate`);

    // Extract request context for matching
    const requestSkills = extractSkillsFromText(request.custom_requirements);
    const requestBudget = parseBudgetRange(request.budget_range);
    const requestIndustries = extractIndustriesFromText(request.custom_requirements);

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

    // Store matching snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from("matching_snapshots")
      .insert({
        request_id,
        candidates: shortlist,
        matching_weights: weights,
        shortlist_size: shortlistSize
      })
      .select("id")
      .single();

    if (snapshotError) {
      throw new Error(`Failed to save snapshot: ${snapshotError.message}`);
    }

    console.log(`Saved matching snapshot ${snapshot.id}`);

    return new Response(JSON.stringify({
      success: true,
      snapshot_id: snapshot.id,
      shortlist,
      message: `Generated shortlist of ${shortlist.length} candidates`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in compute-matching:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
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