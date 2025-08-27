import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ExpertInvite {
  id: string;
  brief_id: string;
  status: string;
  score_at_invite: number;
  invitation_message: string;
  created_at: string;
  expires_at: string;
  viewed_at: string | null;
  response_message: string | null;
  briefs: {
    project_title: string;
    structured_brief: any;
    budget_range: string;
    contact_name: string;
    contact_email: string;
    origin: string;
  } | null;
}

interface ProposalDetails {
  estimated_hours: number;
  hourly_rate: number;
  timeline_days: number;
  approach_summary: string;
}

const ExpertInviteDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invites, setInvites] = useState<ExpertInvite[]>([]);
  const [selectedInvite, setSelectedInvite] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails>({
    estimated_hours: 0,
    hourly_rate: 0,
    timeline_days: 7,
    approach_summary: ''
  });
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    if (user) {
      loadInvites();
    }
  }, [user]);

  const loadInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_invites')
        .select(`
          *,
          briefs:brief_id (
            project_title, structured_brief, budget_range,
            contact_name, contact_email, origin
          )
        `)
        .eq('expert_user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites((data as any[])?.filter(invite => invite.briefs !== null) || []);

      // Mark viewed invites
      const unviewedIds = data?.filter(inv => !inv.viewed_at && inv.status === 'sent').map(inv => inv.id) || [];
      if (unviewedIds.length > 0) {
        await supabase
          .from('expert_invites')
          .update({ viewed_at: new Date().toISOString() })
          .in('id', unviewedIds);
      }

    } catch (error: any) {
      toast({
        title: 'Error loading invitations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToInvite = async (inviteId: string, action: 'accept' | 'decline') => {
    setResponding(true);
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-invite', {
        body: {
          invite_id: inviteId,
          action,
          response_message: responseMessage,
          proposal_details: action === 'accept' ? proposalDetails : undefined
        }
      });

      if (error) throw error;

      toast({
        title: action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined',
        description: `You have ${action === 'accept' ? 'accepted' : 'declined'} the project invitation.`,
      });

      setResponseMessage('');
      setProposalDetails({
        estimated_hours: 0,
        hourly_rate: 0,
        timeline_days: 7,
        approach_summary: ''
      });
      setSelectedInvite(null);
      
      await loadInvites();
    } catch (error: any) {
      toast({
        title: 'Error responding to invitation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResponding(false);
    }
  };

  const getInviteStatusColor = (status: string, expiresAt: string): "default" | "destructive" | "secondary" | "outline" => {
    if (new Date(expiresAt) < new Date()) return 'destructive';
    switch (status) {
      case 'sent': return 'default';
      case 'accepted': return 'secondary';
      case 'declined': return 'destructive';
      default: return 'outline';
    }
  };

  const getInviteStatusIcon = (status: string, expiresAt: string) => {
    if (new Date(expiresAt) < new Date()) return <AlertCircle className="h-4 w-4" />;
    switch (status) {
      case 'sent': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const selectedInviteData = invites.find(inv => inv.id === selectedInvite);
  const pendingInvites = invites.filter(inv => inv.status === 'sent' && new Date(inv.expires_at) > new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading invitations...
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Project Invitations</h2>
          <p className="text-muted-foreground">
            Respond to project invitations and manage your opportunities
          </p>
        </div>
        <Badge variant="outline">
          {pendingInvites.length} Pending
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Invites List */}
        <div className="lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>All Invitations ({invites.length})</CardTitle>
              <CardDescription>Your project invitation history</CardDescription>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No invitations yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Project invitations will appear here when clients are looking for experts with your skills
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className={`p-3 rounded cursor-pointer transition-colors border ${
                        selectedInvite === invite.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedInvite(invite.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium truncate">{invite.briefs?.project_title || 'Project Invitation'}</h4>
                        <Badge 
                          variant={getInviteStatusColor(invite.status, invite.expires_at)}
                          className="ml-2 flex items-center gap-1"
                        >
                          {getInviteStatusIcon(invite.status, invite.expires_at)}
                          {invite.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {invite.briefs?.budget_range || 'Budget TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Score: {invite.score_at_invite?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {invite.briefs?.origin === 'catalog' ? 'Outcome Pack' : 'Custom Brief'}
                        </Badge>
                        {!invite.viewed_at && invite.status === 'sent' && (
                          <Badge variant="destructive" className="text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Invite Details & Response */}
        <div className="lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Details</CardTitle>
              <CardDescription>Review and respond to the selected invitation</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedInviteData ? (
                <p className="text-muted-foreground text-center py-8">
                  Select an invitation to view details and respond
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Project Details */}
                  <div>
                    <h4 className="font-semibold mb-2">{selectedInviteData.briefs?.project_title}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Budget Range</Label>
                        <p>{selectedInviteData.briefs?.budget_range}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Client</Label>
                        <p>{selectedInviteData.briefs?.contact_name || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Match Score</Label>
                        <p>{selectedInviteData.score_at_invite?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Expires</Label>
                        <p className={new Date(selectedInviteData.expires_at) < new Date() ? 'text-destructive' : ''}>
                          {new Date(selectedInviteData.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Project Requirements */}
                  {selectedInviteData.briefs?.structured_brief && (
                    <div>
                      <Label className="text-muted-foreground">Project Requirements</Label>
                      <div className="text-sm space-y-2 mt-1">
                        {selectedInviteData.briefs.structured_brief.goal?.interpreted && (
                          <p><strong>Goal:</strong> {selectedInviteData.briefs.structured_brief.goal.interpreted}</p>
                        )}
                        {selectedInviteData.briefs.structured_brief.context?.interpreted && (
                          <p><strong>Context:</strong> {selectedInviteData.briefs.structured_brief.context.interpreted}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Response Section */}
                  {selectedInviteData.status === 'sent' && new Date(selectedInviteData.expires_at) > new Date() && (
                    <div className="space-y-4 border-t pt-4">
                      <h5 className="font-medium">Your Response</h5>
                      
                      <div>
                        <Label htmlFor="response-message">Message (Optional)</Label>
                        <Textarea
                          id="response-message"
                          placeholder="Add a personal message or questions for the client..."
                          value={responseMessage}
                          onChange={(e) => setResponseMessage(e.target.value)}
                          rows={3}
                        />
                      </div>

                      {/* Proposal Details for Acceptance */}
                      <div className="bg-muted/30 p-3 rounded">
                        <Label className="text-sm font-medium">Proposal Details (for acceptance)</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <Label className="text-xs">Estimated Hours</Label>
                            <Input
                              type="number"
                              value={proposalDetails.estimated_hours}
                              onChange={(e) => setProposalDetails({
                                ...proposalDetails,
                                estimated_hours: parseInt(e.target.value) || 0
                              })}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Timeline (days)</Label>
                            <Input
                              type="number"
                              value={proposalDetails.timeline_days}
                              onChange={(e) => setProposalDetails({
                                ...proposalDetails,
                                timeline_days: parseInt(e.target.value) || 7
                              })}
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label className="text-xs">Approach Summary</Label>
                          <Textarea
                            placeholder="Brief summary of your approach..."
                            value={proposalDetails.approach_summary}
                            onChange={(e) => setProposalDetails({
                              ...proposalDetails,
                              approach_summary: e.target.value
                            })}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => respondToInvite(selectedInviteData.id, 'accept')}
                          disabled={responding}
                          className="flex-1"
                        >
                          {responding ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Accept Invitation
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => respondToInvite(selectedInviteData.id, 'decline')}
                          disabled={responding}
                          className="flex-1"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status Messages */}
                  {selectedInviteData.status !== 'sent' && (
                    <Alert>
                      <AlertDescription>
                        You have {selectedInviteData.status} this invitation.
                        {selectedInviteData.response_message && (
                          <span className="block mt-1 font-medium">
                            Your message: "{selectedInviteData.response_message}"
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {new Date(selectedInviteData.expires_at) < new Date() && selectedInviteData.status === 'sent' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This invitation has expired and can no longer be accepted.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExpertInviteDashboard;