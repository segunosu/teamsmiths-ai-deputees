import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const Plan = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlanSelect = (plan: string) => {
    trackEvent('plan_select' as any, { plan } as any);
  };

  const plans = [
    {
      id: 'professional',
      name: 'Professional',
      price: '£495',
      period: '/mo',
      features: [
        '1 Business Uplift / month',
        'KPI dashboard',
        'Fast start',
        'Email support',
        'Bank Uplifts (2-month cap)'
      ],
      cta: 'Join Professional',
      stripe_id: 'sub_pro_495'
    },
    {
      id: 'business',
      name: 'Business',
      price: '£895',
      period: '/mo',
      popular: true,
      features: [
        '2 Business Uplifts / month',
        'Business KPI dashboard',
        'Weekly async check-ins',
        'Start ≤4 business days',
        'All Professional plan benefits included'
      ],
      cta: 'Join Business',
      stripe_id: 'sub_bus_895'
    },
    {
      id: 'business_plus',
      name: 'Business Plus',
      price: '£1,495',
      period: '/mo',
      features: [
        '3 Business Uplifts / month OR',
        '2 Uplifts + bank toward 1 Project Build*/quarter',
        'Named lead',
        'Monthly working session',
        'All Business plan benefits included'
      ],
      cta: 'Join Business Plus',
      stripe_id: 'sub_plus_1495'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Simple subscription. Monthly Business Uplifts. Bank for bigger Project Builds | Teamsmiths</title>
        <meta name="description" content="Choose your Business Uplift subscription plan. Monthly targeted improvements delivered fast with AI Deputee™ and expert oversight." />
        <meta name="keywords" content="business uplift, subscription plans, monthly improvements, AI deputee, business automation" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Simple subscription. Monthly Business Uplifts.
            </h1>
          </div>
        </section>

        {/* Pricing Cards */}
        <section id="pricing" className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative shadow-sm hover:shadow-lg transition-all duration-300 ${plan.popular ? 'border-primary scale-105' : 'border-border'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-xl text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {feature.includes('Project Build*') ? (
                              <>
                                {feature.replace('Project Build*', 'Project Build')}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger className="text-primary cursor-help">*</TooltipTrigger>
                                    <TooltipContent>
                                      <p>A larger app/automation you fund by banking Business Uplifts for bigger impact projects.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            ) : (
                              feature
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Project Alternative */}
            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-4">
                Prefer a one-off project?  Speak to us and get a fixed price.
              </p>
              <Button asChild variant="outline">
                <Link to="/brief-builder?mode=quote#form">Get a fixed price</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">What's a Business Uplift?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    A targeted business improvement—implemented, tested, and delivered each month. No jargon, no delays.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">What's a Project Build?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    A larger app/automation you fund by banking Business Uplifts for bigger impact projects.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Do Business Uplifts roll over?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Yes, up to 2 months. Bank them for larger Project Builds when you need them.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Can we switch to a project?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Yes—subscription fees can be credited within 90 days toward project work.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Plan;