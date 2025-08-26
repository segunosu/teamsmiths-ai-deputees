import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  User, 
  Star, 
  Clock, 
  CheckCircle, 
  Eye,
  AlertTriangle 
} from 'lucide-react';

interface MatchingCandidate {
  user_id: string;
  score: number;
  breakdown: {
    skills: number;
    domain: number;
    outcomes: number;
    availability: number;
    locale: number;
    price: number;
    vetting: number;
    history: number;
  };
  profile: {
    full_name: string;
    email: string;
    skills: string[];
    tools: string[];
    price_range: string;
    availability: number;
  };
}

interface InvitationManagerProps {
  briefId: string;
  candidates: MatchingCandidate[];
  onInvitesSent: () => void;
}

const InvitationManager: React.FC<InvitationManagerProps> = ({
  briefId,
  candidates,
  onInvitesSent
}) => {
  const { toast } = useToast();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [minScore, setMinScore] = useState(0.65);
  const [maxInvites, setMaxInvites] = useState(5);

  // Filter candidates by score threshold
  const eligibleCandidates = candidates.filter(c => c.score >= minScore);
  const topCandidates = eligibleCandidates.slice(0, maxInvites);

  const sendInvitations = async (userIds: string[]) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-invitations', {
        body: {
          action: 'send_invites',
          brief_id: briefId,
          user_ids: userIds,
          score_threshold: minScore
        }
      });

      if (error) throw error;

      toast({
        title: 'Invitations Sent',
        description: `Sent ${userIds.length} invitations successfully.`,
      });

      // Update brief status and refresh
      await supabase
        .from('briefs')
        .update({ 
          status: 'invitations_sent',
          matched_at: new Date().toISOString()
        })
        .eq('id', briefId);

      onInvitesSent();
    } catch (error: any) {
      toast({
        title: 'Error sending invitations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const sendAllInvitations = () => {
    sendInvitations(topCandidates.map(c => c.user_id));
  };

  const sendSelectedInvitations = () => {
    sendInvitations(selectedCandidates);
  };

  const toggleCandidateSelection = (userId: string) => {
    setSelectedCandidates(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Candidates Found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No experts meet the matching criteria for this brief.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Try adjusting the matching weights</p>
              <p>• Consider widening the budget range</p>
              <p>• Review the skill requirements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Invitations
            </div>
            <Badge variant="outline">
              {eligibleCandidates.length} eligible
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Min Score: {minScore}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Max Invites: {maxInvites}</label>
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

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={sendAllInvitations}
              disabled={sending || topCandidates.length === 0}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : `Send Top ${Math.min(topCandidates.length, maxInvites)}`}
            </Button>
            
            {selectedCandidates.length > 0 && (
              <Button
                onClick={sendSelectedInvitations}
                disabled={sending}
                variant="outline"
                className="flex-1"
              >
                Send Selected ({selectedCandidates.length})
              </Button>
            )}
          </div>

          {topCandidates.length === 0 && (
            <div className="mt-4 p-3 bg-muted rounded text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              No candidates meet the score threshold (≥{minScore}). 
              <button 
                onClick={() => setMinScore(0.4)} 
                className="text-primary hover:underline ml-1"
              >
                Lower threshold?
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidates List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {topCandidates.map((candidate) => (
          <Card 
            key={candidate.user_id}
            className={`cursor-pointer transition-colors ${
              selectedCandidates.includes(candidate.user_id) 
                ? 'ring-2 ring-primary' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => toggleCandidateSelection(candidate.user_id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {candidate.profile.full_name?.split(' ').map(n => n[0]).join('') || 'EX'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {candidate.profile.full_name || 'Expert'}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(candidate.score * 100)}% match
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {candidate.profile.price_range} • {candidate.profile.availability}h/week
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {candidate.profile.skills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.profile.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.profile.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Skills:</span>
                        <Progress value={candidate.breakdown.skills * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Domain:</span>
                        <Progress value={candidate.breakdown.domain * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Outcomes:</span>
                        <Progress value={candidate.breakdown.outcomes * 100} className="h-1 mt-1" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <Progress value={candidate.breakdown.price * 100} className="h-1 mt-1" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open expert profile modal
                    }}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      sendInvitations([candidate.user_id]);
                    }}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InvitationManager;