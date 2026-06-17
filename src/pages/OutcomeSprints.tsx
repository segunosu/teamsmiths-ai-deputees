import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  FileText,
  ClipboardCheck,
  MessageSquare,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const OutcomeSprints = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('outcome_sprints_view' as any, {} as any);
  }, [trackEvent]);

  return (
    <>
      <Helmet>
        <title>Discovery Sprint (£500): Scope Your Custom Engine | Teamsmiths</title>
        <meta
          name="description"
          content="90 minutes 1:1 with an ex-FTSE turnaround lead (Haleon, GSK, Gartner). Blueprint delivered within days: AI Diagnostic Report, working engine design, and 90-day plan. £500, credited to your first build if you proceed."
        />
        <meta name="keywords" content="ai discovery, custom engine design, ai diagnostic, paid scoping" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">Discovery Sprint</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
              Scope your custom engine. Blueprint within days.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
              90 minutes 1:1 with an ex-FTSE turnaround lead (Haleon, GSK, Gartner) to start designing the engine for your problem. Within days we deliver the blueprint: AI Diagnostic Report, a working design for the engine we'd build first, and a 90-day plan you can act on.
            </p>
            <p className="text-3xl font-bold text-primary mb-1">£500</p>
            <p className="text-base text-muted-foreground font-medium mb-2">
              Fully credited to your first build if you proceed within 60 days.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              No groups. No fluff. Built for SMB owners and senior leaders who want clarity, not a sales pitch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/discovery-sprint/checkout">
                  Book your Discovery Sprint (£500)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#what-you-get">What you get</a>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">1</div>
                  <CardTitle className="text-xl">Pre-session brief</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    A 15-minute async questionnaire. Top 3 friction points, current tools, team size, where you're losing time or money.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">2</div>
                  <CardTitle className="text-xl">90-minute working session</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Live 1:1 with an ex-FTSE turnaround lead (Haleon, GSK, Gartner). Opportunity scan, engine shortlist, ROI sizing, and we start designing the engine for the top pick.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">3</div>
                  <CardTitle className="text-xl">AI Diagnostic Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Branded PDF delivered within 5 working days. Top 3 opportunities ranked by £ impact, a working design for #1, and a 90-day plan.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You Leave With */}
        <section id="what-you-get" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">What you walk away with</h2>
            <p className="text-lg text-muted-foreground mb-10">
              An artifact you can share with your co-founder, FD, or board to make the next decision.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <FileText className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">AI Diagnostic Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Your top 3 high-impact opportunities with £-impact estimates and confidence ranges.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Target className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Engine blueprint</h3>
                  <p className="text-sm text-muted-foreground">
                    A working blueprint for the engine we'd build first, tailored to your specific problem, not pulled from a menu. Delivered within days.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <ClipboardCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">A 90-day plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Sequenced steps with timelines and the recommended next package.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">30-day async Q&A</h3>
                  <p className="text-sm text-muted-foreground">
                    Email follow-up window for clarifications after you've digested the report.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Credit toward your first build</h3>
                  <p className="text-sm text-muted-foreground">
                    The full £500 is credited toward your first build if you proceed within 60 days.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">A clear next step</h3>
                  <p className="text-sm text-muted-foreground">
                    Either DIY from the report, upgrade to Kickstart, or walk away. Your call.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Single Pricing Block */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="text-center">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 mx-auto mb-3 w-fit">
                  Discovery Sprint
                </Badge>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-primary">£500</span>
                </div>
                <CardDescription className="text-base mt-3">
                  90 min 1:1 with an ex-FTSE turnaround lead (Haleon, GSK, Gartner) · Blueprint within days · AI Diagnostic Report · engine design · 30-day async Q&amp;A · credited to your first build
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6 max-w-md mx-auto">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>1:1 working session, no groups, no breakouts</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Engine blueprint for your top opportunity (within days)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Branded report you can share internally</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Top 3 opportunities with £-impact estimates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>30 days of async Q&A by email</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Full £500 credit toward your first build within 60 days</span>
                  </li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/discovery-sprint/checkout">
                    Book your Discovery Sprint (£500)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Conversion Path */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">After your sprint</h2>
            <p className="text-center text-muted-foreground mb-12">Three paths forward. You choose.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-muted-foreground/40 mb-3">DIY</div>
                  <h3 className="font-semibold text-lg mb-2">Execute yourself</h3>
                  <p className="text-sm text-muted-foreground">
                    Take the report and run with it. You have everything you need to brief your own team or freelancer.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-primary">
                <CardContent className="pt-6">
                  <Badge className="mb-3">Most common</Badge>
                  <h3 className="font-semibold text-lg mb-2">Upgrade to Kickstart</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We build, integrate, and put your first workflow into your team's hands. Your £500 comes off the price.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/solutions#tiers">View Kickstart →</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-muted-foreground/40 mb-3">∞</div>
                  <h3 className="font-semibold text-lg mb-2">Outcomes Assurance</h3>
                  <p className="text-sm text-muted-foreground">
                    After your build, keep results compounding with our £525/month retainer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Get clarity on what to do, and what it's worth.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              The Discovery Sprint is the lowest-risk way to find out exactly where AI delivers in your business.
            </p>
            <Button asChild size="lg">
              <Link to="/discovery-sprint/checkout">
                Book your Discovery Sprint (£500)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default OutcomeSprints;
