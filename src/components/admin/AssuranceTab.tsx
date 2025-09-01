import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  PoundSterling,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssurancePlan {
  id: string;
  project_id: string;
  stripe_subscription_id: string;
  plan_type: 'bronze' | 'silver' | 'gold';
  monthly_price: number;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  next_billing_date?: string;
  project: {
    title: string;
    teamsmith_user_id: string;
    total_price: number;
  };
}

interface AssuranceTabProps {
  className?: string;
}

export function AssuranceTab({ className }: AssuranceTabProps) {
  const [assurancePlans, setAssurancePlans] = useState<AssurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    plan_type: 'all',
    search: '',
  });
  const [selectedPlan, setSelectedPlan] = useState<AssurancePlan | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAssurancePlans();
  }, [filters]);

  const loadAssurancePlans = async () => {
    setLoading(true);
    try {
      // For demo purposes, using projects table with mock assurance data
      let query = supabase
        .from('projects')
        .select(`
          id,
          title,
          teamsmith_user_id,
          total_price,
          status,
          created_at
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Mock assurance plans from completed projects
      const mockPlans: AssurancePlan[] = (data || []).map(project => ({
        id: `assurance_${project.id}`,
        project_id: project.id,
        stripe_subscription_id: `sub_${Math.random().toString(36).substring(7)}`,
        plan_type: Math.random() > 0.6 ? 'gold' : Math.random() > 0.3 ? 'silver' : 'bronze',
        monthly_price: Math.floor((project.total_price || 0) * 0.12), // 12% of project value
        status: Math.random() > 0.2 ? 'active' : Math.random() > 0.5 ? 'cancelled' : 'expired',
        started_at: project.created_at,
        project: {
          title: project.title,
          teamsmith_user_id: project.teamsmith_user_id,
          total_price: project.total_price || 0,
        }
      })) as AssurancePlan[];

      // Apply filters
      let filteredPlans = mockPlans;
      if (filters.status !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.status === filters.status);
      }
      if (filters.plan_type !== 'all') {
        filteredPlans = filteredPlans.filter(plan => plan.plan_type === filters.plan_type);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPlans = filteredPlans.filter(plan => 
          plan.project?.title?.toLowerCase().includes(searchLower) ||
          plan.stripe_subscription_id?.toLowerCase().includes(searchLower)
        );
      }

      setAssurancePlans(filteredPlans);
    } catch (error) {
      console.error('Error loading assurance plans:', error);
      toast({
        title: "Error loading assurance plans",
        description: "Failed to load assurance plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const reactivateAssurance = async (planId: string) => {
    try {
      const { error } = await supabase.functions.invoke('reactivate-assurance', {
        body: { plan_id: planId },
      });

      if (error) throw error;

      toast({
        title: "Assurance Reactivated",
        description: "Assurance plan has been reactivated successfully.",
      });

      loadAssurancePlans();
    } catch (error) {
      console.error('Error reactivating assurance:', error);  
      toast({
        title: "Error",
        description: "Failed to reactivate assurance plan.",
        variant: "destructive",
      });
    }
  };

  const cancelAssurance = async (planId: string) => {
    try {
      const { error } = await supabase.functions.invoke('cancel-assurance', {
        body: { plan_id: planId },
      });

      if (error) throw error;

      toast({
        title: "Assurance Cancelled",
        description: "Assurance plan has been cancelled.",
      });

      loadAssurancePlans();
    } catch (error) {
      console.error('Error cancelling assurance:', error);
      toast({
        title: "Error", 
        description: "Failed to cancel assurance plan.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'past_due':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    const colors = {
      bronze: 'bg-amber-100 text-amber-800',
      silver: 'bg-gray-100 text-gray-800', 
      gold: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <Badge className={colors[planType as keyof typeof colors] || 'bg-gray-100'}>
        <Shield className="h-3 w-3 mr-1" />
        {planType.charAt(0).toUpperCase() + planType.slice(1)}
      </Badge>
    );
  };

  const openDetailModal = (plan: AssurancePlan) => {
    setSelectedPlan(plan);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount / 100);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Assurance Management
          </CardTitle>
          <div className="flex gap-4 items-center">
            <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.plan_type} onValueChange={(value) => setFilters({...filters, plan_type: value})}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assurance plans...</div>
          ) : assurancePlans.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No assurance plans found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assurancePlans.map((plan) => (
                <Card key={plan.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {plan.project?.title || 'Unknown Project'}
                          </span>
                          {getPlanBadge(plan.plan_type)}
                          {getStatusBadge(plan.status)}
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <PoundSterling className="h-4 w-4" />
                            <span>{formatCurrency(plan.monthly_price)}/month</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Started: {new Date(plan.started_at).toLocaleDateString()}</span>
                          </div>

                          {plan.next_billing_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Next billing: {new Date(plan.next_billing_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-sm">
                          <span className="font-medium">Project Value:</span> {formatCurrency(plan.project?.total_price || 0)}
                          {plan.expires_at && (
                            <>
                              <span className="ml-4 font-medium">Expires:</span> {new Date(plan.expires_at).toLocaleDateString()}
                            </>
                          )}
                        </div>

                        {plan.cancelled_at && (
                          <div className="text-sm text-destructive">
                            <span className="font-medium">Cancelled:</span> {new Date(plan.cancelled_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(plan)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Details
                        </Button>

                        {plan.stripe_subscription_id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(
                              `https://dashboard.stripe.com/subscriptions/${plan.stripe_subscription_id}`,
                              '_blank'
                            )}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Stripe
                          </Button>
                        )}

                        {plan.status === 'cancelled' && (
                          <Button
                            size="sm"
                            onClick={() => reactivateAssurance(plan.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reactivate
                          </Button>
                        )}

                        {plan.status === 'active' && (
                          <Button
                            variant="destructive"
                            size="sm" 
                            onClick={() => cancelAssurance(plan.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
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

      {/* Assurance Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Assurance Plan Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Plan Information</h4>
                  <p><strong>Project:</strong> {selectedPlan.project?.title}</p>
                  <p><strong>Plan Type:</strong> {getPlanBadge(selectedPlan.plan_type)}</p>
                  <p><strong>Monthly Price:</strong> {formatCurrency(selectedPlan.monthly_price)}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedPlan.status)}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Billing Information</h4>
                  <p><strong>Started:</strong> {new Date(selectedPlan.started_at).toLocaleDateString()}</p>
                  {selectedPlan.next_billing_date && (
                    <p><strong>Next Billing:</strong> {new Date(selectedPlan.next_billing_date).toLocaleDateString()}</p>
                  )}
                  {selectedPlan.expires_at && (
                    <p><strong>Expires:</strong> {new Date(selectedPlan.expires_at).toLocaleDateString()}</p>
                  )}
                  {selectedPlan.cancelled_at && (
                    <p><strong>Cancelled:</strong> {new Date(selectedPlan.cancelled_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* Plan Benefits */}
              <div>
                <h4 className="font-medium mb-2">Plan Benefits</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <Shield className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-sm font-medium">Outcome Guarantee</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.plan_type === 'gold' ? '100%' : selectedPlan.plan_type === 'silver' ? '90%' : '80%'} coverage
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <User className="h-6 w-6 mx-auto mb-2 text-info" />
                    <p className="text-sm font-medium">Expert Support</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.plan_type === 'gold' ? '24/7' : selectedPlan.plan_type === 'silver' ? 'Business hours' : 'Email'} support
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <RefreshCw className="h-6 w-6 mx-auto mb-2 text-warning" />
                    <p className="text-sm font-medium">Revisions</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPlan.plan_type === 'gold' ? 'Unlimited' : selectedPlan.plan_type === 'silver' ? '5 free' : '2 free'} revisions
                    </p>
                  </div>
                </div>
              </div>

              {/* Stripe Information */}
              {selectedPlan.stripe_subscription_id && (
                <div>
                  <h4 className="font-medium mb-2">Stripe Information</h4>
                  <p className="text-sm text-muted-foreground">
                    <strong>Subscription ID:</strong> {selectedPlan.stripe_subscription_id}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(
                      `https://dashboard.stripe.com/subscriptions/${selectedPlan.stripe_subscription_id}`,
                      '_blank'
                    )}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View in Stripe Dashboard
                  </Button>
                </div>
              )}

              {/* Admin Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedPlan.status === 'cancelled' && (
                  <Button
                    onClick={() => {
                      reactivateAssurance(selectedPlan.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate Plan
                  </Button>
                )}

                {selectedPlan.status === 'active' && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      cancelAssurance(selectedPlan.id);
                      setShowDetailModal(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Plan
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}