import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, Target, Cog, MessageSquare } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

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
        description: 'Draft proposals from meetings — delivered in 3–7 days',
        benefit: 'Send 28% more proposals, 37% faster turnaround.'
      },
      {
        slug: 'quote_booster',
        title: 'Quote Booster',
        description: 'Faster quotes; higher win rate — delivered in 5–10 days',
        benefit: '32% faster quotes, 11% higher win rate.'
      },
      {
        slug: 'follow_up_engine',
        title: 'Follow-Up Engine',
        description: 'Auto nudges; no lost deals',
        benefit: 'Never miss next steps; auto-nudges.'
      }
    ],
    finance: [
      {
        slug: 'cashflow_nudges',
        title: 'Cashflow Nudges',
        description: 'Polite invoice reminders; lower DSO — delivered in 3–5 days',
        benefit: '17% reduction in DSO, 22% fewer aged invoices.'
      },
      {
        slug: 'expense_categorizer',
        title: 'Expense Categorizer',
        description: 'Automated coding for bookkeeping',
        benefit: 'Automatic expense categorization.'
      }
    ],
    hr: [
      {
        slug: 'onboarding_kit',
        title: 'New Hire Onboarding Kit',
        description: '30-day ramp plan + SOPs — delivered in 7–10 days',
        benefit: '45% faster time to productivity.'
      },
      {
        slug: 'team_focus_rhythm',
        title: 'Team Focus Rhythm',
        description: 'Weekly cadence; fewer meetings',
        benefit: 'Better team rhythm, less meetings.'
      }
    ],
    operations: [
      {
        slug: 'meeting_to_minutes',
        title: 'Meeting-to-Minutes',
        description: 'Clean actions + tasks in your tools — delivered in 3–7 days',
        benefit: '15 hours saved per week, 45% better team efficiency.'
      },
      {
        slug: 'kb_starter',
        title: 'Knowledge Base Starter',
        description: 'Your SOPs searchable in one place',
        benefit: 'Searchable company knowledge.'
      }
    ],
    marketing: [
      {
        slug: 'objection_helper',
        title: 'Sales Objection Helper',
        description: 'Live prompts + response library',
        benefit: 'Handle objections confidently.'
      }
    ],
    customer_service: [
      {
        slug: 'faq_assistant_lite',
        title: 'Customer FAQ Assistant (lite)',
        description: 'Answers that deflect tickets',
        benefit: 'Reduce support tickets.'
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

            {/* Finance Uplifts */}
            <div id="finance">
              <h2 className="text-3xl font-bold text-center mb-12">Finance Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.finance.map((uplift) => (
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

            {/* HR Uplifts */}
            <div id="hr">
              <h2 className="text-3xl font-bold text-center mb-12">HR Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.hr.map((uplift) => (
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

            {/* Operations Uplifts */}
            <div id="operations">
              <h2 className="text-3xl font-bold text-center mb-12">Operations Uplift</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessUplifts.operations.map((uplift) => (
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
      </div>
    </>
  );
};

export default Solutions;