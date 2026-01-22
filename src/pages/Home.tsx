import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ArrowRight,
  Search,
  Rocket,
  TrendingUp,
  Clock,
  Target,
  Zap,
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

  return (
    <>
      <Helmet>
        <title>Turn AI into Measurable Business Results | Teamsmiths</title>
        <meta
          name="description"
          content="We help UK SMEs automate repetitive work, boost revenue and cut costs using proven AI workflows—starting at £495. See results in under 90 days."
        />
        <meta
          name="keywords"
          content="AI automation, business AI, UK SME, cost reduction, revenue growth, AI workflows"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]">
                Turn AI into measurable business results in under 90 days.
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
                We help UK SMEs automate repetitive work, boost revenue and cut costs using proven AI workflows—starting at £495.
              </p>

              {/* Outcome-driven metrics */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center mb-8 sm:mb-10 text-base sm:text-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-success" />
                  <span className="font-medium">Save 5–10 hours per week</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  <span className="font-medium">Increase win rates by 20%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-success" />
                  <span className="font-medium">Reduce operational errors by 30%</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center mb-6 sm:mb-8 max-w-md sm:max-w-none mx-auto">
                <Button
                  asChild
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                >
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Book your free AI diagnostic
                    <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                  asChild
                >
                  <Link to="/results">
                    See AI case studies
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* AI ADOPTION JOURNEY - 3 Steps */}
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-6">
                Your AI Adoption Journey
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
                Three steps from identifying opportunities to scaling AI across your business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-5xl mx-auto">
              <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 bg-card">
                <CardHeader className="pb-6">
                  <div className="mx-auto mb-6 p-6 bg-primary/10 rounded-2xl w-fit">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-6xl font-bold text-primary mb-2">1</div>
                  <CardTitle className="text-xl font-bold mb-2">AI Opportunity Scan</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Identify high-impact AI use cases within your current processes. We analyse where automation will deliver the biggest ROI.
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
                    Deploy out-of-the-box AI workflows to automate tasks, generate leads and support decision-making. Live in days, not months.
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
                    Train your team, optimise results, and build a roadmap for continued AI adoption. Ongoing support available.
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
                  Explore AI Solutions
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* RESULTS / PROOF SECTION */}
        <section id="results" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">AI-Powered Results</h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Real projects, real AI workflows, measurable outcomes
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
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <p className="text-sm text-muted-foreground mb-6">Every AI workflow we deploy, we measure. You should expect the same.</p>
              <Button variant="outline" asChild>
                <Link to="/results">
                  See all case studies
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
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28 lg:pb-24 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-8 sm:mb-10 px-4">
              Ready to see what AI can do for your business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book a free 30-minute AI diagnostic call. We'll identify your highest-impact automation opportunities and show you exactly what's possible.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-2xl mx-auto mb-4">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your free AI diagnostic
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <Link to="/results">
                  See AI case studies
                </Link>
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
