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
      price: '£495',
      period: '/mo',
      description: 'Perfect for getting started',
      features: [
        '1 Rapid Audit or 1 Quick Outcome / month',
        'KPI dashboard',
        'Fast start',
        'Email support',
        '1-month rollover'
      ],
      icon: <Users className="h-6 w-6" />,
      stripeId: 'sub_pro_495',
      popular: false
    },
    {
      name: 'Business',
      price: '£895',
      period: '/mo',
      description: 'Our most popular plan',
      features: [
        'Mini Audit each quarter',
        '1 Quick Outcome / month',
        'Business KPI dashboard + monthly 20-min review',
        'Priority start (≤4 business days)',
        'All Professional plan benefits included'
      ],
      icon: <Target className="h-6 w-6" />,
      stripeId: 'sub_bus_895',
      popular: true
    },
    {
      name: 'Business Plus',
      price: '£1,495',
      period: '/mo',
      description: 'For teams that need more',
      features: [
        'Full Audit included (annual)',
        '2 live Outcomes at a time',
        'Quarterly micro-Impact',
        'Monthly advisory call',
        'All Business plan benefits included'
      ],
      icon: <Crown className="h-6 w-6" />,
      stripeId: 'sub_bus_plus_1495',
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
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Start small with a Rapid Audit or a Quick Outcome each month. Upgrade to bigger work anytime.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-16 leading-relaxed">
              Each month, pick a Quick Outcome or Impact. We tailor every build to your business — nothing generic.
            </p>
          </div>
        </section>

        {/* Pricing ribbon */}
        <section className="py-4 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              Most one-off Outcomes £1.9k–£2.5k · Impact builds from £3.5k · Audits £750. Prefer projects?{' '}
              <Button asChild variant="link" className="p-0 h-auto text-sm">
                <Link to="/brief?mode=quote#form">Get a fixed price in 24h</Link>
              </Button>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Need recognition only? You can also book a standalone{' '}
              <Link to="/motivation-and-appreciation" className="text-primary hover:underline">
                Motivation & Appreciation BusinessPack
              </Link>
              {' '}for your team.
            </p>
          </div>
        </section>

        {/* Optional Layers Note */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-muted/30 border-muted">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Optional culture & motivation layers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For some projects, clients choose to add a personalised <Link to="/motivation-and-appreciation" className="text-primary hover:underline">Motivation & Appreciation layer</Link> (Songita BusinessPack) or Coaching & Growth layer. These are quoted as part of your bespoke build, only if they support your outcomes.
                </p>
                <Button asChild variant="link" className="p-0 h-auto text-sm">
                  <Link to="/brief-builder">
                    Ask about motivation & coaching options
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
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
            
            {/* BusinessPack standalone note */}
            <div className="text-center mt-12 max-w-3xl mx-auto">
              <p className="text-base text-muted-foreground">
                Need recognition only? You can also book a standalone{' '}
                <Link to="/motivation-and-appreciation" className="text-primary hover:underline">
                  Motivation & Appreciation BusinessPack
                </Link>
                {' '}for your team.
              </p>
            </div>
            
            {/* Additional info */}
            <div className="text-center mt-12 max-w-3xl mx-auto space-y-4">
              <p className="text-muted-foreground">
                Subscription fees count as credit toward a Business Outcome within 90 days.
              </p>
              <div>
                <p className="text-base text-muted-foreground mb-2">
                  Prefer a custom build? Request a fixed quote.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Use this if you want either a one‑off BusinessPack (e.g. year‑end recognition) or a full multi‑improvement project.
                </p>
                <Button asChild variant="outline" size="lg">
                  <Link to="/brief-builder?mode=quote#form">
                    Request bespoke quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's included?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each plan includes custom-built solutions tailored to your business needs, KPI tracking, and expert support. Higher tiers add more audits, outcomes, and advisory time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I just buy the Motivation & Appreciation / BusinessPack on its own?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes. You can book a standalone BusinessPack (popular for year‑end and special milestones), or include it as a motivation layer inside a wider Teamsmiths project. We'll scope and price whichever works best for you.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can you also help with motivation, appreciation, or coaching?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes. Where it fits your goals, we can include a hand-built Motivation & Appreciation layer (Songita BusinessPack) and Coaching & Growth layer in your project scope. These are optional and priced per project, the same as other improvements.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is this a subscription?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes, these are monthly subscriptions that give you ongoing access to our services. You can cancel anytime, and your subscription fees count as credit toward larger Business Outcomes within 90 days.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I have to commit to the motivation or coaching layers?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    No. They are optional add-ons. You only include them if they clearly support the business outcome you care about.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Pricing;