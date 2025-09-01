import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Star, User, CheckCircle, Clock, XCircle, MessageSquare, Video, Award } from 'lucide-react';

interface ExpertInvite {
  id: string;
  expert_user_id: string;
  status: string;
  score_at_invite: number;
  sent_at: string;
  responded_at: string | null;
  expert_profile: {
    user_id: string;
    skills: string[];
    tools: string[];
    industries: string[];
    price_band_min: number;
    price_band_max: number;
  };
  expert_details: {
    full_name: string;
    email: string;
  };
  case_studies: any[];
  certifications: any[];
}

interface ClientShortlistProps {
  briefId: string;
  onExpertSelected?: (expertId: string) => void;
}

const ClientShortlist: React.FC<ClientShortlistProps> = ({ briefId, onExpertSelected }) => {
  const [invites, setInvites] = useState<ExpertInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInvites();
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('expert_invites_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expert_invites',
          filter: `brief_id=eq.${briefId}`,
        },
        () => {
          loadInvites();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [briefId]);

  const loadInvites = async () => {
    try {
      // Get expert invites
      const { data: invitesData, error } = await supabase
        .from('expert_invites')
        .select('*')
        .eq('brief_id', briefId)
        .order('score_at_invite', { ascending: false });

      if (error) throw error;

      // Get expert profiles and user details separately
      const expertIds = invitesData.map(invite => invite.expert_user_id);
      
      const { data: profilesData } = await supabase
        .from('freelancer_profiles')
        .select(`
          user_id,
          skills,
          tools,
          industries,
          price_band_min,
          price_band_max
        `)
        .in('user_id', expertIds);

      const { data: userDetails } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', expertIds);

      // Create lookup maps
      const profileMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
      const detailsMap = new Map(userDetails?.map(u => [u.user_id, u]) || []);

      // Transform data to match expected structure
      const transformedData = invitesData.map(invite => ({
        id: invite.id,
        expert_user_id: invite.expert_user_id,
        status: invite.status,
        score_at_invite: invite.score_at_invite,
        sent_at: invite.sent_at,
        responded_at: invite.responded_at,
        expert_profile: profileMap.get(invite.expert_user_id) || {
          user_id: invite.expert_user_id,
          skills: [],
          tools: [],
          industries: [],
          price_band_min: 0,
          price_band_max: 0
        },
        expert_details: detailsMap.get(invite.expert_user_id) || {
          full_name: 'Unknown Expert',
          email: ''
        },
        case_studies: [], // TODO: Load case studies
        certifications: [] // TODO: Load certifications
      }));

      setInvites(transformedData);
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Error",
        description: "Failed to load expert shortlist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectExpert = async (expertUserId: string) => {
    setSelecting(expertUserId);
    
    try {
      const { data, error } = await supabase.rpc('select_expert_for_brief', {
        p_brief_id: briefId,
        p_expert_user_id: expertUserId
      });

      if (error) throw error;
      
      const result = data as any;
      if (result?.success) {
        toast({
          title: "Expert Selected!",
          description: `${result.expert_name} has been selected for your project.`,
        });
        
        // Send email notifications
        await sendSelectionNotifications(expertUserId);
        
        if (onExpertSelected) {
          onExpertSelected(expertUserId);
        }
        
        loadInvites(); // Refresh the list
      } else {
        throw new Error(result?.error || 'Failed to select expert');
      }
    } catch (error) {
      console.error('Error selecting expert:', error);
      toast({
        title: "Error",
        description: "Failed to select expert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSelecting(null);
    }
  };

  const sendSelectionNotifications = async (selectedExpertId: string) => {
    try {
      const selectedExpert = invites.find(inv => inv.expert_user_id === selectedExpertId);
      const nonSelectedExperts = invites.filter(inv => 
        inv.expert_user_id !== selectedExpertId && 
        inv.status === 'accepted'
      );

      // Send selection email to chosen expert
      if (selectedExpert) {
        await supabase.functions.invoke('expert-selection-notifications', {
          body: {
            to: selectedExpert.expert_details.email,
            type: 'selected',
            data: {
              expertName: selectedExpert.expert_details.full_name,
              projectTitle: 'Your Project' // TODO: Get from brief
            }
          }
        });
      }

      // Send rejection emails to non-selected experts
      for (const expert of nonSelectedExperts) {
        await supabase.functions.invoke('expert-selection-notifications', {
          body: {
            to: expert.expert_details.email,
            type: 'not_selected',
            data: {
              expertName: expert.expert_details.full_name,
              projectTitle: 'Your Project' // TODO: Get from brief
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      sent: <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Invited</Badge>,
      accepted: <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Accepted</Badge>,
      declined: <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Declined</Badge>,
      selected: <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Selected</Badge>,
      not_selected: <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Not Selected</Badge>
    };
    return badges[status] || badges.sent;
  };

  const acceptedExperts = invites.filter(inv => inv.status === 'accepted');
  const hasSelectedExpert = invites.some(inv => inv.status === 'selected');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Expert Shortlist</h3>
          <p className="text-sm text-muted-foreground">
            {acceptedExperts.length > 0 
              ? `${acceptedExperts.length} expert${acceptedExperts.length > 1 ? 's' : ''} accepted your invitation`
              : 'Awaiting expert responses...'}
          </p>
        </div>
      </div>

      {invites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invitations sent yet</h3>
              <p className="text-muted-foreground">
                Experts will appear here once invitations are sent.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : acceptedExperts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Awaiting expert responses</h3>
              <p className="text-muted-foreground">
                We've sent invitations to {invites.length} expert{invites.length > 1 ? 's' : ''}. 
                They'll appear here once they respond.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invites.map((invite) => (
            <Card key={invite.id} className={invite.status === 'selected' ? 'border-green-500 bg-green-50' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {invite.expert_details.full_name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {(invite.score_at_invite * 100).toFixed(0)}% match
                      </span>
                      <span>£{invite.expert_profile.price_band_min}-{invite.expert_profile.price_band_max}/outcome</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invite.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Skills */}
                  <div>
                    <h4 className="font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {invite.expert_profile.skills?.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  {invite.expert_profile.tools?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tools</h4>
                      <div className="flex flex-wrap gap-1">
                        {invite.expert_profile.tools.slice(0, 4).map((tool, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Industries */}
                  {invite.expert_profile.industries?.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-1">
                        {invite.expert_profile.industries.slice(0, 3).map((industry, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {invite.status === 'accepted' && !hasSelectedExpert && (
                      <Button
                        onClick={() => selectExpert(invite.expert_user_id)}
                        disabled={selecting === invite.expert_user_id}
                        className="flex-1"
                      >
                        {selecting === invite.expert_user_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Selecting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Select Expert
                          </>
                        )}
                      </Button>
                    )}
                    
                    {invite.status === 'selected' && (
                      <>
                        <Button variant="outline" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Chat
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          Schedule Call
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
    </div>
  );
};

export default ClientShortlist;