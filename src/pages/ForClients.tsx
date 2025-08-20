import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Clock, Users, ArrowRight, Star } from 'lucide-react';

const ForClients = () => {
  const benefits = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Risk-Free Delivery",
      description: "Escrow payments by milestone. Only pay when you approve deliverables.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Vetted Experts",
      description: "Work with experienced leaders who have track records in your industry.",
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Predictable Timelines",
      description: "Fixed-scope packs with clear deliverables and guaranteed timelines.",
    },
  ];

  const securityFeatures = [
    "Encrypted data transmission with SSL/TLS security protocols",
    "Row-level access controls ensuring complete data isolation", 
    "Role-based permissions with admin/user separation",
    "Secure authentication with session management",
    "GDPR-ready data policies with proper access controls",
    "Automated security enforcement preventing unauthorized access"
  ];

  const qaProcess = [
    {
      step: "1",
      title: "Teamsmith Creates",
      description: "Your assigned Teamsmith uses AI Deputees to accelerate the work"
    },
    {
      step: "2", 
      title: "Internal QA Review",
      description: "Every deliverable passes mandatory human quality assurance"
    },
    {
      step: "3",
      title: "Client Approval",
      description: "You review and approve before payment is released"
    },
    {
      step: "4",
      title: "Milestone Payment",
      description: "Automatic payout only after your approval via Stripe Connect"
    }
  ];

  const testimonials = [
    {
      quote: "Teamsmiths delivered our lead generation campaign faster than any agency we've worked with. The QA process caught issues we would have missed.",
      author: "Sarah Chen",
      role: "VP Marketing, TechFlow",
      rating: 5
    },
    {
      quote: "The GDPR compliance pack saved us months of legal work. Everything was audit-ready from day one.",
      author: "Michael Rodriguez", 
      role: "CEO, DataVault",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-muted py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            For Clients
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Why outcome packs beat traditional agencies and freelancers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/catalog">Browse Packs</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Book Demo</Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center shadow-lg">
                <CardHeader>
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
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
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Production-Ready Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your data and intellectual property are protected at every step
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                {securityFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
                <Shield className="h-24 w-24 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Professional Data Protection</h3>
                <p className="text-muted-foreground">
                  Enterprise-class security implementation without the enterprise complexity
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QA Process */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Mandatory QA Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every deliverable passes human quality assurance before you see it
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {qaProcess.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < qaProcess.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real feedback from real businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardHeader>
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <CardDescription className="text-lg italic">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {testimonial.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Better Than Agencies
            </h2>
            <p className="text-xl text-muted-foreground">
              Compare traditional agencies vs Teamsmiths outcome packs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-muted">
              <CardHeader>
                <CardTitle className="text-xl text-center">Traditional Agency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-sm">✗</span>
                  </div>
                  <span>Hourly billing with scope creep</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-sm">✗</span>
                  </div>
                  <span>Junior staff doing the work</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-sm">✗</span>
                  </div>
                  <span>Unclear deliverables</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-destructive text-sm">✗</span>
                  </div>
                  <span>Payment up front</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-xl text-center">Teamsmiths Packs</CardTitle>
                <Badge className="mx-auto w-fit">Recommended</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <span>Fixed price, guaranteed outcomes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <span>Vetted leaders + AI acceleration</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <span>Crystal clear deliverables</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-success" />
                  </div>
                  <span>Pay by milestone approval</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Try Risk-Free?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Start with a small pack to see the difference. Escrow protection included.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/catalog">
                Browse Starter Packs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/auth">Book Consultation</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForClients;