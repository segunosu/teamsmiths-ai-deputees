import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Target,
  Factory,
  HardHat,
  CalendarCheck,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { CaseStudyModal } from "@/components/CaseStudyModal";
import { useCaseStudies } from "@/hooks/useCaseStudies";

const Results = () => {
  const { trackEvent } = useAnalytics();
  const { data: caseStudies, isLoading: caseStudiesLoading } = useCaseStudies();
  const [selectedCaseSlug, setSelectedCaseSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const selectedCaseIndex = caseStudies?.findIndex(cs => cs.slug === selectedCaseSlug) ?? -1;
  const selectedCase = caseStudies?.[selectedCaseIndex] ?? null;

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("results_page_view" as any, { page: "results" } as any);
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

  // Summary stats
  const summaryStats = [
    { icon: Clock, label: "Average time saved", value: "8+ hours/week" },
    { icon: TrendingUp, label: "Typical ROI", value: "300%+" },
    { icon: Target, label: "Implementation time", value: "7-14 days" },
    { icon: BarChart3, label: "Success rate", value: "95%" },
  ];

  return (
    <>
      <Helmet>
        <title>Case Studies & Results | Teamsmiths</title>
        <meta
          name="description"
          content="Real results from real businesses. Measurable outcomes including time saved, revenue increased, and costs reduced."
        />
        <meta
          name="keywords"
          content="case studies, business results, AI ROI, success stories"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-4">Case Studies</Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]">
              Real Results from Real Businesses
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
              Every project we take on, we measure. See how businesses are using our solutions to save time, increase revenue, and reduce costs.
            </p>
          </div>
        </section>

        {/* Summary Stats */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {summaryStats.map((stat, index) => (
                <Card key={index} className="text-center p-4 sm:p-6">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Workflows in Action
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each case study shows the challenge, the solution deployed, and the measurable results achieved.
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

        {/* Example Systems */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <Badge className="mb-4">Capability</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Example systems we build
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Illustrative systems that show how we turn operational pain into a working solution.
                Every implementation is shaped to the client.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Factory,
                  tag: "Manufacturing",
                  title: "Production risk detection system",
                  problem:
                    "Production issues are spotted too late, orders slip, and revenue leaks before anyone can react.",
                  href: "/examples/production-risk-system",
                },
                {
                  icon: HardHat,
                  tag: "Construction",
                  title: "Project risk & revenue system",
                  problem:
                    "Construction projects overrun budgets and schedules because risks aren't surfaced early enough.",
                  href: "/examples/project-risk-system",
                },
              ].map((sys) => (
                <Card key={sys.href} className="flex flex-col p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <sys.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary">{sys.tag}</Badge>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                    {sys.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 flex-1">{sys.problem}</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <Button asChild variant="default" className="w-full sm:w-auto">
                      <Link to={sys.href}>
                        See how it works
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <a
                        href="https://calendly.com/osu/brief-chat"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Book a diagnostic
                      </a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to achieve similar results?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book a free diagnostic call and we'll identify the workflows that will deliver the biggest impact for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your free diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                <Link to="/solutions">
                  Explore Solutions
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Results;