import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, X, MessageSquare, Calendar, Package, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CustomQuote {
  id: string;
  quote_number: string;
  project_title: string;
  scope_description: string;
  deliverables: any;
  milestones: any;
  total_amount: number;
  currency: string;
  payment_structure: string;
  estimated_duration: string;
  estimated_start_date: string;
  status: string;
  client_notes: string;
  expires_at: string;
  created_at: string;
  created_by: string;
  customization_request: {
    base_template: string;
    custom_requirements: string;
  };
}

interface QuoteRevision {
  id: string;
  revision_number: number;
  changes_requested: string;
  revised_amount: number;
  revised_scope: string;
  revised_timeline: string;
  created_at: string;
}

const QuoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<CustomQuote | null>(null);
  const [revisions, setRevisions] = useState<QuoteRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const fetchQuoteDetails = async () => {
    if (!id) return;

    try {
      // Fetch quote details
      const { data: quoteData, error: quoteError } = await supabase
        .from('custom_quotes')
        .select(`
          *,
          customization_request:customization_requests(
            base_template,
            custom_requirements
          )
        `)
        .eq('id', id)
        .single();

      if (quoteError) throw quoteError;

      // Fetch revisions
      const { data: revisionsData, error: revisionsError } = await supabase
        .from('quote_revisions')
        .select('*')
        .eq('quote_id', id)
        .order('revision_number', { ascending: false });

      if (revisionsError) throw revisionsError;

      setQuote(quoteData);
      setRevisions(revisionsData || []);
      setClientNotes(quoteData.client_notes || '');
    } catch (error: any) {
      toast({
        title: "Error loading quote",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteAction = async (action: 'approved' | 'rejected') => {
    if (!quote) return;

    setActionLoading(action);
    try {
      const updateData: any = {
        status: action,
        client_notes: clientNotes,
        updated_at: new Date().toISOString()
      };

      if (action === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user?.id;
      }

      const { error } = await supabase
        .from('custom_quotes')
        .update(updateData)
        .eq('id', quote.id);

      if (error) throw error;

      // If approved, create project automatically
      if (action === 'approved') {
        try {
          const { error: projectError } = await supabase.functions.invoke('create-project-from-quote', {
            body: { quoteId: quote.id }
          });

          if (projectError) {
            console.error('Error creating project:', projectError);
            toast({
              title: "Quote Approved",
              description: "Quote approved but project creation failed. Please contact support.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Quote Approved!",
              description: "Your project has been created! You'll receive milestone payment requests as work progresses."
            });
          }

          // Send notification to freelancer
          await supabase.rpc('create_notification', {
            p_user_id: quote.created_by,
            p_type: 'quote_approved',
            p_title: 'Quote Approved',
            p_message: `Your quote for "${quote.project_title}" has been approved! The project will be created automatically.`,
            p_related_id: quote.id
          });
        } catch (projectCreationError) {
          console.error('Error in project creation process:', projectCreationError);
        }
      } else {
        toast({
          title: "Quote Rejected",
          description: "We'll review your feedback and provide a revised quote if needed."
        });

        // Send notification to freelancer
        await supabase.rpc('create_notification', {
          p_user_id: quote.created_by,
          p_type: 'quote_rejected', 
          p_title: 'Quote Rejected',
          p_message: `Your quote for "${quote.project_title}" has been rejected.`,
          p_related_id: quote.id
        });
      }

      // Refresh quote data
      await fetchQuoteDetails();
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading('');
    }
  };

  const requestRevision = async () => {
    if (!quote || !clientNotes.trim()) {
      toast({
        title: "Changes Required",
        description: "Please describe what changes you'd like to see.",
        variant: "destructive"
      });
      return;
    }

    setActionLoading('revision');
    try {
      // Create revision request
      const { error: revisionError } = await supabase
        .from('quote_revisions')
        .insert({
          quote_id: quote.id,
          revision_number: revisions.length + 1,
          changes_requested: clientNotes,
          requested_by: user?.id
        });

      if (revisionError) throw revisionError;

      // Update quote status
      const { error: quoteError } = await supabase
        .from('custom_quotes')
        .update({
          status: 'modified',
          client_notes: clientNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (quoteError) throw quoteError;

      toast({
        title: "Revision Requested",
        description: "We'll review your changes and provide an updated quote within 24 hours.",
      });

      await fetchQuoteDetails();
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading('');
    }
  };

  const formatPrice = (amount: number) => {
    return `£${(amount / 100).toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      modified: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={colors[status] || colors.draft}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quote details...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const isExpired = new Date(quote.expires_at) < new Date();
  const canTakeAction = quote.status === 'sent' && !isExpired;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/dashboard?tab=customizations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Quote Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{quote.project_title}</CardTitle>
                <CardDescription className="text-lg">
                  Quote #{quote.quote_number}
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  {getStatusBadge(quote.status)}
                  {isExpired && <Badge variant="destructive">EXPIRED</Badge>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(quote.total_amount)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {quote.payment_structure} payments
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Scope */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Project Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{quote.scope_description}</p>
                
                {quote.customization_request?.base_template && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Based on Template:</h4>
                    <p className="text-sm text-muted-foreground">{quote.customization_request.base_template}</p>
                  </div>
                )}

                {quote.customization_request?.custom_requirements && (
                  <div>
                    <h4 className="font-medium mb-2">Original Requirements:</h4>
                    <p className="text-sm text-muted-foreground">{quote.customization_request.custom_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deliverables */}
            {quote.deliverables && Array.isArray(quote.deliverables) && quote.deliverables.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {quote.deliverables.map((deliverable: any, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <span>{deliverable.title || deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Milestones */}
            {quote.milestones && Array.isArray(quote.milestones) && quote.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {quote.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatPrice(milestone.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revisions History */}
            {revisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Revision History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revisions.map((revision) => (
                      <div key={revision.id} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Revision #{revision.revision_number}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(revision.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{revision.changes_requested}</p>
                        {revision.revised_amount && (
                          <p className="text-sm font-medium mt-2">
                            Revised Amount: {formatPrice(revision.revised_amount)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-sm text-muted-foreground">{quote.estimated_duration}</div>
                  </div>
                  {quote.estimated_start_date && (
                    <div>
                      <div className="text-sm font-medium">Estimated Start</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(quote.estimated_start_date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium">Quote Expires</div>
                    <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {new Date(quote.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {canTakeAction && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="client_notes">Notes/Feedback</Label>
                    <Textarea
                      id="client_notes"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      placeholder="Any feedback or questions about this quote..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => handleQuoteAction('approved')}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === 'approved' ? 'Approving...' : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Approve Quote
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={requestRevision}
                      disabled={!!actionLoading || !clientNotes.trim()}
                    >
                      {actionLoading === 'revision' ? 'Requesting...' : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Request Changes
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => handleQuoteAction('rejected')}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === 'rejected' ? 'Rejecting...' : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Reject Quote
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {quote.status === 'approved' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quote approved! You'll receive payment requests for each milestone as work progresses.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/dashboard?tab=projects">View Project</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;