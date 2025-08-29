import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutcomeCard {
  id: string;
  title: string;
  subtitle?: string;
  deliverables: string[];
  durationEstimate: string;
  priceBand?: { low?: number; typical?: number; high?: number; currency: string };
  evidence?: Array<{ type: 'case' | 'tool'; text: string; link?: string }>;
  expertBadges?: Array<{ role: string; expertiseTag?: string }>;
  tags?: string[];
}

// Mock outcome cards data for demo
const generateOutcomeCards = (viewMode: 'proof' | 'catalog'): OutcomeCard[] => {
  const baseOutcomes: OutcomeCard[] = [
    {
      id: 'outcome_1',
      title: 'E-commerce Platform MVP',
      subtitle: 'Full-stack marketplace solution',
      deliverables: [
        'React + Node.js web application',
        'Payment integration (Stripe)',
        'Admin dashboard',
        'Mobile-responsive design'
      ],
      durationEstimate: '8-12 weeks',
      priceBand: { low: 15000, typical: 25000, high: 40000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: 'Similar platform achieved 40% faster checkout', link: '/case-study-1' },
        { type: 'tool', text: 'Advanced React patterns & microservices' }
      ],
      expertBadges: [
        { role: 'Senior Full-Stack Dev', expertiseTag: 'E-commerce' },
        { role: 'UI/UX Designer', expertiseTag: 'Conversion' }
      ],
      tags: ['React', 'Node.js', 'E-commerce', 'Stripe']
    },
    {
      id: 'outcome_2',
      title: 'Data Analytics Dashboard',
      subtitle: 'Real-time business intelligence',
      deliverables: [
        'Interactive dashboard with D3.js',
        'Data pipeline setup',
        'Automated reporting',
        'User access controls'
      ],
      durationEstimate: '4-6 weeks',
      priceBand: { low: 8000, typical: 15000, high: 25000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: 'Reduced decision time by 60% for similar client' },
        { type: 'tool', text: 'Python ML pipelines & real-time processing' }
      ],
      expertBadges: [
        { role: 'Data Engineer', expertiseTag: 'Analytics' },
        { role: 'Frontend Specialist', expertiseTag: 'Visualization' }
      ],
      tags: ['Python', 'D3.js', 'Analytics', 'ML']
    },
    {
      id: 'outcome_3',
      title: 'Mobile App Development',
      subtitle: 'Cross-platform iOS/Android app',
      deliverables: [
        'React Native application',
        'Backend API integration',
        'App store deployment',
        'Push notification system'
      ],
      durationEstimate: '10-14 weeks',
      priceBand: { low: 20000, typical: 35000, high: 50000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: '4.8★ average rating for previous mobile apps' },
        { type: 'tool', text: 'React Native + Firebase integration' }
      ],
      expertBadges: [
        { role: 'Mobile Developer', expertiseTag: 'React Native' },
        { role: 'Backend Engineer', expertiseTag: 'APIs' }
      ],
      tags: ['React Native', 'Mobile', 'iOS', 'Android']
    },
    {
      id: 'outcome_4',
      title: 'Marketing Website Redesign',
      subtitle: 'High-converting landing pages',
      deliverables: [
        'Modern responsive website',
        'SEO optimization',
        'Content management system',
        'Performance optimization'
      ],
      durationEstimate: '3-5 weeks',
      priceBand: { low: 5000, typical: 10000, high: 18000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: 'Increased conversion rates by 180%' },
        { type: 'tool', text: 'Next.js + headless CMS architecture' }
      ],
      expertBadges: [
        { role: 'Frontend Developer', expertiseTag: 'Performance' },
        { role: 'Marketing Expert', expertiseTag: 'Conversion' }
      ],
      tags: ['Next.js', 'SEO', 'CMS', 'Conversion']
    },
    {
      id: 'outcome_5',
      title: 'DevOps Infrastructure Setup',
      subtitle: 'Scalable cloud deployment',
      deliverables: [
        'AWS/GCP infrastructure',
        'CI/CD pipeline setup',
        'Monitoring & logging',
        'Security hardening'
      ],
      durationEstimate: '2-4 weeks',
      priceBand: { low: 6000, typical: 12000, high: 20000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: '99.9% uptime achieved for enterprise clients' },
        { type: 'tool', text: 'Kubernetes + Docker containerization' }
      ],
      expertBadges: [
        { role: 'DevOps Engineer', expertiseTag: 'Cloud' },
        { role: 'Security Specialist', expertiseTag: 'Infrastructure' }
      ],
      tags: ['AWS', 'DevOps', 'Kubernetes', 'Security']
    },
    {
      id: 'outcome_6',
      title: 'API Development & Integration',
      subtitle: 'Robust backend services',
      deliverables: [
        'RESTful API development',
        'Third-party integrations',
        'Database optimization',
        'API documentation'
      ],
      durationEstimate: '4-8 weeks',
      priceBand: { low: 8000, typical: 16000, high: 28000, currency: 'gbp' },
      evidence: [
        { type: 'case', text: 'Handled 1M+ API calls/day for SaaS client' },
        { type: 'tool', text: 'Node.js + PostgreSQL + Redis' }
      ],
      expertBadges: [
        { role: 'Backend Developer', expertiseTag: 'APIs' },
        { role: 'Database Expert', expertiseTag: 'Optimization' }
      ],
      tags: ['Node.js', 'API', 'PostgreSQL', 'Integration']
    }
  ];

  // For proof view, show evidence-rich outcomes
  if (viewMode === 'proof') {
    return baseOutcomes.map(outcome => ({
      ...outcome,
      evidence: outcome.evidence?.slice(0, 2) || []
    }));
  }

  // For catalog view, focus on standardized packages
  return baseOutcomes.map(outcome => ({
    ...outcome,
    subtitle: `${outcome.subtitle} - Ready-to-deploy package`,
    evidence: outcome.evidence?.slice(0, 1) || []
  }));
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const viewMode = url.searchParams.get('viewMode') as 'proof' | 'catalog' || 'proof';

    if (!['proof', 'catalog'].includes(viewMode)) {
      throw new Error('viewMode must be either "proof" or "catalog"');
    }

    const outcomeCards = generateOutcomeCards(viewMode);

    console.log(`Generated ${outcomeCards.length} outcome cards for ${viewMode} view`);

    return new Response(
      JSON.stringify({
        outcomes: outcomeCards,
        viewMode,
        total: outcomeCards.length,
        generatedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Get outcome cards error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        code: 'GET_OUTCOME_CARDS_FAILED'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});