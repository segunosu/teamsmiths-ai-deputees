import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, FolderOpen, Clock, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { BriefsDashboard } from '@/components/BriefsDashboard';

interface Project {
  id: string;
  title: string;
  status: string;
  total_price: number;
  currency: string;
  created_at: string;
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  product_id: string;
  created_at: string;
}


interface CustomQuote {
  id: string;
  quote_number: string;
  project_title: string;
  total_amount: number;
  status: string;
  expires_at: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard - Teamsmiths';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Manage your projects and track progress on Teamsmiths');
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const checkUserTypeAndFetchData = async () => {
      try {
        // First check if user is a freelancer
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.user_type === 'freelancer') {
          navigate('/freelancer-dashboard');
          return;
        }
        
        // Fetch user's projects using secure RPC to prevent parsing issues
        const { data: projectsData, error: projectsError } = await supabase
          .rpc('get_projects_for_user', { _uid: user.id });

        if (projectsError) throw projectsError;

        // Fetch user's orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;


        // Fetch user's custom quotes
        const { data: quotesData, error: quotesError } = await supabase
          .from('custom_quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quotesError) throw quotesError;

        setProjects(projectsData || []);
        setOrders(ordersData || []);
        setCustomQuotes(quotesData || []);
      } catch (error: any) {
        toast({
          title: 'Error loading dashboard',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkUserTypeAndFetchData();
  }, [user, toast, navigate]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      // Project statuses
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-primary text-primary-foreground',
      completed: 'bg-success text-success-foreground',
      cancelled: 'bg-destructive text-destructive-foreground',
      // Customization request statuses
      new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      reviewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      quoted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
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
            <CardDescription>Please sign in to view your dashboard.</CardDescription>
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <div>
              <h1 className="text-3xl font-bold">Client Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Quotes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customQuotes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <BriefsDashboard />
        </div>
        
        <Tabs defaultValue="projects" className="space-y-6">
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="briefs">Your Requests</TabsTrigger>
            </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Your Projects</h2>
              <Button asChild>
                <Link to="/catalog">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Link>
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Purchase your first outcome pack to get started.
                    </p>
                    <Button asChild>
                      <Link to="/catalog">Browse Packs</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>
                            Created {new Date(project.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(project.status)}
                          <span className="font-semibold">
                            {formatPrice(project.total_price, project.currency)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button asChild size="sm">
                          <Link to={`/project/${project.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Order History</h2>
            </div>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your purchase history will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatPrice(order.amount, order.currency)}
                          </p>
                          <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                            {order.status || 'completed'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Custom Quotes</h2>
            </div>

            {customQuotes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Custom quotes will appear here after we review your customization requests.
                    </p>
                    <Button asChild>
                      <Link to="/brief-builder">+ New Request</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {customQuotes.map((quote) => {
                  const isExpired = new Date(quote.expires_at) < new Date();
                  return (
                    <Card key={quote.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{quote.project_title}</CardTitle>
                            <CardDescription>
                              Quote #{quote.quote_number}
                            </CardDescription>
                            <CardDescription>
                              Created {new Date(quote.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary mb-2">
                              £{(quote.total_amount / 100).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(quote.status)}
                              {isExpired && <Badge variant="destructive">EXPIRED</Badge>}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            Expires: {new Date(quote.expires_at).toLocaleDateString()}
                          </div>
                          <Button asChild>
                            <Link to={`/quote/${quote.id}`}>
                              {quote.status === 'sent' ? 'Review Quote' : 'View Details'}
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="briefs">
            <BriefsDashboard />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;