import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Shield,
  ExternalLink,
  Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Milestone {
  id: string;
  title: string;
  description?: string;
  amount: number;
  milestone_number: number;
  status: 'planned' | 'requires_payment' | 'in_progress' | 'submitted' | 'qa_review' | 'completed';
  payment_status: 'pending' | 'paid' | 'released' | 'refunded';
  qa_status: 'pending' | 'passed' | 'failed';
  due_date?: string;
  stripe_payment_intent_id?: string;
  paid_at?: string;
  released_at?: string;
}

interface MilestonePaymentProps {
  milestone: Milestone;
  projectId: string;
  userRole: 'client' | 'expert' | 'admin';
  currency?: string;
  onPaymentComplete?: () => void;
}

export function MilestonePayment({ 
  milestone, 
  projectId, 
  userRole, 
  currency = 'gbp',
  onPaymentComplete 
}: MilestonePaymentProps) {
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (userRole !== 'client') {
      toast({
        title: "Permission Denied",
        description: "Only clients can make payments",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          milestoneId: milestone.id,
          projectId: projectId,
          amount: milestone.amount,
          currency: currency,
          description: `${milestone.title} - Milestone ${milestone.milestone_number}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Payment Started",
          description: "Complete payment in the new tab to continue",
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Failed",
        description: "Unable to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (milestone.payment_status) {
      case 'paid':
        return milestone.qa_status === 'passed' ? 
          <CheckCircle className="h-5 w-5 text-success" /> :
          <Lock className="h-5 w-5 text-warning" />;
      case 'released':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'refunded':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = () => {
    if (milestone.payment_status === 'released') {
      return <Badge className="bg-success">Payment Released</Badge>;
    }
    if (milestone.payment_status === 'paid') {
      if (milestone.qa_status === 'passed') {
        return <Badge className="bg-warning">Releasing Payment...</Badge>;
      }
      return <Badge className="bg-info">Escrowed (QA Pending)</Badge>;
    }
    if (milestone.payment_status === 'refunded') {
      return <Badge variant="destructive">Refunded</Badge>;
    }
    return <Badge variant="outline">Payment Required</Badge>;
  };

  const getPaymentProgress = () => {
    switch (milestone.payment_status) {
      case 'released': return 100;
      case 'paid': return milestone.qa_status === 'passed' ? 80 : 60;
      default: return 0;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const canPay = userRole === 'client' && 
                 milestone.status === 'requires_payment' && 
                 milestone.payment_status === 'pending';

  return (
    <Card className={`${milestone.payment_status === 'released' ? 'border-success' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg">
                Milestone {milestone.milestone_number}: {milestone.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(milestone.amount)}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payment Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span>{getPaymentProgress()}%</span>
          </div>
          <Progress value={getPaymentProgress()} className="w-full" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Payment Required</span>
            <span>QA Review</span>
            <span>Released</span>
          </div>
        </div>

        {/* Milestone Details */}
        {milestone.description && (
          <div>
            <h4 className="text-sm font-medium mb-2">Milestone Details</h4>
            <p className="text-sm text-muted-foreground">{milestone.description}</p>
          </div>
        )}

        {/* Payment Status Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Payment Status</h4>
          
          {milestone.payment_status === 'pending' && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Payment required to start work on this milestone</span>
            </div>
          )}

          {milestone.payment_status === 'paid' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-success">
                <Shield className="h-4 w-4" />
                <span>Payment secured in escrow</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Funds held safely until QA approval and milestone completion
              </p>
              {milestone.paid_at && (
                <p className="text-xs text-muted-foreground ml-6">
                  Paid: {new Date(milestone.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {milestone.payment_status === 'released' && (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-sm text-success">
                <CheckCircle className="h-4 w-4" />
                <span>Payment released to expert</span>
              </div>
              {milestone.released_at && (
                <p className="text-xs text-muted-foreground ml-6">
                  Released: {new Date(milestone.released_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {milestone.payment_status === 'refunded' && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>Payment refunded due to project cancellation</span>
            </div>
          )}
        </div>

        {/* QA Status */}
        {milestone.payment_status === 'paid' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quality Assurance</h4>
            <div className="flex items-center space-x-2 text-sm">
              {milestone.qa_status === 'passed' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-success">QA approved - releasing payment</span>
                </>
              ) : milestone.qa_status === 'failed' ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">QA review requires revisions</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-warning" />
                  <span className="text-warning">Awaiting QA review</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Due Date */}
        {milestone.due_date && (
          <div className="text-sm">
            <span className="font-medium">Due Date: </span>
            <span className="text-muted-foreground">
              {new Date(milestone.due_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {canPay && (
            <Button 
              onClick={handlePayment} 
              disabled={processing}
              className="flex-1"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {processing ? 'Processing...' : `Pay ${formatCurrency(milestone.amount)}`}
            </Button>
          )}

          {milestone.stripe_payment_intent_id && userRole === 'client' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(
                `https://dashboard.stripe.com/payments/${milestone.stripe_payment_intent_id}`, 
                '_blank'
              )}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Receipt
            </Button>
          )}
        </div>

        {/* Help Text */}
        {canPay && (
          <div className="bg-info/10 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info">Secure Escrow Payment</p>
                <p className="text-muted-foreground">
                  Your payment is held safely in escrow and only released to the expert 
                  after successful QA review and milestone completion.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}