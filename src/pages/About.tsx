import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, Globe, Target, BarChart3, Zap, ArrowRight } from 'lucide-react';
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
      title: "Audit",
      description: "A quick diagnostic to find the fastest path to visible uplift.",
      primaryLink: "/audit#start",
      primaryLabel: "Start Audit",
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
        <title>About — Teamsmiths (Audit · Outcomes · Impact)</title>
        <meta 
          name="description" 
          content="Business Audit, Business Outcomes, and Business Impact builds with AI Deputee™ assurance and human QA. More revenue, faster execution, lower costs — in weeks." 
        />
        <meta name="keywords" content="boutique consulting, business audit, outcomes, impact builds, AI deputee, SME consulting" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main id="main-content" tabIndex={-1}>
          {/* Hero Section */}
          <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
                Business Outcomes & Impact — in weeks
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-16 max-w-4xl mx-auto leading-relaxed">
                More revenue. Faster execution. Lower costs. Start with a Business Audit, deploy Business Outcomes, or build Business Impact when an app is the fastest path to ROI — all with <AIDeputee /> and expert oversight.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                <Button 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('See Business Outcomes', '/business-outcomes#offers')}
                >
                  <Link to="/business-outcomes#offers">See Business Outcomes</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  onClick={() => handleCTAClick('Start Audit', '/audit#start')}
                >
                  <Link to="/audit#start">Start Audit</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* What We Do */}
          <section id="what-we-do" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16" onLoad={() => handleSectionView('what-we-do')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                  What we do
                </h2>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {whatWeDoItems.map((item, index) => (
                  <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                    <CardHeader className="pb-6">
                      <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                        {item.icon}
                      </div>
                      <CardTitle className="text-2xl font-semibold">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-lg leading-relaxed mb-6">
                        {item.description}
                      </CardDescription>
                      <div className="flex flex-col gap-3">
                        <Button 
                          asChild 
                          className="w-full"
                          onClick={() => handleCTAClick(item.primaryLabel, item.primaryLink)}
                        >
                          <Link to={item.primaryLink}>{item.primaryLabel}</Link>
                        </Button>
                        <Button 
                          asChild 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleCTAClick(item.secondaryLabel, item.secondaryLink)}
                        >
                          <Link to={item.secondaryLink}>{item.secondaryLabel}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Track Record */}
          <section id="track-record" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16" onLoad={() => handleSectionView('track-record')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                  Track Record
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Results from startup to enterprise—always focused on measurable outcomes.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                    <CardHeader className="pb-4">
                      <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                        {achievement.icon}
                      </div>
                      <CardTitle className="text-xl font-semibold">{achievement.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {achievement.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Our Model: PPP+P */}
          <section id="ppp-model" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-4xl mx-auto text-center">
              <div onLoad={() => handleSectionView('ppp-model')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
                  Our Model: PPP+P
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Primed</h3>
                  <p className="text-muted-foreground">Purpose confirmed, prowess focused, potential unlocked.</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Principled</h3>
                  <p className="text-muted-foreground">Values that steer decisions with clarity, guardrails and flexibility.</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Practised</h3>
                  <p className="text-muted-foreground">Intent refined into consistent execution and improvement.</p>
                </div>
                <div className="text-center">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit mx-auto">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Protected</h3>
                  <p className="text-muted-foreground">Knowledge, identity and well-being safeguarded for the long run.</p>
                </div>
              </div>

              <p className="text-lg text-muted-foreground italic">
                This is our compass, giving clients confidence that results are clear, consistent and sustainable.
              </p>
            </div>
          </section>

          {/* Our Approach */}
          <section id="approach" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-4xl mx-auto text-center">
              <div onLoad={() => handleSectionView('approach')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
                  Our Approach
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                  <h3 className="text-xl font-semibold mb-3">Pick the KPI</h3>
                  <p className="text-muted-foreground">Choose revenue, speed, or cost reduction.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                  <h3 className="text-xl font-semibold mb-3">Deploy in weeks</h3>
                  <p className="text-muted-foreground"><AIDeputee /> + human QA for fast, reliable results.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                  <h3 className="text-xl font-semibold mb-3">Report uplift</h3>
                  <p className="text-muted-foreground">Measure improvements and keep compounding (optional +5% performance share).</p>
                </div>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg mb-8 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Confidential by default</h3>
                <ul className="text-left space-y-2 text-muted-foreground text-sm">
                  <li>• No public client names or logos</li>
                  <li>• Metrics anonymised and aggregated</li>
                  <li>• References and details shared under NDA</li>
                  <li>• On-platform delivery with audit trail</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg"
                  onClick={() => handleCTAClick('See Business Outcomes', '/business-outcomes#offers')}
                >
                  <Link to="/business-outcomes#offers">See Business Outcomes</Link>
                </Button>
                <Button 
                  asChild 
                  variant="outline" 
                  size="lg"
                  onClick={() => handleCTAClick('Start Audit', '/audit#start')}
                >
                  <Link to="/audit#start">Start Audit</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Founder */}
          <section id="founder" className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div onLoad={() => handleSectionView('founder')}>
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
                  Founder
                </h2>
              </div>
              
              <div className="text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto mb-8">
                <p>
                  I've helped startups and SMEs launch fast and scale efficiently, and I've driven measurable performance in large enterprises. As a founder/operator (businessbuyguide → G2Guide) I served 25,000+ SMEs, onboarded 750 vendors, and generated $1.5M in 18 months—shipping MVPs with low-code to cut delivery costs by 55%+. At Gartner I grew a unit from $3M to $10M while reducing costs 30%. At GSK/Haleon I led cross-functional delivery with 40–45% team uplift. I focus on one KPI at a time—practical, measurable, fast. Languages: English (native), Italian (fluent), Yoruba (conversational). Awards: Gartner CEO's Recognition; GSK Global Recognition.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  variant="outline"
                  onClick={() => handleCTAClick('Book a Call', 'https://calendly.com/osu/brief-chat')}
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book a Call
                  </a>
                </Button>
                <Button 
                  asChild 
                  variant="outline"
                  onClick={() => handleCTAClick('View Business Outcomes', '/business-outcomes#offers')}
                >
                  <Link to="/business-outcomes#offers">View Business Outcomes</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Teams & Academy */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 text-center md:text-left">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Teamsmiths Academy™</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Our Academy documents the approach, trains your team, and keeps results compounding with playbooks and short workshops.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCTAClick('Explore the Academy', '/blog')}
                    >
                      <Link to="/blog">Explore the Academy</Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCTAClick('Join a workshop', '/blog')}
                    >
                      <Link to="/blog">Join a workshop</Link>
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Curated team</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Principal consultant involvement end-to-end; curated specialists with QA. (No public marketplace.)
                  </p>
                </div>
              </div>
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