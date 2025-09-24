import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Target, BarChart3, Zap, Shield, FileCheck, CreditCard, MessageSquare, Workflow, Globe, TrendingUp, Clock, Users, ArrowUp, DollarSign, Calendar, Mail, AlertCircle } from 'lucide-react';
import { StickyMobileBar } from '@/components/ui/sticky-mobile-bar';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    // Track page view
    trackEvent('outcomes_page_view' as any, { page: 'home' } as any);
  }, [trackEvent]);

  const handleHeroCTA = (label: string) => {
    trackEvent('home_cta_click' as any, { label } as any);
  };

  const handleQuickOutcomeClick = (slug: string) => {
    trackEvent('quick_outcome_click' as any, { slug } as any);
  };

  const handleResultsTileView = (segment: string) => {
    trackEvent('results_tile_view' as any, { segment } as any);
  };


  const quickOutcomes = [
    {
      title: "Proposal Speed-Up",
      benefit: "Draft proposals from meetings — delivered in 3–7 days",
      slug: "proposal_speedup"
    },
    {
      title: "Quote Booster", 
      benefit: "Faster quotes; higher win rate — delivered in 5–10 days",
      slug: "quote_booster"
    },
    {
      title: "Cashflow Nudges",
      benefit: "Polite invoice reminders; lower DSO — delivered in 3–5 days",
      slug: "cashflow_nudges"
    },
    {
      title: "New Hire Onboarding Kit",
      benefit: "30-day ramp plan + SOPs — delivered in 7–10 days",
      slug: "onboarding_kit"
    },
    {
      title: "Follow-Up Engine",
      benefit: "Auto nudges; no lost deals — delivered in 3–7 days",
      slug: "follow_up_engine"
    },
    {
      title: "Meeting-to-Minutes",
      benefit: "Clean actions + tasks in your tools — delivered in 3–7 days",
      slug: "meeting_to_minutes"
    }
  ];

  // Scroll to section function
  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Grow revenue, speed up delivery, cut costs — in weeks | Teamsmiths</title>
        <meta name="description" content="We deliver Business Outcomes and Impact builds that move one KPI at a time, with AI Deputee™ and human QA." />
        <meta name="keywords" content="business outcomes, revenue growth, delivery speed, cost reduction, AI, human QA" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>
          
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
                Too busy with your business to figure out AI?
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-6 max-w-4xl mx-auto leading-relaxed">
                We deliver practical Business Uplifts you'll see in days - faster proposals, smoother cashflow, more hours back - powered by <AIDeputee showExplanation={true} />.
              </p>
              <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
                <strong>Business Uplift:</strong> A targeted business improvement—implemented, tested, and delivered each month. No jargon, no delays.
              </p>
              
              {/* Credibility bar */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-10 text-lg font-medium">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-success">5–10 hrs</div>
                  <div className="text-muted-foreground">saved per leader per week</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-success">45%</div>
                  <div className="text-muted-foreground">uplift in team performance</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => {
                    handleHeroCTA('See how it works');
                    scrollToSection('how');
                  }}
                >
                  See how it works
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => handleHeroCTA('Start now')}
                >
                  <Link to="/start">Start now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                How it works
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Tell us your business priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg leading-relaxed">
                    Pick your focus area and we'll tailor a Business Uplift to your specific needs.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">We deliver in days</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg leading-relaxed">
                    Targeted Business Uplift delivered fast, tested, and ready to use.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Track the improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg leading-relaxed">
                    See gains, not guesswork. Monitor real KPI improvements month over month.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-16">
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
                  <Link to="/pricing#pricing">Join the Plan</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
                  <Link to="/brief-builder?mode=quote#form">Prefer a project? Get a fixed price in 24h</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>


        {/* WHAT YOU GET THIS MONTH */}
        <section id="menu" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                What you get this month
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Examples of Business Uplifts we can deliver inside your plan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {quickOutcomes.slice(0, 6).map((outcome, index) => (
                <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">{outcome.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">
                      {outcome.benefit}
                    </CardDescription>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleQuickOutcomeClick(outcome.slug)}
                    >
                      <Link to={`/start?engage=subscription&ref=${outcome.slug}`}>Add to Plan</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link to="/solutions">See all Solutions</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* REAL RESULTS SECTION */}
        <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Real Results
              </h2>
              <p className="text-lg text-muted-foreground">Measurable improvements delivered in days or weeks, not months</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all" 
                onClick={() => handleResultsTileView('agency_uk')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sarah, Agency Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">+28%</div>
                    <div className="text-sm">proposals/week</div>
                    <div className="text-2xl font-bold text-success">-37%</div>
                    <div className="text-sm">time-to-proposal</div>
                    <div className="text-xs text-muted-foreground mt-2">Proposal Speed-Up (2 weeks)</div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('trades_uk')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Marcus, Construction Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">-32%</div>
                    <div className="text-sm">time-to-quote</div>
                    <div className="text-2xl font-bold text-success">+11%</div>
                    <div className="text-sm">win rate</div>
                    <div className="text-xs text-muted-foreground mt-2">Quote Booster (3 weeks)</div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('pro_services_eu')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Anna, Consulting Director</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">-17%</div>
                    <div className="text-sm">DSO (days)</div>
                    <div className="text-2xl font-bold text-success">-22%</div>
                    <div className="text-sm">aged invoices</div>
                    <div className="text-xs text-muted-foreground mt-2">Cashflow Nudges (4 weeks)</div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('sme_ops_multi')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tom, Operations Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">15 hrs</div>
                    <div className="text-sm">saved per week</div>
                    <div className="text-2xl font-bold text-success">+45%</div>
                    <div className="text-sm">team efficiency</div>
                    <div className="text-xs text-muted-foreground mt-2">Meeting-to-Minutes (first month)</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Case Studies Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('retail_chain')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Lisa, Retail Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">£18k</div>
                    <div className="text-sm">additional monthly revenue</div>
                    <div className="text-2xl font-bold text-success">-41%</div>
                    <div className="text-sm">admin hours</div>
                    <div className="text-xs text-muted-foreground mt-2">New Hire Onboarding Kit (3 weeks)</div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('tech_startup')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">David, Startup Founder</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">+29%</div>
                    <div className="text-sm">client response rate</div>
                    <div className="text-2xl font-bold text-success">12 hrs</div>
                    <div className="text-sm">saved weekly</div>
                    <div className="text-xs text-muted-foreground mt-2">Follow-Up Engine (10 days)</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground">
                Results from our clients, tracked monthly.
              </p>
            </div>
          </div>
        </section>

        {/* READY BAND (FINAL CTA) */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-10">
              Ready to get your first Business Uplift?
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-10 py-6 h-auto"
              >
                <Link to="/start">Start now</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 h-auto"
              >
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Or talk to us
                </a>
              </Button>
            </div>
          </div>
        </section>

        <StickyMobileBar briefOrigin="home" />
      </div>
    </>
  );
};

export default Home;