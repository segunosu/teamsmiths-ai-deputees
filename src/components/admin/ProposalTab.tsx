import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  PoundSterling,
  FileText,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Proposal {
  id: string;
  brief_id: string;
  expert_id: string;
  scope: any;
  price_total: number;
  milestones: any[];
  status: 'submitted' | 'accepted' | 'rejected';
  created_at: string;
  expert_profile: {
    full_name?: string;
    email?: string;
    skills?: string[];
  };
  brief: {
    structured_brief?: any;
    contact_name?: string;
    contact_email?: string;
  };
}

interface ProposalTabProps {
  className?: string;
}

export function ProposalTab({ className }: ProposalTabProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    brief_id: '',
  });
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProposals();
  }, [filters]);

  const loadProposals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('project_proposals')
        .select(`
          *,
          expert_profile:profiles!project_proposals_expert_id_fkey (
            full_name,
            email
          ),
          brief:briefs (
            structured_brief,
            contact_name,
            contact_email
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.brief_id) {
        query = query.eq('brief_id', filters.brief_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get freelancer profiles for additional info
      const expertIds = data?.map(p => p.expert_id) || [];
      const { data: freelancerProfiles } = await supabase
        .from('freelancer_profiles')
        .select('user_id, skills, price_band_min, price_band_max')
        .in('user_id', expertIds);

      const enrichedProposals = data?.map((proposal: any) => ({
        ...proposal,
        expert_profile: {
          ...proposal.expert_profile,
          skills: freelancerProfiles?.find((fp: any) => fp.user_id === proposal.expert_id)?.skills || [],
        }
      })) || [];

      // Apply search filter
      let filteredProposals = enrichedProposals;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProposals = enrichedProposals.filter(p => 
          p.expert_profile?.full_name?.toLowerCase().includes(searchLower) ||
          p.expert_profile?.email?.toLowerCase().includes(searchLower) ||
          p.brief?.contact_name?.toLowerCase().includes(searchLower) ||
          p.brief?.structured_brief?.project_title?.toLowerCase().includes(searchLower)
        );
      }

      setProposals(filteredProposals);
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

  const handleStatusChange = async (proposalId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('project_proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;

      // If accepting, trigger project creation
      if (newStatus === 'accepted') {
        const proposal = proposals.find(p => p.id === proposalId);
        if (proposal) {
          const { error: projectError } = await supabase.functions.invoke('create-project-from-proposal', {
            body: {
              proposal_id: proposalId,
              brief_id: proposal.brief_id,
            },
          });

          if (projectError) {
            console.error('Error creating project:', projectError);
            toast({
              title: "Warning",
              description: "Proposal accepted but project creation failed. Please create manually.",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: `Proposal ${newStatus}`,
        description: `Proposal has been ${newStatus} successfully.`,
      });

      loadProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: "Error",
        description: "Failed to update proposal status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
    }
  };

  const openDetailModal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>Proposal Management</CardTitle>
          <div className="flex gap-4 items-center">
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search proposals..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No proposals found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {proposal.expert_profile?.full_name || 'Unknown Expert'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {proposal.expert_profile?.email}
                          </span>
                          {getStatusBadge(proposal.status)}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{proposal.brief?.structured_brief?.project_title || 'Untitled Project'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <PoundSterling className="h-4 w-4" />
                            <span>£{proposal.price_total?.toLocaleString() || '0'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {(proposal.expert_profile?.skills || []).slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {(proposal.expert_profile?.skills || []).length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(proposal.expert_profile?.skills || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Milestones:</span> {proposal.milestones?.length || 0}
                          <span className="ml-4 font-medium">Client:</span> {proposal.brief?.contact_name || 'Unknown'}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(proposal)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>

                        {proposal.status === 'submitted' && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(proposal.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(proposal.id, 'accepted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposal Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
          </DialogHeader>
          
          {selectedProposal && (
            <div className="space-y-6">
              {/* Expert & Project Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Expert Information</h4>
                  <p><strong>Name:</strong> {selectedProposal.expert_profile?.full_name}</p>
                  <p><strong>Email:</strong> {selectedProposal.expert_profile?.email}</p>
                  <div className="mt-2">
                    <strong>Skills:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selectedProposal.expert_profile?.skills || []).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Project Information</h4>
                  <p><strong>Title:</strong> {selectedProposal.brief?.structured_brief?.project_title || 'N/A'}</p>
                  <p><strong>Client:</strong> {selectedProposal.brief?.contact_name}</p>
                  <p><strong>Total Value:</strong> £{selectedProposal.price_total?.toLocaleString()}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedProposal.status)}</p>
                </div>
              </div>

              {/* Proposal Scope */}
              <div>
                <h4 className="font-medium mb-2">Project Approach</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProposal.scope?.overview || 'No overview provided'}
                </p>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="font-medium mb-2">Key Deliverables</h4>
                <ul className="space-y-1">
                  {(selectedProposal.scope?.deliverables || []).map((deliverable: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Milestones */}
              <div>
                <h4 className="font-medium mb-2">Project Milestones</h4>
                <div className="space-y-3">
                  {(selectedProposal.milestones || []).map((milestone: any, index: number) => (
                    <Card key={index} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{milestone.title}</h5>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          £{milestone.amount?.toLocaleString() || '0'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Timeline & Assumptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProposal.scope?.timeline || 'Not specified'}
                  </p>
                </div>
                
                {selectedProposal.scope?.assumptions && (
                  <div>
                    <h4 className="font-medium mb-2">Assumptions & Terms</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProposal.scope.assumptions}
                    </p>
                  </div>
                )}
              </div>

              {/* Admin Actions */}
              {selectedProposal.status === 'submitted' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleStatusChange(selectedProposal.id, 'rejected');
                      setShowDetailModal(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Proposal
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedProposal.id, 'accepted');
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept & Create Project
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}