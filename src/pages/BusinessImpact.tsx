import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Workflow, Globe } from 'lucide-react';
import { OfferingHero } from '@/components/ui/offering-hero';
import { OfferingCard } from '@/components/ui/offering-card';
import { StickyMobileBar } from '@/components/ui/sticky-mobile-bar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const BusinessImpact = () => {
  const impactExamples = [
    {
      icon: <MessageSquare className="h-12 w-12 text-accent" />,
      title: 'Customer FAQ Assistant',
      duration: '10 business days',
      price: '£3,500',
      benefit: 'Fewer support emails; faster answers.',
      bullets: [
        'Web widget + CRM/email handoff',
        'Basic analytics dashboard'
      ],
      slug: 'faq_assistant'
    },
    {
      icon: <Workflow className="h-12 w-12 text-accent" />,
      title: 'Internal Ops Micro-Workflow',
      duration: '2 weeks',
      price: '£6,000',
      benefit: 'Less manual work; faster turnaround.',
      bullets: [
        'Intake → sheet → notifications',
        'Access controls + runbook'
      ],
      slug: 'micro_workflow'
    },
    {
      icon: <Globe className="h-12 w-12 text-accent" />,
      title: 'Customer Portal MVP',
      duration: '4–6 weeks',
      price: '£12k–£18k',
      benefit: 'Better self-serve; fewer back-and-forths.',
      bullets: [
        'Login, submissions, status, notifications',
        'Private repo + handover'
      ],
      slug: 'customer_portal'
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
        <OfferingHero 
          title="Business Impact"
          subtitle="Rapid, scoped application builds that move your numbers—fast."
          briefOrigin="impact"
          helperText="Most builds start with a quick Audit."
        />

        {/* Impact Examples */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Impact Examples</h2>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {impactExamples.map((example, index) => (
                <OfferingCard
                  key={index}
                  variant="impact"
                  title={example.title}
                  price={example.price}
                  duration={example.duration}
                  benefit={example.benefit}
                  bullets={example.bullets}
                  icon={example.icon}
                  ctas={{
                    primary: {
                      label: "Book this Build",
                      sku: `impact_${example.slug}_${example.price.replace('£', '').replace('k', '000').replace('–', '').split('–')[0]}`,
                      onClick: () => {
                        // TODO: Implement Stripe checkout for impact builds
                        console.log(`Booking ${example.title}`);
                      }
                    },
                    secondary: {
                      label: "Customise this Brief",
                      link: `/brief-builder?origin=impact&ref=${example.slug}`
                    },
                    tertiary: {
                      label: "Start an Audit",
                      link: `/audit?origin=impact&ref=${example.slug}`
                    }
                  }}
                />
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

        <StickyMobileBar briefOrigin="impact" />
      </div>
    </>
  );
};

export default BusinessImpact;