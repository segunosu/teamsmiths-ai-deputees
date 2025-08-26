import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, User, Calendar, ArrowLeft } from 'lucide-react';

export const BriefSubmitted = () => {
  const [searchParams] = useSearchParams();
  const briefId = searchParams.get('brief');

  const handleBookCurator = () => {
    const calendlyUrl = 'https://calendly.com/teamsmiths/curator-call';
    window.open(calendlyUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              Brief Submitted!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <span>We've emailed you a secure link to view your proposal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Check your inbox for the magic sign-in link to access your dashboard
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              
              <Button variant="outline" onClick={handleBookCurator} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Book a Curator Call
              </Button>
              
              <Button variant="ghost" asChild className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {briefId && (
              <div className="text-xs text-muted-foreground pt-4 border-t">
                Reference: {briefId.slice(0, 8)}...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};