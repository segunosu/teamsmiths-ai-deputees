import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  ArrowRight,
  Target,
  HelpCircle,
  Rocket,
  Sparkles,
  Lightbulb,
  Layers,
  Network,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AISolutions = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('solutions_view' as any, {} as any);
  }, [trackEvent]);

  // Engines we've built or designed — credibility wall, not a fixed catalogue
  const engineWall = [
    {
      name: 'Construction Revenue Risk Engine',
      desc: 'Surfaces delay risks and claim opportunities early enough to benefit, by monitoring project updates and baseline.',
      status: 'Live · onboarding UK contractors',
      href: '/examples/revenue-risk-engine',
    },
    {
      name: 'Manufacturing Order Risk Engine',
      desc: 'Spots order delivery exposure before it costs you, by reading machine signals and translating them into role-specific actions.',
      status: 'Validated prototype · cohort forming',
      href: '/examples/order-risk-engine',
    },
    {
      name: 'Sports Club Membership Engine',
      desc: 'Bookings + admissions + compliance + QR access. Removes manual admin overhead and grows the addressable member base.',
      status: 'Live with clients',
    },
    {
      name: 'Mental Fitness Engine for Sports Clubs',
      desc: 'On-demand mental fitness content synced with coaches and parents. Safeguarding, compliance and privacy built in.',
      status: 'Designed · cohort forming',
    },
    {
      name: 'Songita — Personalised Music & Video Engine',
      desc: 'Custom songs and videos for occasions, hospitality, events and team recognition. Front-end + back-end, used by consumers and businesses.',
      status: 'Live with consumers and businesses',
    },
    {
      name: 'Meeting Intelligence Engine',
      desc: 'Transcribes meetings and turns them into next-best actions, individual nudges, training, coaching and automated CRM/Jira updates. Bring your own framework or pick BANT, MEDIC, SCRUM, etc.',
      status: 'Live · the original Engine',
    },
    {
      name: 'Quote Booster',
      desc: 'Streamlined quoting with dynamic pricing — faster turnaround, higher win rate.',
      status: 'Designed · ready to deploy',
    },
    {
      name: 'Cashflow Nudges',
      desc: 'Automated invoice reminders with polite escalation — DSO down, aged invoices down.',
      status: 'Designed · ready to deploy',
    },
    {
      name: 'Follow-up Engine',
      desc: 'Smart, automated follow-ups so deals never slip through the cracks.',
      status: 'Designed · ready to deploy',
    },
    {
      name: 'Proposal Speed-up',
      desc: 'Drafts proposals from your last call — branded, tracked, and faster.',
      status: 'Designed · ready to deploy',
    },
    {
      name: 'New-Hire Onboarding Kit',
      desc: 'Structured 30-day onboarding with SOPs, milestones and tracking.',
      status: 'Designed · ready to deploy',
    },
    {
      name: 'Meeting-to-Minutes',
      desc: 'Meeting notes flow automatically into your task system — actions get followed up.',
      status: 'Designed · ready to deploy',
    },
  ];

  const tiers = [
    {
      id: 'kickstart',
      name: 'Kickstart',
      price: '£2,950',
      tagline: 'One engine. One painful KPI. Live in days.',
      description:
        'Pick one problem that\'s eating your team\'s hours or your business\'s margin. We design and deploy the engine for it.',
      includes: [
        'One engine designed and deployed in your business',
        'Templated config with your data',
        'Standard integrations with your existing tools',
        'Team training and SOPs',
        'KPI dashboard',
        '30 days post-launch support',
      ],
      examples: [
        'Cashflow Nudges — templated, wired into your accounting tool',
        'Construction Revenue Risk — single project, dashboards-only configuration',
        'Meeting Intelligence Engine — your meetings flowing into action lists',
        'Quote Booster — dynamic pricing wired into your CRM',
      ],
      timeline: 'Days, not weeks',
      icon: <Rocket className="h-8 w-8" />,
      popular: false,
    },
    {
      id: 'foundation',
      name: 'Foundation',
      price: '£7,950',
      tagline: 'One engine deeper, or two coordinated.',
      description:
        'More ambition than a single workflow. A deeper, more custom build — or two engines wired together to lift performance across one function or domain.',
      includes: [
        'Deeper customization, or two engines coordinated',
        'Premium integrations across your stack',
        'Comprehensive team training',
        '3 strategy sessions',
        'Light governance and change-management overlay',
        '45 days post-launch support',
      ],
      examples: [
        'Construction Revenue Risk — multi-project, custom LD logic, role-based escalations',
        'Sports Club Membership Engine — booking + admissions + compliance + QR',
        'Sales engine — lead capture + qualification + quoting + follow-up, wired together',
        'Finance close — invoice processing + cashflow nudges + reporting',
      ],
      timeline: 'Weeks, not months',
      icon: <Layers className="h-8 w-8" />,
      popular: true,
    },
    {
      id: 'transformation',
      name: 'Transformation',
      price: '£19,500',
      tagline: 'An engine portfolio across the business.',
      description:
        'A connected set of engines across functions or sites — one execution layer that compounds wins month-over-month, with senior oversight throughout.',
      includes: [
        'A portfolio of engines wired together',
        'Full custom integrations',
        '7 strategy sessions',
        'Dedicated account team',
        'Governance, change management and rollout planning',
        '60 days post-launch support',
      ],
      examples: [
        'Construction Risk + Cashflow + Meeting Intelligence, wired together for a tier-2 contractor across sites',
        'Cross-functional command centre: sales + ops + finance, with role-based actions',
        'Multi-tenant Songita rollout for a hospitality chain',
        'End-to-end revenue engine: marketing → sales → success → renewal, all instrumented',
      ],
      timeline: '4–8 weeks',
      icon: <Network className="h-8 w-8" />,
      popular: false,
    },
  ];

  const strategicTier = {
    name: 'Strategic',
    tagline: 'By application — for engagements above £30,000',
    description:
      'Multi-quarter programmes, regulated environments, or organisation-wide rollout. We take a small number of these each year.',
  };

  const comparisonFeatures = [
    { feature: 'Engines deployed', kickstart: 'One', foundation: 'One deeper, or two', transformation: 'A portfolio' },
    { feature: 'Customization', kickstart: 'Templated', foundation: 'Custom', transformation: 'Full custom' },
    { feature: 'Integrations', kickstart: 'Standard', foundation: 'Premium', transformation: 'Full custom' },
    { feature: 'Strategy sessions', kickstart: '1', foundation: '3', transformation: '7' },
    { feature: 'Team training', kickstart: 'Basic', foundation: 'Comprehensive', transformation: 'Advanced + ongoing' },
    { feature: 'Governance overlay', kickstart: '—', foundation: 'Light', transformation: 'Full' },
    { feature: 'Post-launch support', kickstart: '30 days', foundation: '45 days', transformation: '60 days + dedicated team' },
    { feature: 'Typical timeline', kickstart: 'Days', foundation: 'Weeks', transformation: '4–8 weeks' },
    { feature: 'Outcome bounty available', kickstart: 'Selected projects', foundation: 'Selected projects', transformation: 'Selected projects' },
    { feature: 'Outcomes Assurance retainer', kickstart: '£525/mo (optional)', foundation: '£525/mo (optional)', transformation: '£525/mo (optional)' },
  ];

  const faqs = [
    {
      question: 'Where should I start?',
      answer:
        'Almost everyone starts with the Discovery Sprint. £495, 90 minutes 1:1 with a senior business performance lead, and you walk away with an AI Diagnostic Report — your top 3 opportunities ranked by £ impact, a working design for the first engine we\'d build, and a 90-day plan. The full £495 is credited to your first build if you proceed within 60 days.',
    },
    {
      question: 'How do you build engines so fast?',
      answer:
        'Decades of finding what\'s leaking + AI compressing the build time = engines that used to take months arrive in days. The bottleneck shifts from build effort to discovery and design — which is exactly what the Discovery Sprint solves.',
    },
    {
      question: 'How are you different from a regular consultancy?',
      answer:
        'Three things. Fixed prices on every package below Strategic. A senior business performance lead on every engagement (no offshore handover). And for selected projects we offer an outcome-bounty pricing model — see "How we get paid" below — where part of our fee only unlocks when the agreed KPI moves.',
    },
    {
      question: 'What is the outcome-bounty pricing model?',
      answer:
        'For selected projects and clients, we split the fee 70/30: 70% paid against milestone delivery (the build, training, integration), and a 30% outcome bounty paid only when the agreed KPI is hit within 90 days of go-live. If the KPI does not move, the bounty stays unpaid and we keep working until it does. Available where the KPI is measurable in your numbers and the target is agreed up-front. We\'ll tell you in the Discovery Sprint whether your engagement is suitable.',
    },
    {
      question: 'What if my problem isn\'t in the engine list?',
      answer:
        'Then we design and build a new engine for it. The list above shows what we\'ve already built or designed — it\'s not the menu. If you can describe the problem, we can build the engine. Bring it to a Discovery Sprint and we\'ll scope it 1:1.',
    },
    {
      question: 'What is Outcomes Assurance?',
      answer:
        'After your initial build is delivered, you can keep results compounding with a £525/month retainer. It includes a monthly KPI review call, up to 3 hours/month of workflow tweaks, and priority support. Add or cancel any month.',
    },
    {
      question: 'Who do you work with?',
      answer:
        'UK SMBs — typically £1m–£50m turnover, 10–250 employees, owner-operators or senior leadership teams who can move quickly. Buildze Ltd, trading as Teamsmiths. Based in London and Woking, Surrey.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Solutions & Pricing | Teamsmiths — Bring the problem. We'll build the engine.</title>
        <meta
          name="description"
          content="Custom engines for your business problem. Live in days. Priced on the outcome they unlock. Discovery Sprint £495. Kickstart £2,950. Foundation £7,950. Transformation £19,500."
        />
        <meta
          name="keywords"
          content="AI consulting UK, custom engines, fixed price AI, SMB AI delivery, outcome pricing, outcome bounty"
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
              Bring the problem.<br className="hidden sm:block" /> We'll build the engine in days, not months.<br className="hidden sm:block" /> When your KPI moves, we earn a bounty <span className="text-base sm:text-lg lg:text-2xl font-medium text-muted-foreground/80">(selected engagements)</span>.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed">
              Custom engines designed and built for your specific business problem.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
              Built for UK SMBs. Senior business performance lead on every engagement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/outcome-sprints">
                  Start with a Discovery Sprint — £495
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a free 15-min chat
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* How this works — three-line equation */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-3">How this works</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Why "in days" is the new normal</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center border-0 bg-card/80">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">+</div>
                  <p className="text-sm font-semibold text-foreground mb-1">Decades of finding what's leaking</p>
                  <p className="text-xs text-muted-foreground">FTSE pharma turnaround. Infrastructure delivery. Strategy across global firms. The pattern is always the same — earlier visibility, the right people, the right tools.</p>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">×</div>
                  <p className="text-sm font-semibold text-foreground mb-1">Build time collapsed</p>
                  <p className="text-xs text-muted-foreground">What used to take months now takes days. The bottleneck is no longer effort — it's discovery and design. That's what the Discovery Sprint exists for.</p>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">=</div>
                  <p className="text-sm font-semibold text-foreground mb-1">Custom engines, fast, priced on outcomes</p>
                  <p className="text-xs text-muted-foreground">We design and build the engine for your specific problem. You pay against milestones, plus a bounty only if the KPI moves.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What we've built so far — credibility wall */}
        <section id="engines" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <Badge variant="secondary" className="mb-3">Engines we've built or designed</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">A taste, not a menu.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These are engines we've already built or designed. The full breadth is whatever you can describe and we can imagine — bring the problem, and we'll design the engine for it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engineWall.map((engine) => {
                const card = (
                  <Card key={engine.name} className="h-full border-l-4 border-l-primary/40 hover:border-l-primary hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="font-semibold text-foreground mb-2 text-sm">{engine.name}</div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{engine.desc}</p>
                      <Badge variant="outline" className="text-[10px]">{engine.status}</Badge>
                    </CardContent>
                  </Card>
                );
                return engine.href ? (
                  <Link key={engine.name} to={engine.href} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={engine.name}>{card}</div>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground/80 italic mt-8 max-w-3xl mx-auto">
              Outcomes shown across this page are projected or illustrative based on engine design and the founder's prior delivery work. Real named cohorts coming soon.
            </p>

            <div className="text-center mt-8">
              <h3 className="text-2xl font-bold mb-3">What would you build?</h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Pick a problem. We'll design the engine for it in a 90-minute Discovery Sprint.
              </p>
              <Button size="lg" asChild>
                <Link to="/outcome-sprints">
                  Book a Discovery Sprint — £495
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Tier ladder — depth, not domain */}
        <section id="tiers" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <Badge className="mb-3">Pick the depth</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Same engine, different depths.</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tiers reflect <span className="font-medium text-foreground">how custom, how integrated and how supported</span> — not how long the build takes. With AI compression, every tier ships fast.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {tiers.map((tier) => (
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
                    <p className="text-xs text-muted-foreground mt-1">Live in: {tier.timeline}</p>
                    <p className="text-muted-foreground mt-3 text-sm">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Things we'd build at this depth:</h4>
                      <ul className="space-y-1.5">
                        {tier.examples.map((ex, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t">
                      <h4 className="font-semibold mb-2 text-sm">Includes:</h4>
                      <ul className="space-y-1.5">
                        {tier.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">{item}</span>
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
              Fixed price. Senior lead on every engagement. Outcome bounty available on selected projects.
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

        {/* How we get paid — outcome bounty centerpiece */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Badge className="mb-4">How we get paid</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                We earn the bounty when your KPI moves.
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
                    <th className="text-center py-4 px-3 font-semibold text-sm">Kickstart</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm bg-primary/5">Foundation</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Transformation</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-3 text-sm">{row.feature}</td>
                      {(['kickstart', 'foundation', 'transformation'] as const).map((col) => (
                        <td
                          key={col}
                          className={`text-center py-3 px-3 ${col === 'foundation' ? 'bg-primary/5' : ''}`}
                        >
                          <span className={`text-sm ${col === 'foundation' ? 'font-medium' : ''}`}>
                            {row[col]}
                          </span>
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
              What would you build?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with a Discovery Sprint and we'll design the engine for your problem in 90 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/outcome-sprints">
                  Book a Discovery Sprint — £495
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a free 15-min chat
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AISolutions;
