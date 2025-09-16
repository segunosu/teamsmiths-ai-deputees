import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageSquare, Workflow, Globe, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessImpact = () => {
  const impactExamples = [
    {
      icon: <MessageSquare className="h-12 w-12 text-accent" />,
      title: 'Customer FAQ Assistant',
      duration: '10 business days',
      price: '£3,500',
      outcome: 'Fewer support emails; faster answers.',
      features: [
        'Web widget + CRM/email handoff',
        'Basic analytics dashboard'
      ]
    },
    {
      icon: <Workflow className="h-12 w-12 text-accent" />,
      title: 'Internal Ops Micro-Workflow',
      duration: '2 weeks',
      price: '£6,000',
      outcome: 'Less manual work; faster turnaround.',
      features: [
        'Intake → sheet → notifications',
        'Access controls + runbook'
      ]
    },
    {
      icon: <Globe className="h-12 w-12 text-accent" />,
      title: 'Customer Portal MVP',
      duration: '4–6 weeks',
      price: '£12k–£18k',
      outcome: 'Better self-serve; fewer back-and-forths.',
      features: [
        'Login, submissions, status, notifications',
        'Private repo + handover'
      ]
    }
  ];

  const getSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '_');

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
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Business Impact
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-16 max-w-3xl mx-auto leading-relaxed">
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
              Most builds start with a quick Audit.
            </p>
          </div>
        </section>

        {/* Impact Examples */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Impact Examples</h2>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {impactExamples.map((example, index) => (
                <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 text-left">
                  <CardHeader className="pb-6">
                    <div className="mb-6">
                      {example.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{example.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-3 mb-4">
                      <Badge variant="secondary" className="text-base font-bold">{example.price}</Badge>
                      <Badge variant="outline">{example.duration}</Badge>
                    </div>
                    <p className="text-lg font-semibold text-primary mb-4">{example.outcome}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {example.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                          <span className="text-base leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-col gap-3">
                      <Button className="w-full">
                        Book this Build
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/brief-builder?origin=impact&example=${getSlug(example.title)}`}>
                          Customise this Brief
                        </Link>
                      </Button>
                      <Link 
                        to={`/audit?origin=impact&ref=${getSlug(example.title)}`}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
                      >
                        Start an Audit
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Assurance Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base leading-relaxed text-muted-foreground">
              Confidential by default. You get code in your repo, a 30-day defects warranty, and the option of a light maintenance retainer (£500–£1,500/mo). We use modern AI agents with human QA. Regulated data or real-time payments go to trusted partners.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
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