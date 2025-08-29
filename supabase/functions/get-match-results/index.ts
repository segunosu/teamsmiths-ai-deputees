import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Match {
  anonymizedExpertId: string;
  roleBadge: string;
  confidenceScore: number;
  rationale: Array<'skill-match' | 'budget-fit' | 'availability' | 'rating'>;
  rateEstimate?: { type: 'hour' | 'day' | 'project'; min?: number; max?: number; currency: string };
  availability?: string;
  sampleLinks?: string[];
}

// Mock matching results for demo - in production this would query actual matching results
const generateMockMatches = (crId: string): Match[] => {
  const roles = [
    'Senior Full-Stack Developer',
    'Lead Data Engineer', 
    'Senior Product Designer',
    'Technical Architect',
    'DevOps Specialist'
  ];

  const availabilities = [
    '2-3 weeks',
    '1-2 weeks', 
    '3-4 weeks',
    'Next week',
    '4-6 weeks'
  ];

  const rationales: Array<Array<Match['rationale'][number]>> = [
    ['skill-match', 'rating', 'availability'],
    ['skill-match', 'budget-fit', 'rating'],
    ['budget-fit', 'availability'],
    ['skill-match', 'availability', 'rating'],
    ['skill-match', 'budget-fit']
  ];

  return Array.from({ length: Math.min(5, roles.length) }, (_, i) => ({
    anonymizedExpertId: `expert_${crId}_${i + 1}`,
    roleBadge: roles[i],
    confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
    rationale: rationales[i] || ['skill-match'],
    rateEstimate: {
      type: 'project' as const,
      min: 5000 + (i * 2000),
      max: 8000 + (i * 3000),
      currency: 'gbp'
    },
    availability: availabilities[i] || '2-3 weeks',
    sampleLinks: [
      'https://example.com/portfolio/project1',
      'https://example.com/portfolio/project2'
    ]
  }));
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );

    const url = new URL(req.url);
    const matchJobId = url.searchParams.get('matchJobId');

    if (!matchJobId) {
      throw new Error('matchJobId parameter required');
    }

    // Extract CR ID from job ID (assuming format like "job_<crId>")
    const crId = matchJobId.replace('job_', '');

    // Verify user has access to this CR
    const { data: cr, error: crError } = await supabase
      .from('customization_requests')
      .select('id, user_id, contact_email, status')
      .eq('id', crId)
      .single();

    if (crError || !cr) {
      throw new Error('Customization request not found');
    }

    // Check access permissions
    const hasAccess = user?.id === cr.user_id || 
                     user?.email === cr.contact_email;

    if (!hasAccess) {
      throw new Error('Access denied');
    }

    // Check if matching is still pending (simulate async processing)
    const isComplete = cr.status === 'submitted';
    
    if (!isComplete) {
      return new Response(
        JSON.stringify({
          status: 'pending',
          matches: [],
          estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString() // 2 minutes
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Generate or retrieve actual matches
    const matches = generateMockMatches(crId);

    // Log matching completed event
    console.log('Match results retrieved:', {
      matchJobId,
      crId,
      matchCount: matches.length
    });

    return new Response(
      JSON.stringify({
        status: 'completed',
        matches,
        completedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Get match results error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'GET_MATCHES_FAILED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});