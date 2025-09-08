import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Zap, Users, BarChart3, Shield, Target, Bot } from 'lucide-react';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';

const AINavigator = () => {
  const { trackEvent } = useAnalytics();

  const handleNavigatorClick = () => {
    trackEvent('nav_ai_navigator_click', {});
  };

  const capabilities = [
    {
      icon: <Bot className="h-12 w-12 text-primary" />,
      title: "Automated Workflows",
      description: "AI Deputee™ agents handle your repetitive tasks",
      items: ["Proposal generation", "Follow-up sequences", "Quote processing", "Payment reminders"]
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-primary" />,
      title: "Performance Monitoring",
      description: "Real-time insights into your business metrics",
      items: ["KPI tracking", "Revenue analytics", "Conversion rates", "Process efficiency"]
    },
    {
      icon: <Users className="h-12 w-12 text-primary" />,
      title: "Human Oversight",
      description: "Expert advisors ensure quality and strategy",
      items: ["Weekly reviews", "Strategic guidance", "Quality assurance", "Performance optimization"]
    }
  ];

  const proofSprints = [
    {
      name: "Lite Sprint",
      duration: "1 week",
      price: "£495",
      deliverable: "1 Deputee™ quick-win (proposal template + auto follow-up)",
      cta: "Book Proof Sprint — £495"
    },
    {
      name: "Focus Sprint", 
      duration: "2 weeks",
      price: "£1,950",
      deliverable: "2 Deputee™ workflows + KPI baseline",
      cta: "Start 2-week Proof — £1,950"
    },
    {
      name: "Impact Sprint",
      duration: "4 weeks", 
      price: "£4,950",
      deliverable: "Full pilot + measurement plan + 30-day uplift projection",
      cta: "Run 4-week Proof — £4,950"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted opacity-80"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.05),transparent_50%),radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.05),transparent_50%)]"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Your <AIDeputee /> AI Team
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-10 max-w-4xl mx-auto leading-relaxed">
              Always-on AI agents + human strategists working to grow your business — starting from £195/month.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Button asChild size="lg" className="text-lg px-10 py-6 h-auto" onClick={handleNavigatorClick}>
                <Link to="/plans">View Navigator Packs</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-10 py-6 h-auto">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Demo</a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Your on-demand AI team — <AIDeputee /> agents + Teamsmiths advisors, from £195/mo.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              How <AIDeputee /> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Intelligent automation with human oversight for guaranteed results.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {capabilities.map((capability, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="pb-6">
                  <div className="mb-6">
                    {capability.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{capability.title}</CardTitle>
                  <CardDescription className="text-lg font-medium text-muted-foreground mt-3">
                    {capability.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3">
                    {capability.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Sprints */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Proof Sprints
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Validate <AIDeputee /> impact in 1–4 weeks with measurable results.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {proofSprints.map((sprint, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="pb-6">
                  <CardTitle className="text-2xl font-bold">{sprint.name}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-primary">{sprint.price}</span>
                      <span className="text-muted-foreground ml-2">• {sprint.duration}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-base leading-relaxed mb-6 text-muted-foreground">
                    <strong>Deliverable:</strong> {sprint.deliverable}
                  </p>
                  <Button asChild className="w-full" size="lg">
                    <Link to={`/proof-sprints?sprint=${sprint.name.toLowerCase().replace(' ', '-')}`}>
                      {sprint.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              All Proof Sprints require signed scope and KPI sign-off before start.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Build Your AI Team?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start with a Proof Sprint or choose a Navigator Pack subscription.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/plans">
                View Navigator Packs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/proof-sprints">Try a Proof Sprint</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AINavigator;