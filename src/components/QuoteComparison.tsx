import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  Star, 
  Calendar,
  Award,
  AlertCircle,
  Download
} from 'lucide-react';

interface StandardizedQuote {
  id: string;
  request_id: string;
  freelancer_id: string;
  milestones: Array<{
    title: string;
    description: string;
    amount: number;
    timeline_weeks: number;
  }>;
  timeline_weeks: number;
  total_price: number;
  currency: string;
  assumptions: string;
  qa_guarantees: string;
  portfolio_highlights: string[];
  validity_until: string;
  status: string;
  created_at: string;
  freelancer_profile?: {
    full_name: string;
    email: string;
    outcome_history: any;
  };
}

interface QuoteComparisonProps {
  requestId: string;
}

const QuoteComparison: React.FC<QuoteComparisonProps> = ({ requestId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<StandardizedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, [requestId]);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('standardized_quotes')
        .select(`
          *,
          profiles!freelancer_id(full_name, email)
        `)
        .eq('request_id', requestId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuotes = (data || []).map(quote => ({
        ...quote,
        milestones: Array.isArray(quote.milestones) ? quote.milestones as any[] : [],
        freelancer_profile: (quote as any).profiles ? {
          full_name: (quote as any).profiles.full_name,
          email: (quote as any).profiles.email,
          outcome_history: {}
        } : undefined
      }));
      setQuotes(formattedQuotes);
    } catch (error: any) {
      toast({
        title: 'Error loading quotes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptQuote = async (quoteId: string) => {
    try {
      // Update selected quote to accepted
      const { error: updateError } = await supabase
        .from('standardized_quotes')
        .update({ status: 'accepted' })
        .eq('id', quoteId);

      if (updateError) throw updateError;

      // Reject other quotes
      const otherQuoteIds = quotes
        .filter(q => q.id !== quoteId)
        .map(q => q.id);

      if (otherQuoteIds.length > 0) {
        const { error: rejectError } = await supabase
          .from('standardized_quotes')
          .update({ status: 'rejected' })
          .in('id', otherQuoteIds);

        if (rejectError) throw rejectError;
      }

      // Create project from accepted quote
      const { error: projectError } = await supabase.functions.invoke('create-project-from-quote', {
        body: { quote_id: quoteId }
      });

      if (projectError) throw projectError;

      toast({
        title: 'Quote accepted',
        description: 'Project has been created and the freelancer has been notified.',
      });

      loadQuotes(); // Refresh to show updated statuses

    } catch (error: any) {
      toast({
        title: 'Error accepting quote',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (amount: number, currency = 'gbp') => {
    return `${currency.toUpperCase()} ${(amount / 100).toLocaleString()}`;
  };

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (validityUntil: string) => {
    return new Date(validityUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading quotes...
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No quotes have been submitted yet. Invited freelancers have been notified and should respond soon.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quote Comparison</h2>
          <p className="text-muted-foreground">
            {quotes.length} quote{quotes.length !== 1 ? 's' : ''} received
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {quotes.map((quote) => (
          <Card 
            key={quote.id} 
            className={`relative ${selectedQuote === quote.id ? 'ring-2 ring-primary' : ''}`}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {quote.freelancer_profile?.full_name || 'Freelancer'}
                  </CardTitle>
                  <CardDescription>
                    Submitted {new Date(quote.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge className={getQuoteStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </div>
              
              {isExpired(quote.validity_until) && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This quote expired on {new Date(quote.validity_until).toLocaleDateString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded">
                  <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(quote.total_price, quote.currency)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Price</p>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold text-primary">
                    {quote.timeline_weeks}w
                  </div>
                  <p className="text-xs text-muted-foreground">Timeline</p>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="font-medium mb-2">Project Milestones</h4>
                <div className="space-y-2">
                  {quote.milestones.map((milestone, index) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{milestone.title}</span>
                        <span>{formatPrice(milestone.amount, quote.currency)}</span>
                      </div>
                      {milestone.description && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio Highlights */}
              {quote.portfolio_highlights && quote.portfolio_highlights.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Highlights
                  </h4>
                  <ul className="text-sm space-y-1">
                    {quote.portfolio_highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* QA Guarantees */}
              {quote.qa_guarantees && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    QA Guarantees
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {quote.qa_guarantees}
                  </p>
                </div>
              )}

              {/* Assumptions */}
              {quote.assumptions && (
                <div>
                  <h4 className="font-medium mb-2">Key Assumptions</h4>
                  <p className="text-sm text-muted-foreground">
                    {quote.assumptions}
                  </p>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-2">
                {quote.status === 'submitted' && !isExpired(quote.validity_until) && (
                  <Button 
                    onClick={() => acceptQuote(quote.id)}
                    className="w-full"
                  >
                    Accept This Quote
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedQuote(
                    selectedQuote === quote.id ? null : quote.id
                  )}
                >
                  {selectedQuote === quote.id ? 'Hide Details' : 'View Full Details'}
                </Button>
              </div>

              {/* Validity */}
              <div className="text-xs text-muted-foreground text-center">
                Valid until {new Date(quote.validity_until).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote Selection Guide */}
      <Card>
        <CardHeader>
          <CardTitle>How to Choose the Right Quote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">💰 Price Considerations</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Compare total cost vs. value delivered</li>
                <li>• Check milestone breakdown for clarity</li>
                <li>• Consider payment terms and schedule</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⏱️ Timeline & Delivery</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Realistic timeline estimation</li>
                <li>• Clear milestone definitions</li>
                <li>• Buffer time for revisions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✨ Quality Assurance</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• QA guarantees and revision policy</li>
                <li>• Portfolio highlights relevance</li>
                <li>• Communication and collaboration style</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteComparison;