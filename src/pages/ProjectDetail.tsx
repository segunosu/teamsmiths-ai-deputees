import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, MessageCircle, FileText, Clock, Users, Send } from 'lucide-react';
import AIChat from '@/components/AIChat';
import ProjectInsights from '@/components/ProjectInsights';

interface Project {
  id: string;
  title: string;
  status: string;
  total_price: number;
  currency: string;
  created_at: string;
  is_custom: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  due_date: string;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = 'Project Details - Teamsmiths';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'View project details and communicate with your team');
  }, []);

  useEffect(() => {
    if (!user || !id) return;

    const fetchData = async () => {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch milestones
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', id)
          .order('created_at');

        if (milestonesError) throw milestonesError;
        setMilestones(milestonesData || []);

        // Fetch messages with profile info
        const { data: messagesData, error: messagesError } = await supabase
          .from('project_messages')
          .select(`
            *,
            profiles(full_name, email)
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
      } catch (error: any) {
        toast({
          title: 'Error loading project',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, id, toast]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !id) return;

    try {
      setSending(true);
      const { error } = await supabase
        .from('project_messages')
        .insert({
          project_id: id,
          user_id: user.id,
          message: newMessage.trim(),
        });

      if (error) throw error;

      // Refresh messages
      const { data: messagesData } = await supabase
        .from('project_messages')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      setMessages(messagesData || []);
      setNewMessage('');
    } catch (error: any) {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-primary text-primary-foreground',
      completed: 'bg-success text-success-foreground',
      cancelled: 'bg-destructive text-destructive-foreground',
      planned: 'bg-muted text-muted-foreground',
      'in_progress': 'bg-primary text-primary-foreground',
    };
    return <Badge className={colors[status] || colors.draft}>{status.replace('_', ' ')}</Badge>;
  };

  const formatPrice = (amount: number, currency = 'gbp') => {
    return `${currency.toUpperCase()} ${(amount / 100).toLocaleString()}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
            <CardDescription>Please sign in to view project details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>The project you're looking for doesn't exist or you don't have access to it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(project.status)}
              <p className="text-2xl font-bold mt-2">
                {formatPrice(project.total_price, project.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Type</p>
                    <p className="text-muted-foreground">
                      {project.is_custom ? 'Custom Project' : 'Outcome Pack'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    {getStatusBadge(project.status)}
                  </div>
                  <div>
                    <p className="font-medium">Total Value</p>
                    <p className="text-muted-foreground">
                      {formatPrice(project.total_price, project.currency)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Communication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Use the Messages tab to communicate with your assigned Teamsmith and track project progress.
                  </p>
                  <Button asChild className="w-full">
                    <Link to={`/project/${id}?tab=messages`}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Open Messages
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Project Milestones</h2>
            </div>

            {milestones.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No milestones yet</h3>
                    <p className="text-muted-foreground">
                      Your Teamsmith will create milestones as work begins.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <CardDescription>{milestone.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(milestone.status)}
                          <p className="font-semibold mt-1">
                            {formatPrice(milestone.amount, project.currency)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    {milestone.due_date && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Due: {new Date(milestone.due_date).toLocaleDateString()}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Project Messages</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Send Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim() || sending}>
                  {sending ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {messages.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Start the conversation with your Teamsmith.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card key={message.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">
                          {message.profiles?.full_name || message.profiles?.email || 'Team Member'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString()} {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* AI Insights */}
        <div className="mt-8">
          <ProjectInsights projectId={id!} />
        </div>
      </div>
      
      {/* AI Chat Interface */}
      <AIChat projectId={id!} />
    </div>
  );
};

export default ProjectDetail;