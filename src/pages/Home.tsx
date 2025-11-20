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
      caseStudySlug: "proposal-speedup",
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
      caseStudySlug: "cashflow-nudges",
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
      caseStudySlug: "new-hire-onboarding",
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
      caseStudySlug: "meeting-to-minutes",
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
        <title>Measurable Business Results for UK SMEs | Teamsmiths</title>
        <meta
          name="description"
          content="We don't sell AI tools—we deliver measurable business results. Cut costs, boost revenue, eliminate errors. See proof in your numbers within weeks."
        />
        <meta
          name="keywords"
          content="business results, cost reduction, revenue growth, UK SME, automation, efficiency"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]">
                Unlock Measurable Results, Motivation, & Growth—<br />all Hand-built for Your Team.
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
                Get rapid business wins and a more energised, appreciated team with our tailored uplift system.
              </p>

              {/* Top SME Outcomes */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-8 sm:mb-10 text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">5–10 hrs saved per leader</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">45% team uplift</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium">Sharper morale & retention</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto">
                <Button
                  asChild
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book your outcome call
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                  onClick={() => {
                    handleHeroCTA("See real client results");
                    scrollToSection("results");
                  }}
                >
                  See real client results
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS IN 3 STEPS */}
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
                How it Works in 3 Steps
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Simple. Direct. Measurable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">1</div>
                  <CardTitle className="text-xl font-bold mb-2">Tell us your business/culture priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    What matters most? Revenue growth, faster processes, stronger team culture—we focus on your priority.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Cog className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">2</div>
                  <CardTitle className="text-xl font-bold mb-2">We hand-build your uplift solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Process optimization, team appreciation, growth coaching—all custom-built and integrated for your goals.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">3</div>
                  <CardTitle className="text-xl font-bold mb-2">See results fast—morale & productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Track improvements in your numbers and team energy—both productivity and morale, proven within weeks.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-10 sm:mt-16">
              <Button
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto"
                onClick={() => {
                  handleHeroCTA("See real client results from How It Works");
                  scrollToSection("results");
                }}
              >
                See real client results
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* RESULTS / PROOF SECTION */}
        <section id="results" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">Proof: Real Clients, Real Numbers</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                See measurable results from businesses just like yours
              </p>
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

        {/* FINAL CTA */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28 lg:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-8 sm:mb-10 px-4">
              Simple. Measurable. Repeatable.<br />See what your business could look like with one priority solved for good.
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-2xl mx-auto">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your outcome call
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <Link to="/pricing">
                  See how we price this
                </Link>
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
