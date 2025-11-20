import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const Plans = () => {
  const { trackEvent } = useAnalytics();

  const plans = [
    {
      id: 'lite',
      name: 'Navigator Lite',
      price: '£195',
      period: 'month',
      who: 'Solo operators & micro-teams',
      features: [
        '1 improvement agent (single function: proposals OR quotes)',
        'Monthly performance check',
        'Basic dashboard',  
        '2 integrations (calendar, Zoom)'
      ],
      primaryCTA: 'Join Lite — £195 / month',
      primaryAction: () => {
        trackEvent('plan_subscribe_click', { plan_id: 'lite', price: 195 });
        window.location.href = '/checkout?plan=lite';
      },
      secondaryCTA: 'Request bespoke',
      secondaryAction: () => {
        trackEvent('plan_request_bespoke_click', { plan_id: 'lite' });
        window.location.href = '/brief-builder?plan=lite';
      }
    },
    {
      id: 'core',
      name: 'Navigator Core',
      price: '£395',
      period: 'month',
      popular: true,
      who: 'Small teams (1–20 staff)',
      features: [
        '2 improvement agents (sales + ops)',
        'Weekly performance digest',
        '1×60min monthly advisor review',
        'Basic RAG',
        'Up to 5 integrations',
        'Performance Assurance'
      ],
      primaryCTA: 'Join Core — £395 / month',
      primaryAction: () => {
        trackEvent('plan_subscribe_click', { plan_id: 'core', price: 395 });
        window.location.href = '/checkout?plan=core';
      },
      secondaryCTA: 'Request bespoke',
      secondaryAction: () => {
        trackEvent('plan_request_bespoke_click', { plan_id: 'core' });
        window.location.href = '/brief-builder?plan=core';
      }
    },
    {
      id: 'growth',
      name: 'Navigator Growth',
      price: '£795',
      period: 'month',
      who: 'Growing firms (10–50 staff)',
      features: [
        '4 improvement agents',
        'Fortnightly strategy session',
        'Custom vertical RAG',
        'Success tracking dashboard',
        'Priority support'
      ],
      primaryCTA: 'Join Growth — Demo',
      primaryAction: () => {
        trackEvent('plan_subscribe_click', { plan_id: 'growth', price: 795 });
        window.location.href = '/demo?plan=growth';
      },
      secondaryCTA: 'Request bespoke',
      secondaryAction: () => {
        trackEvent('plan_request_bespoke_click', { plan_id: 'growth' });
        window.location.href = '/brief-builder?plan=growth';
      }
    },
    {
      id: 'partner',
      name: 'Navigator Partner',
      price: 'Custom',
      period: 'starting at £2,500 / month + success fee',
      who: 'Strategic partners/fast-growth SMBs',
      bespokeOnly: true,
      features: [
        'Full improvement suite',
        'Dedicated account team',
        'Bespoke integrations',
        'Optional performance fee or equity/advisory options'
      ],
      primaryCTA: 'Start a Bespoke Brief',
      primaryAction: () => {
        trackEvent('plan_request_bespoke_click', { plan_id: 'partner' });
        window.location.href = '/brief-builder?plan=partner';
      }
    }
  ];

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every engagement includes a hand-built business win and the option to add custom team appreciation or ongoing growth coaching—delivered and proven, tracked in your numbers.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative shadow-sm hover:shadow-lg transition-all duration-300 border-2 ${
                plan.popular 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    )}
                  </div>
                  {plan.price === 'Custom' && (
                    <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                  )}
                </div>
                <CardDescription className="text-base font-medium mt-4">
                  {plan.who}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="space-y-3">
                  <Button 
                    onClick={plan.primaryAction}
                    className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                    size="lg"
                  >
                    {plan.primaryCTA}
                  </Button>
                  
                  {!plan.bespokeOnly && (
                    <Button 
                      onClick={plan.secondaryAction}
                      variant="outline" 
                      className="w-full"
                      size="sm"
                    >
                      {plan.secondaryCTA}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            All plans include continuous monitoring and human QA. Teamsmiths uplift includes custom recognition and ongoing coaching, all hand-built for your team. Month-to-month or quarterly billing available.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Plans;