import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Heart, Users, Music, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const AddOns = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('add_ons_view' as any, {} as any);
  }, [trackEvent]);

  return (
    <>
      <Helmet>
        <title>Add-Ons: Culture, Motivation & Coaching | Teamsmiths</title>
        <meta name="description" content="Optional add-ons to complement your AI workflows. Songita BusinessPack for team appreciation and Deputee-style coaching for ongoing growth." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">Optional Services</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Culture & Motivation Add-Ons
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Once your core AI workflows are delivering ROI, boost team morale with these optional services.
            </p>
          </div>
        </section>

        {/* Add-Ons Grid */}
        <section className="pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Songita BusinessPack */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Music className="h-8 w-8 text-primary" />
                    </div>
                    <Badge variant="outline">Most Popular Add-On</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold">Motivation & Appreciation</CardTitle>
                  <CardDescription className="text-base">Songita BusinessPack</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Celebrate achievements with custom team appreciation songs. AI-powered creativity, refined by real human producers for emotional resonance.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Perfect for:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Year-end celebrations</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Team milestones & wins</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Employee recognition moments</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Client appreciation</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><strong>Pricing:</strong> From £495 per custom song/experience</p>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to="/motivation-and-appreciation">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Coaching & Growth */}
              <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">Coaching & Micro-Growth</CardTitle>
                  <CardDescription className="text-base">Deputee-style Coaching</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">
                    Accelerate development with ongoing, personalized coaching prompts. Micro-coaching plans and feedback cycles, all tailored to individuals and teams.
                  </p>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Includes:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Personalized growth plans</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Weekly micro-coaching prompts</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Quarterly progress reviews</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span>Team dynamics optimization</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm"><strong>Pricing:</strong> From £295/month per team</p>
                  </div>
                  
                  <Button className="w-full" variant="outline" asChild>
                    <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                      Discuss Coaching Options
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* When to Add */}
            <Card className="mt-12 bg-muted/30 border-dashed">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  When to Add Culture Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We recommend adding motivation and coaching services <strong>after</strong> your core AI workflows are delivering measurable results. This ensures:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Your team has capacity freed up by automation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>ROI from AI covers the investment in culture</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span>Recognition amplifies the wins you're already achieving</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start with AI, Add Culture Later
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get your core workflows delivering results first. We'll help you identify the right time to invest in team culture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book your free AI diagnostic
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/ai-solutions">View AI Solutions</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AddOns;
