import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Target,
  BarChart3,
  Zap,
  Shield,
  FileCheck,
  CreditCard,
  MessageSquare,
  Workflow,
  Globe,
  TrendingUp,
  Clock,
  Users,
  ArrowUp,
  DollarSign,
  Calendar,
  Mail,
  AlertCircle,
  Cog,
  Star,
  Award,
  Crown,
  Info,
} from "lucide-react";
import { StickyMobileBar } from "@/components/ui/sticky-mobile-bar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AIDeputee } from "@/components/AIDeputee";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useCaseStudies, useCaseStudy } from "@/hooks/useCaseStudies";
import { useState } from "react";

const Home = () => {
  const { trackEvent } = useAnalytics();
  const { data: caseStudies, isLoading: caseStudiesLoading } = useCaseStudies();
  const [selectedCaseSlug, setSelectedCaseSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedCaseIndex = caseStudies?.findIndex(cs => cs.slug === selectedCaseSlug) ?? -1;
  const selectedCase = caseStudies?.[selectedCaseIndex] ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
    // Track page view
    trackEvent("outcomes_page_view" as any, { page: "home" } as any);
  }, [trackEvent]);

  const handleHeroCTA = (label: string) => {
    trackEvent("home_cta_click" as any, { label } as any);
  };

  const handleQuickOutcomeClick = (slug: string) => {
    trackEvent("quick_outcome_click" as any, { slug } as any);
  };

  const handleResultsTileView = (segment: string) => {
    trackEvent("results_tile_view" as any, { segment } as any);
  };

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

  const prefetchCase = (slug: string) => {
    // Prefetch case study data when hovering
    useCaseStudy(slug);
  };

  const quickOutcomes = [
    {
      title: "Proposal Speed-Up",
      painHeadline: "Tired of slow proposal turnaround?",
      benefit: "Send 28% more proposals with 37% faster turnaround",
      proof: "Owners saved 6+ hours/week",
      timeframe: "7–14 days",
      slug: "proposal_speedup",
      category: "sales",
      icon: <Target className="h-6 w-6" />,
      badge: "Top Pick",
      accentColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Lead Nurture Engine",
      painHeadline: "Leads going cold?",
      benefit: "35% more leads convert with consistent nurturing",
      proof: "10+ warm leads/month",
      timeframe: "10–14 days",
      slug: "lead_nurture_engine",
      category: "marketing",
      icon: <BarChart3 className="h-6 w-6" />,
      badge: "Fast Results",
      accentColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Cashflow Nudges",
      painHeadline: "Chasing payments?",
      benefit: "17% reduction in DSO, 22% fewer aged invoices",
      proof: "Faster payments, smoother cashflow",
      timeframe: "7–10 days",
      slug: "cashflow_nudges",
      category: "finance",
      icon: <DollarSign className="h-6 w-6" />,
      badge: "Quickest Win",
      accentColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "New Hire Onboarding Kit",
      painHeadline: "Onboarding headaches?",
      benefit: "45% faster time to productivity for new hires",
      proof: "50% reduction in ramp time",
      timeframe: "10–14 days",
      slug: "onboarding_kit",
      category: "hr",
      icon: <Users className="h-6 w-6" />,
      badge: "Owner's Favorite",
      accentColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Meeting-to-Minutes",
      painHeadline: "Drowning in meeting admin?",
      benefit: "15 hours saved per week, 45% better team efficiency",
      proof: "Clear actions, better follow-through",
      timeframe: "7–14 days",
      slug: "meeting_to_minutes",
      category: "operations",
      icon: <Cog className="h-6 w-6" />,
      badge: "Most Popular",
      accentColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Resolution Turbo",
      painHeadline: "Support tickets piling up?",
      benefit: "50% faster response times with smart triage",
      proof: "Happier customers, less stress",
      timeframe: "7–10 days",
      slug: "customer_service_deputee_resolution_turbo",
      category: "customer_service",
      icon: <MessageSquare className="h-6 w-6" />,
      badge: "Game Changer",
      accentColor: "text-red-600 dark:text-red-400",
    },
  ];

  // Map solution slugs to their corresponding sections on the Solutions page
  const getSolutionSection = (slug: string) => {
    const solutionMap: Record<string, string> = {
      proposal_speedup: "sales",
      lead_nurture_engine: "marketing",
      cashflow_nudges: "finance",
      onboarding_kit: "hr",
      meeting_to_minutes: "operations",
      customer_service_deputee_resolution_turbo: "customer-service",
    };
    return solutionMap[slug] || "sales";
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "Top Pick":
        return <Crown className="h-3 w-3" />;
      case "Fast Results":
        return <Zap className="h-3 w-3" />;
      case "Quickest Win":
        return <Clock className="h-3 w-3" />;
      case "Owner's Favorite":
        return <Star className="h-3 w-3" />;
      case "Most Popular":
        return <TrendingUp className="h-3 w-3" />;
      case "Game Changer":
        return <Award className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  // Scroll to section function
  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <Helmet>
        <title>Grow revenue, speed up delivery, cut costs — in weeks | Teamsmiths</title>
        <meta
          name="description"
          content="We deliver Business Outcomes and Impact builds that move one KPI at a time, with AI Deputee™ and human QA."
        />
        <meta
          name="keywords"
          content="business outcomes, revenue growth, delivery speed, cost reduction, AI, human QA"
        />
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
                Too busy with business to figure out AI?
              </h1>
              <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
                Access AI expertise that boosts sales, eliminates waste, and frees leadership time.
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
                    handleHeroCTA("See what you get");
                    scrollToSection("menu");
                  }}
                >
                  See what you get
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-10 py-6 h-auto"
                  onClick={() => handleHeroCTA("Start now")}
                >
                  <Link to="/solutions">Start now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* BUSINESS WINS */}
        <section id="menu" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 flex items-center justify-center gap-2">
                Business Wins
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-6 w-6 text-muted-foreground hover:text-primary cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>A targeted business improvement—implemented, tested, and delivered.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Unlock measurable business wins every month — examples we deliver inside your plan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {quickOutcomes.map((outcome, index) => (
                <Card
                  key={index}
                  className="group shadow-sm hover:shadow-xl transition-all duration-300 border-0 bg-card/50 hover:bg-card/80 relative overflow-hidden"
                >
                  {/* Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <Badge
                      variant="secondary"
                      className="text-xs font-medium bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                    >
                      {getBadgeIcon(outcome.badge)}
                      {outcome.badge}
                    </Badge>
                  </div>

                  {/* Accent Line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${outcome.accentColor} bg-current opacity-60`}
                  ></div>

                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-muted/50 ${outcome.accentColor}`}>{outcome.icon}</div>
                      <CardTitle className="text-lg font-semibold">{outcome.title}</CardTitle>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">{outcome.painHeadline}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base font-medium text-foreground">
                      {outcome.benefit}
                    </CardDescription>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>{outcome.proof}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Delivered in: {outcome.timeframe}</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => handleQuickOutcomeClick(outcome.slug)}
                    >
                      <Link to={`/solutions#${getSolutionSection(outcome.slug)}`}>See Full Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <div className="mb-8">
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-4 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                >
                  <Link to="/solutions">
                    <Globe className="mr-2 h-5 w-5" />
                    Explore All Business Wins
                  </Link>
                </Button>
              </div>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Don't see your specific challenge? We create custom solutions for every business need.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">How it works</h2>
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
                    Pick from the wins above (or tell us your specific challenge) and we'll tailor a solution to your
                    needs.
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
                    Targeted business results delivered fast, tested, and ready to use. Human experts oversee every AI
                    output.
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
                  <Link to="/pricing#pricing">Get Started (from £495/month)</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
                  <Link to="/brief-builder?mode=quote#form">Prefer a project? Get a fixed price in 24h</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* POWERFUL RESULTS SECTION */}
        <section id="results" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">Powerful Results</h2>
              <p className="text-lg text-muted-foreground">Measurable improvements delivered in weeks, not months</p>
            </div>

            {caseStudiesLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caseStudies?.map((caseStudy) => (
                  <CaseStudyCard
                    key={caseStudy.id}
                    caseStudy={caseStudy}
                    onOpenModal={() => handleOpenModal(caseStudy.slug)}
                    onHoverStart={() => prefetchCase(caseStudy.slug)}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground">Results from our clients, tracked monthly.</p>
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

        {/* READY BAND (FINAL CTA) */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-10">
              Ready to get your first business win?
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
                <Link to="/pricing#pricing">Get Started (from £495/month)</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Talk to a Strategist
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
