import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Search,
  Rocket,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Lightbulb,
  BarChart3,
  Factory,
  HardHat,
  ShoppingCart,
  Shield,
  ExternalLink,
} from "lucide-react";
import { StickyMobileBar } from "@/components/ui/sticky-mobile-bar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useCaseStudies } from "@/hooks/useCaseStudies";

const Home = () => {
  const { trackEvent } = useAnalytics();
  const { data: caseStudies, isLoading: caseStudiesLoading } = useCaseStudies();
  const [selectedCaseSlug, setSelectedCaseSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedCaseIndex = caseStudies?.findIndex(cs => cs.slug === selectedCaseSlug) ?? -1;
  const selectedCase = caseStudies?.[selectedCaseIndex] ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("homepage_view" as any, { page: "home" } as any);
  }, [trackEvent]);

  const handleOpenModal = (slug: string) => {
    setSelectedCaseSlug(slug);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCaseSlug(null), 200);
  };

  const handlePrevCase = () => {
    if (!caseStudies || selectedCaseIndex <= 0) return;
    setSelectedCaseSlug(caseStudies[selectedCaseIndex - 1].slug);
  };

  const handleNextCase = () => {
    if (!caseStudies || selectedCaseIndex >= caseStudies.length - 1) return;
    setSelectedCaseSlug(caseStudies[selectedCaseIndex + 1].slug);
  };

  // Live products — mirror /results live engines section
  const liveEngines = [
    {
      icon: Factory,
      sector: "Manufacturing",
      title: "Order Risk Engine",
      problem: "Spots order-delivery exposure before it costs you. Reads machine signals and turns them into role-specific decision cards.",
      demoUrl: "https://order-risk-engine.deputee.ai/intro",
      href: "/examples/order-risk-engine",
    },
    {
      icon: HardHat,
      sector: "Construction",
      title: "Revenue Risk Engine",
      problem: "Flags programme drift and the £ liquidated-damages exposure before it locks in. Role-based decision cards escalate if ignored.",
      demoUrl: "https://revenue-risk-engine.deputee.ai/",
      href: "/examples/revenue-risk-engine",
    },
    {
      icon: ShoppingCart,
      sector: "Procurement",
      title: "Procurement Engine",
      problem: "AI procurement deputy for mid-market £25k–£500k decisions. Structured brief → 3–5 pre-qualified vendors → buyer-supervised counter-offer.",
      demoUrl: "https://procurement.deputee.ai/",
    },
    {
      icon: Shield,
      sector: "Governance",
      title: "AI Governance Engine",
      problem: "The 4Ps framework: Primed, Principled, Practised, Protected. Free 20-question self-assessment, then a one-P-per-week 30-day rollout.",
      demoUrl: "https://governance.deputee.ai/",
    },
  ];

  // Founder's prior delivery work — mirror /results compressed wall
  const trackRecordOutcomes = [
    {
      client: "Haleon PLC",
      headline: "98%+ delivery predictability",
      context: "10 teams · +45% velocity · 15% cost reduction · powered by AI",
    },
    {
      client: "BusinessBuyGuide",
      headline: "$1M ARR in 12 months",
      context: "Cofounded · multi-category B2B procurement engine · 800+ suppliers",
    },
    {
      client: "GSK PLC",
      headline: "80% → 94%+ predictability in 3 months",
      context: "5 teams · +40% velocity · 8% cost reduction · pre-demerger",
    },
    {
      client: "Ogier Group",
      headline: "50% time-to-milestone reduction",
      context: "Corporate governance overhaul · 7 teams · top 5 risks managed",
    },
    {
      client: "Gartner Inc.",
      headline: "$3M → $10M",
      context: "EMEA portfolio growth · 5 years · halved delivery, improved retention",
    },
    {
      client: "Philips Italy",
      headline: "£22M revenue safeguarded annually",
      context: "Bespoke project management application · built hands-on",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Teamsmiths · Bring the problem. We build the engine that solves it.</title>
        <meta
          name="description"
          content="Bring the problem. We build the AI + human engine that solves it. Days, not months. Discovery Sprint £500. Kickstart £2,950. Outcome-bounty on selected projects. Founder-led from London & Woking, Surrey, UK."
        />
        <meta
          name="keywords"
          content="business engines, custom AI consulting, fixed price AI, business automation, outcome pricing, AI for SMB"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 sm:mb-8 leading-[1.15]">
                Bring the problem.<br /> We build the solution engine.
              </h1>
              <h2 className="text-xl sm:text-3xl lg:text-[2.75rem] font-semibold text-foreground/[0.87] mb-3 sm:mb-4 leading-[1.2]">
                Expert strategy. AI speed. Measurable outcomes.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-normal mb-10 sm:mb-14 max-w-3xl mx-auto leading-relaxed px-2">
                Reduce friction. Increase output. No extra headcount.
              </p>

              {/* Proof points: named FTSE outcomes (mirror /results, honestly attributed) */}
              <p className="text-sm sm:text-base uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-4">
                Behind the engines
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 justify-center items-center mb-3 text-sm sm:text-base">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span><span className="font-bold">98%+ predictability</span> <span className="text-muted-foreground">@ Haleon</span></span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <span><span className="font-bold">$3M → $10M</span> <span className="text-muted-foreground">@ Gartner</span></span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                  <span><span className="font-bold">£22M annually</span> <span className="text-muted-foreground">@ Philips</span></span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground/80 italic mb-16 sm:mb-20 max-w-2xl mx-auto">
                The founder's prior delivery work, now codified into the engines we build.
              </p>

              {/* CTAs: primary paid Discovery Sprint, secondary free chat */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto mb-3">
                <Button
                  asChild
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                >
                  <Link to="/discovery-sprint">
                    Book a Discovery Sprint (£500)
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                  asChild
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Not ready? 15-min fit call →
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/70 mt-1">
                90 mins 1:1 with the founder. Fully credited to your first build within 60 days.
              </p>
            </div>
          </div>
        </section>

        {/* HOW WE WORK - 3 Steps */}
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
                How We Work
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Three steps from finding high-impact opportunities to scaling results
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">1</div>
                  <CardTitle className="text-xl font-bold mb-2">Opportunity Scan</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Identify high-impact use cases within your current processes. We pinpoint where systems will deliver the biggest ROI.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Rocket className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">2</div>
                  <CardTitle className="text-xl font-bold mb-2">Rapid Implementation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Deploy your custom engine, plugged into your existing tools, moving one KPI. Live in days, not months.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">3</div>
                  <CardTitle className="text-xl font-bold mb-2">Scale & Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Train your team, optimise results, and build a roadmap for continued growth. Ongoing support available.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10 sm:mt-16">
              <Button
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto"
                asChild
              >
                <Link to="/solutions">
                  Explore Solutions
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* DISCOVERY SPRINT SECTION */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              Start with a Discovery Sprint
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              90 minutes 1:1 with the founder, an ex-FTSE turnaround lead (Haleon, GSK, Gartner). A branded AI Diagnostic Report delivered within days.
            </p>
            <p className="text-base sm:text-lg font-medium text-foreground max-w-3xl mx-auto mb-8">
              £500 fully credited to your first build if you proceed within 60 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-success" />
                Top 3 opportunities ranked by £ impact
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-success" />
                90-day plan you can act on
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-5 w-5 text-success" />
                30 days of async Q&amp;A
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/discovery-sprint">
                  Book a Discovery Sprint (£500)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/solutions">
                  See the engines
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* RESULTS / PROOF SECTION — three layers: live products + case studies + founder track record */}
        <section id="results" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">Results</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                The engines we've built, and the track record behind them.
              </p>
            </div>

            {/* Layer 1: Live products — strongest proof, leads */}
            <div className="mb-16 sm:mb-20">
              <div className="text-center mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                  Live products
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  Live engines you can try right now.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">
                  Four working products. Click through to see them running.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {liveEngines.map((sys) => (
                  <Card key={sys.title} className="flex flex-col p-6 sm:p-8 bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <sys.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary">{sys.sector}</Badge>
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                      {sys.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">{sys.problem}</p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button asChild variant="default" size="sm" className="w-full sm:w-auto">
                        <a href={sys.demoUrl} target="_blank" rel="noopener noreferrer">
                          Try the live demo
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </a>
                      </Button>
                      {sys.href && (
                        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <Link to={sys.href}>
                            See how it works
                            <ArrowRight className="ml-2 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Layer 2: Built for clients (SMB case studies) */}
            <div className="mb-16 sm:mb-20">
              <div className="text-center mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                  Built for clients
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  Across manufacturing, construction, procurement, sport, hospitality and public-sector services.
                </h3>
              </div>

              {caseStudiesLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-4 sm:p-6 animate-pulse">
                      <div className="h-5 sm:h-6 bg-muted rounded mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
                      <div className="h-16 sm:h-20 bg-muted rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {caseStudies?.map((caseStudy) => (
                    <CaseStudyCard
                      key={caseStudy.id}
                      caseStudy={caseStudy}
                      onOpenModal={() => handleOpenModal(caseStudy.slug)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Layer 3: Behind the engines — founder track record (supporting proof) */}
            <div>
              <div className="text-center mb-8">
                <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                  Behind the engines
                </p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  Patterns moved at FTSE scale, now codified into engines.
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {trackRecordOutcomes.map((o, idx) => (
                  <Card key={idx} className="p-5 sm:p-6 border-l-4 border-l-primary bg-card">
                    <div className="text-xs uppercase tracking-[0.15em] font-bold text-primary mb-3">
                      {o.client}
                    </div>
                    <div className="text-2xl sm:text-[1.65rem] font-bold text-foreground leading-tight mb-3">
                      {o.headline}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {o.context}
                    </div>
                  </Card>
                ))}
              </div>
              <p className="text-center text-xs sm:text-sm text-muted-foreground/80 italic mt-6 max-w-2xl mx-auto">
                The founder's prior delivery work. <Link to="/results" className="text-primary underline-offset-2 hover:underline not-italic">See full track record and testimonials →</Link>
              </p>
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-6">Every engine we deploy, we measure. You should expect the same.</p>
              <Button variant="outline" asChild>
                <Link to="/results">
                  See all case studies and testimonials
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Case Study Modal */}
        <CaseStudyModal
          caseStudy={selectedCase}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPrev={handlePrevCase}
          onNext={handleNextCase}
          canNavigatePrev={selectedCaseIndex > 0}
          canNavigateNext={selectedCaseIndex >= 0 && selectedCaseIndex < (caseStudies?.length ?? 0) - 1}
        />

        {/* FINAL CTA */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28 lg:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 sm:mb-8 px-4 leading-tight">
              One paid sprint. Three opportunities ranked by £-impact. A 90-day plan you can act on Monday.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              90 minutes 1:1 with the founder. £500 fully credited to your first build within 60 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-2xl mx-auto mb-4">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <Link to="/discovery-sprint">
                  Book a Discovery Sprint (£500)
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Not ready? 15-min fit call →
                </a>
              </Button>
            </div>
          </div>
        </section>

        <StickyMobileBar />
      </div>
    </>
  );
};

export default Home;
