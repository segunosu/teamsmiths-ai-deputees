import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Target, BarChart3, Calendar } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const WorkWithUs = () => {
  const skills = [
    "Proposals", "Quotes", "Sales ops", "PandaDoc/Xero/QBO", 
    "PM/Agile", "Data/Automation", "Localisation (EN/IT/NG)"
  ];

  const benefits = [
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "NDA & light vetting"
    },
    {
      icon: <FileCheck className="h-6 w-6 text-primary" />,
      title: "Outcome playbooks"
    },
    {
      icon: <Award className="h-6 w-6 text-primary" />,
      title: "On-platform delivery (escrow & milestones)"
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "QA by principal consultants"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Work with Teamsmiths - Expert Network Application</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
              Work with Teamsmiths
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 font-medium max-w-3xl mx-auto leading-relaxed">
              We're a curated bench. If you're a specialist who cares about measurable outcomes and quality, join our private roster.
            </p>
          </div>

          {/* Who We Invite */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-center">Who we invite</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-base px-4 py-2">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-8 text-center">How it works</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-xl w-fit">
                    {benefit.icon}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{benefit.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <Card className="shadow-sm border-0 bg-card/50">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">Join the Roster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn/Portfolio</Label>
                <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sector">Sector experience</Label>
                  <Input id="sector" placeholder="e.g., SaaS, Professional Services, Trading" />
                </div>
                <div>
                  <Label htmlFor="languages">Languages</Label>
                  <Input id="languages" placeholder="e.g., English (native), Italian (fluent)" />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="availability">Availability (hours/week)</Label>
                  <Input id="availability" placeholder="e.g., 10-20" />
                </div>
                <div>
                  <Label htmlFor="dayrate">Day rate (GBP)</Label>
                  <Input id="dayrate" placeholder="e.g., £500" />
                </div>
                <div>
                  <Label htmlFor="timezone">Location/Time zone</Label>
                  <Input id="timezone" placeholder="e.g., London, UK (GMT)" />
                </div>
              </div>

              <div>
                <Label htmlFor="outcome">Best outcome you've driven (short description)</Label>
                <Textarea 
                  id="outcome" 
                  placeholder="Describe a specific, measurable outcome you delivered for a client..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="consent" />
                <Label htmlFor="consent" className="text-sm">
                  I agree to NDA & on-platform delivery if accepted *
                </Label>
              </div>

              <Button className="w-full" size="lg">
                Join the Roster
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                <strong>Curated</strong> — we reply only if there's a fit. (This page is not indexed.)
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default WorkWithUs;