import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Settings, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Send,
  Eye
} from 'lucide-react';

interface MatchingWeights {
  skills: number;
  domain: number;
  outcomes: number;
  availability: number;
  locale: number;
  price: number;
  vetting: number;
  history: number;
}

interface MatchingConfig {
  matching_weights: MatchingWeights;
  shortlist_size_default: number;
  invite_response_sla_hours: number;
  max_quotes_per_request: number;
  min_quotes_before_presenting: number;
  sensitive_single_provider_only: boolean;
  conflict_window_days: number;
}

interface CustomizationRequest {
  id: string;
  project_title: string;
  status: string;
  created_at: string;
  user_id: string;
  custom_requirements: string;
  budget_range: string;
  timeline_preference: string;
}

interface MatchingSnapshot {
  id: string;
  request_id: string;
  candidates: Array<{
    user_id: string;
    score: number;
    breakdown: any;
    profile: any;
  }>;
  created_at: string;
}

const MatchingDashboard = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<MatchingConfig | null>(null);
  const [requests, setRequests] = useState<CustomizationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [matchingSnapshot, setMatchingSnapshot] = useState<MatchingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load matching configuration from individual admin settings
      const { data: adminSettings, error: configError } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'matching_weights',
          'shortlist_size_default',
          'max_quotes_per_request',
          'min_quotes_before_presenting',
          'invite_response_sla_hours',
          'conflict_window_days',
          'sensitive_single_provider_only'
        ]);

      if (configError) throw configError;

      const settingsMap = adminSettings?.reduce((acc, item) => {
        acc[item.setting_key] = item.setting_value;
        return acc;
      }, {} as Record<string, any>) || {};

      const loadedConfig: MatchingConfig = {
        matching_weights: settingsMap.matching_weights || {
          skills: 0.25,
          domain: 0.15,
          outcomes: 0.20,
          availability: 0.15,
          locale: 0.05,
          price: 0.10,
          vetting: 0.07,
          history: 0.03
        },
        shortlist_size_default: settingsMap.shortlist_size_default?.value || 3,
        max_quotes_per_request: settingsMap.max_quotes_per_request?.value || 3,
        min_quotes_before_presenting: settingsMap.min_quotes_before_presenting?.value || 2,
        invite_response_sla_hours: settingsMap.invite_response_sla_hours?.value || 24,
        conflict_window_days: settingsMap.conflict_window_days?.value || 60,
        sensitive_single_provider_only: settingsMap.sensitive_single_provider_only?.enabled || false
      };

      setConfig(loadedConfig);

      // Load recent customization requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('customization_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);

    } catch (error: any) {
      toast({
        title: 'Error loading matching dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async () => {
    if (!config) return;

    try {
      // Update each setting individually
      const updates = [
        { key: 'matching_weights', value: config.matching_weights },
        { key: 'shortlist_size_default', value: { value: config.shortlist_size_default } },
        { key: 'max_quotes_per_request', value: { value: config.max_quotes_per_request } },
        { key: 'min_quotes_before_presenting', value: { value: config.min_quotes_before_presenting } },
        { key: 'invite_response_sla_hours', value: { value: config.invite_response_sla_hours } },
        { key: 'conflict_window_days', value: { value: config.conflict_window_days } },
        { key: 'sensitive_single_provider_only', value: { enabled: config.sensitive_single_provider_only } }
      ];

      for (const update of updates) {
        const { error } = await supabase.rpc('update_admin_setting', {
          p_key: update.key,
          p_value: update.value as any
        });

        if (error) throw error;
      }

      toast({
        title: 'Configuration updated',
        description: 'Matching settings have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating configuration',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const computeMatching = async (requestId: string, forceRecompute = false) => {
    setComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke('compute-matching', {
        body: { request_id: requestId, force_recompute: forceRecompute }
      });

      if (error) throw error;

      toast({
        title: 'Matching computed',
        description: data.message,
      });

      await loadMatchingSnapshot(requestId);
    } catch (error: any) {
      toast({
        title: 'Error computing matches',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setComputing(false);
    }
  };

  const loadMatchingSnapshot = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('matching_snapshots')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setMatchingSnapshot(data ? {
        ...data,
        candidates: Array.isArray(data.candidates) ? data.candidates as any[] : []
      } : null);
    } catch (error: any) {
      console.error('Error loading snapshot:', error);
    }
  };

  const sendInvitations = async (userIds: string[]) => {
    if (!selectedRequest) return;

    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'send_invites',
          request_id: selectedRequest,
          user_ids: userIds
        }
      });

      if (error) throw error;

      toast({
        title: 'Invitations sent',
        description: `Sent ${data.invitations_sent} invitations successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error sending invitations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  const updateWeight = (key: keyof MatchingWeights, value: number[]) => {
    if (!config) return;
    setConfig({
      ...config,
      matching_weights: {
        ...config.matching_weights,
        [key]: value[0]
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading matching dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Matching Dashboard</h2>
          <p className="text-muted-foreground">
            Manage automated freelancer matching and invitations
          </p>
        </div>
        <Button onClick={updateConfig} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Active Requests</TabsTrigger>
          <TabsTrigger value="settings">Matching Rules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requests List */}
            <Card>
              <CardHeader>
                <CardTitle>Customization Requests</CardTitle>
                <CardDescription>
                  Select a request to view matching candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedRequest === request.id
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    onClick={() => {
                      setSelectedRequest(request.id);
                      loadMatchingSnapshot(request.id);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{request.project_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.budget_range} • {request.timeline_preference}
                        </p>
                      </div>
                      <Badge variant={request.status === 'new' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Matching Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Matching Results
                  {selectedRequest && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => computeMatching(selectedRequest, true)}
                      disabled={computing}
                    >
                      {computing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        'Recompute'
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedRequest ? (
                  <p className="text-muted-foreground text-center py-8">
                    Select a request to view candidates
                  </p>
                ) : !matchingSnapshot ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No matching results yet
                    </p>
                    <Button
                      onClick={() => computeMatching(selectedRequest)}
                      disabled={computing}
                    >
                      {computing ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <TrendingUp className="h-4 w-4 mr-2" />
                      )}
                      Compute Matches
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchingSnapshot.candidates.map((candidate, index) => (
                      <div key={candidate.user_id} className="border rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{candidate.profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.profile.skills.slice(0, 3).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">
                              {(candidate.score * 100).toFixed(0)}%
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {candidate.profile.price_range}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>Skills: {(candidate.breakdown.skills * 100).toFixed(0)}%</div>
                          <div>Domain: {(candidate.breakdown.domain * 100).toFixed(0)}%</div>
                          <div>Track: {(candidate.breakdown.outcomes * 100).toFixed(0)}%</div>
                          <div>Avail: {(candidate.breakdown.availability * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => sendInvitations(matchingSnapshot.candidates.map(c => c.user_id))}
                        disabled={inviting}
                        className="flex-1"
                      >
                        {inviting ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send All Invitations
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {config && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Matching Weights</CardTitle>
                  <CardDescription>
                    Adjust the importance of each matching signal (must sum to 1.0)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(config.matching_weights).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="capitalize">{key.replace('_', ' ')}</Label>
                        <span className="text-sm text-muted-foreground">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Slider
                        value={[value]}
                        onValueChange={(val) => updateWeight(key as keyof MatchingWeights, val)}
                        max={1}
                        min={0}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                  ))}
                  
                  <Alert>
                    <AlertDescription>
                      Current total: {Object.values(config.matching_weights).reduce((a, b) => a + b, 0).toFixed(2)}
                      {Object.values(config.matching_weights).reduce((a, b) => a + b, 0) !== 1 && 
                        " (should equal 1.0)"
                      }
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Settings</CardTitle>
                  <CardDescription>
                    Configure invitation and quote management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Shortlist Size</Label>
                    <Input
                      type="number"
                      value={config.shortlist_size_default}
                      onChange={(e) => setConfig({
                        ...config,
                        shortlist_size_default: parseInt(e.target.value) || 3
                      })}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Invitation Response SLA (hours)</Label>
                    <Input
                      type="number"
                      value={config.invite_response_sla_hours}
                      onChange={(e) => setConfig({
                        ...config,
                        invite_response_sla_hours: parseInt(e.target.value) || 24
                      })}
                      min={1}
                      max={168}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Quotes Per Request</Label>
                    <Input
                      type="number"
                      value={config.max_quotes_per_request}
                      onChange={(e) => setConfig({
                        ...config,
                        max_quotes_per_request: parseInt(e.target.value) || 3
                      })}
                      min={1}
                      max={10}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Quotes Before Presenting</Label>
                    <Input
                      type="number"
                      value={config.min_quotes_before_presenting}
                      onChange={(e) => setConfig({
                        ...config,
                        min_quotes_before_presenting: parseInt(e.target.value) || 2
                      })}
                      min={1}
                      max={config.max_quotes_per_request}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Conflict Window (days)</Label>
                    <Input
                      type="number"
                      value={config.conflict_window_days}
                      onChange={(e) => setConfig({
                        ...config,
                        conflict_window_days: parseInt(e.target.value) || 60
                      })}
                      min={1}
                      max={365}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sensitive-single">Sensitive projects require single provider</Label>
                      <p className="text-sm text-muted-foreground">
                        Restrict sensitive projects to one provider only
                      </p>
                    </div>
                    <Switch
                      id="sensitive-single"
                      checked={config.sensitive_single_provider_only}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        sensitive_single_provider_only: checked
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Matching Performance</CardTitle>
              <CardDescription>
                Key metrics for the automated matching system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">87%</div>
                  <p className="text-sm text-muted-foreground">Fill Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">18h</div>
                  <p className="text-sm text-muted-foreground">Avg Time to First Quote</p>
                </div>
                <div className="text-2xl font-bold text-primary text-center">
                  <div className="text-2xl font-bold text-primary">3.2</div>
                  <p className="text-sm text-muted-foreground">Avg Quotes per Request</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.6/5</div>
                  <p className="text-sm text-muted-foreground">Match Quality Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchingDashboard;