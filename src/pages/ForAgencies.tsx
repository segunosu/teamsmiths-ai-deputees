import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, TrendingUp, Zap, ArrowRight, Building, DollarSign, Target } from 'lucide-react';

const ForAgencies = () => {
  const benefits = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Build Your Roster",
      description: "Create an agency profile and invite your best Teamsmiths to join your collective.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Flexible Payouts",
      description: "Set custom payout splits per project. Retain margin while rewarding your team.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Scale Together",
      description: "Take on larger projects by combining your team's expertise and AI acceleration.",
    },
  ];

  const agencyFeatures = [
    "Agency profile with portfolio showcase",
    "Member invitation and role management", 
    "Project assignment and workload distribution",
    "Custom payout splits per milestone",
    "Collaborative project rooms",
    "Unified client communication",
    "Performance analytics and reporting",
    "Reputation and review system"
  ];

  const payoutExamples = [
    {
      role: "Agency Owner",
      percentage: "30-50%",
      description: "Business development, client relationship, project oversight"
    },
    {
      role: "Lead Teamsmith",
      percentage: "40-60%", 
      description: "Primary delivery, strategy, client-facing work"
    },
    {
      role: "Supporting Teamsmith",
      percentage: "20-30%",
      description: "Specialized expertise, execution support, QA review"
    }
  ];

  const agencyTypes = [
    {
      icon: <Target className="h-8 w-8 text-accent" />,
      title: "Specialized Boutiques",
      description: "Deep expertise in specific domains (GDPR, manufacturing CI, etc.)",
      example: "GDPR specialists handling compliance for fintech companies"
    },
    {
      icon: <Building className="h-8 w-8 text-accent" />,
      title: "Full-Service Agencies", 
      description: "Multi-domain teams offering comprehensive business solutions",
      example: "End-to-end growth agencies handling sales + ops + compliance"
    },
    {
      icon: <Zap className="h-8 w-8 text-accent" />,
      title: "AI-First Collectives",
      description: "Technical experts who push the boundaries of AI-human collaboration",
      example: "AI researchers developing custom Deputee workflows"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-primary/5 to-muted py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-8 leading-normal pt-4 pb-6">
            For Agencies
          </h1>
          <p className="text-2xl sm:text-3xl text-muted-foreground mb-6 max-w-4xl mx-auto font-light leading-relaxed">
            <span className="text-foreground font-medium">Build your collective, assign work, split payouts,</span>
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            and scale together with AI-accelerated teams that deliver premium outcomes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button asChild size="lg" className="text-xl px-12 py-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Link to="/auth">Create Agency</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-xl px-12 py-8 rounded-xl border-2 hover:bg-primary/5 transition-all duration-300">
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

      {/* Agency Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built-in tools to manage your team, projects, and client relationships
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                {agencyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">Agency Dashboard</CardTitle>
                  <CardDescription>
                    Centralized control for all your agency operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Active Projects</span>
                      <Badge>12</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      £47,500 total value • £12,300 this month
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Team Members</span>
                      <Badge>8</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      5 active • 3 on bench • 98% utilization
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Client Satisfaction</span>
                      <Badge variant="secondary">4.9/5</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on 47 completed projects
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Payout Structure */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Flexible Payout Splits
            </h2>
            <p className="text-xl text-muted-foreground">
              Configure custom splits for each project based on contribution and role
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {payoutExamples.map((example, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{example.role}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{example.percentage}</div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {example.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 text-center">Example Project Split</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4">£10,000 GDPR Compliance Pack</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Agency Owner (40%)</span>
                    <span className="font-semibold">£4,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lead Teamsmith (50%)</span>
                    <span className="font-semibold">£5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Legal Reviewer (10%)</span>
                    <span className="font-semibold">£1,000</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Automatic payouts via</div>
                <div className="text-lg font-semibold">Stripe Connect</div>
                <div className="text-sm text-muted-foreground mt-2">Released upon client milestone approval</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Agency Models
            </h2>
            <p className="text-xl text-muted-foreground">
              Different ways to structure and position your collective
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {agencyTypes.map((type, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      {type.icon}
                    </div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">Example:</div>
                    <div className="text-sm text-muted-foreground italic">
                      {type.example}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Agency Success Stories
            </h2>
            <p className="text-xl text-muted-foreground">
              Real agencies scaling with Teamsmiths
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl">ComplianceFirst Agency</CardTitle>
                  <Badge>GDPR Specialists</Badge>
                </div>
                <CardDescription className="text-lg">
                  "We went from 2 freelancers to a 6-person collective. The AI Deputees let us take on 3x more clients while maintaining quality."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">£500k</div>
                    <div className="text-xs text-muted-foreground">Annual Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">15 days</div>
                    <div className="text-xs text-muted-foreground">Avg Delivery</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">Client Retention</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-xl">GrowthTech Collective</CardTitle>
                  <Badge>Full-Service</Badge>
                </div>
                <CardDescription className="text-lg">
                  "The payout flexibility lets us experiment with different team structures. Some projects are 80/20, others are more even splits."
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Team Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">£1.2M</div>
                    <div className="text-xs text-muted-foreground">Annual Revenue</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4.8/5</div>
                    <div className="text-xs text-muted-foreground">Client Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Build Your Collective?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start with your existing team or recruit vetted Teamsmiths to join your agency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">
                Create Agency
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <a href="https://calendly.com/osu/teamsmiths-agency" target="_blank" rel="noopener noreferrer">Schedule Demo</a>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Active Agencies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">£50M+</div>
              <div className="text-sm text-muted-foreground">Total Payouts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForAgencies;