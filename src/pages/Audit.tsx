import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, BarChart3, Calendar } from 'lucide-react';

const Audit = () => {
  const deliverables = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "KPI baseline (revenue, speed, cost)"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-primary" />,
      title: "Prioritised opportunity map (2–3 quick wins)"
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary" />,
      title: "30/60/90 plan + recommended next step"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="start" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Business Audit
            </h1>
            <div className="flex items-center justify-center mb-8">
              <span className="text-xl font-semibold">5 business days</span>
            </div>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium max-w-2xl mx-auto leading-relaxed">
              A quick, neutral diagnostic - the fastest path to visible uplift.
            </p>
          </div>

          {/* What You Get */}
          <Card className="shadow-sm border-0 bg-card/50 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">What you get:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6 mb-8">
                {deliverables.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                      {item.icon}
                    </div>
                    <span className="text-lg leading-relaxed font-medium">{item.title}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-muted/50 p-6 rounded-lg mb-8">
                <p className="text-base font-medium text-center">
                  <strong>Credit:</strong> Audit fee is credited if you purchase a Business Outcome or Business Impact within 30 days.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => window.location.href = '/start?customize=business_audit&origin=audit'}
                >
                  Add to Plan
                </Button>
                <div className="text-sm text-muted-foreground text-center space-y-1">
                  <p>Tailored to your business during onboarding.</p>
                  <p>
                    Or{' '}
                    <Link 
                      to="/brief?mode=quote&origin=audit&ref=business_audit#form"
                      className="underline hover:no-underline"
                    >
                      buy one-off
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-lg font-semibold mb-2">Discovery Call</h3>
                <p className="text-muted-foreground">30-minute call to understand your current state and goals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                <p className="text-muted-foreground">We analyze your workflows and identify quick wins</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-lg font-semibold mb-2">Roadmap</h3>
                <p className="text-muted-foreground">Receive your prioritized plan and Business Outcome recommendation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Audit;