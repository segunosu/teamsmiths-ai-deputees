import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, DollarSign, Target, Cog, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';
import { BusinessUpliftCard } from '@/components/BusinessUpliftCard';

const Solutions = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBusinessUpliftClick = (type: 'add_to_plan' | 'fixed_price', slug: string) => {
    trackEvent('businessuplift_card_click' as any, { type, slug } as any);
  };

  const businessFunctions = [
    {
      id: 'sales',
      title: 'Sales Improvements',
      icon: <Target className="h-8 w-8 text-primary" />,
      anchor: '#sales'
    },
    {
      id: 'marketing',
      title: 'Marketing Improvements',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      anchor: '#marketing'
    },
    {
      id: 'hr',
      title: 'HR Improvements',
      icon: <Users className="h-8 w-8 text-primary" />,
      anchor: '#hr'
    },
    {
      id: 'finance',
      title: 'Finance Improvements',
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      anchor: '#finance'
    },
    {
      id: 'operations',
      title: 'Operations Improvements',
      icon: <Cog className="h-8 w-8 text-primary" />,
      anchor: '#operations'
    },
    {
      id: 'customer_service',
      title: 'Customer Service Improvements',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      anchor: '#customer-service'
    },
    {
      id: 'culture_growth',
      title: 'Culture & Growth Improvements',
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      anchor: '#culture-growth'
    }
  ];

  const businessUplifts = {
    sales: [
      {
        slug: 'sales_deputee_deal_closer',
        title: 'Deal Closer',
        description: 'Connects to your CRM to analyze deal patterns and triggers personalized follow-up actions for your sales team',
        benefit: 'Scans CRM data, surfaces at-risk deals, generates role-specific next actions and follow-up prompts based on deal stage and client behavior',
        delivered: 'CRM-integrated system that delivers daily action prompts and deal risk alerts to the right team members',
        timeframe: '7–10 days',
        outcome: 'No missed deals, increased close rate, 3+ hours back/week'
      },
      {
        slug: 'proposal_speed_up',
        title: 'Proposal Speed-Up',
        description: 'Automated proposal creation from meeting notes and client briefs',
        benefit: 'Send 28% more proposals with 37% faster turnaround — track on your dashboard.',
        delivered: 'Custom proposal templates + automation setup',
        timeframe: '7–14 days',
        outcome: 'Measurable increase in proposal volume and speed'
      },
      {
        slug: 'quote_booster',
        title: 'Quote Booster',
        description: 'Streamlined quoting process with dynamic pricing models',
        benefit: '32% faster quotes with 11% higher win rate — measured monthly.',
        delivered: 'Quote automation system + pricing calculator',
        timeframe: '10–14 days',
        outcome: 'Faster quotes, higher conversion rates'
      },
      {
        slug: 'follow_up_engine',
        title: 'Follow-Up Engine',
        description: 'Automated client follow-up system with smart nudging',
        benefit: 'Never miss follow-ups; 23% more deals closed on time.',
        delivered: 'Follow-up automation + CRM integration',
        timeframe: '7–10 days',
        outcome: 'Zero missed opportunities, improved close rates'
      }
    ],
    finance: [
      {
        slug: 'finance_deputee_cashflow_sentinel',
        title: 'Cashflow Sentinel',
        description: 'Integrates with your invoicing system to analyze payment patterns and automatically prompt follow-up actions',
        benefit: 'Analyzes invoice data, identifies payment delays, generates targeted reminders and escalation prompts based on client payment history',
        delivered: 'Invoice-tracking system that delivers daily payment status updates and role-specific collection actions',
        timeframe: '7–10 days',
        outcome: 'Faster payments, smoother cash flow'
      },
      {
        slug: 'cashflow_nudges',
        title: 'Cashflow Nudges',
        description: 'Automated invoice reminders with polite escalation sequences',
        benefit: '17% reduction in DSO, 22% fewer aged invoices — tracked monthly.',
        delivered: 'Smart reminder system + payment tracking dashboard',
        timeframe: '7–10 days',
        outcome: 'Faster payments, improved cash flow'
      },
      {
        slug: 'expense_categorizer',
        title: 'Expense Categorizer',
        description: 'AI-powered expense categorization and bookkeeping automation',
        benefit: '15 hours saved monthly on bookkeeping tasks.',
        delivered: 'Automated categorization rules + accounting integration',
        timeframe: '10–14 days',
        outcome: 'Reduced admin time, accurate books'
      },
      {
        slug: 'budget_tracker',
        title: 'Budget Tracker & Alerts',
        description: 'Real-time budget monitoring with automated alerts when approaching limits',
        benefit: '25% better budget control with early warning system.',
        delivered: 'Budget monitoring dashboard + alert system',
        timeframe: '7–10 days',
        outcome: 'Better financial control, no budget surprises'
      }
    ],
    hr: [
      {
        slug: 'hr_deputee_onboarding_accelerator',
        title: 'Onboarding Accelerator',
        description: 'Connects to your HR systems to track new hire progress and trigger personalized coaching prompts for managers',
        benefit: 'Monitors onboarding milestones, analyzes completion patterns, generates manager action prompts and check-in reminders based on individual progress',
        delivered: 'HR-integrated tracking that delivers daily manager prompts and milestone-based coaching actions',
        timeframe: '10–14 days',
        outcome: 'Faster ramp-up, less admin'
      },
      {
        slug: 'onboarding_kit',
        title: 'New Hire Onboarding Kit',
        description: '30-day structured onboarding plan with SOPs and tracking',
        benefit: '45% faster time to productivity for new hires — measured monthly.',
        delivered: 'Custom onboarding workflow + SOP templates',
        timeframe: '10–14 days',
        outcome: 'Faster ramp-up, better retention'
      },
      {
        slug: 'team_focus_rhythm',
        title: 'Team Focus Rhythm',
        description: 'Weekly team cadence system with clear priorities',
        benefit: '30% reduction in meeting time with better focus.',
        delivered: 'Weekly rhythm framework + priority tracker',
        timeframe: '7–10 days',
        outcome: 'More focused team, fewer meetings'
      },
      {
        slug: 'performance_review_system',
        title: 'Performance Review System',
        description: 'Structured quarterly review process with goal tracking',
        benefit: '40% improvement in goal achievement with clear feedback loops.',
        delivered: 'Review templates + goal tracking system',
        timeframe: '10–14 days',
        outcome: 'Better performance, clearer expectations'
      }
    ],
    operations: [
      {
        slug: 'operations_deputee_action_ready_ops',
        title: 'Action-Ready Ops',
        description: 'Integrates with your operations systems to monitor workflow status and deliver role-specific action prompts in real-time',
        benefit: 'Analyzes operational data flows, identifies bottlenecks and delays, generates targeted action prompts for specific team members based on system triggers',
        delivered: 'Ops-integrated monitoring that delivers real-time action prompts and workflow optimization suggestions',
        timeframe: '10–14 days',
        outcome: 'Fewer dropped balls, faster response'
      },
      {
        slug: 'meeting_to_minutes',
        title: 'Meeting-to-Minutes',
        description: 'Automated meeting notes with action items in your tools',
        benefit: '15 hours saved per week, 45% better team efficiency.',
        delivered: 'Meeting automation + task integration',
        timeframe: '7–14 days',
        outcome: 'Clear actions, better follow-through'
      },
      {
        slug: 'kb_starter',
        title: 'Knowledge Base Starter',
        description: 'Searchable company SOPs and knowledge system',
        benefit: 'Instant access to company knowledge for all team members.',
        delivered: 'Searchable knowledge base + content migration',
        timeframe: '10–14 days',
        outcome: 'Faster onboarding, consistent processes'
      },
      {
        slug: 'task_automation_hub',
        title: 'Task Automation Hub',
        description: 'Automated workflows for repetitive tasks across your tools',
        benefit: '20 hours saved weekly on manual tasks with 95% accuracy.',
        delivered: 'Custom automation workflows + integration setup',
        timeframe: '10–14 days',
        outcome: 'Less manual work, fewer errors'
      }
    ],
    marketing: [
      {
        slug: 'marketing_deputee_campaign_builder',
        title: 'Campaign Builder',
        description: 'Connects to your marketing platforms to analyze engagement data and trigger personalized campaign actions',
        benefit: 'Analyzes campaign performance data, identifies engagement patterns, generates targeted follow-up sequences and team action prompts based on lead behavior',
        delivered: 'Marketing-integrated system that delivers daily campaign optimization prompts and lead nurturing actions',
        timeframe: '7–14 days',
        outcome: '10+ warm leads/month, less manual work'
      },
      {
        slug: 'objection_helper',
        title: 'Sales Objection Helper',
        description: 'Live objection handling prompts with response library',
        benefit: '25% higher close rates with confident objection handling.',
        delivered: 'Objection response system + training materials',
        timeframe: '10–14 days',
        outcome: 'More confident sales calls, higher conversion'
      },
      {
        slug: 'lead_nurture_engine',
        title: 'Lead Nurture Engine',
        description: 'Automated email sequences that warm leads until they\'re ready to buy',
        benefit: '35% more leads convert with consistent nurturing.',
        delivered: 'Email automation + lead scoring system',
        timeframe: '10–14 days',
        outcome: 'Warmer leads, higher conversion rates'
      },
      {
        slug: 'content_repurposer',
        title: 'Content Repurposer',
        description: 'Turn one piece of content into 5+ formats automatically',
        benefit: '5x more content output with same effort and budget.',
        delivered: 'Content automation + distribution system',
        timeframe: '7–10 days',  
        outcome: 'More content, wider reach'
      }
    ],
    customer_service: [
      {
        slug: 'customer_service_deputee_resolution_turbo',
        title: 'Resolution Turbo',
        description: 'Integrates with your support system to analyze ticket patterns and deliver role-specific resolution prompts',
        benefit: 'Analyzes support ticket data, identifies escalation patterns, generates priority assignments and response prompts based on issue complexity and customer history',
        delivered: 'Support-integrated system that delivers real-time triage decisions and agent-specific resolution actions',
        timeframe: '7–10 days',
        outcome: 'Faster resolution, happier customers'
      },
      {
        slug: 'faq_assistant_lite',
        title: 'Customer FAQ Assistant (lite)',
        description: 'Automated FAQ responses that reduce support tickets',
        benefit: '40% reduction in basic support tickets.',
        delivered: 'FAQ automation + deflection system',
        timeframe: '10–14 days',
        outcome: 'Less support burden, happier customers'
      },
      {
        slug: 'ticket_triage_system',
        title: 'Ticket Triage System',
        description: 'Smart ticket routing and priority assignment',
        benefit: '50% faster response times with better ticket organization.',
        delivered: 'Automated triage rules + routing system',
        timeframe: '7–10 days',
        outcome: 'Faster resolutions, better customer experience'
      },
      {
        slug: 'feedback_collector',
        title: 'Customer Feedback Collector',
        description: 'Automated feedback collection with sentiment analysis',
        benefit: '3x more customer feedback with actionable insights.',
        delivered: 'Feedback automation + sentiment dashboard',
        timeframe: '10–14 days',
        outcome: 'Better customer insights, proactive improvements'
      }
    ],
    culture_growth: [
      {
        slug: 'team_appreciation_moments',
        title: 'Team Appreciation Moments',
        description: 'Celebrate key milestones, foster connection, and energise your team',
        benefit: 'Hand-built team recognition experiences, crafted for your team culture.',
        delivered: 'Custom team recognition and celebration experiences',
        timeframe: '7–14 days',
        outcome: 'Boosted morale, stronger team connection'
      },
      {
        slug: 'coaching_micro_growth',
        title: 'Coaching & Micro-Growth',
        description: 'Accelerate development with ongoing, personalised coaching prompts',
        benefit: 'Micro-coaching plans and feedback cycles, all tailored to individuals and teams.',
        delivered: 'Personalized coaching system with continuous development prompts',
        timeframe: '7–14 days',
        outcome: 'Accelerated growth, better retention'
      }
    ]
  };

  const scrollToSection = (elementId: string) => {
    const element = document.querySelector(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>How It Works — Measurable Improvements for UK SMEs | Teamsmiths</title>
        <meta name="description" content="Browse targeted business improvements by function: Sales, Finance, HR, Operations, Marketing, and Customer Service. Fixed pricing, proven results." />
        <meta name="keywords" content="business improvement, sales automation, finance optimization, HR tools, operations, marketing, customer service, UK SME" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
              Business wins and a stronger team, hand-built for your goals. Browse our proprietary methods: Process · Recognition · Growth.
            </p>

            {/* Business Function Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {businessFunctions.map((func) => (
                <Card 
                  key={func.id}
                  className="cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50"
                  onClick={() => scrollToSection(func.anchor)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-xl w-fit">
                      {func.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold">{func.title}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Business Wins Sections */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-24">
            
            {/* Sales Improvements */}
            <div id="sales">
              <h2 className="text-3xl font-bold text-center mb-12">Sales Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.sales.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Sales Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Sales improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific sales challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=sales#form">
                        Request Custom Sales Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Finance Improvements */}
            <div id="finance">
              <h2 className="text-3xl font-bold text-center mb-12">Finance Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.finance.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Finance Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Finance improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific finance challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=finance#form">
                        Request Custom Finance Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* HR Improvements */}
            <div id="hr">
              <h2 className="text-3xl font-bold text-center mb-12">HR Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.hr.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom HR Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different HR improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific HR challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=hr#form">
                        Request Custom HR Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Operations Improvements */}
            <div id="operations">
              <h2 className="text-3xl font-bold text-center mb-12">Operations Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.operations.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Operations Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Operations improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific operations challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=operations#form">
                        Request Custom Operations Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Marketing Improvements */}
            <div id="marketing">
              <h2 className="text-3xl font-bold text-center mb-12">Marketing Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.marketing.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Marketing Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Marketing improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific marketing challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=marketing#form">
                        Request Custom Marketing Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Customer Service Improvements */}
            <div id="customer-service">
              <h2 className="text-3xl font-bold text-center mb-12">Customer Service Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.customer_service.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Customer Service Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Customer Service improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific customer service challenge and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=customer_service#form">
                        Request Custom Customer Service Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Culture & Growth Improvements */}
            <div id="culture-growth">
              <h2 className="text-3xl font-bold text-center mb-12">Culture & Growth Improvements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.culture_growth.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
                
                {/* Custom Culture & Growth Request Card */}
                <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50 border-dashed border-2 border-muted-foreground/30">
                  <CardHeader className="pb-4">
                    <div className="mx-auto mb-4 p-4 bg-muted/20 rounded-xl w-fit">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Need a different Culture or Growth improvement?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base text-center">
                      Tell us about your specific team culture or development needs and we'll create a custom solution.
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full"
                    >
                      <Link to="/brief-builder?mode=quote&origin=solutions&category=culture_growth#form">
                        Request Custom Culture & Growth Improvement
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* General Custom Request Section */}
            <div className="mt-24 text-center">
              <h2 className="text-3xl font-bold mb-6">Don't see what you need?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Every business is unique. Tell us about your specific challenge and we'll create a custom business improvement just for you.
              </p>
              <Button asChild size="lg" className="mb-4">
                <Link to="/brief-builder?mode=quote&origin=solutions&category=custom#form">
                  Request Custom Improvement
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Fixed price quote delivered in 24 hours
              </p>
            </div>

          </div>
        </section>

        {/* Proof & Case Studies Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Real Results</h2>
              <p className="text-lg text-muted-foreground">Measurable improvements delivered in days, not months</p>
            </div>

            {/* Stats Bar */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">5–10 hrs</div>
                <p className="text-muted-foreground">saved per leader per week</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">45%</div>
                <p className="text-muted-foreground">uplift in team performance</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">14 days</div>
                <p className="text-muted-foreground">average delivery time</p>
              </div>
            </div>

            {/* Case Studies */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-card border-0">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary">32%</div>
                    <p className="text-sm text-muted-foreground">faster quoting</p>
                  </div>
                  <blockquote className="text-sm italic mb-4">
                    "We went from 3-day quote turnarounds to same-day responses. Our win rate jumped immediately."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">— Sarah, Marketing Agency Owner</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Quote Booster</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary">£12k</div>
                    <p className="text-sm text-muted-foreground">additional monthly revenue</p>
                  </div>
                  <blockquote className="text-sm italic mb-4">
                    "The follow-up system caught deals we would have lost. It's like having a sales assistant that never sleeps."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">— Marcus, Consulting Firm Director</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Follow-Up Engine</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-0">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary">15 hrs</div>
                    <p className="text-sm text-muted-foreground">saved weekly on admin</p>
                  </div>
                  <blockquote className="text-sm italic mb-4">
                    "Meeting notes automatically become tasks in our project system. The team actually follows up now."
                  </blockquote>
                  <p className="text-xs text-muted-foreground">— Lisa, Operations Manager</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">Meeting-to-Minutes</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Solutions;