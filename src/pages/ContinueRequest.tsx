import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ContinueRequest = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crData, setCrData] = useState<any>(null);

  const token = searchParams.get('token');
  const crId = searchParams.get('cr');

  useEffect(() => {
    const loadDraftCR = async () => {
      if (!token || !crId) {
        setError('Invalid or missing continuation link');
        setLoading(false);
        return;
      }

      try {
        // Load the draft CR
        const { data: cr, error: crError } = await supabase
          .from('customization_requests')
          .select('*')
          .eq('id', crId)
          .eq('status', 'draft')
          .single();

        if (crError || !cr) {
          throw new Error('Draft request not found or already submitted');
        }

        // Parse additional context to get saved data and token
        const additionalContext = cr.additional_context as any;
        
        if (!additionalContext?.saveToken || additionalContext.saveToken !== token) {
          throw new Error('Invalid continuation token');
        }

        // Check if token has expired
        if (additionalContext.tokenExpiresAt) {
          const expiresAt = new Date(additionalContext.tokenExpiresAt);
          if (expiresAt < new Date()) {
            throw new Error('Continuation link has expired');
          }
        }

        // Reconstruct CR data for the modal
        const reconstructedData = {
          title: cr.project_title,
          description: cr.custom_requirements,
          deliverables: additionalContext.deliverables || [],
          milestones: additionalContext.milestones || [],
          budgetMin: additionalContext.budgetMin,
          budgetTypical: additionalContext.budgetTypical,
          budgetMax: additionalContext.budgetMax,
          requiredSkills: additionalContext.requiredSkills || [],
          desiredStartDate: cr.timeline_preference,
          attachments: additionalContext.attachments || [],
          anonymityFlag: additionalContext.anonymityFlag ?? true,
          guestEmail: cr.contact_email
        };

        setCrData(reconstructedData);
        setLoading(false);

      } catch (err: any) {
        console.error('Error loading draft CR:', err);
        setError(err.message || 'Failed to load draft request');
        setLoading(false);
      }
    };

    loadDraftCR();
  }, [token, crId]);

  const startOver = () => {
    // Navigate to outcomes page to start over
    window.location.href = '/outcomes';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Spinner className="h-8 w-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading your request...</h3>
            <p className="text-muted-foreground text-center">
              Please wait while we restore your draft.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Unable to Continue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This could happen if:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• The link has expired (links are valid for 7 days)</li>
                <li>• The request was already submitted</li>
                <li>• The link was used before</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={startOver} className="flex-1">
                Start New Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>Welcome Back!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We've restored your draft request. You can now continue where you left off.
          </p>

          {crData && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-sm">Your Draft:</h4>
              <p className="text-sm font-medium">{crData.title}</p>
              <p className="text-xs text-muted-foreground">
                {crData.description.substring(0, 100)}
                {crData.description.length > 100 ? '...' : ''}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Saved drafts expire after 7 days</span>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={startOver}
              className="flex-1"
            >
              Start Over
            </Button>
            <Button 
              asChild
              className="flex-1"
            >
              <Link to={`/customize?continue=${token}&cr=${crId}`}>
                Continue Request
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContinueRequest;