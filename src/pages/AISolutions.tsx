import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, TrendingUp, BarChart3, Clock, Target, HelpCircle, Rocket, Sparkles } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AISolutions = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('solutions_view' as any, {} as any);
  }, [trackEvent]);

  const kickstartTiers = [
    {
      id: 'kickstart-core',
      name: 'Kickstart Core',
      price: '£1,295',
      description: 'Turn your idea into a clear, validated business direction and working system.',
      includes: [
        'Idea validation and concept refinement',
        'Market and competitor research',
        'Clear business model and direction',
        'Initial system or workflow (based on highest impact area)',
        '2 strategy sessions',
        '14–30 days support',
      ],
      outcomes: [
        'Clear, validated direction',
        'Defined go-to-market approach',
        'First working system or workflow',
      ],
      icon: <Rocket className="h-8 w-8" />,
      popular: false,
    },
    {
      id: 'kickstart-build',
      name: 'Kickstart Build',
      price: '£1,895',
      description: 'Go further — build and launch a working business system.',
      includes: [
        'Everything in Core PLUS:',
        'Deeper research and validation',
        'Cashflow / commercial thinking (high-level)',
        '2–3 production-ready workflows',
        'Website, PWA app, or system (based on use case)',
        'Stronger execution support',
      ],
      outcomes: [
        'Working business system (not just plan)',
        'Faster launch with reduced risk',
        'Ready-to-run foundation',
      ],
      icon: <Sparkles className="h-8 w-8" />,
      popular: true,
    },
  ];

  const solutionTiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Quick Wins',
      price: '£795',
      workflows: '1 workflow',
      timeline: '1–2 weeks',
      description: 'Quick wins that free up your team immediately',
      includes: [
        'Opportunity Scan',
        '1 workflow',
        'Basic team training',
        'KPI dashboard setup',
        'Team support for 30 days',
        'Standard integrations',
        '1 strategy session',
      ],
      outcomes: [
        'Save 5–10 hours per week',
        'Reduce manual errors by 80%',
        '95% accuracy on routine tasks',
      ],
      icon: <Zap className="h-8 w-8" />,
      popular: false,
    },
    {
      id: 'growth',
      name: 'Growth',
      subtitle: 'Marketing & Sales',
      price: '£1,950',
      workflows: '3 workflows',
      timeline: '2–4 weeks',
      description: 'Drive revenue with intelligent sales and marketing systems',
      includes: [
        'Everything in Starter',
        '3 workflows',
        'Comprehensive team training',
        'Premium integrations',
        '3 strategy sessions',
        'Team support for 45 days',
      ],
      outcomes: [
        'Increase win rates by 20%',
        '32% faster time-to-quote',
        '35% more leads converted',
      ],
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true,
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Full Transformation',
      price: '£4,950',
      workflows: '7 workflows',
      timeline: '4–8 weeks',
      description: 'Intelligent systems across your business for comprehensive impact',
      includes: [
        'Everything in Growth',
        '7 workflows',
        'Advanced training + ongoing',
        'Full custom integrations',
        '7 strategy sessions',
        'Dedicated account team + 60 days support',
      ],
      outcomes: [
        'Full implementation roadmap',
        'Real-time business intelligence',
        'Scalable infrastructure',
      ],
      icon: <BarChart3 className="h-8 w-8" />,
      popular: false,
    },
  ];

  const comparisonFeatures = [
    { feature: 'Opportunity Scan', starter: true, growth: true, scale: true },
    { feature: 'Workflow Implementation', starter: '1 workflow', growth: '3 workflows', scale: '7 workflows' },
    { feature: 'Team Training', starter: 'Basic', growth: 'Comprehensive', scale: 'Advanced + ongoing' },
    { feature: 'KPI Dashboard', starter: true, growth: true, scale: true },
    { feature: 'Implementation Time', starter: '1–2 weeks', growth: '2–4 weeks', scale: '4–8 weeks' },
    { feature: 'Support', starter: 'Team (30 days)', growth: 'Team (45 days)', scale: 'Dedicated account team (60 days)' },
    { feature: 'Custom Integrations', starter: 'Standard', growth: 'Premium', scale: 'Full custom' },
    { feature: 'Strategy Sessions', starter: '1', growth: '3', scale: '7' },
  ];

  const faqs = [
    {
      question: 'What is an Outcome Sprint?',
      answer: 'An Outcome Sprint is a 60–90 minute facilitated session where you build a working workflow, roadmap, or business concept. Available on-demand (£29–£49), live online (£79–£129), or live in-person (£149–£295). Each attendee leaves with tangible deliverables and clear next actions. Optional retainer available for ongoing improvements.',
    },
    {
      question: 'What\'s the difference between Kickstart Core and Kickstart Build?',
      answer: 'Kickstart Core (£1,295) gives you a validated direction, business model, and your first working system. Kickstart Build (£1,895) goes further — you get a production-ready business system including website, app, or platform, plus deeper research and commercial thinking.',
    },
    {
      question: 'When will we see results?',
      answer: 'Most clients see measurable results within 2–4 weeks of implementation. Starter workflows typically go live within 1–2 weeks.',
    },
    {
      question: 'Is there a money-back guarantee if workflows don\'t deliver?',
      answer: 'We stand behind our work. If the agreed KPIs aren\'t met within 90 days, we\'ll continue working at no extra cost until they are, or provide a partial refund.',
    },
    {
      question: 'What\'s included in the Opportunity Scan?',
      answer: 'A 30-minute diagnostic where we analyze your current processes, identify high-impact use cases, and provide a prioritized roadmap for implementation.',
    },
    {
      question: 'Can I upgrade tiers later?',
      answer: 'Absolutely. Many clients start with an Outcome Sprint or Kickstart to prove value, then upgrade to Growth or Scale. Your initial investment is credited toward larger projects.',
    },
    {
      question: 'Do you offer ongoing support after implementation?',
      answer: 'Yes. Each tier includes support (14–60 days depending on tier). For ongoing optimization, we offer a monthly retainer called Outcomes Assurance starting at £295/month.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Solutions | Teamsmiths — Results-Driven Execution for Growing Businesses</title>
        <meta name="description" content="Validate, design, and launch the right business or product — fast. Kickstart from £1,295. Solutions from £795 to £4,950. Results in weeks." />
        <meta name="keywords" content="business solutions, workflow implementation, fixed pricing, execution, kickstart" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Solutions That Deliver Measurable Results
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Choose your package based on where you are today. Every solution includes implementation, training, and KPI tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your free diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/results">See case studies</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Kickstart Section — Separate */}
        <section id="kickstart" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-sm font-medium text-primary mb-2">Start with clarity. Build what actually works.</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2">Start something new (or rebuild)</h2>
            <p className="text-center text-sm text-muted-foreground mb-3">Validate, design, and launch the right business or product — fast.</p>
            <p className="text-center text-xs text-muted-foreground mb-10">
              <Badge variant="secondary" className="text-xs">Next step after an Outcome Sprint</Badge>
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {kickstartTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative shadow-lg hover:shadow-xl transition-all duration-300 ${
                    tier.popular ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        Most Complete
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        {tier.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">What's Included:</h4>
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
                      <h4 className="font-semibold mb-2 text-sm">Typical Outcomes:</h4>
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
                      variant={tier.popular ? "default" : "outline"}
                      asChild
                    >
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Get Started with {tier.name}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Solutions Tiers Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2">Ongoing Solutions</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              For teams ready to improve, grow, or transform existing operations.
            </p>

            <div className="grid lg:grid-cols-3 gap-6">
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
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        {tier.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold">{tier.name}</CardTitle>
                        <CardDescription className="text-sm font-medium">{tier.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{tier.workflows}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{tier.timeline}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-3 text-sm">{tier.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">What's Included:</h4>
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
                      <h4 className="font-semibold mb-2 text-sm">Typical Outcomes:</h4>
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
                      variant={tier.popular ? "default" : "outline"}
                      asChild
                    >
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Get Started with {tier.name}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Outcomes Assurance */}
            <div className="mt-12 max-w-3xl mx-auto">
              <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                  <CardTitle className="text-xl">+ Outcomes Assurance (Optional Retainer)</CardTitle>
                  <CardDescription>Continuous optimization after implementation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-2xl font-bold text-primary">£295/month</p>
                      <p className="text-sm text-muted-foreground mt-1">Monthly KPI reviews, workflow tweaks, priority support</p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Outcome Sprint Banner */}
            <div className="mt-8 max-w-3xl mx-auto text-center">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-6">
                  <p className="text-base font-medium text-foreground mb-2">
                    Not ready for a full package?
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Outcome Sprint:</strong> a low-risk way to experience Teamsmiths before choosing a package.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/outcome-sprints">Learn more about Outcome Sprints</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Table — Solutions only */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Solutions</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-3 font-semibold text-sm">Feature</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Starter</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm bg-primary/5">Growth</th>
                    <th className="text-center py-4 px-3 font-semibold text-sm">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-3 text-sm">{row.feature}</td>
                      {(['starter', 'growth', 'scale'] as const).map((col) => (
                        <td key={col} className={`text-center py-3 px-3 ${col === 'growth' ? 'bg-primary/5' : ''}`}>
                          {typeof row[col] === 'boolean' ? (
                            row[col] ? <CheckCircle className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={`text-sm ${col === 'growth' ? 'font-medium' : ''}`}>{row[col]}</span>
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

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

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
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Not sure which package is right for you?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free diagnostic call. We'll analyze your processes and recommend the best starting point.
            </p>
            <Button asChild size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book your free diagnostic
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
