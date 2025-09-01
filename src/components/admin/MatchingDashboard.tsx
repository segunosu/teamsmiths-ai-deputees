import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminMatchingSettings from './AdminMatchingSettings';
import { 
  RefreshCw,
  Send,
  Eye,
  Zap,
  History,
  Play,
  Pause,
  Bot,
  XCircle
} from 'lucide-react';

interface BriefRequest {
  brief_id: string;
  project_title: string;
  status: string;
  created_at: string;
  contact_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  budget_range: string;
  timeline_preference: string;
  urgency_level: string;
  candidate_count: number;
  matching_results: any;
  matched_at: string | null;
  assured_mode: boolean;
  origin: string;
  origin_id: string | null;
  structured_brief: any;
  proposal_json: any;
  updated_at: string;
}

interface MatchingResults {
  candidates: Array<{
    expert_user_id: string;
    score: number;
    reasons?: string[];
    flags?: string[];
    profile: any;
  }>;
  matched_at?: string;
}

const MatchingDashboard = () => {
  const { toast } = useToast();
  const [briefRequests, setBriefRequests] = useState<BriefRequest[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null);
  const [matchingResults, setMatchingResults] = useState<MatchingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [minScore, setMinScore] = useState(0.65);
  const [maxInvites, setMaxInvites] = useState(5);
  const [expertSearch, setExpertSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [autopilotHistory, setAutopilotHistory] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadAutopilotSettings();
    loadAutopilotHistory();
  }, []);

  const loadAutopilotSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'autopilot_enabled')
        .single();
      
      setAutopilotEnabled(data?.setting_value === true);
    } catch (error) {
      console.error('Error loading autopilot settings:', error);
    }
  };

  const loadAutopilotHistory = async () => {
    try {
      const { data }: { data: any } = await supabase
        .from('matching_runs')
        .select('*')
        .eq('algorithm_version', 'autopilot-v1')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setAutopilotHistory(data || []);
    } catch (error) {
      console.error('Error loading autopilot history:', error);
    }
  };

  const toggleAutopilot = async () => {
    try {
      const newState = !autopilotEnabled;
      
      await supabase.functions.invoke('admin-update-matching-settings', {
        body: { autopilot_enabled: newState }
      });

      setAutopilotEnabled(newState);
      
      toast({
        title: `Autopilot ${newState ? 'Enabled' : 'Disabled'}`,
        description: `Automated matching is now ${newState ? 'active' : 'paused'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error updating autopilot',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const runAutopilotManually = async () => {
    setComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-match-pending-briefs', {
        body: { scheduled: false, manual_override: true }
      });

      if (error) throw error;

      toast({
        title: 'Manual Autopilot Complete',
        description: `Processed ${data.processed} briefs, sent ${data.invitations_sent} invitations`,
      });

      await loadData();
      await loadAutopilotHistory();
    } catch (error: any) {
      toast({
        title: 'Error running autopilot',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setComputing(false);
    }
  };

  const loadData = async () => {
    try {
      const { data: briefsData, error: briefsError } = await supabase
        .rpc('admin_list_briefs', {
          p_statuses: ['submitted', 'proposal_ready', 'qa_in_review'],
          p_limit: 50,
          p_offset: 0,
          p_order: 'created_at.desc'
        });

      if (briefsError) throw briefsError;
      setBriefRequests(briefsData || []);

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

  const computeMatching = async (briefId: string) => {
    setComputing(true);
    try {
      const { data, error } = await supabase.functions.invoke('compute-matches', {
        body: { 
          brief_id: briefId, 
          min_score: minScore,
          max_results: maxInvites + 2
        }
      });

      if (error) throw error;

      if (data?.ok && data.candidates) {
        setMatchingResults({ candidates: data.candidates });
        toast({
          title: "Matching Complete",
          description: `Found ${data.candidates.length} eligible candidates`,
        });
      } else {
        throw new Error(data?.message || "Matching failed");
      }
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

  const sendInvitations = async (userIds?: string[]) => {
    if (!selectedBrief || (!userIds && !matchingResults?.candidates)) return;
    
    setInviting(true);
    
    try {
      const targetUserIds = userIds || matchingResults.candidates
        .filter(c => c.score >= minScore)
        .slice(0, maxInvites)
        .map(c => c.expert_user_id);

      if (targetUserIds.length === 0) {
        toast({
          title: "No Eligible Candidates",
          description: "No experts meet the current threshold. Try lowering the minimum score.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('send-invitations', {
        body: {
          brief_id: selectedBrief,
          candidate_ids: targetUserIds,
          max_invites: maxInvites
        }
      });

      if (error) throw error;

      toast({
        title: data.sent > 0 ? 'Invitations sent' : 'No invitations sent',
        description: data.sent > 0 ? `Sent ${data.sent} invitations successfully.` : 'All eligible experts already invited.',
        variant: data.sent > 0 ? 'default' : 'destructive'
      });
      
      await loadData();
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

  const searchExperts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('admin_list_experts', {
        p_q: query,
        p_limit: 10,
        p_offset: 0
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      toast({
        title: 'Error searching experts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addExpertManually = (expert: any) => {
    const newCandidate = {
      expert_user_id: expert.expert_id,
      score: 0.95,
      reasons: ['Manually selected by admin'],
      flags: ['Manual addition'],
      profile: {
        full_name: expert.full_name,
        email: 'hidden@privacy.com',
        skills: expert.skills,
        tools: expert.tools,
        price_range: `£${Math.floor((expert.price_band_min || 0)/100)}-${Math.floor((expert.price_band_max || 0)/100)}`,
        availability: `${expert.availability_weekly_hours || 0}h/week`
      }
    };

    setMatchingResults(prev => {
      if (!prev) {
        return { candidates: [newCandidate] };
      }
      
      if (prev.candidates.some(c => c.expert_user_id === expert.expert_id)) {
        toast({
          title: 'Expert already added',
          description: 'This expert is already in the shortlist',
          variant: 'destructive'
        });
        return prev;
      }

      return {
        ...prev,
        candidates: [newCandidate, ...prev.candidates]
      };
    });

    setExpertSearch('');
    setSearchResults([]);
    
    toast({
      title: 'Expert added',
      description: `${expert.full_name} has been manually added to the shortlist`,
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
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <div>
            <h2 className="text-2xl font-bold">Autopilot Matching Dashboard</h2>
            <p className="text-muted-foreground">AI-first matching with manual overrides • {autopilotEnabled ? '🟢 Active' : '🔴 Paused'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={autopilotEnabled ? 'default' : 'secondary'} className="gap-1">
            {autopilotEnabled ? <Bot className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {autopilotEnabled ? 'Autopilot Active' : 'Manual Mode'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutopilot}
            className="gap-2"
          >
            {autopilotEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {autopilotEnabled ? 'Pause' : 'Enable'} Autopilot
          </Button>
        </div>
      </div>

      <Tabs defaultValue="matching" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matching">Active Matching</TabsTrigger>
          <TabsTrigger value="autopilot">Autopilot History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="matching">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Briefs List */}
            <div className="lg:w-1/2">
              <Card>
                <CardHeader>
                  <CardTitle>Brief Requests ({briefRequests.length})</CardTitle>
                  <CardDescription>Catalog purchases and custom briefs</CardDescription>
                </CardHeader>
                <CardContent>
                  {briefRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No briefs ready for matching</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {briefRequests.map((brief) => (
                        <div
                          key={brief.brief_id}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedBrief === brief.brief_id
                              ? 'bg-primary/10 border border-primary'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          onClick={() => setSelectedBrief(brief.brief_id)}
                        >
                          <h4 className="font-medium truncate">{brief.project_title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {brief.budget_range} • {brief.timeline_preference}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {brief.origin === 'catalog' ? 'Pack' : 'Custom'}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{brief.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Brief Details & Matching */}
            <div className="lg:w-1/2">
              {!selectedBrief ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Brief Details & AI Matching</CardTitle>
                    <CardDescription>Select a brief to view details and compute matches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                      Select a brief from the list to view details and manage expert matching
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Brief Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Brief Details
                        <Badge variant="secondary">
                          {briefRequests.find(b => b.brief_id === selectedBrief)?.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const brief = briefRequests.find(b => b.brief_id === selectedBrief);
                        if (!brief) return null;
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground">PROJECT TITLE</h4>
                              <p className="font-medium">{brief.project_title}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">CONTACT</h4>
                                <p className="text-sm">{brief.contact_name || 'Not provided'}</p>
                                <p className="text-sm text-muted-foreground">{brief.contact_email}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground">BUDGET & TIMELINE</h4>
                                <p className="text-sm">{brief.budget_range}</p>
                                <p className="text-sm text-muted-foreground">{brief.timeline_preference}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {brief.origin === 'catalog' ? 'Outcome Pack' : 'Custom Request'}
                              </Badge>
                              <Badge variant={brief.urgency_level === 'urgent' ? 'destructive' : 'secondary'} className="text-xs">
                                {brief.urgency_level}
                              </Badge>
                              {brief.assured_mode && (
                                <Badge variant="default" className="text-xs">Assured</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Matching Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Matching Controls</CardTitle>
                      <CardDescription>Configure matching parameters and compute results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Controls */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Min Score: {minScore}</Label>
                            <input 
                              type="range" 
                              min="0.1" 
                              max="1" 
                              step="0.05"
                              value={minScore}
                              onChange={(e) => setMinScore(parseFloat(e.target.value))}
                              className="w-full mt-1"
                            />
                          </div>
                          <div>
                            <Label>Max Invites: {maxInvites}</Label>
                            <input 
                              type="range" 
                              min="1" 
                              max="10"
                              value={maxInvites}
                              onChange={(e) => setMaxInvites(parseInt(e.target.value))}
                              className="w-full mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button onClick={() => computeMatching(selectedBrief)} disabled={computing}>
                            {computing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                            Compute Matches
                          </Button>
                          <Button variant="outline" onClick={() => sendInvitations()} disabled={inviting || !matchingResults}>
                            <Send className="h-4 w-4 mr-2" />
                            Send All
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={runAutopilotManually}
                            disabled={computing}
                            className="gap-2"
                          >
                            <Zap className="h-4 w-4" />
                            Run Autopilot
                          </Button>
                        </div>

                        {/* No Candidates Warning */}
                        {matchingResults && matchingResults.candidates.filter(c => c.score >= minScore).length === 0 && (
                          <Alert>
                            <AlertDescription>
                              No experts meet threshold ≥{minScore}. 
                              <Button variant="link" onClick={() => setMinScore(0.1)} className="p-0 h-auto ml-1">
                                Try minimum (0.1)
                              </Button>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Manual Expert Addition */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Manual Expert Addition</CardTitle>
                      <CardDescription>Search and manually add experts to the shortlist</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search experts by name or skills..."
                            value={expertSearch}
                            onChange={(e) => {
                              setExpertSearch(e.target.value);
                              if (e.target.value.length >= 2) {
                                searchExperts(e.target.value);
                              } else {
                                setSearchResults([]);
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={() => searchExperts(expertSearch)}
                            disabled={isSearching}
                          >
                            {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>

                        {searchResults.length > 0 && (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {searchResults.map((expert) => (
                              <div key={expert.expert_id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex-1">
                                  <p className="font-medium">{expert.full_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {expert.skills?.slice(0, 3).join(', ')} • 
                                    £{Math.floor((expert.price_band_min || 0)/100)}-{Math.floor((expert.price_band_max || 0)/100)}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addExpertManually(expert)}
                                >
                                  Add
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {expertSearch && searchResults.length === 0 && !isSearching && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No experts found for "{expertSearch}"
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Matching Results */}
                  {matchingResults && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Matched Experts 
                          <Badge variant="outline">
                            {matchingResults.candidates.filter(c => c.score >= minScore).length} eligible
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          AI-computed expert matches with manual override capability
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {matchingResults.candidates
                            .filter(c => c.score >= minScore)
                            .map((candidate, index) => (
                            <div key={candidate.expert_user_id} className="border rounded p-3 hover:bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium">{candidate.profile?.full_name || 'Expert'}</p>
                                    <Badge variant="outline" className="text-xs">
                                      {(candidate.score * 100).toFixed(0)}%
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {candidate.profile?.price_range} • {candidate.profile?.availability}
                                  </p>
                                  {candidate.reasons && candidate.reasons.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                      {candidate.reasons.slice(0, 2).join(' • ')}
                                    </p>
                                  )}
                                  {candidate.flags && candidate.flags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {candidate.flags.map((flag, i) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {flag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => sendInvitations([candidate.expert_user_id])}
                                    disabled={inviting}
                                  >
                                    Invite
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => {
                                      setMatchingResults(prev => prev ? {
                                        ...prev,
                                        candidates: prev.candidates.filter(c => c.expert_user_id !== candidate.expert_user_id)
                                      } : null);
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {matchingResults.candidates.filter(c => c.score >= minScore).length === 0 && (
                            <p className="text-center text-muted-foreground py-4">
                              No experts meet the current threshold
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="autopilot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Autopilot History
              </CardTitle>
              <CardDescription>Recent automated matching runs and results</CardDescription>
            </CardHeader>
            <CardContent>
              {autopilotHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No autopilot runs recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {autopilotHistory.map((run) => (
                    <div 
                      key={run.id} 
                      className="border rounded-lg p-4 bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {new Date(run.created_at).toLocaleString()}
                          </Badge>
                          <Badge variant={run.metadata?.matched > 0 ? 'default' : 'secondary'} className="text-xs">
                            {run.metadata?.matched || 0} matched
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {run.execution_time_ms}ms
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Processed</p>
                          <p className="text-muted-foreground">{run.metadata?.processed || 0} briefs</p>
                        </div>
                        <div>
                          <p className="font-medium">Invitations</p>
                          <p className="text-muted-foreground">{run.metadata?.invitations_sent || 0} sent</p>
                        </div>
                        <div>
                          <p className="font-medium">Parameters</p>
                          <p className="text-muted-foreground">
                            Score: {run.parameters?.min_score || 0.65}, 
                            Max: {run.parameters?.max_invites || 5}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <AdminMatchingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchingDashboard;