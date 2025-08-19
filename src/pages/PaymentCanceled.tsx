import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentCanceled = () => {
  useEffect(() => {
    document.title = 'Payment Canceled - Teamsmiths';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Your payment was canceled. You can try again anytime.');
    const linkCanonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    linkCanonical.setAttribute('href', window.location.href);
    if (!linkCanonical.parentNode) document.head.appendChild(linkCanonical);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
          <CardDescription>Looks like you canceled the checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-3">
            <XCircle className="h-6 w-6 text-destructive mt-0.5" />
            <p className="text-muted-foreground">No worries—you can restart checkout anytime.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/catalog">Back to Catalog</Link>
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

export default PaymentCanceled;
