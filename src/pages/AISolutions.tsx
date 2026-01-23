import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, TrendingUp, BarChart3, Clock, Target, HelpCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AISolutions = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('solutions_view' as any, {} as any);
  }, [trackEvent]);

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Automation Essentials',
      price: '£795',
      workflows: '1 workflow',
      timeline: '1–2 weeks',
      description: 'Quick wins that free up your team immediately',
      includes: [
        'Opportunity Scan',
        '1 automation workflow',
        'Basic team training',
        'KPI dashboard setup',
        'Email support for 30 days'
      ],
      outcomes: [
        'Save 5–10 hours per week',
        'Reduce manual errors by 80%',
        '95% accuracy on routine tasks'
      ],
      icon: <Zap className="h-8 w-8" />,
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      subtitle: 'Marketing & Sales',
      price: '£1,950',
      workflows: '3 workflows',
      timeline: '2–4 weeks',
      description: 'Drive revenue with automated sales and marketing',
      includes: [
        'Everything in Starter',
        '3 automation workflows',
        'Comprehensive team training',
        'Basic integrations',
        '1 strategy session',
        'Priority support for 60 days'
      ],
      outcomes: [
        'Increase win rates by 20%',
        '32% faster time-to-quote',
        '35% more leads converted'
      ],
      icon: <TrendingUp className="h-8 w-8" />,
      popular: true
    },
    {
      id: 'scale',
      name: 'Scale',
      subtitle: 'Strategic Automation',
      price: '£4,950',
      workflows: 'Unlimited workflows',
      timeline: '4–8 weeks',
      description: 'Transform your business with comprehensive automation',
      includes: [
        'Everything in Growth',
        'Unlimited workflows',
        'Advanced training + ongoing',
        'Full custom integrations',
        'Quarterly strategy sessions',
        'Dedicated account team'
      ],
      outcomes: [
        'Full automation roadmap',
        'Real-time business intelligence',
        'Scalable infrastructure'
      ],
      icon: <BarChart3 className="h-8 w-8" />,
      popular: false
    }
  ];

  const comparisonFeatures = [
    { feature: 'Opportunity Scan', starter: true, growth: true, scale: true },
    { feature: 'Workflow Implementation', starter: '1 workflow', growth: '3 workflows', scale: 'Unlimited' },
    { feature: 'Team Training', starter: 'Basic', growth: 'Comprehensive', scale: 'Advanced + ongoing' },
    { feature: 'KPI Dashboard', starter: true, growth: true, scale: true },
    { feature: 'Implementation Time', starter: '1–2 weeks', growth: '2–4 weeks', scale: '4–8 weeks' },
    { feature: 'Support', starter: 'Email (30 days)', growth: 'Priority (60 days)', scale: 'Dedicated account team' },
    { feature: 'Custom Integrations', starter: false, growth: 'Basic', scale: 'Full custom' },
    { feature: 'Strategy Session', starter: false, growth: '1 session', scale: 'Quarterly' },
  ];

  const faqs = [
    {
      question: 'When will we see results?',
      answer: 'Most clients see measurable results within 2–4 weeks of implementation. Starter workflows typically go live within 1–2 weeks.'
    },
    {
      question: 'Is there a money-back guarantee if workflows don\'t deliver?',
      answer: 'We stand behind our work. If the agreed KPIs aren\'t met within 90 days, we\'ll continue working at no extra cost until they are, or provide a partial refund.'
    },
    {
      question: 'What\'s included in the Opportunity Scan?',
      answer: 'A 30-minute diagnostic where we analyze your current processes, identify high-impact automation use cases, and provide a prioritized roadmap for implementation.'
    },
    {
      question: 'Can I upgrade tiers later?',
      answer: 'Absolutely. Many clients start with Starter to prove value, then upgrade to Growth or Scale. Your initial investment is credited toward larger projects.'
    },
    {
      question: 'Do you offer ongoing support after implementation?',
      answer: 'Yes. Each tier includes a support period (30–60 days). For ongoing optimization, we offer a monthly retainer called Outcomes Assurance starting at £295/month.'
    },
    {
      question: 'What about culture, motivation, or coaching services?',
      answer: 'These are available as optional add-ons once your core automation workflows are delivering ROI. See our Add-Ons page for details on the Songita BusinessPack and coaching options.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Solutions | Automation for Growing Businesses | Teamsmiths</title>
        <meta name="description" content="Fixed-price automation solutions. Starter £795 (1 workflow), Growth £1,950 (3 workflows), Scale £4,950 (unlimited). Results in weeks." />
        <meta name="keywords" content="automation solutions, business automation, workflow automation, fixed pricing" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Solutions That Deliver Measurable Results
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Choose your package based on where you are in your automation journey. Every solution includes implementation, training, and KPI tracking.
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

        {/* Tiers Grid */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
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
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        {tier.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                        <CardDescription className="text-base font-medium">{tier.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{tier.workflows}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{tier.timeline} implementation</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-4">{tier.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">What's Included:</h4>
                      <ul className="space-y-2">
                        {tier.includes.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Typical Outcomes:</h4>
                      <ul className="space-y-2">
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
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Packages</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold bg-primary/5">Growth</th>
                    <th className="text-center py-4 px-4 font-semibold">Scale</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-4 px-4 text-sm">{row.feature}</td>
                      <td className="text-center py-4 px-4">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? <CheckCircle className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm">{row.starter}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4 bg-primary/5">
                        {typeof row.growth === 'boolean' ? (
                          row.growth ? <CheckCircle className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm font-medium">{row.growth}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {typeof row.scale === 'boolean' ? (
                          row.scale ? <CheckCircle className="h-5 w-5 text-success mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="text-sm">{row.scale}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
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
