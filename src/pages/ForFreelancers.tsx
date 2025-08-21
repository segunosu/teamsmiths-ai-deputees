import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Zap, Users, Shield, ArrowRight, Target, BarChart3, Award } from 'lucide-react';

const ForFreelancers = () => {
  const benefits = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI Deputees™",
      description: "Command AI agents to accelerate your work while you focus on strategy and quality.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Guaranteed Payment",
      description: "Escrow system ensures you get paid when milestones are approved.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Premium Positioning",
      description: "Join an exclusive network of vetted leaders commanding premium rates.",
    },
  ];

  const requirements = [
    "5+ years leadership experience in your domain",
    "Track record of delivering measurable business outcomes",
    "Excellent communication and client management skills",
    "Willingness to learn our AI Deputee workflows",
    "Professional references and portfolio review"
  ];

  const deputeePowers = [
    {
      icon: <Target className="h-6 w-6 text-accent" />,
      title: "Sales Acceleration",
      description: "Prospect research, outreach sequences, CRM management"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-accent" />,
      title: "Process Analysis", 
      description: "KPI analysis, bottleneck identification, improvement plans"
    },
    {
      icon: <Award className="h-6 w-6 text-accent" />,
      title: "Compliance Drafting",
      description: "Policy templates, compliance checklists, audit preparation"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-accent/5 to-primary/10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent mb-8 leading-tight">
            For Freelancers
          </h1>
          <p className="text-2xl sm:text-3xl text-muted-foreground mb-6 max-w-4xl mx-auto font-light leading-relaxed">
            <span className="text-foreground font-medium">Become a Teamsmith:</span>
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Command AI Deputees™ and deliver premium outcomes while focusing on strategy and client success
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="text-xl px-12 py-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/auth">Apply to Join</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-8 rounded-xl border-2 hover:bg-accent/5 transition-all duration-300">
              <Link to="/auth">Learn More</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center shadow-lg">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Deputees Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Command AI Deputees™
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI agents handle the heavy lifting while you focus on strategy and client success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {deputeePowers.map((power, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      {power.icon}
                    </div>
                    <CardTitle className="text-lg">{power.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {power.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">The Deputee Advantage</h3>
              <p className="text-lg text-muted-foreground mb-6">
                While traditional freelancers get bogged down in execution, Teamsmiths use AI to deliver 3x faster while maintaining premium quality and strategic oversight.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">3x</div>
                  <div className="text-sm text-muted-foreground">Faster Delivery</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">5x</div>
                  <div className="text-sm text-muted-foreground">Higher Rates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10x</div>
                  <div className="text-sm text-muted-foreground">Less Busy Work</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Application Requirements
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We're selective about who joins our network. Here's what we look for:
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Application Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <div className="font-semibold">Application Review</div>
                      <div className="text-sm text-muted-foreground">Portfolio and background check</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <div className="font-semibold">Skills Assessment</div>
                      <div className="text-sm text-muted-foreground">Domain expertise evaluation</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <div className="font-semibold">Client Interview</div>
                      <div className="text-sm text-muted-foreground">Soft skills and culture fit</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <div className="font-semibold">Onboarding</div>
                      <div className="text-sm text-muted-foreground">AI Deputee training and certification</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Join the Elite?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Applications are reviewed on a rolling basis. Join the elite network of performance-focused professionals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">
                Start Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Schedule Info Call</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">&lt; 5%</div>
              <div className="text-sm text-muted-foreground">Acceptance Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Elite</div>
              <div className="text-sm text-muted-foreground">Performance Tier</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForFreelancers;