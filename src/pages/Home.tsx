import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Users, Shield, Zap, Target, BarChart3, FileCheck, Award, Clock, UserCheck, Database, CreditCard } from 'lucide-react';
import { OutcomeAssurance } from '@/components/OutcomeAssurance';
import { useEffect } from 'react';
import CapabilityGallery from '@/components/CapabilityGallery';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';

const Home = () => {
  const { trackEvent } = useAnalytics();
  
  // Ensure proper component loading
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Pick the KPI",
      description: "Choose what matters most: revenue, speed, or cost reduction."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Deploy in weeks",
      description: "Launch with <AIDeputee /> and expert QA for fast, reliable results."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Report uplift",
      description: "Measure the improvement and keep compounding (optional +5% performance share)."
    }
  ];

  const outcomePacks = [
    {
      icon: <FileCheck className="h-12 w-12 text-accent" />,
      title: "Proposal Velocity Pack",
      price: "£1,950",
      duration: "2 weeks",
      description: "Draft proposals from your last call; branded & tracked with <AIDeputee />",
      items: ["Two follow-up cadences included", "KPIs: proposals/week • time-to-proposal • open rate"],
      ctas: ["Book this Pack", "Start a Bespoke Brief"]
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-accent" />,
      title: "Sales Uplift Pack", 
      price: "£1,950",
      duration: "2 weeks",
      description: "Transcript-to-quote + SMS/email nudges",
      items: ["Simple pipeline tracker", "KPIs: quotes/week • time-to-quote • conversion to job"],
      ctas: ["Book this Pack", "Start a Bespoke Brief"]
    },
    {
      icon: <CreditCard className="h-12 w-12 text-accent" />,
      title: "Cashflow Control Pack",
      price: "£2,500", 
      duration: "3 weeks",
      description: "Connect Xero/QBO; aging analysis; tone ladder",
      items: ["Owner weekly cash digest", "KPIs: DSO • £ aged >30/60 days • response rate"],
      ctas: ["Book this Pack", "Start a Bespoke Brief"]
    }
  ];

  // Keep pillars for backward compatibility (to be updated later)
  const pillars = outcomePacks;

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
              Build your AI team to grow your business
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
              More revenue. Lower costs. The speed of AI with Human Oversight.
            </p>
            
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button 
              asChild 
              size="lg" 
              className="text-lg px-10 py-6 h-auto"
            >
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-6 h-auto"
            >
              <Link to="/outcome-packs">See Outcome Packs</Link>
            </Button>
          </div>

          {/* Price anchor */}
          <p className="text-sm text-muted-foreground mb-10">
            Outcome Packs from £1,950. Retainers from £1,500/mo. + 5% uplift participation (eligible).
          </p>

          {/* Separator line */}
          <div className="w-full max-w-4xl mx-auto mb-8">
            <hr className="border-t border-border" />
          </div>

          {/* Benefits Strip */}
          <div className="mb-10">
            <div className="grid grid-cols-2 md:flex md:justify-between gap-4 md:gap-6 text-sm font-semibold text-foreground max-w-4xl mx-auto">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Target className="h-4 w-4 text-primary" />
                <span>Precision-matched expertise</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Measured uplift</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Zap className="h-4 w-4 text-primary" />
                <span>Faster outcomes</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Shield className="h-4 w-4 text-primary" />
                <span><AIDeputee /> Assurance</span>
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
              How it works
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
      <section id="offers" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Business Outcome Packs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Packaged, rapid solutions delivered in weeks—focused on revenue, speed, and cost.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {pillars.map((pack, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="pb-6">
                  <div className="mb-6">
                    {pack.icon}
                  </div>
                  <CardTitle className="text-3xl font-bold">{pack.title}</CardTitle>
                  <div className="flex items-center gap-3 mt-3 mb-4">
                    <Badge variant="secondary" className="text-lg font-bold">{pack.price}</Badge>
                    <Badge variant="outline">{pack.duration}</Badge>
                  </div>
                  <CardDescription className="text-lg font-medium text-muted-foreground">
                    {pack.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-6">
                    {pack.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                      <Link to="/outcome-packs">Book this Pack</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/brief?origin=home">Start a Bespoke Brief</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* De-risk note */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              <strong>De-risk:</strong> Live workflow by Day 10 or your Pack fee is credited toward a retainer.
            </p>
          </div>

          <div className="text-center mt-16">
            <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
              <Link to="/outcome-packs">
                See All Outcome Packs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Teamsmiths Academy™ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            The Teamsmiths Academy™
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Our Academy documents the approach, trains your team, and keeps results compounding. Clients get access to playbooks, templates, and short workshops.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/academy">Explore the Academy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/blog">Join a workshop</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Rapid Audit Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Rapid AI Uplift Audit — £750 — 5 business days
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A quick, neutral diagnostic to find the fastest path to visible uplift.
            </p>
          </div>

          <Card className="shadow-sm border-0 bg-card/50 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">You get:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed">KPI baseline (revenue, speed, cost)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed">Prioritised opportunity map (2–3 quick wins)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span className="text-base leading-relaxed">30/60/90 plan + recommended Pack</span>
                </li>
              </ul>
              
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium">
                  <strong>Credit:</strong> audit fee credited against a Pack purchased within 30 days.
                </p>
              </div>

              <Button className="w-full" size="lg">
                Start with an Audit
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Results in Numbers (confidential by default)
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center shadow-sm border-0 bg-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Agency (UK)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">+28%</div>
                  <div className="text-sm">proposals/week</div>
                  <div className="text-2xl font-bold text-success">-37%</div>
                  <div className="text-sm">time-to-proposal</div>
                  <div className="text-xs text-muted-foreground mt-2">(2 weeks)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-sm border-0 bg-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trades (UK)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">-32%</div>
                  <div className="text-sm">time-to-quote</div>
                  <div className="text-2xl font-bold text-success">+11%</div>
                  <div className="text-sm">win rate</div>
                  <div className="text-xs text-muted-foreground mt-2">(3 weeks)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-sm border-0 bg-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Professional services (EU)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">-17%</div>
                  <div className="text-sm">DSO</div>
                  <div className="text-2xl font-bold text-success">-22%</div>
                  <div className="text-sm">&gt;30/60 aged debt</div>
                  <div className="text-xs text-muted-foreground mt-2">(4 weeks)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center shadow-sm border-0 bg-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">SME ops (multi)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-success">10-20</div>
                  <div className="text-sm">owner hours saved/wk</div>
                  <div className="text-xs text-muted-foreground mt-2">(first month)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-8">
              <strong>Note:</strong> Metrics anonymised and aggregated. Full details shared under NDA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/outcome-packs">See Outcome Packs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/audit">Start with an Audit</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teamsmiths Academy™ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            The Teamsmiths Academy™
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Our Academy documents the approach, trains your team, and keeps results compounding. Clients get access to playbooks, templates, and short workshops.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/academy">Explore the Academy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/blog">Join a workshop</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to move a KPI in weeks?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Choose your focus: revenue, speed, or cost reduction.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/outcome-packs">
                See Outcome Packs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/audit">Start with an Audit</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
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