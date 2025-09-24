import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, DollarSign, Target, Cog, MessageSquare } from 'lucide-react';
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
      title: 'Sales Uplift',
      icon: <Target className="h-8 w-8 text-primary" />,
      anchor: '#sales'
    },
    {
      id: 'marketing',
      title: 'Marketing Uplift',
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      anchor: '#marketing'
    },
    {
      id: 'hr',
      title: 'HR Uplift',
      icon: <Users className="h-8 w-8 text-primary" />,
      anchor: '#hr'
    },
    {
      id: 'finance',
      title: 'Finance Uplift',
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      anchor: '#finance'
    },
    {
      id: 'operations',
      title: 'Operations Uplift',
      icon: <Cog className="h-8 w-8 text-primary" />,
      anchor: '#operations'
    },
    {
      id: 'customer_service',
      title: 'Customer Service Uplift',
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      anchor: '#customer-service'
    }
  ];

  const businessUplifts = {
    sales: [
      {
        slug: 'proposal_speed_up',
        title: 'Proposal Speed-Up',
        description: 'Automated proposal creation from meeting notes and client briefs — delivered in 3–7 days',
        benefit: 'Send 28% more proposals with 37% faster turnaround — track on your dashboard.',
        delivered: 'Custom proposal templates + automation setup',
        timeframe: '3–7 days',
        outcome: 'Measurable increase in proposal volume and speed'
      },
      {
        slug: 'quote_booster',
        title: 'Quote Booster',
        description: 'Streamlined quoting process with dynamic pricing models — delivered in 5–10 days',
        benefit: '32% faster quotes with 11% higher win rate — measured monthly.',
        delivered: 'Quote automation system + pricing calculator',
        timeframe: '5–10 days',
        outcome: 'Faster quotes, higher conversion rates'
      },
      {
        slug: 'follow_up_engine',
        title: 'Follow-Up Engine',
        description: 'Automated client follow-up system with smart nudging — delivered in 3–5 days',
        benefit: 'Never miss follow-ups; 23% more deals closed on time.',
        delivered: 'Follow-up automation + CRM integration',
        timeframe: '3–5 days',
        outcome: 'Zero missed opportunities, improved close rates'
      }
    ],
    finance: [
      {
        slug: 'cashflow_nudges',
        title: 'Cashflow Nudges',
        description: 'Automated invoice reminders with polite escalation sequences — delivered in 3–5 days',
        benefit: '17% reduction in DSO, 22% fewer aged invoices — tracked monthly.',
        delivered: 'Smart reminder system + payment tracking dashboard',
        timeframe: '3–5 days',
        outcome: 'Faster payments, improved cash flow'
      },
      {
        slug: 'expense_categorizer',
        title: 'Expense Categorizer',
        description: 'AI-powered expense categorization and bookkeeping automation — delivered in 5–7 days',
        benefit: '15 hours saved monthly on bookkeeping tasks.',
        delivered: 'Automated categorization rules + accounting integration',
        timeframe: '5–7 days',
        outcome: 'Reduced admin time, accurate books'
      }
    ],
    hr: [
      {
        slug: 'onboarding_kit',
        title: 'New Hire Onboarding Kit',
        description: '30-day structured onboarding plan with SOPs and tracking — delivered in 7–10 days',
        benefit: '45% faster time to productivity for new hires — measured monthly.',
        delivered: 'Custom onboarding workflow + SOP templates',
        timeframe: '7–10 days',
        outcome: 'Faster ramp-up, better retention'
      },
      {
        slug: 'team_focus_rhythm',
        title: 'Team Focus Rhythm',
        description: 'Weekly team cadence system with clear priorities — delivered in 5–7 days',
        benefit: '30% reduction in meeting time with better focus.',
        delivered: 'Weekly rhythm framework + priority tracker',
        timeframe: '5–7 days',
        outcome: 'More focused team, fewer meetings'
      }
    ],
    operations: [
      {
        slug: 'meeting_to_minutes',
        title: 'Meeting-to-Minutes',
        description: 'Automated meeting notes with action items in your tools — delivered in 3–7 days',
        benefit: '15 hours saved per week, 45% better team efficiency.',
        delivered: 'Meeting automation + task integration',
        timeframe: '3–7 days',
        outcome: 'Clear actions, better follow-through'
      },
      {
        slug: 'kb_starter',
        title: 'Knowledge Base Starter',
        description: 'Searchable company SOPs and knowledge system — delivered in 7–10 days',
        benefit: 'Instant access to company knowledge for all team members.',
        delivered: 'Searchable knowledge base + content migration',
        timeframe: '7–10 days',
        outcome: 'Faster onboarding, consistent processes'
      }
    ],
    marketing: [
      {
        slug: 'objection_helper',
        title: 'Sales Objection Helper',
        description: 'Live objection handling prompts with response library — delivered in 5–7 days',
        benefit: '25% higher close rates with confident objection handling.',
        delivered: 'Objection response system + training materials',
        timeframe: '5–7 days',
        outcome: 'More confident sales calls, higher conversion'
      }
    ],
    customer_service: [
      {
        slug: 'faq_assistant_lite',
        title: 'Customer FAQ Assistant (lite)',
        description: 'Automated FAQ responses that reduce support tickets — delivered in 5–7 days',
        benefit: '40% reduction in basic support tickets.',
        delivered: 'FAQ automation + deflection system',
        timeframe: '5–7 days',
        outcome: 'Less support burden, happier customers'
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
        <title>Choose your next Business Uplift | Teamsmiths</title>
        <meta name="description" content="Browse targeted Business Uplifts by function: Sales, Finance, HR, Operations, Marketing, and Customer Service. Add to your plan or get a fixed price." />
        <meta name="keywords" content="business uplift, sales automation, finance optimization, HR tools, operations improvement, marketing automation, customer service" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Choose your next Business Uplift
            </h1>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
              <strong>Business Uplift:</strong> A targeted business improvement—implemented, tested, and delivered in 3–10 days. No jargon, no delays.
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

        {/* Business Uplift Sections */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-24">
            
            {/* Sales Uplifts */}
            <div id="sales">
              <h2 className="text-3xl font-bold text-center mb-12">Sales Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.sales.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
              </div>
            </div>

            {/* Finance Uplifts */}
            <div id="finance">
              <h2 className="text-3xl font-bold text-center mb-12">Finance Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.finance.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
              </div>
            </div>

            {/* HR Uplifts */}
            <div id="hr">
              <h2 className="text-3xl font-bold text-center mb-12">HR Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.hr.map((uplift) => (
                  <BusinessUpliftCard 
                    key={uplift.slug} 
                    uplift={uplift}
                    onBusinessUpliftClick={handleBusinessUpliftClick}
                  />
                ))}
              </div>
            </div>

            {/* Marketing Uplifts */}
            <div id="marketing">
              <h2 className="text-3xl font-bold text-center mb-12">Marketing Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.marketing.map((uplift) => (
                  <Card key={uplift.slug} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">{uplift.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">
                        {uplift.description}
                      </CardDescription>
                      <Button 
                        asChild 
                        className="w-full"
                        onClick={() => handleBusinessUpliftClick('add_to_plan', uplift.slug)}
                      >
                        <Link to={`/start?engage=subscription&ref=${uplift.slug}`}>Add to Plan</Link>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Tailored to your business during onboarding.
                      </p>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleBusinessUpliftClick('fixed_price', uplift.slug)}
                      >
                        <Link to={`/brief-builder?mode=quote&origin=solutions&ref=${uplift.slug}#form`}>
                          Prefer a project? Get a fixed price in 24h
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Customer Service Uplifts */}
            <div id="customer-service">
              <h2 className="text-3xl font-bold text-center mb-12">Customer Service Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.customer_service.map((uplift) => (
                  <Card key={uplift.slug} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold">{uplift.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">
                        {uplift.description}
                      </CardDescription>
                      <Button 
                        asChild 
                        className="w-full"
                        onClick={() => handleBusinessUpliftClick('add_to_plan', uplift.slug)}
                      >
                        <Link to={`/start?engage=subscription&ref=${uplift.slug}`}>Add to Plan</Link>
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Tailored to your business during onboarding.
                      </p>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleBusinessUpliftClick('fixed_price', uplift.slug)}
                      >
                        <Link to={`/brief-builder?mode=quote&origin=solutions&ref=${uplift.slug}#form`}>
                          Prefer a project? Get a fixed price in 24h
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                <div className="text-4xl font-bold text-primary mb-2">7 days</div>
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