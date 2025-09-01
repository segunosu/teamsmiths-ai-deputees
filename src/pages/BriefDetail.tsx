import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, FileText, Users, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import ClientShortlist from '@/components/ClientShortlist';
import BriefChat from '@/components/BriefChat';

interface Brief {
  id: string;
  origin: string;
  status: string;
  contact_name: string;
  contact_email: string;
  structured_brief: any;
  proposal_json: any;
  assured_mode: boolean;
  selected_expert_id: string | null;
  created_at: string;
  updated_at: string;
}

const BriefDetail = () => {
  const { id: briefId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (briefId && user) {
      loadBrief();
    }
  }, [briefId, user]);

  const loadBrief = async () => {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', briefId)
        .single();

      if (error) throw error;

      // Check if user has access to this brief
      if (data.user_id !== user?.id && data.contact_email !== user?.email) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user?.id)
          .single();

        if (!profile?.is_admin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this brief.",
            variant: "destructive",
          });
          navigate('/dashboard');
          return;
        }
      }

      setBrief(data);
      
      // Set active tab based on brief status
      if (data.status === 'expert_selected' || data.selected_expert_id) {
        setActiveTab('chat');
      } else if (data.status === 'proposal_ready' || data.status === 'invitations_sent') {
        setActiveTab('shortlist');
      }

    } catch (error) {
      console.error('Error loading brief:', error);
      toast({
        title: "Error",
        description: "Failed to load brief details.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      proposal_ready: 'bg-green-100 text-green-800',
      invitations_sent: 'bg-purple-100 text-purple-800',
      expert_selected: 'bg-emerald-100 text-emerald-800',
      qa_in_review: 'bg-yellow-100 text-yellow-800',
      qa_passed: 'bg-emerald-100 text-emerald-800',
      accepted: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-500'
    };
    return <Badge className={colors[status] || colors.draft}>{status.replace('_', ' ')}</Badge>;
  };

  const formatBudget = (budgetRange: string) => {
    if (!budgetRange) return 'Budget not specified';
    return `Budget: ${budgetRange}`;
  };

  const handleExpertSelected = (expertId: string) => {
    setBrief(prev => prev ? { ...prev, selected_expert_id: expertId, status: 'expert_selected' } : null);
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading brief details...</p>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Brief Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The brief you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectTitle = brief.structured_brief?.project_title || 
                      brief.structured_brief?.goal?.interpreted || 
                      'Custom Brief';

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{projectTitle}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Created {format(new Date(brief.created_at), 'MMM d, yyyy')}</span>
                <span>•</span>
                <span>Origin: {brief.origin}</span>
                {brief.assured_mode && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">Assured Mode</Badge>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(brief.status)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <FileText className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="shortlist" 
              className="gap-2"
              disabled={brief.status === 'draft' || brief.status === 'submitted'}
            >
              <Users className="h-4 w-4" />
              Shortlist
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="gap-2"
              disabled={!brief.selected_expert_id}
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="meetings" 
              className="gap-2"
              disabled={!brief.selected_expert_id}
            >
              <Calendar className="h-4 w-4" />
              Meetings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Brief Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Goal</h4>
                    <p className="text-sm text-muted-foreground">
                      {brief.structured_brief?.goal?.interpreted || 
                       brief.structured_brief?.goal || 
                       'No goal specified'}
                    </p>
                  </div>
                  
                  {brief.structured_brief?.context && (
                    <div>
                      <h4 className="font-medium mb-2">Context</h4>
                      <p className="text-sm text-muted-foreground">
                        {typeof brief.structured_brief.context === 'string' 
                          ? brief.structured_brief.context
                          : brief.structured_brief.context?.interpreted || 'No context provided'}
                      </p>
                    </div>
                  )}
                  
                  {brief.structured_brief?.budget_range && (
                    <div>
                      <h4 className="font-medium mb-2">Budget</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatBudget(brief.structured_brief.budget_range)}
                      </p>
                    </div>
                  )}
                  
                  {brief.structured_brief?.timeline && (
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <p className="text-sm text-muted-foreground">
                        {brief.structured_brief.timeline}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Name</h4>
                    <p className="text-sm text-muted-foreground">
                      {brief.contact_name || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      {brief.contact_email}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Status</h4>
                    {getStatusBadge(brief.status)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shortlist">
            <ClientShortlist 
              briefId={brief.id} 
              onExpertSelected={handleExpertSelected}
            />
          </TabsContent>

          <TabsContent value="chat">
            <BriefChat briefId={brief.id} />
          </TabsContent>

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle>Project Meetings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No meetings scheduled</h3>
                  <p className="text-muted-foreground">
                    Meetings will appear here once scheduled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BriefDetail;