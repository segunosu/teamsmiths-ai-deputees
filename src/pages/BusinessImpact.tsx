import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Zap, Target, Users, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessImpact = () => {
  const impactExamples = [
    {
      title: 'Customer FAQ Assistant',
      outcome: 'Fewer support emails; faster answers.',
      features: [
        'Web widget + CRM/email handoff',
        'Basic analytics dashboard'
      ],
      duration: '10 business days',
      price: '£3,500',
      feasibilityPrice: '£1,250'
    },
    {
      title: 'Internal Ops Micro-Workflow',
      outcome: 'Less manual work; faster turnaround.',
      features: [
        'Intake → sheet → notifications',
        'Access controls + runbook'
      ],
      duration: '2 weeks',
      price: '£6,000',
      feasibilityPrice: '£1,250'
    },
    {
      title: 'Customer Portal MVP',
      outcome: 'Better self-serve; fewer back-and-forths.',
      features: [
        'Login, submissions, status, notifications',
        'Private repo + handover'
      ],
      duration: '4–6 weeks',
      price: '£12k–£18k',
      feasibilityPrice: '£1,250'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Business Impact - Rapid Scoped Application Builds | Teamsmiths</title>
        <meta 
          name="description" 
          content="Rapid, scoped application builds that move your numbers—fast. Custom solutions delivering measurable business impact in weeks." 
        />
        <meta name="keywords" content="business impact, rapid applications, scoped builds, measurable results, business efficiency" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Business Impact
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Rapid, scoped application builds that move your numbers—fast.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Button size="lg" asChild>
                <Link to="/brief-builder?origin=impact">
                  Start a Brief
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a Call
                </a>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Feasibility in 5 business days if needed.
            </p>
          </div>
        </section>

        {/* Impact Examples */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Impact Examples</h2>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {impactExamples.map((example, index) => (
                <Card key={index} className="text-left">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">{example.title}</CardTitle>
                    <p className="text-primary font-semibold">{example.outcome}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {example.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex gap-2 mb-6">
                      <Badge variant="secondary">{example.duration}</Badge>
                      <Badge variant="outline">{example.price}</Badge>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button asChild size="sm">
                        <Link to={`/brief-builder?origin=impact&example=${example.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          Start a Brief
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        Start Feasibility ({example.feasibilityPrice})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feasibility Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Build Feasibility Audit — £1,250 — 5 business days</h2>
            <p className="text-muted-foreground mb-6">
              Scope & risk check, data boundaries, go/no-go. Credited if a Build starts within 30 days.
            </p>
            <Button>Start Feasibility (£1,250)</Button>
          </div>
        </section>

        {/* Assurance Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground mb-8">
              Confidential by default. You get code in your repo, a 30-day defects warranty, and the option of a light maintenance retainer (£500–£1,500/mo). We use modern AI agents with human QA. No regulated data or real-time payments builds—those go to partners.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to create impact?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/brief-builder?origin=impact">
                  Start a Brief
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a Call
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BusinessImpact;