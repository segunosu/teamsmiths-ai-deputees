import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Calendar,
  Activity,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BriefWithInvites {
  id: string;
  structured_brief: any;
  status: string;
  created_at: string;
  selected_expert_id: string | null;
  invites: ExpertInvite[];
  chat_messages: any[];
  meetings: any[];
}

interface ExpertInvite {
  id: string;
  expert_user_id: string;
  status: string;
  sent_at: string;
  responded_at: string | null;
  score_at_invite: number;
  expert_profile: {
    full_name: string;
    email: string;
  };
}

const ExpertSelectionMonitor = () => {
  const [briefs, setBriefs] = useState<BriefWithInvites[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadBriefs();
  }, []);

  const loadBriefs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select(`
          id,
          structured_brief,
          status,
          created_at,
          selected_expert_id,
          expert_invites (
            id,
            expert_user_id,
            status,
            sent_at,
            responded_at,
            score_at_invite
          ),
          brief_chat_messages (
            id,
            created_at,
            message_type
          ),
          meetings (
            id,
            title,
            starts_at,
            provider
          )
        `)
        .in('status', ['submitted', 'proposal_ready', 'expert_selected'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get expert profiles separately to avoid relation issues
      const expertIds = data.flatMap(brief => 
        brief.expert_invites.map(invite => invite.expert_user_id)
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', expertIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Transform the data to match our interface
      const transformedBriefs = data.map(brief => ({
        ...brief,
        invites: brief.expert_invites.map(invite => ({
          ...invite,
          expert_profile: profilesMap.get(invite.expert_user_id) || {
            full_name: 'Unknown Expert',
            email: 'unknown@email.com'
          }
        })),
        chat_messages: brief.brief_chat_messages,
        meetings: brief.meetings
      }));

      setBriefs(transformedBriefs);
    } catch (error) {
      console.error('Error loading briefs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load briefs data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const reassignExpert = async (briefId: string, newExpertId: string) => {
    try {
      const { error } = await supabase.functions.invoke('select-expert-for-brief', {
        body: {
          brief_id: briefId,
          expert_user_id: newExpertId
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Expert reassigned successfully'
      });

      loadBriefs();
    } catch (error) {
      console.error('Error reassigning expert:', error);
      toast({
        title: 'Error',
        description: 'Failed to reassign expert',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'selected':
        return 'bg-blue-100 text-blue-800';
      case 'not_selected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInviteStats = (invites: ExpertInvite[]) => {
    const sent = invites.filter(i => i.status === 'sent').length;
    const accepted = invites.filter(i => i.status === 'accepted').length;
    const declined = invites.filter(i => i.status === 'declined').length;
    const selected = invites.filter(i => i.status === 'selected').length;
    
    return { sent, accepted, declined, selected, total: invites.length };
  };

  const selectedBriefData = selectedBrief ? briefs.find(b => b.id === selectedBrief) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Expert Selection Monitor</h2>
          <p className="text-muted-foreground">Monitor and manage the expert selection process</p>
        </div>
        <Button onClick={loadBriefs} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {briefs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No active selections</h3>
              <p className="text-muted-foreground">
                No briefs are currently in the expert selection process
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brief List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Active Briefs ({briefs.length})</h3>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {briefs.map((brief) => {
                  const stats = getInviteStats(brief.invites);
                  const projectTitle = brief.structured_brief?.project_title || 'Untitled Project';
                  
                  return (
                    <Card 
                      key={brief.id} 
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedBrief === brief.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedBrief(brief.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base truncate">{projectTitle}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {brief.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          Created {formatDistanceToNow(new Date(brief.created_at), { addSuffix: true })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{stats.total}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{stats.accepted}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <span>{stats.sent}</span>
                            </div>
                            {stats.declined > 0 && (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span>{stats.declined}</span>
                              </div>
                            )}
                          </div>
                          {brief.selected_expert_id && (
                            <Badge variant="secondary" className="text-xs">
                              Expert Selected
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Brief Details */}
          <div className="space-y-4">
            {selectedBriefData ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Brief Details</h3>
                  <Badge variant="outline">
                    {selectedBriefData.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <Tabs defaultValue="invites" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="invites">Invites</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="actions">Actions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="invites" className="space-y-4">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-3">
                        {selectedBriefData.invites.map((invite) => (
                          <Card key={invite.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium text-sm">
                                    {invite.expert_profile?.full_name || 'Unknown Expert'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {invite.expert_profile?.email}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(invite.status)}>
                                  {invite.status}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Score: {Math.round(invite.score_at_invite * 100)}%</span>
                                <span>
                                  Sent {formatDistanceToNow(new Date(invite.sent_at), { addSuffix: true })}
                                </span>
                              </div>
                              {invite.responded_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Responded {formatDistanceToNow(new Date(invite.responded_at), { addSuffix: true })}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="activity" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">
                          {selectedBriefData.chat_messages?.length || 0} chat messages
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {selectedBriefData.meetings?.length || 0} meetings scheduled
                        </span>
                      </div>
                      <Separator />
                      <div className="text-xs text-muted-foreground">
                        <p>Brief created {formatDistanceToNow(new Date(selectedBriefData.created_at), { addSuffix: true })}</p>
                        <p>Project: {selectedBriefData.structured_brief?.project_title}</p>
                        <p>Budget: {selectedBriefData.structured_brief?.budget_range}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="actions" className="space-y-4">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Admin Actions</p>
                      
                      {selectedBriefData.invites.filter(i => i.status === 'accepted').length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Reassign Expert</p>
                          {selectedBriefData.invites
                            .filter(i => i.status === 'accepted')
                            .map(invite => (
                              <div key={invite.id} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm">{invite.expert_profile?.full_name}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => reassignExpert(selectedBriefData.id, invite.expert_user_id)}
                                >
                                  Select
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                      
                      {selectedBriefData.invites.filter(i => i.status === 'sent').length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{selectedBriefData.invites.filter(i => i.status === 'sent').length} pending responses</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a brief</h3>
                    <p className="text-muted-foreground">
                      Choose a brief from the list to view detailed information
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertSelectionMonitor;