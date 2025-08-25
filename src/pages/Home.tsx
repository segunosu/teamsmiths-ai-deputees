import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Users, Shield, Zap, Target, BarChart3, FileCheck, Award, Clock, UserCheck, Database, CreditCard } from 'lucide-react';
import { OutcomeAssurance } from '@/components/OutcomeAssurance';
import { useEffect } from 'react';
import CapabilityGallery from '@/components/CapabilityGallery';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Vetted Experts",
      description: "Work with experienced experts who deliver results, not just outputs"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Human QA",
      description: "Every deliverable passes mandatory human quality assurance before you see it"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI Deputees™",
      description: "Our AI agents accelerate work while humans ensure quality and strategy"
    }
  ];

  const pillars = [
    {
      icon: <Target className="h-12 w-12 text-accent" />,
      title: "Sales Acceleration",
      description: "Global wedge, fastest ROI",
      items: ["Lead generation at scale", "Outbound campaign setup", "CRM integration & optimization"]
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-accent" />,
      title: "Continuous Improvement",
      description: "Manufacturing/services process improvement",
      items: ["KPI baseline analysis", "Bottleneck identification", "30-day improvement plans"]
    },
    {
      icon: <FileCheck className="h-12 w-12 text-accent" />,
      title: "Compliance",
      description: "UK credibility essentials",
      items: ["GDPR fast-track setup", "HR policy templates", "Privacy compliance"]
    }
  ];

  const trustFactors = [
    "Escrow payments by milestone",
    "Your data stays yours (scoped RAG)",
    "Mandatory QA on every deliverable",
    "Template starting points",
    "Vetted experts only"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Revenue Up. Waste Down. Fast
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
              Accelerate performance without consulting overhead.
            </p>
            
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
              <Link to="/brief-builder">Start a Bespoke Brief</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Talk to a curator</a>
            </Button>
          </div>

            {/* Benefits Strip */}
            <div className="border-t border-[#E5E7EB] mt-8 pt-4 pb-4">
              <div className="grid grid-cols-2 md:flex md:justify-between gap-4 md:gap-6 text-sm font-semibold text-[#111] max-w-4xl mx-auto">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Target className="h-4 w-4 text-primary" />
                  <span>Precision matched experts</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Milestone payments</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Faster outcomes</span>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Quality assured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Outcomes you can trust—faster, safer, smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes in Action - Capability Gallery */}
      <CapabilityGallery />

      {/* Three Pillars */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Outcome Packs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Choose from three proven pillars. Each pack combines vetted expertise with AI acceleration for guaranteed results.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {pillars.map((pillar, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="pb-6">
                  <div className="mb-6">
                    {pillar.icon}
                  </div>
                  <CardTitle className="text-3xl font-bold">{pillar.title}</CardTitle>
                  <CardDescription className="text-lg font-medium text-muted-foreground mt-3">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4">
                    {pillar.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
              <Link to="/catalog">
                Browse Outcome Catalog
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Outcome Assurance */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <OutcomeAssurance />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our outcome packs or book a quick intro call to discuss your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/brief-builder">
                Start a Bespoke Brief
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/catalog">Browse Outcome Catalog</Link>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">7 Days</div>
              <div className="text-sm text-muted-foreground">Average Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">QA Coverage</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;