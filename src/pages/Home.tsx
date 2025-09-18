import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Target, BarChart3, Zap, Shield, FileCheck, CreditCard, MessageSquare, Workflow, Globe, TrendingUp, Clock, Users } from 'lucide-react';
import { OfferingHero } from '@/components/ui/offering-hero';
import { OfferingCard } from '@/components/ui/offering-card';
import { StickyMobileBar } from '@/components/ui/sticky-mobile-bar';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const Home = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    // Track page view
    trackEvent('offers_view', { page: 'home' });
  }, [trackEvent]);

  const features = [
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Pick the KPI",
      description: "Choose what matters most: revenue, speed, or cost reduction."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Deploy in weeks",
      description: "AI Deputee™ + human oversight deliver fast, reliable results."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Report uplift",
      description: "Measure improvement and keep compounding."
    }
  ];

  const pillarTiles = [
    {
      icon: <TrendingUp className="h-12 w-12 text-accent" />,
      title: "Audit",
      description: "A quick diagnostic to find the fastest path to visible uplift.",
      primaryCTA: { label: "Start Audit", link: "/audit#start" },
      secondaryCTA: { label: "Learn more", link: "/audit#start" }
    },
    {
      icon: <Target className="h-12 w-12 text-accent" />,
      title: "Outcomes",
      description: "Packaged, rapid solutions with clear KPIs and fixed fees.",
      primaryCTA: { label: "See Business Outcomes", link: "/business-outcomes#offers" },
      secondaryCTA: { label: "Start a Brief", link: "/brief-builder?origin=outcomes#form" }
    },
    {
      icon: <Zap className="h-12 w-12 text-accent" />,
      title: "Impact",
      description: "Scoped application builds that move your numbers — fast.",
      primaryCTA: { label: "See Impact", link: "/business-impact#examples" },
      secondaryCTA: { label: "Start a Brief", link: "/brief-builder?origin=impact#form" }
    }
  ];

  // Outcomes data
  const outcomePacks = [
    {
      icon: <FileCheck className="h-12 w-12 text-accent" />,
      title: "Proposal Velocity Pack",
      price: "£1,950",
      duration: "2 weeks",
      benefit: "More proposals, faster.",
      bullets: [
        "Two follow-up cadences included"
      ],
      kpis: "proposals/week • time-to-proposal • open rate",
      slug: "proposal_velocity"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-accent" />,
      title: "Sales Uplift Pack", 
      price: "£1,950",
      duration: "2 weeks",
      benefit: "Quotes out faster; more wins.",
      bullets: [
        "Simple pipeline tracker"
      ],
      kpis: "quotes/week • time-to-quote • conversion to job",
      slug: "sales_uplift"
    },
    {
      icon: <CreditCard className="h-12 w-12 text-accent" />,
      title: "Cashflow Control Pack",
      price: "£2,500", 
      duration: "3 weeks",
      benefit: "DSO down; cash in sooner.",
      bullets: [
        "Owner weekly cash digest"
      ],
      kpis: "DSO • £ aged >30/60 days • response rate",
      slug: "cashflow_control"
    }
  ];

  // Impact data
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

  const handleHeroCTA = (label: string) => {
    trackEvent('hero_cta_click', { label });
  };

  const handlePillarCTA = (pillar: string, cta: string) => {
    trackEvent('pillars_cta_click', { pillar, cta });
  };

  const handleCardCTA = (section: string, slug: string, cta: string) => {
    trackEvent('card_cta_click', { section, slug, cta });
  };

  const handleResultsTileView = (segment: string) => {
    trackEvent('results_tile_view', { segment });
  };

  return (
    <>
      <Helmet>
        <title>Revenue Up. Waste Down. | Teamsmiths</title>
        <meta name="description" content="More revenue. Lower costs. The speed of AI with human oversight. Business Audit, Outcomes, and Impact solutions." />
        <meta name="keywords" content="AI team, business growth, revenue, cost reduction, business audit, outcomes, impact" />
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
                Revenue Up. Waste Down.
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
                Fast growth. Lower costs. The speed of AI with Human Oversight.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Button 
                  asChild 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => handleHeroCTA('Book a Call')}
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => handleHeroCTA('See Business Outcomes')}
                >
                  <Link to="/business-outcomes#offers">See Business Outcomes</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => handleHeroCTA('See Impact')}
                >
                  <Link to="/business-impact#examples">See Impact</Link>
                </Button>
              </div>

              {/* Price anchor */}
              <p className="text-sm text-muted-foreground mb-10">
                Outcomes from £1,950. Builds from £3,500. +5% uplift participation (eligible).
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
                Outcomes you can trust — faster, safer, smarter.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10 mb-16">
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

            {/* CTA row after How it works */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/business-outcomes#offers">Explore Outcomes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/business-impact#examples">Explore Impact</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/audit#start">Start an Audit</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Our Three Pillars */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Choose your path
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-10">
              {pillarTiles.map((tile, index) => (
                <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                  <CardHeader className="pb-6">
                    <div className="mb-6">
                      {tile.icon}
                    </div>
                    <CardTitle className="text-3xl font-bold">{tile.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-muted-foreground mt-4">
                      {tile.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col gap-3">
                      <Button 
                        asChild 
                        className="w-full"
                        onClick={() => handlePillarCTA(tile.title.toLowerCase(), 'primary')}
                      >
                        <Link to={tile.primaryCTA.link}>{tile.primaryCTA.label}</Link>
                      </Button>
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handlePillarCTA(tile.title.toLowerCase(), 'secondary')}
                      >
                        <Link to={tile.secondaryCTA.link}>{tile.secondaryCTA.label}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Results in Numbers */}
        <section id="results" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Results in Numbers
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card 
                className="text-center shadow-sm border-0 bg-card/80" 
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
                className="text-center shadow-sm border-0 bg-card/80"
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
                className="text-center shadow-sm border-0 bg-card/80"
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
                className="text-center shadow-sm border-0 bg-card/80"
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

            {/* CTA row under results */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/business-outcomes">See Business Outcomes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/business-impact">See Impact</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/audit">Start Audit</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Outcomes */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Featured Outcomes
              </h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {outcomePacks.map((pack, index) => (
                <OfferingCard
                  key={index}
                  variant="outcome"
                  title={pack.title}
                  price={pack.price}
                  duration={pack.duration}
                  benefit={pack.benefit}
                  bullets={pack.bullets}
                  kpis={pack.kpis}
                  icon={pack.icon}
                  ctas={{
                    primary: {
                      label: "Book this Pack",
                      sku: `proof_${pack.slug}_${pack.price.replace('£', '').replace(',', '')}`,
                      onClick: () => handleCardCTA('outcomes', pack.slug, 'book')
                    },
                    secondary: {
                      label: "Customise this Brief",
                      link: `/brief-builder?origin=outcomes&ref=${pack.slug}#form`
                    },
                    tertiary: {
                      label: "Start an Audit",
                      link: `/audit?origin=outcomes&ref=${pack.slug}#start`
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Impact Builds */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Featured Impact Builds
              </h2>
            </div>
            
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
                      onClick: () => handleCardCTA('impact', example.slug, 'book')
                    },
                    secondary: {
                      label: "Customise this Brief",
                      link: `/brief-builder?origin=impact&ref=${example.slug}#form`
                    },
                    tertiary: {
                      label: "Start an Audit",
                      link: `/audit?origin=impact&ref=${example.slug}#start`
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Confidentiality & Assurance */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-base leading-relaxed text-muted-foreground">
              Confidential by default. <AIDeputee /> assurance with human QA. On-platform delivery and audit trail. References under NDA.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section id="home-final-cta" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to move a KPI in weeks?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/brief-builder?origin=home#form">
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

        <StickyMobileBar briefOrigin="home" />
      </div>
    </>
  );
};

export default Home;