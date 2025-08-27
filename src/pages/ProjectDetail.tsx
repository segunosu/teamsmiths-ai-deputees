import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import ProjectChat from '@/components/ProjectChat';
import { 
  Calendar, 
  DollarSign, 
  User, 
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  title: string;
  status: string;
  total_price: number;
  currency: string;
  expert_user_id: string;
  client_user_id: string;
  created_at: string;
  brief_id: string;
  teamsmith_user_id?: string;
}

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string;
  email: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [expertProfile, setExpertProfile] = useState<Profile | null>(null);
  const [clientProfile, setClientProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      // Load project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load milestones (use custom milestones table if available)
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('custom_project_milestones')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (milestonesError) {
        console.log('No custom milestones found:', milestonesError);
        setMilestones([]);
      } else {
        setMilestones(milestonesData || []);
      }

      // Load expert and client profiles
      const { data: expertData, error: expertError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('user_id', projectData.expert_user_id)
        .single();

      if (!expertError) setExpertProfile(expertData);

      const { data: clientData, error: clientError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .eq('user_id', projectData.client_user_id)
        .single();

      if (!clientError) setClientProfile(clientData);

    } catch (error: any) {
      console.error('Error loading project:', error);
      toast({
        title: 'Error loading project',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getMilestoneStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'in_progress': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getProjectProgress = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return (completed / milestones.length) * 100;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Project not found or you don't have access to this project.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user has access to this project
  const hasAccess = user && (
    user.id === project.expert_user_id || 
    user.id === project.client_user_id
  );

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this project.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground mt-2">Project created from brief</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Created {format(new Date(project.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(project.total_price, project.currency)}
            </div>
            <p className="text-sm text-muted-foreground">Total Budget</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Project Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(getProjectProgress())}% complete
            </span>
          </div>
          <Progress value={getProjectProgress()} className="h-2" />
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="chat">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Team */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Expert</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>{expertProfile?.full_name || 'Loading...'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {expertProfile?.email}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Client</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    <span>{clientProfile?.full_name || 'Loading...'}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clientProfile?.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Total Milestones</h4>
                    <p className="text-2xl font-bold">{milestones.length}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Completed</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {milestones.filter(m => m.status === 'completed').length}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">In Progress</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {milestones.filter(m => m.status === 'in_progress').length}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Planned</h4>
                    <p className="text-2xl font-bold text-gray-600">
                      {milestones.filter(m => m.status === 'planned').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No milestones defined yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600 mt-1" />
                        ) : milestone.status === 'in_progress' ? (
                          <Clock className="h-6 w-6 text-blue-600 mt-1" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300 mt-1" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{milestone.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={getMilestoneStatusColor(milestone.status)}>
                              {milestone.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm font-medium">
                              {formatCurrency(milestone.amount, project.currency)}
                            </span>
                          </div>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {milestone.due_date && (
                            <span>Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}</span>
                          )}
                          <span>Milestone {index + 1} of {milestones.length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <ProjectChat projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;