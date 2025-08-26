import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StructuredBrief {
  goal?: { interpreted?: string; normalized?: any };
  context?: { interpreted?: string; normalized?: any };
  constraints?: { interpreted?: string; normalized?: any };
  budget_range?: string;
  timeline?: string;
  urgency?: string;
  expert_style?: string;
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

interface FreelancerProfile {
  user_id: string;
  skills: string[];
  tools: string[];
  industries: string[];
  certifications: string[];
  locales: string[];
  price_band_min: number;
  price_band_max: number;
  availability_weekly_hours: number;
  outcome_history: any;
  profiles: {
    full_name: string;
    email: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { brief_id, force_recompute = false } = await req.json();

    console.log('Processing matching for brief:', brief_id);

    // Check for existing recent results (unless force recompute)
    if (!force_recompute) {
      const { data: existingBrief } = await supabase
        .from('briefs')
        .select('matching_results, matched_at')
        .eq('id', brief_id)
        .single();

      if (existingBrief?.matching_results && 
          existingBrief.matching_results.length > 0 &&
          existingBrief.matched_at &&
          new Date(existingBrief.matched_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        return new Response(
          JSON.stringify({
            brief_id,
            candidates: existingBrief.matching_results,
            message: 'Using cached matching results from less than 24h ago'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get matching configuration
    const { data: adminSettings } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['matching_weights', 'shortlist_size_default']);

    const settingsMap = adminSettings?.reduce((acc, item) => {
      acc[item.setting_key] = item.setting_value;
      return acc;
    }, {} as Record<string, any>) || {};

    const weights: MatchingWeights = settingsMap.matching_weights || {
      skills: 0.25, domain: 0.15, outcomes: 0.20, availability: 0.15,
      locale: 0.05, price: 0.10, vetting: 0.07, history: 0.03
    };

    const shortlistSize = settingsMap.shortlist_size_default?.value || 5;

    // Fetch the brief details
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('structured_brief')
      .eq('id', brief_id)
      .single();

    if (briefError || !brief) {
      throw new Error(`Brief not found: ${briefError?.message}`);
    }

    const structuredBrief = brief.structured_brief as StructuredBrief;

    // Fetch all freelancer profiles
    const { data: freelancers, error: freelancersError } = await supabase
      .from('freelancer_profiles')
      .select(`
        user_id, skills, tools, industries, certifications, locales,
        price_band_min, price_band_max, availability_weekly_hours, outcome_history,
        profiles:user_id (full_name, email)
      `);

    if (freelancersError) {
      throw new Error(`Error fetching freelancers: ${freelancersError.message}`);
    }

    console.log(`Found ${freelancers?.length || 0} freelancer profiles`);

    // Extract requirements from brief
    const requiredSkills = extractSkillsFromBrief(structuredBrief);
    const budgetRange = parseBudgetRange(structuredBrief.budget_range);
    const industries = extractIndustriesFromBrief(structuredBrief);
    const tools = extractToolsFromBrief(structuredBrief);

    // Calculate scores for each freelancer
    const candidatesWithScores = (freelancers || []).map((freelancer: FreelancerProfile) => {
      const scores = {
        skills: calculateSkillsScore(requiredSkills, freelancer.skills || []),
        domain: calculateDomainScore(industries, tools, freelancer.industries || [], freelancer.tools || []),
        outcomes: calculateOutcomesScore(freelancer.outcome_history),
        availability: calculateAvailabilityScore(freelancer.availability_weekly_hours || 40, structuredBrief.urgency),
        locale: calculateLocaleScore(freelancer.locales || []),
        price: calculatePriceScore(budgetRange, freelancer.price_band_min || 0, freelancer.price_band_max || 100000),
        vetting: calculateVettingScore(freelancer.certifications || []),
        history: calculateHistoryScore(freelancer.outcome_history)
      };

      const totalScore = Object.entries(scores).reduce((sum, [key, score]) => 
        sum + score * weights[key as keyof MatchingWeights], 0
      );

      return {
        user_id: freelancer.user_id,
        score: totalScore,
        breakdown: scores,
        profile: {
          full_name: freelancer.profiles?.full_name || 'Unknown',
          email: freelancer.profiles?.email || '',
          skills: freelancer.skills || [],
          tools: freelancer.tools || [],
          price_range: `£${freelancer.price_band_min || 0}-${freelancer.price_band_max || 100000}/day`,
          availability: freelancer.availability_weekly_hours || 40
        }
      };
    });

    // Sort by total score and take top candidates
    const shortlist = candidatesWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, shortlistSize);

    // Store results in brief
    const { error: updateError } = await supabase
      .from('briefs')
      .update({
        matching_results: shortlist,
        matched_at: new Date().toISOString()
      })
      .eq('id', brief_id);

    if (updateError) {
      console.error('Error updating brief with matching results:', updateError);
    }

    console.log(`Generated ${shortlist.length} candidates for brief ${brief_id}`);

    return new Response(
      JSON.stringify({
        brief_id,
        candidates: shortlist,
        weights_used: weights,
        shortlist_size: shortlistSize,
        message: `Successfully matched ${shortlist.length} candidates`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-experts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions
function extractSkillsFromBrief(brief: StructuredBrief): string[] {
  const text = [
    brief.goal?.interpreted || '',
    brief.context?.interpreted || '',
    brief.constraints?.interpreted || ''
  ].join(' ').toLowerCase();

  const commonSkills = [
    'react', 'javascript', 'typescript', 'nodejs', 'python', 'java', 'aws', 'docker',
    'kubernetes', 'mongodb', 'postgresql', 'redis', 'graphql', 'rest api', 'microservices',
    'machine learning', 'data science', 'ai', 'devops', 'ci/cd', 'terraform'
  ];

  return commonSkills.filter(skill => text.includes(skill));
}

function extractIndustriesFromBrief(brief: StructuredBrief): string[] {
  const industryKeywords = {
    'fintech': ['banking', 'finance', 'payment', 'trading', 'cryptocurrency'],
    'healthcare': ['health', 'medical', 'hospital', 'patient', 'clinical'],
    'e-commerce': ['shop', 'store', 'retail', 'marketplace', 'commerce'],
    'education': ['learning', 'course', 'student', 'university', 'education'],
    'saas': ['software', 'service', 'platform', 'dashboard', 'subscription']
  };

  const text = [
    brief.goal?.interpreted || '',
    brief.context?.interpreted || ''
  ].join(' ').toLowerCase();

  const matchedIndustries = [];
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      matchedIndustries.push(industry);
    }
  }

  return matchedIndustries;
}

function extractToolsFromBrief(brief: StructuredBrief): string[] {
  const text = [
    brief.goal?.interpreted || '',
    brief.constraints?.interpreted || ''
  ].join(' ').toLowerCase();

  const tools = [
    'figma', 'sketch', 'adobe', 'photoshop', 'github', 'gitlab', 'jira', 'slack',
    'notion', 'confluence', 'stripe', 'paypal', 'sendgrid', 'twilio', 'firebase'
  ];

  return tools.filter(tool => text.includes(tool));
}

function parseBudgetRange(budgetStr?: string): { min: number; max: number } {
  if (!budgetStr) return { min: 0, max: 100000 };
  
  const match = budgetStr.match(/(\d+).*?(\d+)/);
  if (match) {
    return { min: parseInt(match[1]), max: parseInt(match[2]) };
  }
  
  const singleMatch = budgetStr.match(/(\d+)/);
  if (singleMatch) {
    const amount = parseInt(singleMatch[1]);
    return { min: amount * 0.8, max: amount * 1.2 };
  }
  
  return { min: 0, max: 100000 };
}

function calculateSkillsScore(required: string[], freelancerSkills: string[]): number {
  if (required.length === 0) return 0.7; // neutral score if no requirements
  
  const matches = required.filter(skill => 
    freelancerSkills.some(fs => fs.toLowerCase().includes(skill.toLowerCase()))
  ).length;
  
  return Math.min(matches / required.length, 1.0);
}

function calculateDomainScore(industries: string[], tools: string[], 
                            freelancerIndustries: string[], freelancerTools: string[]): number {
  let score = 0;
  let factors = 0;

  if (industries.length > 0) {
    const industryMatches = industries.filter(ind => 
      freelancerIndustries.some(fi => fi.toLowerCase().includes(ind.toLowerCase()))
    ).length;
    score += (industryMatches / industries.length) * 0.6;
    factors += 0.6;
  }

  if (tools.length > 0) {
    const toolMatches = tools.filter(tool => 
      freelancerTools.some(ft => ft.toLowerCase().includes(tool.toLowerCase()))
    ).length;
    score += (toolMatches / tools.length) * 0.4;
    factors += 0.4;
  }

  return factors > 0 ? score / factors : 0.5;
}

function calculateOutcomesScore(outcomeHistory: any): number {
  if (!outcomeHistory) return 0.5;
  
  const passRate = outcomeHistory.pass_at_qa_rate || 0.8;
  const csatScore = outcomeHistory.csat_score || 4.0;
  const onTimeRate = outcomeHistory.on_time_rate || 0.9;
  
  return (passRate * 0.4) + ((csatScore / 5) * 0.3) + (onTimeRate * 0.3);
}

function calculateAvailabilityScore(weeklyHours: number, urgency?: string): number {
  const baseScore = Math.min(weeklyHours / 40, 1.0);
  
  if (urgency === 'urgent' && weeklyHours >= 30) return Math.min(baseScore * 1.2, 1.0);
  if (urgency === 'low' && weeklyHours >= 20) return baseScore;
  
  return baseScore;
}

function calculateLocaleScore(locales: string[]): number {
  // Prefer UK/EU timezones for now
  const preferredLocales = ['en-GB', 'en-US', 'en-EU', 'en'];
  const hasPreferred = locales.some(locale => 
    preferredLocales.some(pref => locale.includes(pref))
  );
  
  return hasPreferred ? 1.0 : 0.6;
}

function calculatePriceScore(budgetRange: { min: number; max: number }, 
                           priceMin: number, priceMax: number): number {
  if (budgetRange.max === 0) return 0.7; // no budget specified
  
  // Check if freelancer's rate fits within budget
  const freelancerMidRate = (priceMin + priceMax) / 2;
  const budgetMid = (budgetRange.min + budgetRange.max) / 2;
  
  if (freelancerMidRate <= budgetRange.max && freelancerMidRate >= budgetRange.min) {
    return 1.0; // perfect fit
  }
  
  // Penalize if outside range
  const distance = Math.min(
    Math.abs(freelancerMidRate - budgetRange.min),
    Math.abs(freelancerMidRate - budgetRange.max)
  );
  
  return Math.max(0, 1 - (distance / budgetMid));
}

function calculateVettingScore(certifications: string[]): number {
  if (!certifications || certifications.length === 0) return 0.5;
  
  // Weight certain certifications higher
  const highValueCerts = ['aws', 'google cloud', 'azure', 'kubernetes', 'react', 'node.js'];
  const hasHighValue = certifications.some(cert => 
    highValueCerts.some(hvc => cert.toLowerCase().includes(hvc.toLowerCase()))
  );
  
  return hasHighValue ? 1.0 : 0.7;
}

function calculateHistoryScore(outcomeHistory: any): number {
  if (!outcomeHistory) return 0.5;
  
  const disputeRate = outcomeHistory.dispute_rate || 0;
  return Math.max(0, 1 - disputeRate);
}