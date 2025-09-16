import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Zap, Target, Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BusinessImpact = () => {
  const keyFeatures = [
    {
      icon: Clock,
      title: 'Quick Turnaround',
      description: 'Rapid deployment of applications that deliver results within weeks, not months.'
    },
    {
      icon: Target,
      title: 'Tailored Solutions',
      description: 'Custom applications designed specifically for your business needs and objectives.'
    },
    {
      icon: Users,
      title: 'Ongoing Support',
      description: 'Continuous support and optimization to ensure sustained business impact.'
    }
  ];

  const benefits = [
    'Increased operational efficiency',
    'Measurable return on investment',
    'Scalable solutions that grow with your business',
    'AI-powered insights and automation',
    'Streamlined workflows and processes'
  ];

  return (
    <>
      <Helmet>
        <title>Business Impact - Rapid AI Applications for Measurable Results | Teamsmiths</title>
        <meta 
          name="description" 
          content="Transform your business with rapid, precise AI applications delivering tangible results. Speed, efficiency, and measurable outcomes in weeks, not months." 
        />
        <meta name="keywords" content="business impact, AI applications, rapid deployment, measurable results, business efficiency" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Business Impact
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Rapid, precise applications delivering tangible results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/outcome-packs">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Driving Real Business Value
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                In today's competitive landscape, businesses need applications that don't just work—they need 
                solutions that drive measurable impact. Our impact-driven approach focuses on speed, efficiency, 
                and tangible outcomes that transform how your business operates.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Speed to Market</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Deploy applications in weeks, not months. Get your competitive advantage faster with our streamlined development process.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Measurable Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track real improvements with built-in analytics and reporting that show exactly how your investment pays off.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Focused Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Every feature serves a purpose. We build only what drives results, eliminating waste and maximizing value.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Our Approach Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Proven Approach
              </h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                We follow a systematic process that combines deep consultation, cutting-edge development, 
                and rapid deployment to ensure your application delivers immediate business value.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Deep Consultation</h3>
                <p className="text-muted-foreground">
                  We start by understanding your unique challenges, goals, and success metrics to ensure perfect alignment.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">AI-Powered Development</h3>
                <p className="text-muted-foreground">
                  Leveraging advanced AI tools and frameworks to build custom applications with unprecedented speed and precision.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Rapid Deployment</h3>
                <p className="text-muted-foreground">
                  Quick deployment with comprehensive testing and quality assurance to ensure your application performs flawlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                What Sets Us Apart
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Key Features</h3>
                <div className="space-y-6">
                  {keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <feature.icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6">Business Benefits</h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses that have already experienced measurable impact 
              through our rapid application development approach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/contact">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">
                  Learn About Our Team
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default BusinessImpact;