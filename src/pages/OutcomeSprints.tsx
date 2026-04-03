import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Zap, Users, Monitor, Play, Clock, Target, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

const OutcomeSprints = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('outcome_sprints_view' as any, {} as any);
  }, [trackEvent]);

  const formats = [
    {
      id: 'on-demand',
      icon: <Play className="h-8 w-8" />,
      title: 'On-Demand',
      subtitle: 'Recorded + guided execution',
      price: '£29–£49',
      launchPrice: null,
      description: 'Work through the sprint at your own pace with recorded sessions and guided execution templates.',
      features: [
        'Pre-recorded facilitation',
        'Step-by-step execution guide',
        'Templates & frameworks included',
        'Complete at your own pace',
      ],
    },
    {
      id: 'live-online',
      icon: <Monitor className="h-8 w-8" />,
      title: 'Live Online',
      subtitle: 'Zoom with breakout rooms',
      price: '£79–£129',
      launchPrice: '£79',
      description: 'Join a live facilitated session with breakout rooms for hands-on group work.',
      features: [
        'Live facilitated session',
        'Breakout rooms for group work',
        '3–5 attendees per group',
        'Real-time feedback & guidance',
      ],
    },
    {
      id: 'live-in-person',
      icon: <Users className="h-8 w-8" />,
      title: 'Live In-Person',
      subtitle: 'Roundtable sessions',
      price: '£149–£295',
      launchPrice: '£149',
      description: 'Intensive in-person session with roundtable collaboration and direct facilitator access.',
      features: [
        'Face-to-face facilitation',
        'Roundtable collaboration',
        '3–5 attendees per table',
        'Networking with peers',
      ],
    },
  ];

  return (
    <>
      <Helmet>
        <title>Outcome Sprints | Build Something Real in 60–90 Minutes | Teamsmiths</title>
        <meta name="description" content="Build a working workflow, roadmap, or business concept in 60–90 minutes. Small groups. Facilitated execution. No fluff." />
        <meta name="keywords" content="outcome sprint, business workshop, workflow building, rapid execution" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">Outcome Sprints</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
              Build something real in 60–90 minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4 leading-relaxed">
              Leave with a working workflow, roadmap, or business concept.
            </p>
            <p className="text-lg text-muted-foreground font-medium mb-10">
              Small groups. Facilitated execution. No fluff.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Join the next Outcome Sprint
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  See upcoming sessions
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">1</div>
                  <CardTitle className="text-xl">Pre-Session Brief</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Share your idea, challenge, or goal. We prepare tailored materials and match you with the right group.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">2</div>
                  <CardTitle className="text-xl">Sprint Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    60–90 minutes of facilitated execution. Build your workflow, validate your concept, or map your roadmap with expert guidance.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center border-0 bg-card/80">
                <CardHeader>
                  <div className="text-5xl font-bold text-primary mb-2">3</div>
                  <CardTitle className="text-xl">Follow-Up Pack</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Receive your deliverables, action plan, and recommendations for next steps — ready to implement immediately.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">What You Leave With</h2>
            <p className="text-lg text-muted-foreground mb-10">Every attendee walks away with tangible, usable outputs.</p>
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Target className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">A Clear Roadmap</h3>
                  <p className="text-sm text-muted-foreground">Prioritised steps to move from idea to execution.</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">A Working Workflow</h3>
                  <p className="text-sm text-muted-foreground">At least one functional workflow you can use immediately.</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Defined Next Actions</h3>
                  <p className="text-sm text-muted-foreground">Clear steps for what to do after the sprint.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Formats & Pricing */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Choose Your Format</h2>
            <p className="text-center text-muted-foreground mb-12">Three ways to sprint — pick what works for you.</p>
            <div className="grid lg:grid-cols-3 gap-8">
              {formats.map((format) => (
                <Card key={format.id} className={`shadow-lg hover:shadow-xl transition-all duration-300 ${format.id === 'live-online' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                  {format.id === 'live-online' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">Recommended</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">{format.icon}</div>
                      <div>
                        <CardTitle className="text-xl">{format.title}</CardTitle>
                        <CardDescription>{format.subtitle}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{format.price}</span>
                    </div>
                    {format.launchPrice && (
                      <Badge variant="secondary" className="w-fit mt-2">Launch price: {format.launchPrice}</Badge>
                    )}
                    <p className="text-muted-foreground mt-4 text-sm">{format.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {format.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={format.id === 'live-online' ? 'default' : 'outline'} asChild>
                      <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                        {format.id === 'on-demand' ? 'Start on-demand' : 'Join the next sprint'}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Conversion Path */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">What Happens After Your Sprint</h2>
            <p className="text-center text-muted-foreground mb-12">Three paths forward — you choose what fits.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-muted-foreground/40 mb-3">DIY</div>
                  <h3 className="font-semibold text-lg mb-2">Execute Yourself</h3>
                  <p className="text-sm text-muted-foreground">Take your deliverables and run with them. You have everything you need.</p>
                </CardContent>
              </Card>
              <Card className="text-center border-2 border-primary">
                <CardContent className="pt-6">
                  <Badge className="mb-3">Most Popular</Badge>
                  <h3 className="font-semibold text-lg mb-2">Upgrade to Kickstart</h3>
                  <p className="text-sm text-muted-foreground mb-4">We implement and refine your sprint outputs into a production-ready solution.</p>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/solutions">View Kickstart →</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="text-center border-2">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-muted-foreground/40 mb-3">∞</div>
                  <h3 className="font-semibold text-lg mb-2">Retainer</h3>
                  <p className="text-sm text-muted-foreground">Continuous improvement with our Outcomes Assurance programme. From £295/mo.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Start fast. Execute faster. Improve continuously.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              An Outcome Sprint is the lowest-risk way to experience Teamsmiths.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Join the next Outcome Sprint
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Start on-demand
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default OutcomeSprints;
