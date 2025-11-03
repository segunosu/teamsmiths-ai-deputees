import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const Plan = () => {
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handlePlanSelect = (plan: string) => {
    trackEvent('plan_select' as any, { plan } as any);
  };

  const plans = [
    {
      id: 'professional',
      name: 'Professional',
      price: '£495',
      period: '/mo',
      features: [
        '1 business win / month',
        'KPI dashboard',
        'Fast start',
        'Email support',
        'Bank wins (2-month cap)'
      ],
      cta: 'Join Professional',
      stripe_id: 'sub_pro_495'
    },
    {
      id: 'business',
      name: 'Business',
      price: '£895',
      period: '/mo',
      popular: true,
      features: [
        '2 business wins / month',
        'Business KPI dashboard',
        'Weekly async check-ins',
        'Start ≤4 business days',
        'All Professional plan benefits included'
      ],
      cta: 'Join Business',
      stripe_id: 'sub_bus_895'
    },
    {
      id: 'business_plus',
      name: 'Business Plus',
      price: '£1,495',
      period: '/mo',
      features: [
        '3 business wins / month OR',
        '2 wins + bank toward 1 Project Build/quarter',
        'Named lead',
        'Monthly working session',
        'All Business plan benefits included'
      ],
      cta: 'Join Business Plus',
      stripe_id: 'sub_plus_1495'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Fixed Price. Visible Outcomes. Pay Only When We Deliver | Teamsmiths</title>
        <meta name="description" content="One-time Discovery & Implementation from £495-£995. Optional Outcomes Assurance from £195/month—only after you see results." />
        <meta name="keywords" content="fixed price, business improvement, measurable outcomes, UK SME, cost reduction" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Fixed price. Visible outcomes.<br />Pay monthly only when we deliver.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              One business improvement delivered and proven—tracked in your numbers.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section id="pricing" className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Discovery & Implementation */}
              <Card className="relative shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-primary">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Start Here
                </Badge>
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Discovery & Implementation</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">£495-£995</span>
                    <p className="text-sm text-muted-foreground mt-2">One-time, fixed price per project</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-base">
                    We identify your priority, set up the solution, and prove it works in your business.
                  </CardDescription>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">One business improvement delivered & proven</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Tracked in your numbers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Delivered in 2–6 weeks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">No monthly commitment required</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    onClick={() => handlePlanSelect('discovery')}
                    asChild
                  >
                    <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                      Book your outcome call
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Outcomes Assurance */}
              <Card className="relative shadow-sm hover:shadow-lg transition-all duration-300 border-2">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Outcomes Assurance</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">£195-£395</span>
                    <p className="text-sm text-muted-foreground mt-2">per month</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <CardDescription className="text-base">
                    Optional add-on: ongoing monitoring & support to keep your results on track.
                  </CardDescription>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Only pay after solution is working</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Continuous monitoring & optimization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Performance safeguard included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Cancel anytime</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handlePlanSelect('assurance')}
                    asChild
                  >
                    <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                      Discuss Assurance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Custom Build Option */}
            <div className="text-center mt-16">
              <p className="text-lg text-muted-foreground mb-4 font-medium">
                Prefer a custom build? Request a fixed quote.
              </p>
              <Button asChild variant="outline" size="lg">
                <Link to="/brief-builder">Request bespoke quote</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">What's included?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    One business improvement delivered and proven, tracked in your numbers. Simple, measurable results.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">When do I pay monthly?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    After you see the result in your live system, not before. The Outcomes Assurance retainer is optional.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">How quickly will I see results?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Most clients see measurable change in 2–6 weeks from the start of implementation.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-0 bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg">Is this a subscription?</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Discovery & Implementation is one-time. Outcomes Assurance is a monthly retainer—only if you like the result and keep it running.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Plan;