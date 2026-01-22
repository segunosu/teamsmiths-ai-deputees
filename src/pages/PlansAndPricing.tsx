import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, TrendingUp, BarChart3, Clock, HelpCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const PlansAndPricing = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('plans_pricing_view' as any, {} as any);
  }, [trackEvent]);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Automation Essentials',
      price: '£495',
      priceNote: 'one-time',
      timeline: '1–2 weeks',
      description: 'Perfect for testing AI with quick wins',
      includes: [
        'AI Opportunity Scan',
        '1–2 automation workflows',
        'Basic team training',
        'KPI dashboard setup',
        'Email support for 30 days'
      ],
      outcomes: 'Save 5–10 hours/week, 80% error reduction',
      icon: <Zap className="h-8 w-8" />,
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      subtitle: 'Marketing & Sales AI',
      price: '£1,950',
      priceNote: 'one-time',
      timeline: '2–4 weeks',
      description: 'Drive revenue with AI-powered sales',
      includes: [
        'Everything in Starter',
        '3–4 AI workflows',
        'Comprehensive team training',
        'Basic integrations',
        '1 AI strategy session',
        'Priority support for 60 days'
      ],
      outcomes: '20% higher win rates, 32% faster quotes',
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Strategic AI & Analytics',
      price: '£4,950',
      priceNote: 'starting price',
      timeline: '4–8 weeks',
      description: 'Full AI transformation for growth',
      includes: [
        'Everything in Growth',
        'Unlimited workflows',
        'Advanced training + ongoing',
        'Full custom integrations',
        'Quarterly AI strategy sessions',
        'Dedicated account team'
      ],
      outcomes: 'Complete AI roadmap, real-time BI',
      icon: <BarChart3 className="h-8 w-8" />,
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'When will we see AI results?',
      answer: 'Most clients see measurable results within 2–4 weeks of implementation. Starter tier workflows typically go live within 1–2 weeks.'
    },
    {
      question: 'Is there a money-back guarantee if AI workflows don\'t deliver?',
      answer: 'We stand behind our work. If the agreed KPIs aren\'t met within 90 days, we\'ll continue working at no extra cost until they are, or provide a partial refund.'
    },
    {
      question: 'What\'s included in the AI Opportunity Scan?',
      answer: 'A 30-minute diagnostic where we analyze your current processes, identify high-impact AI use cases, and provide a prioritized roadmap for implementation.'
    },
    {
      question: 'Can I upgrade tiers later?',
      answer: 'Absolutely. Many clients start with Starter to prove value, then upgrade to Growth or Scale. Your initial investment is credited toward larger projects.'
    },
    {
      question: 'Do you offer ongoing support after implementation?',
      answer: 'Yes. Each tier includes a support period (30–60 days). For ongoing optimization, we offer a monthly retainer called Outcomes Assurance starting at £295/month.'
    },
    {
      question: 'What about culture, motivation, or coaching services?',
      answer: 'These are available as optional add-ons once your core AI workflows are delivering ROI. See our Add-Ons page for details on the Songita BusinessPack and coaching options.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Plans & Pricing | AI Solutions for UK SMEs | Teamsmiths</title>
        <meta name="description" content="Transparent pricing for AI solutions. Starter from £495, Growth from £1,950, Scale from £4,950. Results in under 90 days." />
        <meta name="keywords" content="AI pricing, SME AI costs, automation pricing, AI implementation" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Plans & Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
              Transparent, fixed pricing. No hidden fees. Results in under 90 days.
            </p>
            <p className="text-muted-foreground">
              All plans include Discovery & Implementation. Add Outcomes Assurance for continuous optimization.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                        <CardDescription className="text-base font-medium">{plan.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.priceNote}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{plan.timeline} implementation</span>
                    </div>
                    <p className="text-muted-foreground mt-4">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">What's Included:</h4>
                      <ul className="space-y-2">
                        {plan.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm"><strong>Typical Outcomes:</strong> {plan.outcomes}</p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Outcomes Assurance */}
            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                  <CardTitle className="text-xl">+ Outcomes Assurance (Optional Retainer)</CardTitle>
                  <CardDescription>Continuous optimization after implementation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">From £295/month</p>
                      <p className="text-sm text-muted-foreground mt-1">Monthly KPI reviews, workflow tweaks, priority support</p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground pl-8">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Have more questions?</p>
              <Button asChild variant="outline">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PlansAndPricing;
