import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, Globe, Target, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { OfferingHero } from '@/components/ui/offering-hero';
import { StickyMobileBar } from '@/components/ui/sticky-mobile-bar';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('nav_click', { label: 'About' });
  }, [trackEvent]);

  const handleSectionView = (section: string) => {
    trackEvent('about_section_view', { section_id: section });
  };

  const handleCTAClick = (label: string, href: string) => {
    trackEvent('about_cta_click', { label, href });
  };

  const whatWeDoItems = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Diagnostic",
      description: "A quick diagnostic to find the fastest path to visible results.",
      primaryLink: "/audit#start",
      primaryLabel: "Get Diagnostic",
      secondaryLink: "/audit",
      secondaryLabel: "Learn more"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Outcomes", 
      description: "Packaged, rapid solutions with clear KPIs and fixed fees.",
      primaryLink: "/business-outcomes#offers",
      primaryLabel: "See Business Outcomes",
      secondaryLink: "/brief-builder?origin=about-outcomes#form",
      secondaryLabel: "Start a Brief"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Impact",
      description: "Scoped application builds that move your numbers—fast.",
      primaryLink: "/business-impact#examples", 
      primaryLabel: "See Impact",
      secondaryLink: "/brief-builder?origin=about-impact#form",
      secondaryLabel: "Start a Brief"
    }
  ];

  const achievements = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "25,000+ SMEs served",
      description: "As operators, we worked with businesses across sectors."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "$1.5M in 18 months", 
      description: "Revenue generated while cutting delivery costs by 55%+."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "$3M → $10M growth",
      description: "Grew a Gartner unit while reducing costs 30%."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "40–45% team uplift",
      description: "Delivered measurable performance improvements at GSK/Haleon."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About — We deliver real improvements faster, simpler, and proven | Teamsmiths</title>
        <meta 
          name="description" 
          content="Simple, direct, measurable improvements for UK SMEs. Experienced team focused on single priorities with proven results." 
        />
        <meta name="keywords" content="business improvement, UK SME, measurable outcomes, pragmatic consulting" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main id="main-content" tabIndex={-1}>
          {/* Hero Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
                Unlocking better businesses, stronger teams, and a culture of ongoing growth—all custom-built.
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground font-medium mb-16 max-w-4xl mx-auto leading-relaxed">
                We combine proven process uplift with unique, crafted recognition and coaching methods, fully tailored to you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('Book your outcome call', 'https://calendly.com/osu/brief-chat')}
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book your outcome call
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('See real results', '/outcomes')}
                >
                  <Link to="/outcomes">See real results</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Our Philosophy */}
          <section id="philosophy" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16" onLoad={() => handleSectionView('philosophy')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                  Our philosophy: Simple, direct, measurable.
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We focus on a single priority per engagement and prove it with facts.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                  <CardHeader className="pb-6">
                    <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Simple</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg leading-relaxed">
                      No complex jargon or over-engineered solutions. We solve the problem in front of you.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                  <CardHeader className="pb-6">
                    <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Direct</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg leading-relaxed">
                      Straight talk about what works. No pushy pitch, just practical solutions.
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                  <CardHeader className="pb-6">
                    <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-semibold">Measurable</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-lg leading-relaxed">
                      Every outcome tracked in your numbers. Proof over promises, always.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section id="team" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div onLoad={() => handleSectionView('team')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
                  Our team: Experienced, pragmatic, outcome-obsessed.
                </h2>
              </div>
              
              <div className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-12 space-y-4">
                <p>
                  We've worked with startups, SMEs, and large enterprises—always focused on moving one metric at a time.
                </p>
                <p>
                  Our approach is consultative and low-jargon. We don't sell tools or subscriptions—we deliver tangible improvements you can see in your business within weeks, combining business process optimization with our proprietary team recognition and coaching methods.
                </p>
                <p>
                  Principal consultant involvement from start to finish, with curated specialists and quality assurance at every step.
                </p>
              </div>

              <Card className="shadow-sm border-0 bg-muted/30 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Track Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-left">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">25,000+ SMEs served across sectors</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">$1.5M revenue in 18 months, 55% cost reduction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Grew Gartner unit from $3M → $10M</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">40-45% team performance uplift at GSK/Haleon</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Ready to move a KPI in weeks?
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('Start a Brief', '/brief-builder?origin=about#form')}
                >
                  <Link to="/brief-builder?origin=about#form">
                    Start a Brief
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('Book a Call', 'https://calendly.com/osu/brief-chat')}
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book a Call
                  </a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <StickyMobileBar briefOrigin="about" />
      </div>
    </>
  );
};

export default About;