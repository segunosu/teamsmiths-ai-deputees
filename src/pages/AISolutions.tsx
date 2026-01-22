import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, TrendingUp, BarChart3, Bot, Clock, Target } from 'lucide-react';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';

const AISolutions = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('ai_solutions_view' as any, {} as any);
  }, [trackEvent]);

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Automation Essentials',
      price: 'From £495',
      timeline: '1–2 weeks',
      description: 'Quick wins that free up your team immediately',
      workflows: [
        'Email triage & auto-categorization',
        'Invoice processing automation',
        'Scheduling & calendar management',
        'Document extraction & filing'
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
      subtitle: 'Marketing & Sales AI',
      price: 'From £1,950',
      timeline: '2–4 weeks',
      description: 'Drive revenue with AI-powered sales and marketing',
      workflows: [
        'AI-driven lead generation',
        'Personalized email campaigns',
        'Sales-assist chatbots',
        'Proposal automation (Quote Booster)'
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
      subtitle: 'Strategic AI & Analytics',
      price: 'From £4,950',
      timeline: '4–8 weeks',
      description: 'Transform your business with custom AI strategy',
      workflows: [
        'Custom AI roadmaps',
        'Real-time dashboards & reporting',
        'AI governance frameworks',
        'Multi-system integration'
      ],
      outcomes: [
        'Full AI adoption roadmap',
        'Real-time business intelligence',
        'Scalable AI infrastructure'
      ],
      icon: <BarChart3 className="h-8 w-8" />,
      popular: false
    }
  ];

  const comparisonFeatures = [
    { feature: 'AI Opportunity Scan', starter: true, growth: true, scale: true },
    { feature: 'Workflow Implementation', starter: '1–2 workflows', growth: '3–4 workflows', scale: 'Unlimited' },
    { feature: 'Team Training', starter: 'Basic', growth: 'Comprehensive', scale: 'Advanced + ongoing' },
    { feature: 'KPI Dashboard', starter: true, growth: true, scale: true },
    { feature: 'Implementation Time', starter: '1–2 weeks', growth: '2–4 weeks', scale: '4–8 weeks' },
    { feature: 'Support', starter: 'Email', growth: 'Priority', scale: 'Dedicated account team' },
    { feature: 'Custom Integrations', starter: false, growth: 'Basic', scale: 'Full custom' },
    { feature: 'AI Strategy Session', starter: false, growth: '1 session', scale: 'Quarterly' },
  ];

  return (
    <>
      <Helmet>
        <title>AI Solutions for UK SMEs | Teamsmiths</title>
        <meta name="description" content="Productized AI solutions for UK SMEs. Automation Essentials, Marketing & Sales AI, and Strategic AI tiers. Results in under 90 days." />
        <meta name="keywords" content="AI solutions, SME automation, sales AI, marketing AI, business intelligence" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              <Bot className="h-4 w-4 mr-2" />
              Powered by <AIDeputee /> Technology
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              AI Solutions That Deliver Measurable Results
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Choose your tier based on where you are in your AI journey. Every solution includes implementation, training, and KPI tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your free AI diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/results">See AI case studies</Link>
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
                      <span className="text-3xl font-bold text-primary">{tier.price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Clock className="h-4 w-4" />
                      <span>{tier.timeline} implementation</span>
                    </div>
                    <p className="text-muted-foreground mt-4">{tier.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Included Workflows:</h4>
                      <ul className="space-y-2">
                        {tier.workflows.map((workflow, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span>{workflow}</span>
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
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Compare Tiers</h2>
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

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Not sure which tier is right for you?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free AI diagnostic call. We'll analyze your processes and recommend the best starting point.
            </p>
            <Button asChild size="lg">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book your free AI diagnostic
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
