import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Phone, Calendar, Shield, Zap, Users, MessageSquare } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const PlanConfirmation = () => {
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (planId) {
      trackEvent('plan_confirmation_view' as any, { plan: planId } as any);
    }
  }, [trackEvent, planId]);

  const planDetails = {
    professional: {
      name: 'Professional',
      price: '£495',
      period: '/mo',
      description: 'Perfect for getting started with business wins',
      winCount: '1 business win every month',
      features: [
        '1 business win / month',
        'KPI dashboard to track progress',
        'Fast start (within 7 days)',
        'Email support from our team',
        'Bank wins for up to 2 months'
      ],
      highlights: [
        'Start seeing improvements within your first week',
        'Perfect for testing our approach with lower commitment',
        'Easy to upgrade anytime as your needs grow'
      ],
      popular: false
    },
    business: {
      name: 'Business',
      price: '£895',
      period: '/mo',
      description: 'Our most popular plan for growing businesses',
      winCount: '2 business wins every month',
      features: [
        '2 business wins / month',
        'Business KPI dashboard with detailed analytics',
        'Weekly async check-ins with your success team',
        'Priority start (≤4 business days)',
        'All Professional plan benefits included'
      ],
      highlights: [
        'Double the impact with 2 wins per month',
        'Weekly touchpoints keep you informed and aligned',
        'Priority queue gets you started faster'
      ],
      popular: true
    },
    business_plus: {
      name: 'Business Plus',
      price: '£1,495',
      period: '/mo',
      description: 'For teams that need maximum impact and support',
      winCount: '3 business wins every month',
      features: [
        '3 business wins / month OR',
        '2 wins + bank toward 1 Project Build/quarter',
        'Named lead for consistent relationship',
        'Monthly working session (1-on-1 strategy call)',
        'All Business plan benefits included'
      ],
      highlights: [
        'Maximum monthly wins or bank for larger projects',
        'Dedicated relationship manager who knows your business',
        'Monthly strategy sessions to plan ahead'
      ],
      popular: false
    }
  };

  const plan = planDetails[planId as keyof typeof planDetails];

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle>Plan Not Found</CardTitle>
            <CardDescription>
              The selected plan could not be found. Please go back and select a plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/pricing">View All Plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBookCall = () => {
    trackEvent('plan_book_call' as any, { plan: planId } as any);
  };

  const handleProceedToPayment = () => {
    trackEvent('plan_proceed_payment' as any, { plan: planId } as any);
  };

  return (
    <>
      <Helmet>
        <title>{`Confirm ${plan.name} Plan - What You Get | Teamsmiths`}</title>
        <meta name="description" content={`Review your ${plan.name} plan selection. ${plan.description} with ${plan.winCount} per month.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              You've selected the {plan.name} plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let's confirm what you get and guide you through next steps
            </p>
          </div>
        </section>

        {/* Plan Details */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className={`shadow-lg ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular Choice
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {plan.description}
                </CardDescription>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div>
                    <span className="text-5xl font-bold text-primary">{plan.price}</span>
                    <span className="text-xl text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Includes</p>
                    <p className="font-semibold text-lg">{plan.winCount}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Features */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    What's included
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Why this works */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Why businesses love this plan
                  </h3>
                  <ul className="space-y-3">
                    {plan.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What happens next */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What happens next?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">1. Business Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We'll schedule a brief call to understand your business priorities and set up your first wins.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">2. Team Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    You'll meet your dedicated success team and AI Deputee who will deliver your monthly wins.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">3. First Win Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Within days, you'll see your first business improvement implemented and ready to drive results.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-muted-foreground">
                Choose how you'd like to proceed with your {plan.name} plan
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="h-auto py-4 px-6"
                onClick={handleProceedToPayment}
                asChild
              >
                <a href={`#payment-${planId}`}>
                  <div className="text-left">
                    <div className="font-semibold">Start Now</div>
                    <div className="text-sm opacity-90">Secure payment & immediate setup</div>
                  </div>
                  <ArrowRight className="ml-3 h-5 w-5" />
                </a>
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="h-auto py-4 px-6"
                onClick={handleBookCall}
                asChild
              >
                <a href="https://calendly.com/osu/surrey-rapid-performance" target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-semibold">Book a Call First</div>
                    <div className="text-sm text-muted-foreground">Questions? Let's chat</div>
                  </div>
                  <Phone className="ml-3 h-5 w-5" />
                </a>
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>30-day money back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground border-t pt-6">
              Not quite right? <Link to="/pricing" className="text-primary hover:underline">Compare all plans</Link> or{' '}
              <Link to="/brief-builder?mode=quote" className="text-primary hover:underline">get a project quote instead</Link>
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default PlanConfirmation;