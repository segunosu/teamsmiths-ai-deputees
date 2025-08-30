import React from 'react';
import { QAChecklist } from '@/components/qa/QAChecklist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, CheckCircle, AlertTriangle } from 'lucide-react';

const QADashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
        <div>
          <h1 className="text-4xl font-bold">QA/UAT Dashboard</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Comprehensive quality assurance checklist for the Outcomes & Quotes system.
            Items are separated between automated code verification and manual human testing.
          </p>
        </div>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Testing Instructions:</strong> Green items have been verified in code. 
          Blue items require manual testing including email delivery, Stripe payments, 
          Fireflies transcripts, and mobile responsiveness.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Automated Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Components, forms, guardrails, and API integrations verified through code analysis and automated testing.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              Manual Testing Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Email delivery, payment processing, transcript generation, and user experience flows that require human verification.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InfoIcon className="h-5 w-5 text-orange-600" />
              Guardrails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Critical business rules: no direct expert quotes in proof view, price bands only, anonymity enforcement.
            </p>
          </CardContent>
        </Card>
      </div>

      <QAChecklist />
    </div>
  );
};

export default QADashboard;