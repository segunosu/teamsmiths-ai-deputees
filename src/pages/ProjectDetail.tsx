import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import DeliverableManagement from '@/components/DeliverableManagement';
import ProjectInsights from '@/components/ProjectInsights';
import AIChat from '@/components/AIChat';
import { toast } from 'sonner';
import { Users, Calendar, DollarSign, FileText, MessageSquare, TrendingUp } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: string;
  total_price: number;
  currency: string;
  created_at: string;
  is_custom: boolean;
  project_participants: Array<{
    role: string;
    user_id: string;
    profiles?: { full_name: string; email: string };
  }>;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  milestone_number: number;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'client' | 'freelancer' | 'admin'>('client');

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      // Fetch project with participants
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          project_participants (
            role,
            user_id,
            profiles:user_id (full_name, email)
          )
        `)
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      setProject(projectData);

      // Determine user role
      const userParticipant = projectData.project_participants.find(p => p.user_id === user?.id);
      if (userParticipant) {
        setUserRole(userParticipant.role as 'client' | 'freelancer' | 'admin');
      } else {
        // Check if admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user?.id)
          .single();
        
        if (profile?.is_admin) {
          setUserRole('admin');
        }
      }

      // Fetch milestones for custom projects
      if (projectData.is_custom) {
        const { data: milestonesData, error: milestonesError } = await supabase
          .from('custom_project_milestones')
          .select('*')
          .eq('project_id', id)
          .order('milestone_number', { ascending: true });

        if (milestonesError) {
          console.error('Error fetching milestones:', milestonesError);
        } else {
          setMilestones(milestonesData || []);
        }
      }

    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'completed':
        return 'bg-primary text-primary-foreground';
      case 'on_hold':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getMilestoneProgress = () => {
    if (milestones.length === 0) return 0;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / milestones.length) * 100);
  };

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency.toLowerCase() === 'gbp' ? '£' : '$';
    return `${symbol}${(amount / 100).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The project you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-1">
                Created on {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Project Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(project.total_price, project.currency)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.project_participants.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {milestones.length}
                </div>
              </CardContent>
            </Card>

            {project.is_custom && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getMilestoneProgress()}%
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Progress Bar for Custom Projects */}
          {project.is_custom && milestones.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Progress</CardTitle>
                <CardDescription>
                  {milestones.filter(m => m.status === 'completed').length} of {milestones.length} milestones completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={getMilestoneProgress()} className="w-full" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="deliverables" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deliverables" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Milestones
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliverables">
            <DeliverableManagement projectId={project.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="milestones">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Project Milestones</h2>
                <Badge variant="secondary">{milestones.length} total</Badge>
              </div>
              
              {milestones.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No milestones defined for this project</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <Card key={milestone.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              Milestone {milestone.milestone_number}: {milestone.title}
                            </CardTitle>
                            {milestone.description && (
                              <CardDescription className="mt-1">
                                {milestone.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge 
                            className={
                              milestone.status === 'completed' 
                                ? 'bg-success text-success-foreground'
                                : milestone.status === 'in_progress'
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }
                          >
                            {milestone.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Amount: {formatPrice(milestone.amount, project.currency)}
                            </p>
                            {milestone.due_date && (
                              <p className="text-sm text-muted-foreground">
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <ProjectInsights projectId={project.id} />
          </TabsContent>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI Project Assistant
                </CardTitle>
                <CardDescription>
                  Get help with your project, ask questions, or request insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIChat projectId={project.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Team Members */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              People working on this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.project_participants.map((participant) => (
                <div key={participant.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {participant.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {participant.profiles?.email}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {participant.role.charAt(0).toUpperCase() + participant.role.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;