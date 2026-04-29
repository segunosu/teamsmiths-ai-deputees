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
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  HelpCircle,
  Rocket,
  Sparkles,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AISolutions = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('solutions_view' as any, {} as any);
  }, [trackEvent]);

  const solutionTiers = [
    {
      id: 'discovery',
      name: 'Discovery Sprint',
      price: '£495',
      tagline: 'Paid 1:1 scoping with a senior consultant',
      description:
        'A 90-minute working session that produces an AI Diagnostic Report — your top 3 high-impact opportunities, a detailed design for the first one, and a 90-day plan.',
      includes: [
        'Pre-session brief (15-min async questionnaire)',
        '90-minute 1:1 working session with a senior consultant',
        'AI Diagnostic Report delivered within 5 working days',
        '90-day implementation roadmap with £-impact estimates',
        '30 days of async Q&A by email',
        'Full £495 credited toward Kickstart if you proceed within 60 days',
      ],
      outcomes: [
        'Top 3 opportunities ranked by £ impact',
        'A working design for your first workflow',
        'Clear, costed next step',
      ],
      timeline: '5 working days',
      icon: <Lightbulb className="h-8 w-8" />,
      popular: false,
    },
    {
      id: 'kickstart',
      name: 'Kickstart',
      price: '£2,950',
      tagline: 'First production workflow live',
      description:
        'Your first end-to-end workflow built, integrated, and put into your team\'s hands. The fastest path to a measurable result.',
      includes: [
        'Opportunity Scan refresh',
        '1–2 production workflows built and integrated',
        'Standard integrations with your existing tools',
        'Team training and SOPs',
        'KPI dashboard',
        '30 days post-launch support',
      ],
      outcomes: [
        'A live workflow in your stack within weeks',
        'Save 5–10 hours per week per role',
        'Clear KPI baseline for what comes next',
      ],
      timeline: '2–3 weeks',
      icon: <Rocket className="h-8 w-8" />,
      popular: false,
    },
    {
      id: 'foundation',
      name: 'Foundation',
      price: '£7,950',
      tagline: 'Multi-workflow build across one or two functions',
      description:
        'For teams that need more than a single workflow — a foundation across sales, ops, finance, or HR with the integrations and reporting to compound results.',
      includes: [
        'Everything in Kickstart',
        '3 production workflows',
        'Premium integrations across your stack',
        'Comprehensive team training',
        '3 strategy sessions',
        '45 days post-launch support',
      ],
      outcomes: [
        'Increase win rates by ~20%',
        '32% faster time-to-quote (typical)',
        'More leads converted with consistent follow-through',
      ],
      timeline: '4–6 weeks',
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true,
    },
    {
      id: 'transformation',
      name: 'Transformation',
      price: '£19,500',
      tagline: 'Cross-functional engine across the business',
      description:
        'A connected set of intelligent workflows across the business — one execution layer that compounds wins month-over-month with senior oversight.',
      includes: [
        'Everything in Foundation',
        '7 production workflows',
        'Full custom integrations',
        '7 strategy sessions',
        'Dedicated account team',
        '60 days post-launch support',
      ],
      outcomes: [
        'Real-time business intelligence across functions',
        'Scalable infrastructure for repeatable execution',
        'Full implementation roadmap for the next 12 months',
      ],
      timeline: '8–12 weeks',
      icon: <BarChart3 className="h-8 w-8" />,
      popular: false,
    },
  ];

  const strategicTier = {
    name: 'Strategic',
    tagline: 'By application — for engagements above £30,000',
    description:
      'Multi-quarter programmes, regulated environments, or executive-level transformation work. We take a small number of these each year.',
  };

  const comparisonFeatures = [
    { feature: 'Workflow implementation', discovery: 'Design only', kickstart: '1–2 workflows', foundation: '3 workflows', transformation: '7 workflows' },
    { feature: 'Strategy sessions', discovery: '1', kickstart: '1', foundation: '3', transformation: '7' },
    { feature: 'Team training', discovery: '—', kickstart: 'Basic', foundation: 'Comprehensive', transformation: 'Advanced + ongoing' },
    { feature: 'KPI dashboard', discovery: false, kickstart: true, foundation: true, transformation: true },
    { feature: 'Integrations', discovery: '—', kickstart: 'Standard', foundation: 'Premium', transformation: 'Full custom' },
    { feature: 'Post-launch support', discovery: '30-day async Q&A', kickstart: '30 days', foundation: '45 days', transformation: '60 days + dedicated team' },
    { feature: 'Typical timeline', discovery: '5 working days', kickstart: '2–3 weeks', foundation: '4–6 weeks', transformation: '8–12 weeks' },
    { feature: 'Outcomes Assurance retainer', discovery: '£525/mo (optional)', kickstart: '£525/mo (optional)', foundation: '£525/mo (optional)', transformation: '£525/mo (optional)' },
  ];

  const faqs = [
    {
      question: 'Where should I start?',
      answer:
        'Almost everyone starts with the Discovery Sprint. £495, 1:1, and you walk away with an AI Diagnostic Report, a 90-day plan, and a £-impact estimate for your top opportunities. The full £495 is credited toward Kickstart if you proceed within 60 days.',
    },
    {
      question: 'When will we see results?',
      answer:
        'Discovery delivers within 5 working days. Kickstart workflows typically go live in 2–3 weeks. Most clients see a measurable KPI movement within 4–6 weeks of go-live.',
    },
    {
      question: 'How are you different from a regular consultancy?',
      answer:
        'Three things. Fixed prices on every package below Strategic. A senior consultant on every engagement (no offshore handover). And for selected projects we offer an outcome-bounty pricing model — see below — where part of our fee only unlocks when the agreed KPI moves.',
    },
    {
      question: 'What is the outcome-bounty pricing model?',
      answer:
        'For selected projects and clients, we split the fee 70/30: 70% paid against milestone delivery (the build, training, integration), and a 30% outcome bounty paid only when the agreed KPI is hit within 90 days of go-live. If the KPI does not move, the bounty stays unpaid and we keep working until it does. Available where the KPI is measurable in your numbers and we agree the target up-front.',
    },
    {
      question: 'What is Outcomes Assurance?',
      answer:
        'After your initial implementation, you can keep results compounding with a £525/month retainer. It includes a monthly KPI review call, up to 3 hours/month of workflow tweaks, and priority support. Add or cancel any month.',
    },
    {
      question: 'Can I upgrade later?',
      answer:
        'Yes. Many clients start with Discovery or Kickstart, prove value, then upgrade to Foundation or Transformation. Your initial investment can be credited toward larger engagements within 60 days.',
    },
    {
      question: 'Who do you work with?',
      answer:
        'UK SMBs — typically £1m–£50m turnover, 10–250 employees, owner-operators or senior leadership teams who can move quickly. We are based in London and Woking, Surrey.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Solutions & Pricing | Teamsmiths — Fixed-Price AI for UK SMBs</title>
        <meta
          name="description"
          content="Fixed-price AI delivery for UK SMBs. Discovery from £495. Kickstart £2,950. Foundation £7,950. Transformation £19,500. Outcome-bounty pricing on selected projects."
        />
        <meta
          name="keywords"
          content="AI consulting UK, fixed price AI, SMB AI delivery, AI workflows, outcome pricing"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Fixed-price AI delivery. Measurable outcomes.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
              One simple ladder. Every step has a fixed price, a clear scope, and a measurable outcome — so you know exactly what you're buying.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              Built for UK SMBs. No hidden costs. No long-tail consultancy hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a free 15-min chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#tiers">See packages</a>
              </Button>
            </div>
          </div>
        </section>

        {/* The ladder */}
        <section id="tiers" className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Pick where you start</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Almost everyone begins with the Discovery Sprint. From there, you choose how far you take it.
              </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
              {solutionTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative shadow-lg hover:shadow-xl transition-all duration-300 ${
                    tier.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most chosen
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-xl">{tier.icon}</div>
                      <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <p className="text-xs font-medium text-primary mt-1">{tier.tagline}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{tier.timeline}</span>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">What's included:</h4>
                      <ul className="space-y-1.5">
                        {tier.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Typical outcomes:</h4>
                      <ul className="space-y-1.5">
                        {tier.outcomes.map((outcome, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="font-medium">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      variant={tier.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Get started
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Fixed scope. Clear outcomes. No hidden costs.
            </p>
          </div>
        </section>

        {/* Strategic tier — by application */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-dashed border-primary/40">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">{strategicTier.name}</CardTitle>
                </div>
                <CardDescription className="text-sm font-medium text-primary">
                  {strategicTier.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{strategicTier.description}</p>
                <Button variant="outline" asChild>
                  <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                    Apply for a Strategic engagement
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Outcome bounty — how we get paid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4">How we get paid</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Pay for outcomes, not hours
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Most consultancies invoice for time, regardless of result. We don't.
              </p>
            </div>

            <Card className="border-primary/30">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Milestone delivery — 70%</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Paid against agreed milestones as the build, training and integrations land. Predictable for your finance team.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Outcome bounty — 30%</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Unlocked only when the agreed KPI moves within 90 days of go-live. If it doesn't, the bounty stays unpaid and we keep working until it does.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    Available on selected projects where the KPI is measurable in your numbers and the target is agreed up-front. Not every engagement is suitable — we'll tell you in the Discovery Sprint whether yours is.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Outcomes Assurance retainer */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-xl">Outcomes Assurance — optional retainer</CardTitle>
                <CardDescription>
                  After your build is delivered, keep results compounding. Monthly KPI review, workflow tweaks, and priority support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">£525/month</p>
                    <ul className="mt-3 space-y-1.5">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        Monthly KPI review call
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        Up to 3 hours/month of workflow tweaks
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        Priority support — 24-hour response SLA
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        Add or cancel any month
                      </li>
                    </ul>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                      Discuss the retainer
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare packages</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-3 font-semibold text-sm">Feature</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Discovery</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Kickstart</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm bg-primary/5">Foundation</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Transformation</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-3 text-sm">{row.feature}</td>
                      {(['discovery', 'kickstart', 'foundation', 'transformation'] as const).map((col) => (
                        <td
                          key={col}
                          className={`text-center py-3 px-3 ${col === 'foundation' ? 'bg-primary/5' : ''}`}
                        >
                          {typeof row[col] === 'boolean' ? (
                            row[col] ? (
                              <CheckCircle className="h-5 w-5 text-success mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          ) : (
                            <span className={`text-sm ${col === 'foundation' ? 'font-medium' : ''}`}>
                              {row[col]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Funnel Clarity */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-6 text-foreground">Your path to results</h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 text-sm">
              <span className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full">Discovery Sprint</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-muted-foreground sm:hidden">↓</span>
              <span className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full">Kickstart</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-muted-foreground sm:hidden">↓</span>
              <span className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full">Foundation</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-muted-foreground sm:hidden">↓</span>
              <span className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full">Transformation</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <span className="text-muted-foreground sm:hidden">↓</span>
              <span className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full">Outcomes Assurance</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Or enter directly at any stage that fits your needs.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground pl-8">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">Have more questions?</p>
              <Button asChild variant="outline">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Not sure which package fits?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free 15-minute chat. We'll point you to the right starting package — no pressure, no obligation.
            </p>
            <Button asChild size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book a free 15-min chat
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

export default AISolutions;
