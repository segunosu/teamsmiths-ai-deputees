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
  Quote,
  ShoppingCart,
  Shield,
  ExternalLink,
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

  // Outcomes the engines now codify — patterns that have already moved numbers at scale
  const trackRecordOutcomes = [
    {
      headline: "98%+ delivery predictability",
      timeframe: "across 10 teams — powered by AI + automation",
      supporting: [
        "+45% velocity across all teams",
        "15% cost reduction",
        "Output equivalent to +8 additional people",
        "1 coach managing 2× normal capacity, thanks to AI",
      ],
      context: {
        client: "Haleon PLC",
        detail: "Post-demerger agile + AI transformation. Also Bain-coordinated smart-retail AI rollout.",
      },
    },
    {
      headline: "80% → 94%+ predictability",
      timeframe: "in 3 months, ahead of the demerger deadline",
      supporting: [
        "+40% velocity across all teams",
        "8% cost reduction",
        "Output equivalent to +5 additional people",
      ],
      context: {
        client: "GSK PLC",
        detail: "5-team scrum transformation · demerger and London listing prep",
      },
    },
    {
      headline: "50% reduction in time-to-milestone",
      timeframe: "Corporate governance overhaul across 7 teams",
      supporting: [
        "Top 5 group-wide risks identified and managed",
        "Real-time board reporting via Power BI",
        "Modern compliance tools rolled out (CDD Toolkit, ID Pal)",
      ],
      context: {
        client: "Ogier Group",
        detail: "Multi-jurisdictional legal & fiduciary firm",
      },
    },
    {
      headline: "$3M → $10M",
      timeframe: "EMEA portfolio growth over 5 years",
      context: {
        client: "Gartner",
      },
    },
    {
      headline: "£25M cleared",
      timeframe: "Accounts Receivable in 12 months",
      context: {
        client: "Philips Italy",
      },
    },
  ];

  const namedTestimonials = [
    {
      quote: "Thanks for making the SJB Club monitoring infinitely easier.",
      name: "Ani McGill",
      title: "Executive Head, SJB · CEO, Xavier Catholic Education Trust",
      context: "On the Rebate App — automated tax rebate entitlement, ~1 headcount of manual work eliminated.",
    },
    {
      quote: "The team is great and the project manager provided an essential bridge, keeping work organised and on track. So far we've had an excellent experience.",
      name: "Marco Piscitelli",
      title: "Director, Thriize / Vertis Media",
      context: "On the AI-enabled advertising portal — delivered in less than half the time of a traditional code-driven build.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Results & Case Studies | Teamsmiths — Track Record Behind the Engines</title>
        <meta
          name="description"
          content="Founder track record across Philips, Haleon, GSK, Gartner. Plus illustrative scenarios and named client comments from prior delivery work."
        />
        <meta
          name="keywords"
          content="case studies, business results, AI ROI, founder track record"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-4">Track record</Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15]">
              The track record behind the Engines
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-muted-foreground font-medium mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-2">
              Decades of finding productivity and performance gains across FTSE pharma, professional services, and infrastructure delivery — now codified into engines that ship in days.
            </p>
          </div>
        </section>

        {/* Track record — outcomes that the engines now codify */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
                Patterns that have moved numbers at FTSE scale.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Same playbook, now shipped as engines.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {trackRecordOutcomes.map((o, idx) => (
                <Card key={idx} className="p-5 sm:p-6 border-l-4 border-l-primary">
                  <div className="mb-3">
                    <div className="text-2xl sm:text-3xl font-bold text-primary leading-tight">
                      {o.headline}
                    </div>
                    <div className="text-sm font-medium text-foreground/80 mt-1">
                      {o.timeframe}
                    </div>
                  </div>
                  {o.supporting && (
                    <ul className="space-y-1 mb-4">
                      {o.supporting.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary/60 mt-0.5">+</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="pt-3 border-t border-border/60 text-sm">
                    <span className="font-semibold text-foreground">{o.context.client}</span>
                    {o.context.detail && (
                      <span className="text-muted-foreground"> · {o.context.detail}</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Also delivered for: <span className="text-foreground/80 font-medium">Reuters</span>
            </p>
            <p className="text-center text-xs text-muted-foreground/70 mt-3 max-w-2xl mx-auto">
              Credentials: Oxford AI Governance · Wharton AI Strategy &amp; Governance
            </p>
          </div>
        </section>

        {/* Named Client Comments */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Named client comments
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Selected feedback from prior engagements. More named cohorts joining shortly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {namedTestimonials.map((t, idx) => (
                <Card key={idx} className="bg-card/80 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/40 mb-4" />
                    <blockquote className="text-base text-foreground italic leading-relaxed mb-6">
                      "{t.quote}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-foreground text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.title}</div>
                      <div className="text-xs text-muted-foreground/80 italic mt-2">{t.context}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Live Engines — try the demo */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <Badge className="mb-4">Live engines</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Real engines you can try right now
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Four live engines, in the wild. Each one solves a specific problem for a specific buyer. Click through to see them running.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  icon: Factory,
                  tag: "Manufacturing",
                  title: "Order Risk Engine",
                  problem:
                    "Production issues are spotted too late, orders slip, and revenue leaks before anyone can react. The engine reads machine signals and turns them into role-specific decision cards.",
                  href: "/examples/order-risk-engine",
                  demoUrl: "https://order-risk-engine.deputee.ai/intro",
                },
                {
                  icon: HardHat,
                  tag: "Construction",
                  title: "Revenue Risk Engine",
                  problem:
                    "Construction projects overrun budgets and schedules because risks aren't surfaced early enough. The engine flags programme drift and the £ liquidated-damages exposure before it locks in.",
                  href: "/examples/revenue-risk-engine",
                  demoUrl: "https://revenue-risk-engine.deputee.ai/",
                },
                {
                  icon: ShoppingCart,
                  tag: "Procurement",
                  title: "Procurement Engine",
                  problem:
                    "Mid-market £25k–£500k procurement decisions made under time pressure with no procurement department. The engine structures the brief, shortlists 3–5 pre-qualified vendors, drafts buyer-supervised counter-offers, and outputs an agreement in principle.",
                  demoUrl: "https://procurement.deputee.ai/",
                },
                {
                  icon: Shield,
                  tag: "Governance",
                  title: "AI Governance Engine",
                  problem:
                    "Most AI governance is theatre — written for regulators with no decision rights and audit trails that don't hold under challenge. The 4Ps engine (Primed, Principled, Practised, Protected) gives operators a one-P-per-week 30-day rollout. Free 20-question self-assessment to start.",
                  demoUrl: "https://governance.deputee.ai/",
                },
              ].map((sys) => (
                <Card key={sys.title} className="flex flex-col p-6 sm:p-8">
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
                      <a
                        href={sys.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Try the live demo
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                    {sys.href && (
                      <Button asChild variant="outline" className="w-full sm:w-auto">
                        <Link to={sys.href}>
                          See how it works
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Beyond the SMB lane — small footer strip */}
            <div className="mt-16 pt-10 border-t border-border/60">
              <div className="text-center mb-6">
                <Badge variant="secondary" className="mb-2">Beyond the SMB lane</Badge>
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Engines we've also built in other domains
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                  Proof we can shape an engine for any problem.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-3 max-w-5xl mx-auto">
                {[
                  {
                    name: "Coach Deputee",
                    tag: "Consumer",
                    desc: "Daily AI mentor council for individual professionals.",
                    demoUrl: "https://coach.deputee.ai/",
                  },
                  {
                    name: "Positive Changes",
                    tag: "Therapy",
                    desc: "CBT/REBT therapist companion with AI-prepared client homework.",
                    demoUrl: "https://positivechanges.deputee.ai/",
                  },
                  {
                    name: "TPM — The Player's Mind",
                    tag: "Youth football",
                    desc: "Mental-fitness toolkit for grassroots clubs and academies.",
                    demoUrl: "https://tpm.deputee.ai/",
                  },
                ].map((e) => (
                  <Card key={e.name} className="border-l-4 border-l-primary/30 hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="text-[10px] mb-2">{e.tag}</Badge>
                      <div className="font-semibold text-foreground text-sm mb-1.5">{e.name}</div>
                      <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{e.desc}</p>
                      <a
                        href={e.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center"
                      >
                        See the live product
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Engines in action — case studies showing the breadth of problems we solve */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-16">
              <Badge className="mb-4">Engines in action</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Engines built across every kind of problem we've met.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Each card shows the challenge, the engine that solves it, and the measurable result. Pick the closest match — or bring a problem we haven't met yet.
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

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-6">
              Want results like these in your own numbers?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Book a Discovery Sprint. 90 minutes 1:1 with the founder to scope your engine. We deliver the blueprint within days. £495 — credited to your build if you proceed with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                <Link to="/discovery-sprint">
                  Book a Discovery Sprint — £495
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Not ready? 15-min fit call →
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Results;