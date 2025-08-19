import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Payment Success - Teamsmiths';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Payment successful. Your project has been created.');
    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', window.location.href);
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical);
  }, []);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setError('Missing session id');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { session_id: sessionId },
        });
        if (error) throw error;
        setProjectId(data?.project_id ?? null);
      } catch (e: any) {
        setError(e.message || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Successful</CardTitle>
          <CardDescription>Thank you! We are setting things up.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying your payment...</span>
            </div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-success mt-0.5" />
              <div>
                <p className="font-medium">Your project has been created.</p>
                {projectId && (
                  <p className="text-sm text-muted-foreground">Project ID: {projectId}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild>
              <Link to="/catalog">Browse More Packs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
