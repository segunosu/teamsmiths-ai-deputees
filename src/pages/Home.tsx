import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  Cog,
  Info,
} from "lucide-react";
import { StickyMobileBar } from "@/components/ui/sticky-mobile-bar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useCaseStudies, useCaseStudy } from "@/hooks/useCaseStudies";

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
                Measurable Results. Motivated Team. Profitable Growth.
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
                Custom-built solutions for rapid wins, energized teams, and financial uplift—all proven and delivered fast.
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

              <p className="text-sm text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
                Optional add-ons: personalised motivation and coaching layers to boost team morale and retention.
              </p>

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
                  <CardTitle className="text-xl font-bold mb-2">We custom-build your uplift solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Process optimisation, team appreciation, and growth coaching—all custom‑built. You can start with a one‑off BusinessPack or a full improvement project.
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
                onClick={() => scrollToSection("results")}
              >
                See real client results
                <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* CULTURE & MOTIVATION LAYER */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                Add a Culture & Motivation Layer to Your Plan
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Alongside process automation, some clients choose a personalised team appreciation program to lift morale, retention, and discretionary effort.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                    Motivation & Appreciation (Songita BusinessPack)
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Powered by our proprietary methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Hand-built songs and appreciation moments for your team</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Designed from your stories, values, and goals</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Optional layer that supports engagement and retention</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link to="/motivation-and-appreciation">
                      Explore Motivation Layer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-md hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl font-bold mb-2">
                    Coaching & Growth (Deputee-style Coaching)
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Powered by our proprietary methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Personalised support for key leaders or teams</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Turn new systems into habits and better decisions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-base">Add only where coaching leverage is highest</span>
                    </li>
                  </ul>
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link to="/solutions#coaching">
                      Explore Coaching Layer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* RESULTS / PROOF SECTION */}
        <section id="results" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">The Kind of Results We Deliver</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Measurable outcomes from real projects—see what's possible
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
              <p className="text-sm text-muted-foreground">Every project we take on, we measure. You should expect the same.</p>
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-2xl mx-auto mb-4">
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
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              During your call, you can also ask about adding the Motivation & Appreciation layer for your team.
            </p>
          </div>
        </section>

        <StickyMobileBar briefOrigin="home" />
      </div>
    </>
  );
};

export default Home;
