import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Users, Shield, TrendingUp, Calendar, Target, CheckCircle, ArrowRight } from 'lucide-react';
import AIDeputee from '@/components/AIDeputee';

const AINavigator = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const benefits = [
    {
      icon: <Brain className="h-12 w-12 text-primary" />,
      title: "Always-On AI Team",
      description: "Your AI Deputee™ agents work 24/7, handling proposals, follow-ups, and routine tasks while you focus on strategy."
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Human Expertise",
      description: "Named Teamsmiths advisors provide weekly reviews, strategic guidance, and ensure quality outcomes."
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary" />,
      title: "Measurable Results",
      description: "Track performance with our dashboard, measuring actual uplift in revenue, efficiency, and key metrics."
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Continuous Assurance",
      description: "AI Deputee™ Assurance provides ongoing monitoring, human QA, and performance guarantees."
    }
  ];

  const useCases = [
    "Sales proposal automation and follow-up sequences",
    "Customer onboarding and support workflows",
    "Financial reporting and cashflow management",
    "Project management and team coordination",
    "Marketing campaign execution and optimization",
    "Compliance monitoring and documentation"
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            AI Navigator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Your on-demand AI team — <AIDeputee /> agents + human strategists, from £195/mo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
              <Link to="/plans">Start Your AI Team — £195/mo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
              <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                Book a Demo
              </a>
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why AI Navigator?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20 bg-muted/30 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Can Your AI Team Do?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-base">{useCase}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  1
                </div>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Select from Lite (£195/mo), Core (£395/mo), Growth (£795/mo), or Partner (custom) based on your team size and needs.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  2
                </div>
                <CardTitle>Onboard Your AI Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Connect your tools, upload examples, and configure your <AIDeputee /> agents for your specific workflows and sector.</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                  3
                </div>
                <CardTitle>Track & Optimize</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Monitor performance through your dashboard, get weekly insights from your human advisor, and continuously improve results.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your AI Team?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of SMBs who've already built their AI teams with Navigator. 
            Start with a Proof Sprint or jump straight into a subscription.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/plans">
                View All Plans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/proof-sprints/checkout?sprint=lite">Try a Proof Sprint First</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AINavigator;