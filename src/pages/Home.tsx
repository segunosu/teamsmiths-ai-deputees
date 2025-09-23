import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Target, BarChart3, Zap, Shield, FileCheck, CreditCard, MessageSquare, Workflow, Globe, TrendingUp, Clock, Users, Search, ArrowUp, DollarSign, Calendar, Mail, AlertCircle } from 'lucide-react';
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

  const whatWeDoTiles = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Audit",
      description: "A quick diagnostic to find the fastest path to results.",
      link: "/audit"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Outcomes",
      description: "Packaged solutions delivered in weeks.",
      link: "/business-outcomes"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Impact",
      description: "Scoped app builds that move your numbers.",
      link: "/business-impact"
    }
  ];

  const quickOutcomes = [
    {
      title: "Proposal speed-up",
      benefit: "Send more proposals, faster.",
      slug: "proposal_speedup"
    },
    {
      title: "Quote booster",
      benefit: "Faster quotes; higher win rate.",
      slug: "quote_booster"
    },
    {
      title: "Cashflow nudges",
      benefit: "Reduce DSO with polite reminders.",
      slug: "cashflow_nudges"
    },
    {
      title: "DSAR intake (lite)",
      benefit: "One-month clock, ID checks, templates.",
      slug: "dsar_intake"
    },
    {
      title: "PECR pre-flight",
      benefit: "TPS/CTPS screening + consent proof.",
      slug: "pecr_preflight"
    },
    {
      title: "Team follow-ups",
      benefit: "Automated follow-up cadence that sticks.",
      slug: "team_followups"
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
                Grow revenue, speed up delivery, cut costs — in weeks.
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
                We deliver Business Outcomes and Impact builds that move one KPI at a time, with <AIDeputee /> and human QA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => {
                    handleHeroCTA('See how we help');
                    scrollToSection('what');
                  }}
                >
                  See how we help
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

        {/* SECTION 1 — WHAT WE DO */}
        <section id="what" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                What we do
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {whatWeDoTiles.map((tile, index) => (
                <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
                  <CardHeader className="pb-6">
                    <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                      {tile.icon}
                    </div>
                    <CardTitle className="text-2xl font-semibold">{tile.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg leading-relaxed mb-4">
                      {tile.description}
                    </CardDescription>
                    <Button asChild className="w-full">
                      <Link to={tile.link}>{tile.title}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2 — HOW WE OFFER IT */}
        <section id="how" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                How we offer it
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Card A — Subscriptions */}
              <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CardTitle className="text-2xl font-bold">Subscriptions</CardTitle>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <CardDescription className="text-lg">
                    Done-for-you each month. Pick one Quick Outcome or a Rapid Audit; upgrade to bigger work anytime.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/pricing">See plans</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/start">Start now</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card B — One-off projects */}
              <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">One-off projects</CardTitle>
                  <CardDescription className="text-lg">
                    Fixed scope, fixed price in 24h. Ideal if you prefer a single Outcome or Impact build.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link to="/brief-builder?mode=quote#form">Get a fixed price</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/business-outcomes#offers">Explore Outcomes</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 3 — WHAT YOU GET THIS MONTH */}
        <section id="menu" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                What you get this month
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Examples of Quick Outcomes we can deliver inside your plan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {quickOutcomes.map((outcome, index) => (
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
                      <Link to={`/start?ref=${outcome.slug}`}>Start now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 — RESULTS IN NUMBERS */}
        <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Results in Numbers
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all" 
                onClick={() => handleResultsTileView('agency_uk')}
              >
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

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('trades_uk')}
              >
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

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('pro_services_eu')}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pro services (EU)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-success">-17%</div>
                    <div className="text-sm">DSO</div>
                    <div className="text-2xl font-bold text-success">-22%</div>
                    <div className="text-sm">aged &gt;30/60</div>
                    <div className="text-xs text-muted-foreground mt-2">(4 weeks)</div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="text-center shadow-sm border-0 bg-card/80 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleResultsTileView('sme_ops_multi')}
              >
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

            <div className="text-center mb-12">
              <p className="text-sm text-muted-foreground">
                Metrics are anonymised, aggregated across engagements. Full details under NDA.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5 — READY BAND (FINAL CTA) */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-10">
              Ready to move a KPI in weeks?
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