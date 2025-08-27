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
    reasons?: Array<{ label: string; value: string }>;
    red_flags?: string[];
    profile: any;
  }>;
  matched_at?: string;
}

const MatchingDashboard = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<MatchingConfig | null>(null);
  const [briefRequests, setBriefRequests] = useState<BriefRequest[]>([]);
  const [selectedBrief, setSelectedBrief] = useState<string | null>(null);
  const [matchingResults, setMatchingResults] = useState<MatchingResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [minScore, setMinScore] = useState(0.65);
  const [maxInvites, setMaxInvites] = useState(5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load submitted briefs ready for matching using secure admin RPC
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
        <div>
          <h2 className="text-2xl font-bold">AI Matching Dashboard</h2>
          <p className="text-muted-foreground">Unified brief queue with AI-first matching</p>
        </div>
      </div>

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
        
        {/* Matching Results */}
        <div className="lg:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Deputee™ AI Matching</CardTitle>
              <CardDescription>AI-powered expert matching with thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedBrief ? (
                <p className="text-muted-foreground text-center py-8">
                  Select a brief to view AI matching
                </p>
              ) : (
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
                        className="w-full"
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
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => computeMatching(selectedBrief)} disabled={computing}>
                      {computing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Compute Matches
                    </Button>
                    <Button variant="outline" onClick={() => sendInvitations()} disabled={inviting || !matchingResults}>
                      Send All Invitations
                    </Button>
                  </div>

                  {/* No Candidates Warning */}
                  {matchingResults && matchingResults.candidates.filter(c => c.score >= minScore).length === 0 && (
                    <Alert>
                      <AlertDescription>
                        No eligible experts at threshold ≥{minScore}. 
                        <Button variant="link" onClick={() => setMinScore(0.55)} className="p-0 h-auto">
                          Lower to 0.55
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Results */}
                  {matchingResults && (
                    <div className="space-y-2">
                      <h4 className="font-medium">
                        Candidates ({matchingResults.candidates.filter(c => c.score >= minScore).length} eligible)
                      </h4>
                      {matchingResults.candidates
                        .filter(c => c.score >= minScore)
                        .map((candidate, index) => (
                        <div key={candidate.expert_user_id} className="border rounded p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{candidate.profile?.full_name || 'Expert'}</p>
                              <p className="text-sm text-muted-foreground">
                                Score: {candidate.score.toFixed(2)} • {candidate.profile?.price_range}
                              </p>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => sendInvitations([candidate.expert_user_id])}
                            >
                              Invite
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchingDashboard;