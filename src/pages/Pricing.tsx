import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Star, ArrowRight, Users } from 'lucide-react';
import { OutcomeAssurance } from '@/components/OutcomeAssurance';
import { ASSURANCE } from '@/content/assurance';

const Pricing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pricingTiers = [
    {
      name: 'Starter Outcomes',
      priceRange: '£3,950–£6,000',
      timeline: '2–4 weeks',
      description: 'Perfect for focused, single-function improvements',
      features: [
        'Single expert assignment',
        'Deputee™ AI acceleration',
        'Human QA validation',
        'Milestone-based payment',
        'Basic Outcome Assurance™'
      ],
      popular: false
    },
    {
      name: 'Growth Outcomes',
      priceRange: '£6,000–£10,000',
      timeline: '3–5 weeks',
      description: 'Multi-function projects with integrated workflows',
      features: [
        'Multi-expert team coordination',
        'Advanced Deputee™ AI workflows',
        'Priority QA + human oversight',
        'Milestone + performance bonuses',
        'Full Outcome Assurance™',
        'Performance Safeguard'
      ],
      popular: true
    },
    {
      name: 'Scale Outcomes',
      priceRange: '£10,000–£20,000',
      timeline: '4–8 weeks',
      description: 'Complex, multi-system transformations',
      features: [
        'Dedicated expert team',
        'Custom Deputee™ AI implementation',
        'White-glove QA management',
        'Performance-based pricing options',
        'Premium Outcome Assurance™',
        'Performance Safeguard — reinforcement support',
        'Post-project optimization support'
      ],
      popular: false
    },
    {
      name: 'Enterprise Outcomes',
      priceRange: '£20,000+',
      timeline: '6+ weeks',
      description: 'Strategic transformations with ongoing optimization',
      features: [
        'Senior expert leadership',
        'Bespoke Deputee™ AI solutions',
        'Dedicated QA manager',
        'ROI-based success metrics',
        'Enterprise Outcome Assurance™',
        'Unlimited performance safeguards',
        'Ongoing optimization & support',
        'Strategic consultation included'
      ],
      popular: false
    }
  ];

  const assuranceFeatures = [
    'AI-driven insight, human validation, structured QA',
    'Milestone-based payments with satisfaction guarantees',
    'Real-time progress tracking and quality metrics',
    'Continuous optimization and support'
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Outcome-Based Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Pay for results, not hours. Every engagement includes Deputee™ AI™ acceleration and human QA validation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/brief-builder">Get Custom Quote</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Talk to a Curator
              </a>
            </Button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`relative shadow-lg hover:shadow-xl transition-all ${
              tier.popular ? 'border-primary ring-2 ring-primary/20' : ''
            }`}>
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-primary">{tier.priceRange}</div>
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {tier.timeline}
                </CardDescription>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"}>
                    <Link to="/brief-builder">
                      Customize This Tier
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outcome Assurance Section */}
        <div className="py-12 px-8 bg-muted/30 rounded-2xl mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              {ASSURANCE.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every engagement includes our comprehensive quality and outcome guarantee system.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {assuranceFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm">{feature}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="font-semibold text-lg">{ASSURANCE.body[1]}</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I need something custom?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every outcome can be fully customized. Our Brief Builder will capture your specific requirements 
                  and Deputee™ AI™ will provide a tailored proposal within 2 hours.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How does the Performance Safeguard work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  If you're not satisfied with your assigned expert's work quality or approach, we'll replace them 
                  at no additional cost and restart the work with a new expert.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What makes Deputee™ AI different?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Deputee™ AI accelerates expert work by 2-3x while maintaining human quality control. 
                  Every AI-generated output is validated by human experts before delivery.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I pay in installments?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! All projects are structured with milestone-based payments. You only pay as work 
                  is completed and validated to your satisfaction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;