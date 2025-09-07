import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, ArrowRight, Mail, Target } from 'lucide-react';
import AIDeputee from '@/components/AIDeputee';

const ProofSprintSuccess = () => {
  const location = useLocation();
  const { sprint, formData } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!sprint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Success page not found</h1>
          <Button asChild>
            <Link to="/plans">Back to Plans</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-green-600">
            🎉 Proof Sprint Purchased!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your {sprint.name} is confirmed. Here's what happens next.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Order Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Sprint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">{sprint.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {sprint.duration}
                  </div>
                  <span className="font-medium text-primary">{sprint.price}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Deliverable:</h4>
                <p className="text-sm text-muted-foreground">{sprint.deliverable}</p>
              </div>

              {formData && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Project Focus:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>KPI:</strong> {formData.kpiToMeasure}</p>
                    <p><strong>Goals:</strong> {formData.idealOutcomes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                What Happens Next
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p className="text-sm text-muted-foreground">You'll receive a confirmation email with receipt and next steps.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Kickoff Scheduling</p>
                    <p className="text-sm text-muted-foreground">Our team will send you a Calendly link to book your kickoff meeting within 24 hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Scope Agreement</p>
                    <p className="text-sm text-muted-foreground">We'll create a one-page scope document based on your requirements and get your sign-off.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Sprint Begins</p>
                    <p className="text-sm text-muted-foreground">Your <AIDeputee /> powered sprint starts and you'll get regular updates.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Offer */}
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 mb-12">
          <CardHeader>
            <CardTitle className="text-center">🎯 Special Conversion Offer</CardTitle>
            <CardDescription className="text-center">
              Ready to build your full AI team?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm">
              Convert to <strong>Navigator Core</strong> within 30 days and receive onboarding credit 
              equal to <strong>half your first month's Core fee</strong> (£197.50 credit).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/plans">
                  Upgrade to Navigator Core
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                  Discuss Upgrade Options
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our team is here to help you succeed.
          </p>
          <Button asChild variant="outline">
            <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProofSprintSuccess;