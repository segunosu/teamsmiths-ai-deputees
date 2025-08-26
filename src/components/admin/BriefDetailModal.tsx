import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefSection } from '@/components/BriefSection';
import { 
  Calendar, 
  DollarSign, 
  Target, 
  Clock, 
  Send,
  FileText,
  Users
} from 'lucide-react';

interface BriefDetailModalProps {
  brief: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateProposal?: () => void;
  onSendToMatching?: () => void;
  onEscalateToQuotes?: () => void;
}

export function BriefDetailModal({
  brief,
  open,
  onOpenChange,
  onGenerateProposal,
  onSendToMatching,
  onEscalateToQuotes
}: BriefDetailModalProps) {
  if (!brief) return null;

  const structuredBrief = brief.structured_brief || {};
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Brief Details
          </DialogTitle>
          <DialogDescription>
            Review and take action on this brief submission
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Brief Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Project Overview</span>
                <Badge variant={brief.status === 'submitted' ? 'default' : 'secondary'}>
                  {brief.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {brief.contact_name || 'Name not provided'} <br />
                    {brief.contact_email} <br />
                    {brief.contact_phone || 'Phone not provided'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Submission Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Origin: {brief.origin || 'Direct submission'} <br />
                    {brief.origin_id && <>ID: {brief.origin_id} <br /></>}
                    Created: {new Date(brief.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {brief.assured_mode && (
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Outcome Assurance™ Mode Enabled
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Structured Brief Content */}
          {structuredBrief && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {structuredBrief.goal && (
                  <BriefSection title="Goal" data={structuredBrief.goal} type="goal" />
                )}
                {structuredBrief.context && (
                  <BriefSection title="Context" data={structuredBrief.context} type="context" />
                )}
              </div>
              
              <div className="space-y-4">
                {structuredBrief.constraints && (
                  <BriefSection title="Constraints" data={structuredBrief.constraints} type="constraints" />
                )}
                
                {/* Project Attributes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Project Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {structuredBrief.budget_range && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Budget:</span>
                        <span>{structuredBrief.budget_range}</span>
                      </div>
                    )}
                    {structuredBrief.timeline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Timeline:</span>
                        <span>{structuredBrief.timeline}</span>
                      </div>
                    )}
                    {structuredBrief.urgency && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Urgency:</span>
                        <Badge variant={structuredBrief.urgency === 'urgent' ? 'destructive' : 'secondary'}>
                          {structuredBrief.urgency}
                        </Badge>
                      </div>
                    )}
                    {structuredBrief.expert_style && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Expert Style:</span>
                        <span>{structuredBrief.expert_style}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {brief.proposal_json ? (
              <Badge variant="outline" className="text-green-600">
                Proposal Generated
              </Badge>
            ) : (
              <Button
                onClick={onGenerateProposal}
                variant="outline"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate AI Proposal
              </Button>
            )}

            <Button
              onClick={onSendToMatching}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send to Matching
            </Button>

            <Button
              onClick={onEscalateToQuotes}
              variant="outline"
            >
              <Target className="h-4 w-4 mr-2" />
              Escalate to Quotes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}