import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, Settings, Users, FileText, AlertTriangle, DollarSign } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminSettings {
  quote_approval_threshold: { amount: number; currency: string };
  allow_custom_request_without_login: boolean;
}

interface QuoteForReview {
  id: string;
  quote_number: string;
  project_title: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  user_id: string;
}

interface ProjectOverview {
  id: string;
  title: string;
  status: string;
  total_price: number;
  currency: string;
  created_at: string;
  project_participants: Array<{
    role: string;
    profiles?: { full_name: string; email: string };
  }>;
}

interface DeliverableForQA {
  id: string;
  title: string;
  status: string;
  submitted_at: string;
  project_id: string;
  projects?: { title: string };
  deliverable_files: Array<{
    file_name: string;
    version_number: number;
  }>;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>({ 
    quote_approval_threshold: { amount: 5000, currency: 'gbp' },
    allow_custom_request_without_login: false
  });
  const [quotesForReview, setQuotesForReview] = useState<QuoteForReview[]>([]);
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [deliverablesForQA, setDeliverablesForQA] = useState<DeliverableForQA[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    pendingDeliverables: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user?.id)
        .single();

      if (profile?.is_admin) {
        setIsAdmin(true);
        await loadAdminData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      // Load admin settings
      const { data: settingsData } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (settingsData) {
        const settingsObj: any = {};
        settingsData.forEach(setting => {
          settingsObj[setting.setting_key] = setting.setting_value;
        });
        setSettings(settingsObj);
      }

      // Load quotes needing review (above threshold)  
      const threshold = settings.quote_approval_threshold?.amount || 5000;
      const { data: quotesData } = await supabase
        .from('custom_quotes')
        .select('id, quote_number, project_title, total_amount, currency, status, created_at, user_id')
        .eq('status', 'pending_admin_review')
        .gte('total_amount', threshold * 100); // Convert to pence

      setQuotesForReview(quotesData || []);

      // Load project overview
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          id, title, status, total_price, currency, created_at,
          project_participants (
            role,
            profiles:user_id (full_name, email)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      setProjects(projectsData || []);

      // Load deliverables for QA
      const { data: deliverablesData } = await supabase
        .from('project_deliverables')
        .select(`
          id, title, status, submitted_at, project_id,
          projects:project_id (title),
          deliverable_files (file_name, version_number)
        `)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: true });

      setDeliverablesForQA(deliverablesData || []);

      // Calculate stats
      const allProjects = await supabase.from('projects').select('status, total_price');
      const allQuotes = await supabase.from('custom_quotes').select('status, total_amount').gte('total_amount', threshold * 100);
      
      setStats({
        totalProjects: allProjects.data?.length || 0,
        activeProjects: allProjects.data?.filter(p => p.status === 'active').length || 0,
        pendingQuotes: allQuotes.data?.filter(q => q.status === 'pending_admin_review').length || 0,
        pendingDeliverables: deliverablesData?.length || 0,
        totalRevenue: allProjects.data?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    }
  };

  const updateSettings = async () => {
    try {
      // Update quote approval threshold
      const { error: thresholdError } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'quote_approval_threshold',
          setting_value: settings.quote_approval_threshold,
          updated_by: user?.id
        });

      if (thresholdError) throw thresholdError;

      // Update allow custom request without login
      const { error: toggleError } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'allow_custom_request_without_login',
          setting_value: settings.allow_custom_request_without_login,
          updated_by: user?.id
        });

      if (toggleError) throw toggleError;

      toast.success('Settings updated successfully');
      await loadAdminData();
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    }
  };

  const approveQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('custom_quotes')
        .update({
          status: 'sent',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (error) throw error;

      toast.success('Quote approved and sent to client');
      await loadAdminData();
    } catch (error) {
      console.error('Error approving quote:', error);
      toast.error('Failed to approve quote');
    }
  };

  const holdQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('custom_quotes')
        .update({ status: 'on_hold' })
        .eq('id', quoteId);

      if (error) throw error;

      toast.success('Quote placed on hold');
      await loadAdminData();
    } catch (error) {
      console.error('Error holding quote:', error);
      toast.error('Failed to hold quote');
    }
  };

  const approveDeliverable = async (deliverableId: string) => {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', deliverableId);

      if (error) throw error;

      toast.success('Deliverable approved');
      await loadAdminData();
    } catch (error) {
      console.error('Error approving deliverable:', error);
      toast.error('Failed to approve deliverable');
    }
  };

  const requestRevision = async (deliverableId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .update({
          status: 'revision_requested',
          rejection_reason: reason
        })
        .eq('id', deliverableId);

      if (error) throw error;

      toast.success('Revision requested');
      await loadAdminData();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('Failed to request revision');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have admin permissions to access this dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform oversight and compliance management</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.activeProjects}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingQuotes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">QA Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.pendingDeliverables}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(stats.totalRevenue / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quote Reviews
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              QA Queue
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quotes">
            <Card>
              <CardHeader>
                <CardTitle>Quotes Requiring Review</CardTitle>
                <CardDescription>
                  High-value quotes above the approval threshold requiring admin review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quotesForReview.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No quotes pending review</p>
                ) : (
                  <div className="space-y-4">
                    {quotesForReview.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{quote.project_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quote.quote_number} • £{(quote.total_amount / 100).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => holdQuote(quote.id)}
                          >
                            Hold
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveQuote(quote.id)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliverables">
            <Card>
              <CardHeader>
                <CardTitle>Deliverables for QA Review</CardTitle>
                <CardDescription>
                  Submitted deliverables awaiting quality assurance approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deliverablesForQA.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No deliverables in QA queue</p>
                ) : (
                  <div className="space-y-4">
                    {deliverablesForQA.map((deliverable) => (
                      <div key={deliverable.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{deliverable.title}</h3>
                          <Badge variant="secondary">
                            {deliverable.deliverable_files.length} file(s)
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Project: {deliverable.projects?.title} • 
                          Submitted: {new Date(deliverable.submitted_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reason = prompt('Enter revision reason:');
                              if (reason) requestRevision(deliverable.id, reason);
                            }}
                          >
                            Request Revision
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveDeliverable(deliverable.id)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Overview of all platform projects and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.currency === 'GBP' ? '£' : '$'}{(project.total_price / 100).toLocaleString()} • 
                          {project.project_participants.map(p => p.profiles?.full_name).filter(Boolean).join(', ')}
                        </p>
                      </div>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>
                  Configure platform thresholds and approval workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Quote Approval Threshold (£)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="threshold"
                      type="number"
                      value={settings.quote_approval_threshold?.amount || 5000}
                      onChange={(e) => 
                        setSettings({
                          ...settings,
                          quote_approval_threshold: {
                            ...settings.quote_approval_threshold,
                            amount: parseInt(e.target.value)
                          }
                        })
                      }
                      className="w-32"
                    />
                    <Button onClick={updateSettings}>
                      Update Settings
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Quotes above this amount require admin approval before being sent to clients.
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

export default AdminDashboard;