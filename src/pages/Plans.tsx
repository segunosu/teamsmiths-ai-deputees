import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, ArrowRight, Users, Calendar, Target, TrendingUp, Zap } from 'lucide-react';
import AIDeputee from '@/components/AIDeputee';

const Plans = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigatorPlans = [
    {
      name: 'Navigator Lite',
      price: '£195',
      period: 'month',
      description: 'For: Solo operators & micro-teams',
      features: [
        '1 AI Deputee™ agent (single function e.g., proposals OR quotes)',
        'Monthly performance check',
        'Basic dashboard',
        '2 integrations (calendar, Zoom)'
      ],
      cta: 'Join Lite — £195/mo',
      ctaLink: '/plans/checkout?plan=lite',
      popular: false
    },
    {
      name: 'Navigator Core',
      price: '£395',
      period: 'month',
      description: 'For: Small teams (1–20 staff) who need a reliable AI team.',
      features: [
        '2 AI Deputee™ agents (sales + ops)',
        'Weekly performance digest',
        '1 x 60-min monthly advisor review',
        'Basic RAG',
        'Up to 5 integrations',
        'Deputee™ Assurance'
      ],
      cta: 'Join Core — £395/mo',
      ctaLink: '/plans/checkout?plan=core',
      popular: true
    },
    {
      name: 'Navigator Growth',
      price: '£795',
      period: 'month',
      description: 'For: Growing firms (10–50 staff) prioritising measurable revenue or cashflow uplift.',
      features: [
        '4 AI Deputee™ agents',
        'Fortnightly strategy session',
        'Customised vertical RAG',
        'Success tracking dashboard',
        'Priority support'
      ],
      cta: 'Join Growth — Demo',
      ctaLink: 'https://calendly.com/osu/brief-chat',
      popular: false
    },
    {
      name: 'Navigator Partner',
      price: 'Custom',
      period: '',
      description: 'For: high-growth or strategic partners.',
      features: [
        'Full Deputee™ suite',
        'Dedicated account team',
        'Bespoke integrations',
        'Optional performance fee or investment/board advisory by agreement'
      ],
      pricing: 'Custom (start at £2,500/mo + success fee)',
      cta: 'Apply for Partner',
      ctaLink: '/plans/partner-application',
      popular: false
    }
  ];

  const proofSprints = [
    {
      name: 'Proof Sprint — Lite',
      duration: '1 week',
      price: '£495',
      deliverable: '1 Deputee™ quick-win (proposal template + auto follow-up), KPI baseline',
      cta: 'Book Proof Sprint — £495',
      ctaLink: '/proof-sprints/checkout?sprint=lite'
    },
    {
      name: 'Proof Sprint — Focus',
      duration: '2 weeks',
      price: '£1,950',
      deliverable: '2 Deputee™ workflows, KPI baseline, measurement plan',
      cta: 'Start 2-week Proof — £1,950',
      ctaLink: '/proof-sprints/checkout?sprint=focus'
    },
    {
      name: 'Proof Sprint — Impact',
      duration: '4 weeks',
      price: '£4,950',
      deliverable: 'Full small pilot, weekly measurement, 30-day uplift projection',
      cta: 'Run 4-week Proof — £4,950',
      ctaLink: '/proof-sprints/checkout?sprint=impact'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Plans & Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            A single subscription gives you <AIDeputee /> agents + human Teamsmiths advisors — for less than the cost of a hire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/plans/checkout?plan=core">Join AI Navigator — £195/mo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book a demo
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Navigator Lite from £195 / month. Core starts at £395 / month. Proof Sprints from £495.
          </p>
        </div>

        {/* Navigator Plans */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Navigator Packs</h2>
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {navigatorPlans.map((plan, index) => (
              <Card key={index} className={`relative shadow-lg hover:shadow-xl transition-all ${
                plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {plan.price}
                    {plan.period && <span className="text-lg font-normal text-muted-foreground"> / {plan.period}</span>}
                  </div>
                  {plan.pricing && (
                    <p className="text-sm text-muted-foreground">{plan.pricing}</p>
                  )}
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="space-y-2 flex-1">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.ctaLink.startsWith('http') ? (
                        <a href={plan.ctaLink} target="_blank" rel="noopener noreferrer">
                          {plan.cta}
                        </a>
                      ) : (
                        <Link to={plan.ctaLink}>
                          {plan.cta}
                        </Link>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans are monitored and improved using <AIDeputee /> Assurance and include human QA. Month-to-month or quarterly billing available.
          </p>
        </div>

        {/* Proof Sprints */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Proof Sprints — validate in 1–4 weeks</h2>
            <p className="text-lg text-muted-foreground">
              Quick pilots to prove value before committing to a full subscription.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {proofSprints.map((sprint, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">{sprint.name}</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-primary">{sprint.price}</div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {sprint.duration}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Deliverable:</h4>
                    <p className="text-sm text-muted-foreground">{sprint.deliverable}</p>
                  </div>
                  <Button asChild className="w-full">
                    <Link to={sprint.ctaLink}>
                      {sprint.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 p-6 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Important:</strong> Proof Sprints require a signed scope (one-page) and KPI sign-off before start.
            </p>
            <p className="text-sm text-primary font-medium mt-2">
              Convert to Navigator Core within 30 days and receive onboarding credit equal to half your first month's Core fee (applies once).
            </p>
          </div>
        </div>

        {/* AI Deputee™ Assurance */}
        <div className="py-12 px-8 bg-muted/30 rounded-2xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              <AIDeputee /> Assurance — our QA promise
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every deployment is continuously monitored by <AIDeputee /> and reviewed by human Teamsmiths. We instrument KPIs, track results and use data to iterate weekly.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your AI Team?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start with a Proof Sprint or jump straight into Navigator Core.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/plans/checkout?plan=core">
                Join Navigator Core — £395/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/proof-sprints/checkout?sprint=lite">Start with Proof Sprint</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;