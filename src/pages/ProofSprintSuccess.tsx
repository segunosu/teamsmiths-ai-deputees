import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { AIDeputee } from '@/components/AIDeputee';
import { useAnalytics } from '@/hooks/useAnalytics';

const ProofSprintSuccess = () => {
  const [searchParams] = useSearchParams();
  const { trackEvent } = useAnalytics();
  const sessionId = searchParams.get('session_id');
  const sprintId = searchParams.get('sprint_id');

  useEffect(() => {
    if (sessionId && sprintId) {
      trackEvent('checkout_success', { 
        product_id: sprintId, 
        amount: 0, // Will be populated by webhook
        user_email: '' // Will be populated by webhook
      });
    }
  }, [sessionId, sprintId, trackEvent]);

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-sm border-success/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-success/10 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
            </div>
            <CardTitle className="text-3xl text-success">Proof Sprint Booked!</CardTitle>
            <CardDescription className="text-lg">
              Your <AIDeputee /> Proof Sprint has been successfully purchased.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                What Happens Next?
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">1</span>
                  <span>You'll receive a Calendly invite within the next hour to schedule your kickoff session.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">2</span>
                  <span>During kickoff, we'll review your KPIs and finalize the scope document.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">3</span>
                  <span>Our team will begin baseline measurement and <AIDeputee /> deployment.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">4</span>
                  <span>You'll receive regular updates and a final outcome report with measurable results.</span>
                </li>
              </ol>
            </div>

            <div className="bg-accent/10 rounded-lg p-6">
              <h3 className="font-semibold mb-3">Special Offer</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Convert to Navigator Core within 30 days and receive onboarding credit equal to 50% of your first month's Core fee.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/plans#core">
                  View Navigator Core
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Questions? Our team will contact you within 48 hours.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/dashboard">View Dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Back to Home</Link>
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <AIDeputee />
                <span>Assurance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProofSprintSuccess;