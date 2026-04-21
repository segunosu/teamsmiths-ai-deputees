import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  HardHat,
  CheckCircle,
  Workflow,
  Activity,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

const ExampleProjectRiskSystem = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent("example_system_view" as any, { system: "project-risk" } as any);
  }, [trackEvent]);

  const logicSteps = [
    "A project slip or risk signal is detected",
    "System identifies the risk category and affected workstreams",
    "Estimates cost, schedule, and revenue impact",
    "Proposes interventions and assigns clear ownership",
  ];

  const applies = [
    "Construction & built environment",
    "Multi-site project teams",
    "Programme & delivery management",
    "Operations-heavy businesses with project portfolios",
  ];

  return (
    <>
      <Helmet>
        <title>Project risk & revenue system | Example | Teamsmiths</title>
        <meta
          name="description"
          content="Example system that surfaces project risks early, quantifies cost and schedule impact, and proposes interventions."
        />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Badge className="mb-4">Example system</Badge>
            <div className="flex items-start gap-4 mb-6">
              <div className="hidden sm:flex h-14 w-14 rounded-2xl bg-primary/10 text-primary items-center justify-center shrink-0">
                <HardHat className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold text-foreground leading-[1.15]">
                  Project risk &amp; revenue system
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-3xl">
                  Spot project risks before they hit the budget. A practical
                  example of the kind of system we design and build with clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-2xl">The problem</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Construction and delivery projects overrun budgets and
                  schedules because risks aren't surfaced early enough.
                  By the time a problem is visible in the weekly report, the
                  cost and schedule damage is already done.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What it does */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              What the system does
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mb-8">
              The system continuously checks project signals, classifies risks
              as they emerge, quantifies their financial and schedule impact,
              and proposes the next intervention to keep the project on track.
            </p>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Workflow className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl">How the logic flows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {logicSteps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Where this applies */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Activity className="h-7 w-7 text-primary" />
              Where this applies
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {applies.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 bg-background rounded-lg border p-4"
                >
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to get this */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              How to get a system like this
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-2xl mx-auto">
              Systems like this are designed in an Outcome Sprint and built
              through Kickstart or Growth. We tailor the logic and integrations
              to your delivery model.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <a
                  href="https://calendly.com/osu/brief-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book your free diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/outcome-sprints">Join an Outcome Sprint</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link to="/solutions">Explore packages</Link>
              </Button>
            </div>
            {/* TODO: Add live demo URL when ready and re-enable the demo CTA */}
          </div>
        </section>
      </div>
    </>
  );
};

export default ExampleProjectRiskSystem;
