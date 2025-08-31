import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Settings
} from 'lucide-react';
import FreelancerProfile from '@/components/FreelancerProfile';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Invite {
  id: string;
  brief_id: string;
  status: string;
  sent_at: string;
  viewed_at: string | null;
  responded_at: string | null;
  expires_at: string;
  invitation_message: string;
  score_at_invite: number;
  briefs: {
    structured_brief?: any;
  };
}

const FreelancerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [stats, setStats] = useState({
    totalInvites: 0,
    acceptedInvites: 0,
    responseRate: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/freelancer-auth');
      return;
    }
    
    // Check if user is actually a freelancer
    checkUserType();
    loadInvites();
  }, [user, navigate]);

  const checkUserType = async () => {
    if (!user) return;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single();
    
    setProfileLoaded(true);
    
    if (profile?.user_type !== 'freelancer') {
      toast({
        title: "Access denied",
        description: "This dashboard is for freelancers only.",
        variant: "destructive",
      });
      navigate('/');
    }
  };

  const loadInvites = async () => {
    if (!user) return;
    
    try {
      const { data: invitesData, error } = await supabase
        .from('expert_invites')
        .select(`
          *,
          briefs!inner(structured_brief)
        `)
        .eq('expert_user_id', user.id)
        .order('sent_at', { ascending: false });

      if (error) throw error;

      setInvites(invitesData || []);
      
      // Calculate stats
      const total = invitesData?.length || 0;
      const accepted = invitesData?.filter(invite => invite.status === 'accepted').length || 0;
      const avgScore = invitesData?.reduce((sum, invite) => sum + (invite.score_at_invite || 0), 0) / total || 0;
      
      setStats({
        totalInvites: total,
        acceptedInvites: accepted,
        responseRate: total > 0 ? (accepted / total) * 100 : 0,
        averageScore: avgScore
      });
    } catch (error) {
      console.error('Error loading invites:', error);
      toast({
        title: "Error",
        description: "Failed to load invites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteResponse = async (inviteId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('expert_invites')
        .update({ 
          status,
          responded_at: new Date().toISOString(),
          response_message: status === 'accepted' ? 'Accepted invitation' : 'Declined invitation'
        })
        .eq('id', inviteId);

      if (error) throw error;

      toast({
        title: `Invitation ${status}`,
        description: `You have ${status} the project invitation.`,
      });
      
      loadInvites(); // Reload invites
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} invitation`,
        variant: "destructive",
      });
    }
  };

  const markAsViewed = async (inviteId: string) => {
    if (!invites.find(i => i.id === inviteId)?.viewed_at) {
      await supabase
        .from('expert_invites')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', inviteId);
      
      loadInvites();
    }
  };

  if (loading || !profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Freelancer Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invites</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvites}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.responseRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Match Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.averageScore * 100).toFixed(0)}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptedInvites}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="invites" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invites">Project Invites</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="invites" className="space-y-4">
            <div className="space-y-4">
              {invites.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No invites yet</h3>
                      <p className="text-muted-foreground">
                        Complete your profile to start receiving project invitations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                invites.map((invite) => (
                  <Card key={invite.id} className={!invite.viewed_at ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {invite.briefs?.structured_brief?.project_title || 'Project Invitation'}
                          </CardTitle>
                          <CardDescription>
                            Match Score: {(invite.score_at_invite * 100).toFixed(0)}% • 
                            Sent {new Date(invite.sent_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {!invite.viewed_at && (
                            <Badge variant="secondary">New</Badge>
                          )}
                          <Badge variant={
                            invite.status === 'accepted' ? 'default' :
                            invite.status === 'declined' ? 'destructive' :
                            'outline'
                          }>
                            {invite.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {invite.invitation_message && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {invite.invitation_message}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsViewed(invite.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {invite.status === 'sent' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleInviteResponse(invite.id, 'accepted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleInviteResponse(invite.id, 'declined')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <FreelancerProfile />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your freelancer account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Email: {user?.email}</h4>
                  <p className="text-sm text-muted-foreground">
                    Account type: Freelancer
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Notification Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure how you want to receive project invitations and updates.
                  </p>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default FreelancerDashboard;