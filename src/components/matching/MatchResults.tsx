import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Users, Clock, DollarSign, Star, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Match } from '@/lib/api';
import { track } from '@/lib/analytics';

export interface MatchResultsProps {
  crId: string;
  matches: Match[];
  onShortlistChange: (expertIds: string[]) => void;
  onSendRfp: (payload: { expertIds: string[]; message?: string }) => Promise<void>;
  onRequestManualReview: () => void;
}

const MatchResults: React.FC<MatchResultsProps> = ({
  crId,
  matches,
  onShortlistChange,
  onSendRfp,
  onRequestManualReview
}) => {
  const [shortlistedExperts, setShortlistedExperts] = useState<string[]>([]);
  const [rfpMessage, setRfpMessage] = useState('');
  const [isSendingRfp, setIsSendingRfp] = useState(false);

  useEffect(() => {
    if (matches.length > 0) {
      track('match_results_shown', { 
        matchJobId: 'generated-match-job-id', // TODO: Pass actual matchJobId
        crId 
      });
    }
  }, [matches, crId]);

  const handleShortlistToggle = (expertId: string, checked: boolean) => {
    let newShortlist: string[];
    
    if (checked) {
      if (shortlistedExperts.length >= 5) {
        toast.error('You can shortlist up to 5 experts maximum');
        return;
      }
      newShortlist = [...shortlistedExperts, expertId];
      track('expert_shortlisted', { crId, expertId });
    } else {
      newShortlist = shortlistedExperts.filter(id => id !== expertId);
    }
    
    setShortlistedExperts(newShortlist);
    onShortlistChange(newShortlist);
  };

  const handleSendRfp = async () => {
    if (shortlistedExperts.length === 0) {
      toast.error('Please select at least one expert to send RFP');
      return;
    }

    setIsSendingRfp(true);
    try {
      await onSendRfp({
        expertIds: shortlistedExperts,
        message: rfpMessage.trim() || undefined
      });
      
      track('rfp_sent', { crId, count: shortlistedExperts.length });
      toast.success(`RFP sent to ${shortlistedExperts.length} expert${shortlistedExperts.length > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to send RFP. Please try again.');
    } finally {
      setIsSendingRfp(false);
    }
  };

  const getRationaleText = (rationale: Match['rationale']) => {
    const rationaleMap = {
      'skill-match': 'Perfect skill match',
      'budget-fit': 'Budget aligned',
      'availability': 'Available soon',
      'rating': 'Highly rated'
    };
    
    return rationale.slice(0, 3).map(r => rationaleMap[r]).filter(Boolean);
  };

  const formatRate = (rate?: Match['rateEstimate']) => {
    if (!rate) return null;
    
    const { type, min, max, currency } = rate;
    const symbol = currency === 'gbp' ? '£' : '$';
    
    if (min && max) {
      return `${symbol}${min}-${max}/${type}`;
    } else if (min) {
      return `From ${symbol}${min}/${type}`;
    } else if (max) {
      return `Up to ${symbol}${max}/${type}`;
    }
    return null;
  };

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <RefreshCw className="animate-spin h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Finding matching experts...</h3>
              <p className="text-muted-foreground">
                No strong matches yet. We'll notify you when experts are found.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Usually within 2 hours
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onRequestManualReview}
              className="mt-4"
            >
              Request manual review
            </Button>
          </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Expert Matches Found</h1>
        <p className="text-muted-foreground">
          We found {matches.length} expert{matches.length > 1 ? 's' : ''} that match your requirements.
          Select up to 5 to send your RFP.
        </p>
      </div>

      {/* Match Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {matches.map((match) => (
          <Card 
            key={match.anonymizedExpertId}
            className={`transition-all hover:shadow-md ${
              shortlistedExperts.includes(match.anonymizedExpertId) 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Checkbox
                      checked={shortlistedExperts.includes(match.anonymizedExpertId)}
                      onCheckedChange={(checked) => 
                        handleShortlistToggle(match.anonymizedExpertId, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <CardTitle className="text-lg">{match.roleBadge}</CardTitle>
                  </div>
                  
                  {/* Confidence Score */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Match confidence:</span>
                    <Progress value={match.confidenceScore} className="flex-1 max-w-24" />
                    <span className="text-sm font-medium">{match.confidenceScore}%</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Rationale Badges */}
              <div className="flex flex-wrap gap-2">
                {getRationaleText(match.rationale).map((text, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {text}
                  </Badge>
                ))}
              </div>

              {/* Rate & Availability */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {match.rateEstimate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{formatRate(match.rateEstimate)}</span>
                  </div>
                )}
                
                {match.availability && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{match.availability}</span>
                  </div>
                )}
              </div>

              {/* Sample Links */}
              {match.sampleLinks && match.sampleLinks.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recent work:</p>
                  <div className="space-y-1">
                    {match.sampleLinks.slice(0, 2).map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline block truncate"
                      >
                        Sample project {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RFP Section */}
      {shortlistedExperts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Send RFP to {shortlistedExperts.length} Expert{shortlistedExperts.length > 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional message (optional)
              </label>
              <Textarea
                placeholder="Add any specific requirements or questions for the experts..."
                value={rfpMessage}
                onChange={(e) => setRfpMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleSendRfp}
                disabled={isSendingRfp}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSendingRfp ? 'Sending RFP...' : 'Send RFP'}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Experts usually respond within 48 hours with detailed proposals.
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Manual Review Option */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h3 className="font-medium">Not seeing the right match?</h3>
              <p className="text-sm text-muted-foreground">
                Our team can manually review your requirements and find additional experts.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={onRequestManualReview}>
            Request Manual Review
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchResults;