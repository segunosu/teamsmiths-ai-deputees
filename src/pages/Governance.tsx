import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  ShieldCheck,
  Compass,
  Repeat,
  Lock,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Helmet } from "react-helmet-async";

const Governance = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("governance_page_view" as any, { page: "governance" } as any);
  }, [trackEvent]);

  const fourPs = [
    {
      icon: GraduationCap,
      name: "Primed",
      summary: "Literacy and readiness.",
      detail:
        "Your people understand what AI can and cannot do. Skills, awareness, and a shared vocabulary before any tool goes live.",
    },
    {
      icon: Compass,
      name: "Principled",
      summary: "Decision rights and human-in-the-loop.",
      detail:
        "Who decides, who approves, who can override. Clear accountability and humans in the loop where it matters.",
    },
    {
      icon: Repeat,
      name: "Practised",
      summary: "Operating cadence.",
      detail:
        "Governance as a routine, not a binder. Reviews, escalation paths and metrics that run on a cadence your teams already keep.",
    },
    {
      icon: Lock,
      name: "Protected",
      summary: "Risk, compliance, audit.",
      detail:
        "ISO 42001 and EU AI Act alignment, model cards, risk registers and audit trails. Evidence you can hand to a regulator or a buyer.",
    },
  ];

  const proofPoints = [
    {
      metric: "+45%",
      label: "velocity lift",
      context: "Haleon · 10 teams · AI-powered delivery",
    },
    {
      metric: "+40%",
      label: "velocity lift",
      context: "GSK · 5 teams · pre-demerger transformation",
    },
    {
      metric: "~99%",
      label: "delivery predictability",
      context: "Sustained across FTSE programmes",
    },
    {
      metric: "Ahead of schedule",
      label: "governance frameworks",
      context: "Ogier Group · corporate governance overhaul",
    },
  ];

  return (
    <>
      <Helmet>
        <title>The 4Ps AI Governance Framework | Teamsmiths · Responsible AI that compounds business value</title>
        <meta
          name="description"
          content="The 4Ps AI Governance Framework — Primed, Principled, Practised, Protected. Operator-first AI governance delivered at Haleon, GSK and Ogier Group. Run the free 4Ps assessment."
        />
        <meta
          name="keywords"
          content="AI governance, 4Ps framework, responsible AI, ISO 42001, EU AI Act, model cards, AI risk, enterprise AI security review"
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative">
            <div className="text-center">
              <Badge className="mb-6">Flagship practice</Badge>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 sm:mb-8 leading-[1.15]">
                The 4Ps AI Governance Framework
              </h1>
              <h2 className="text-xl sm:text-3xl lg:text-[2.5rem] font-semibold text-foreground/[0.87] mb-4 leading-[1.2]">
                Primed. Principled. Practised. Protected.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground font-normal mb-8 max-w-3xl mx-auto leading-relaxed px-2">
                Responsible AI that compounds business value.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl mx-auto mb-10 sm:mb-14">
                By <span className="text-foreground font-medium">Segun Osu</span> · Oxford AI Governance (100%) · Wharton AI Strategy &amp; Governance (100%) · Delivery at Haleon, GSK and Ogier Group.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
                <Button
                  asChild
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                >
                  <a href="https://governance.teamsmiths.ai/cockpit" target="_blank" rel="noopener noreferrer">
                    Run the free 4Ps assessment
                    <ExternalLink className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto"
                  asChild
                >
                  <a href="https://calendly.com/osu/ai-governance" target="_blank" rel="noopener noreferrer">
                    Book a call →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Two audiences */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Two problems. One framework.
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                Pick the side of the table you sit on.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <Card className="flex flex-col p-6 sm:p-8 bg-card border-2 hover:shadow-lg transition-all duration-300">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Deploying AI? Govern it like a harness, not a cage.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 flex-1 leading-relaxed">
                  Most governance slows teams down. Ours speeds them up. The 4Ps give your people clear decision rights, a working cadence, and the evidence trail — so AI ships faster, not slower. Start with a free assessment. Ten minutes, instant readout.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <a href="https://governance.teamsmiths.ai/cockpit" target="_blank" rel="noopener noreferrer">
                    Run the free 4Ps assessment
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </Card>

              <Card className="flex flex-col p-6 sm:p-8 bg-card border-2 hover:shadow-lg transition-all duration-300">
                <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Selling AI to enterprises? Pass the security review.
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 flex-1 leading-relaxed">
                  Enterprise buyers want model cards, risk registers, ISO 42001 and EU AI Act alignment before they sign. The Enterprise-Ready Governance Pack builds that evidence for you. Fixed price from £9,500. Fourteen days.
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href="https://governance.teamsmiths.ai/enterprise-ready" target="_blank" rel="noopener noreferrer">
                    Enterprise-Ready Governance Pack
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* The 4Ps explainer */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                The framework
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                The 4Ps, in plain terms.
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Four disciplines. Each one auditable. Together they make AI safe to scale.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {fourPs.map((p) => (
                <Card key={p.name} className="flex flex-col p-6 bg-card border-t-4 border-t-primary">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{p.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{p.summary}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.detail}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                Proof
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                Tested where the stakes are real.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {proofPoints.map((p, idx) => (
                <Card key={idx} className="p-5 sm:p-6 border-l-4 border-l-primary bg-card">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-1">
                    {p.metric}
                  </div>
                  <div className="text-sm font-medium text-primary mb-3">{p.label}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{p.context}</div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mx-auto mb-6 p-5 bg-primary/10 rounded-2xl w-fit">
              <Shield className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Governance is a growth lever. Treat it like one.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Thirty minutes with the founder. Bring your AI roadmap. Leave with the gaps named and a next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <a href="https://calendly.com/osu/ai-governance" target="_blank" rel="noopener noreferrer">
                  Book a call
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base sm:text-lg px-6 sm:px-10 py-4 sm:py-6 h-auto w-full sm:w-auto">
                <a href="https://governance.teamsmiths.ai/cockpit" target="_blank" rel="noopener noreferrer">
                  Run the free 4Ps assessment →
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Governance;
