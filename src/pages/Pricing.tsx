import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Users, Target, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

const Pricing = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('pricing_view' as any, {} as any);
  }, [trackEvent]);

  const handlePlanSelect = (plan: string) => {
    trackEvent('plan_select' as any, { plan } as any);
  };

  const plans = [
    {
      name: 'Professional',
      price: '£175',
      period: '/mo',
      description: 'Perfect for getting started',
      features: [
        '1 Rapid Audit or Quick Outcome each month',
        '1-month rollover',
        'Email support'
      ],
      icon: <Users className="h-6 w-6" />,
      stripeId: 'sub_faio_175',
      popular: false
    },
    {
      name: 'Business',
      price: '£495',
      period: '/mo',
      description: 'Our most popular plan',
      features: [
        'Mini Audit each quarter',
        '1 Quick Outcome/month', 
        'Priority start + KPI summary'
      ],
      icon: <Target className="h-6 w-6" />,
      stripeId: 'sub_faio_495',
      popular: true
    },
    {
      name: 'Business Plus',
      price: '£795',
      period: '/mo',
      description: 'For teams that need more',
      features: [
        'Full Audit included (annual)',
        '2 live Outcomes at a time + quarterly micro-Impact',
        'Monthly advisory call'
      ],
      icon: <Crown className="h-6 w-6" />,
      stripeId: 'sub_faio_795',
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>Simple subscription, real results | Teamsmiths</title>
        <meta name="description" content="Start small with a Rapid Audit or a Quick Outcome each month. Upgrade to bigger work anytime." />
        <meta name="keywords" content="subscription, pricing, business outcomes, audit, monthly plans" />
        <link rel="canonical" href={window.location.origin + '/pricing'} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Simple subscription, real results
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed">
              Start small with a Rapid Audit or a Quick Outcome each month. Upgrade to bigger work anytime.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
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
                  
                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                      {plan.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handlePlanSelect(plan.name)}
                      asChild
                    >
                      <a href={`#stripe-${plan.stripeId}`}>
                        Start {plan.name}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Additional info */}
            <div className="text-center mt-16 max-w-3xl mx-auto">
              <p className="text-muted-foreground mb-6">
                • Prefer a one-off project? Most Outcomes £1.9k–£2.5k; Impact builds from £3.5k.
              </p>
              <Button asChild variant="outline">
                <Link to="/brief-builder?mode=quote#form">
                  Get a fixed price in 24h
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;