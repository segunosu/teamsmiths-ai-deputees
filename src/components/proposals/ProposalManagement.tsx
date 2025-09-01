import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, User, Calendar, PoundSterling } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Milestone {
  title: string;
  amount: number;
  description?: string;
}

interface Proposal {
  id: string;
  expert_id: string;
  scope: any; // JSONB field, will be properly typed at runtime
  price_total: number;
  milestones: any; // JSONB field, will be properly typed at runtime
  created_at: string;
  status: string;
  expert_profile: {
    full_name?: string;
    email?: string;
    skills?: string[];
    price_band_min?: number;
    price_band_max?: number;
  };
}

interface Props {
  briefId: string;
  briefTitle: string;
}

export function ProposalManagement({ briefId, briefTitle }: Props) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProposals();
  }, [briefId]);

  const loadProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('project_proposals')
        .select(`
          *,
          expert_profile:profiles!project_proposals_expert_id_fkey (
            full_name,
            email
          )
        `)
        .eq('brief_id', briefId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get freelancer profiles for additional info
      const expertIds = data.map(p => p.expert_id);
      const { data: freelancerProfiles } = await supabase
        .from('freelancer_profiles')
        .select('user_id, skills, price_band_min, price_band_max')
        .in('user_id', expertIds);

      const enrichedProposals = data.map((proposal: any) => ({
        ...proposal,
        expert_profile: {
          full_name: proposal.expert_profile?.full_name || '',
          email: proposal.expert_profile?.email || '',
          skills: freelancerProfiles?.find((fp: any) => fp.user_id === proposal.expert_id)?.skills || [],
          price_band_min: freelancerProfiles?.find((fp: any) => fp.user_id === proposal.expert_id)?.price_band_min,
          price_band_max: freelancerProfiles?.find((fp: any) => fp.user_id === proposal.expert_id)?.price_band_max,
        }
      }));

      setProposals(enrichedProposals || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast({
        title: "Error loading proposals",
        description: "Failed to load proposals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptProposal = async (proposalId: string) => {
    try {
      // Start transaction: accept one, reject others
      const { error: acceptError } = await supabase
        .from('project_proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId);

      if (acceptError) throw acceptError;

      // Reject all other proposals for this brief
      const { error: rejectError } = await supabase
        .from('project_proposals')
        .update({ status: 'rejected' })
        .eq('brief_id', briefId)
        .neq('id', proposalId);

      if (rejectError) throw rejectError;

      // Create project from accepted proposal
      const acceptedProposal = proposals.find(p => p.id === proposalId);
      if (acceptedProposal) {
        const { error: projectError } = await supabase.functions.invoke('create-project-from-proposal', {
          body: {
            proposal_id: proposalId,
            brief_id: briefId,
          },
        });

        if (projectError) throw projectError;
      }

      toast({
        title: "Proposal accepted!",
        description: "Project has been created and the expert has been notified.",
      });

      loadProposals();
    } catch (error) {
      console.error('Error accepting proposal:', error);
      toast({
        title: "Error accepting proposal",
        description: "Failed to accept proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposals(prev =>
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId].slice(0, 3) // Max 3 proposals
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading proposals...</div>;
  }

  if (showComparison && selectedProposals.length > 0) {
    const selectedProposalData = proposals.filter(p => selectedProposals.includes(p.id));
    return (
      <div className="space-y-4">
        <Button onClick={() => setShowComparison(false)}>← Back to Proposals</Button>
        <div className="text-center text-muted-foreground">
          Proposal comparison view coming soon
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{briefTitle}</h2>
          <p className="text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} received
          </p>
        </div>
        {selectedProposals.length > 1 && (
          <Button onClick={() => setShowComparison(true)}>
            Compare Selected ({selectedProposals.length})
          </Button>
        )}
      </div>

      {proposals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No proposals have been submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className={selectedProposals.includes(proposal.id) ? 'ring-2 ring-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{proposal.expert_profile?.full_name || 'Expert'}</h3>
                        <p className="text-sm text-muted-foreground">{proposal.expert_profile?.email}</p>
                        {proposal.expert_profile?.price_band_min && (
                          <p className="text-sm text-muted-foreground">
                            Rate: £{proposal.expert_profile.price_band_min}-{proposal.expert_profile.price_band_max}/day
                          </p>
                        )}
                      </div>
                    </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(proposal.status)}>
                      {getStatusIcon(proposal.status)}
                      <span className="ml-1 capitalize">{proposal.status}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Approach</h4>
                      <p className="text-sm text-muted-foreground">{proposal.scope?.overview || 'No overview provided'}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Timeline: {proposal.scope?.timeline || 'Not specified'}
                      </div>
                      <div className="flex items-center">
                        <PoundSterling className="h-4 w-4 mr-1" />
                        Total: £{proposal.price_total?.toLocaleString() || '0'}
                      </div>
                    </div>
                    {proposal.expert_profile?.skills && (
                      <div>
                        <h4 className="font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {proposal.expert_profile.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="deliverables">
                    <div className="space-y-2">
                      {(proposal.scope?.deliverables || []).map((deliverable: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                          <span className="text-sm">{deliverable}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="milestones">
                    <div className="space-y-3">
                      {(proposal.milestones || []).map((milestone: any, index: number) => (
                        <div key={index} className="flex justify-between items-start p-3 border rounded">
                          <div>
                            <h5 className="font-medium">{milestone.title}</h5>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary">£{milestone.amount?.toLocaleString() || '0'}</Badge>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pricing">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-lg font-semibold">
                        <span>Total Project Value</span>
                        <span>£{proposal.price_total?.toLocaleString() || '0'}</span>
                      </div>
                      {proposal.scope?.assumptions && (
                        <div>
                          <h4 className="font-medium mb-2">Assumptions & Terms</h4>
                          <p className="text-sm text-muted-foreground">{proposal.scope.assumptions}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => toggleProposalSelection(proposal.id)}
                      className="rounded"
                    />
                    <label className="text-sm">Select for comparison</label>
                  </div>
                  
                  {proposal.status === 'submitted' && (
                    <div className="space-x-2">
                      <Button variant="outline">Message Expert</Button>
                      <Button onClick={() => acceptProposal(proposal.id)}>
                        Accept Proposal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}