import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Users, Shield, Zap, Target, BarChart3, FileCheck } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Vetted Leaders",
      description: "Work with experienced Teamsmiths who deliver results, not just outputs"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Human QA",
      description: "Every deliverable passes mandatory human quality assurance before you see it"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI Deputees",
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
    "Vetted leaders only"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-normal py-2">
              Revenue up. Waste down.
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Delivered by vetted leaders + AI Deputees.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/catalog">View Templates</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book 15-min Intro</a>
              </Button>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Precision matching. We shortlist vetted Teamsmiths based on skills, domain, outcomes, availability—then you receive comparable quotes fast. Human QA on every milestone.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Outcomes you can trust—faster, safer, smarter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              The Three Pillars
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hire a Teamsmith: a vetted leader who commands AI Deputees to deliver results. Pay for milestones. QA included.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="mb-4">
                    {pillar.icon}
                  </div>
                  <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                  <CardDescription className="text-lg font-medium">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pillar.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Browse our solution templates or book a quick intro call to discuss your customization needs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/catalog">
                Browse Templates
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Book Intro Call</Link>
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