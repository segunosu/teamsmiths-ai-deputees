import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, ArrowRight, CheckCircle, Target, Zap, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    window.scrollTo(0, 0);
    trackEvent('about_view' as any, {} as any);
  }, [trackEvent]);

  const trackRecord = [
    {
      org: 'Philips Engineering',
      detail: '£22m/year revenue protection through dispute and claims prevention',
    },
    {
      org: 'FTSE turnaround',
      detail: '10 teams, 90 days · velocity +45% · predictability 70% → 98%',
    },
    {
      org: 'Haleon',
      detail: 'Predictability >98% · velocity +45% · costs −15%',
    },
    {
      org: 'GSK',
      detail: 'Predictability 80% → 96% · velocity +40% · costs −8%',
    },
    {
      org: 'Gartner',
      detail: 'Revenue $3m → $10m in under 5 years · 100% staff retention',
    },
    {
      org: 'Strategy work supporting',
      detail: 'ICI · Orange · Volkswagen · Motorola · HP. Contributing to $3.2bn in new revenue',
    },
  ];

  const testimonials = [
    {
      quote:
        'Thank you for your stewardship and counseling to our MotU and WREF sprint teams throughout this year. To achieve a Level 3 in such a short space of time is a testament to your leadership and knowledge of the Agile Framework.',
      name: 'Jo Taylor',
      title: 'Senior Director, GSK PLC',
    },
    {
      quote:
        'Segun has played a pivotal role in our agile transformation journey in GSK and now in Haleon. His dedication, expertise, and unwavering commitment to driving agility and continuous improvement have been nothing short of remarkable.',
      name: 'Amy Houston',
      title: 'Director of Product Transformation, Haleon PLC',
    },
    {
      quote:
        'He hired and led a first-class team that excelled in growing both revenue, and critically margins, well ahead of target. Most noticeable was the strong client renewal rates the team achieved through a clear goal of meeting or beating the expectation of every client.',
      name: 'Simon Levin',
      title: 'Group Vice President, Gartner (now Managing Director, The Skills Connection)',
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Teamsmiths · Decades of finding what's leaking, now codified into engines</title>
        <meta
          name="description"
          content="Teamsmiths is led by Segun Osu. Decades of work helping FTSE companies and multinationals find the productivity and performance they were leaving on the table, now codified into engines that ship in days."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4">About Teamsmiths</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-[1.15]">
              Segun Osu has spent 25 years finding the margin leaking out of FTSE businesses. Now he builds engines that do the same for yours.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Most executives don't miss their targets because their people are bad. They miss them because critical issues like delays, claim exposure, and performance gaps surface too late to act on. Earlier visibility, the right people, the right tools: that's the pattern, now codified into engines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/discovery-sprint">
                  Book a Discovery Sprint (£500)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Not ready? 15-min fit call →
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Founder Story */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">The founder's story</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Why Teamsmiths exists, and the pattern it's built on.
              </p>
            </div>

            <Card className="border-0 bg-card/80">
              <CardContent className="p-8 sm:p-10">
                <div className="prose prose-neutral max-w-none text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Teamsmiths is led by <span className="text-foreground font-semibold">Segun Osu</span>. The career started at <span className="text-foreground font-medium">Balfour Beatty</span> on £25m infrastructure projects. Decades later, after helping FTSE companies and multinationals find the productivity and performance they were leaving on the table, the pattern is always the same:
                  </p>
                  <p className="text-foreground font-medium italic border-l-4 border-primary pl-4">
                    Earlier visibility · the right people working with the right tools · focused on the right commercial outcome.
                  </p>
                  <p>
                    Teamsmiths is built on that pattern, turning decades of experience into <span className="text-foreground font-medium">Engines</span> ready to work in your business. Each Teamsmiths Engine plugs into your existing data, finds the leakage, and delivers commercial outcomes in weeks. No new systems. No data entry.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Track Record */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Selected track record</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Decades of finding productivity and performance gains at every level: projects, business units, and companies.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {trackRecord.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardContent className="p-5">
                    <div className="font-semibold text-foreground mb-1">{item.org}</div>
                    <div className="text-sm text-muted-foreground">{item.detail}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground/80 mt-8 italic max-w-3xl mx-auto">
              Track record reflects the founder's prior work supporting these organisations across various roles and engagements.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">In their words</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Selected client comments from prior engagements.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <Card key={idx} className="bg-card/80 border-0 shadow-sm">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-primary/40 mb-4" />
                    <blockquote className="text-sm text-muted-foreground italic leading-relaxed mb-6">
                      "{t.quote}"
                    </blockquote>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-foreground text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.title}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What's Live Now */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Live now and forming founding cohorts</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Three Engines, plugging into your existing data, delivering commercial outcomes in weeks.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Construction</Badge>
                  <CardTitle className="text-lg">Construction Revenue Risk Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Surfaces delay risks and claim opportunities early enough to benefit, by monitoring your project updates and baseline, with oversight from a domain expert.
                  </p>
                  <Badge className="text-xs">Live · onboarding UK contractors</Badge>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Manufacturing</Badge>
                  <CardTitle className="text-lg">Manufacturing Order Risk Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Spots order delivery exposure before it costs you, by reading machine signals and translating them into role-specific actions.
                  </p>
                  <Badge variant="outline" className="text-xs">Validated prototype · cohort forming</Badge>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">Cross-functional</Badge>
                  <CardTitle className="text-lg">Agile Delivery Engine</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Cuts delivery time and improves outcome predictability across business and technology teams.
                  </p>
                  <Badge variant="outline" className="text-xs">Cohort forming</Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">What makes us different</h2>
            </div>

            <Card className="bg-card/80 border-0">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">How we work</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Plugs into your existing data, no new systems, no data entry</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Segun Osu (ex-FTSE turnaround lead at Haleon, GSK, Gartner) on every engagement</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Outcomes measured in your numbers, every time</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Continuous optimisation after delivery</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">How we charge</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Fixed prices. No hourly billing surprises</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Outcome-bounty pricing on selected projects (70/30 split)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">Discovery Sprint credit toward your first build</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">SMB-focused, enterprise-quality</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to find what's leaking in your business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with a Discovery Sprint, or book a free 15-minute chat first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Book a free 15-min chat
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/discovery-sprint">Discovery Sprint (£500)</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
