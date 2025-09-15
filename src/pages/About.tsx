import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, Globe } from 'lucide-react';

const About = () => {
  const achievements = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "25,000+ SMEs served",
      description: "As operators, we've worked with businesses across every sector"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "$1.5M in 18 months",
      description: "Revenue generated while cutting delivery costs by 55%+"
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "$3M → $10M growth",
      description: "Grew a Gartner unit while cutting costs 30%"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "40–45% team uplift",
      description: "Delivered measurable performance improvements at GSK/Haleon"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
            Boutique expertise. Practical outcomes.
          </h1>
          
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-lg leading-relaxed text-foreground/80 mb-6">
              We've helped startups and SMEs launch fast and scale efficiently, while driving measurable performance in large enterprises. We've delivered valuable services for 750 vendors, serving 25,000+ SMEs.  Our solutions have generated $1.5M within 18 months and we've shipped MVPs for clients to cut delivery costs by 55%+.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80 mb-8">
              In enterprise, we grew a Gartner unit from $3M → $10M, cut costs 30%, and delivered 40–45% team uplift at GSK/Haleon. We focus on one KPI at a time — practical, measurable, fast.
            </p>
          </div>

          <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
            <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
          </Button>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Track Record
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Results from startup to enterprise — always focused on measurable outcomes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {achievements.map((achievement, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
                <CardHeader className="pb-4">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                    {achievement.icon}
                  </div>
                  <CardTitle className="text-2xl font-semibold">{achievement.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-lg leading-relaxed">
                    {achievement.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-8">
            Our Approach
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Pick the KPI</h3>
              <p className="text-muted-foreground">Choose what matters most: revenue, speed, or cost reduction.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Deploy in weeks</h3>
              <p className="text-muted-foreground">Launch with AI Deputee™ and expert QA for fast, reliable results.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Report uplift</h3>
              <p className="text-muted-foreground">Measure the improvement and keep compounding with +5% performance share.</p>
            </div>
          </div>

          <div className="bg-muted/50 p-8 rounded-lg mb-8">
            <h3 className="text-2xl font-semibold mb-4">Confidential by default</h3>
            <ul className="text-left max-w-md mx-auto space-y-2 text-muted-foreground">
              <li>• No public client names or logos</li>
              <li>• Metrics anonymised and aggregated</li>
              <li>• References and details shared under NDA</li>
              <li>• On-platform delivery with audit trail</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link to="/outcome-packs">See Outcome Packs</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
              <Link to="/audit">Start with an Audit</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;