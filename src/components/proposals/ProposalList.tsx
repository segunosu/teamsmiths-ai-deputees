import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, DollarSign, Calendar, MessageSquare, Check, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Proposal } from '@/lib/api';
import { track } from '@/lib/analytics';

interface ProposalListProps {
  proposals: Proposal[];
  onSelectProposal: (proposal: Proposal) => void;
  onAcceptProposal: (proposalId: string) => void;
  onViewComparison: (proposals: Proposal[]) => void;
  onStartChat: (proposalId: string) => void;
}

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  onSelectProposal,
  onAcceptProposal,
  onViewComparison,
  onStartChat
}) => {
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

  const handleProposalClick = (proposal: Proposal) => {
    track('proposal_viewed', { proposalId: proposal.id });
    onSelectProposal(proposal);
  };

  const handleAccept = (proposalId: string) => {
    track('proposal_accepted', { proposalId });
    onAcceptProposal(proposalId);
  };

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposals(prev => 
      prev.includes(proposalId)
        ? prev.filter(id => id !== proposalId)
        : [...prev, proposalId].slice(0, 3) // Max 3 for comparison
    );
  };

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'outline';
      case 'viewed': return 'default';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'gbp' ? '£' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  if (proposals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Waiting for Proposals</h3>
            <p className="text-muted-foreground">
              Experts are working on your proposals. You'll be notified when they're ready.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Usually takes 2-5 business days
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Proposals Received</h1>
          <p className="text-muted-foreground">
            {proposals.length} proposal{proposals.length > 1 ? 's' : ''} from expert{proposals.length > 1 ? 's' : ''}
          </p>
        </div>
        
        {selectedProposals.length > 1 && (
          <Button
            variant="outline"
            onClick={() => onViewComparison(
              proposals.filter(p => selectedProposals.includes(p.id))
            )}
          >
            Compare Selected ({selectedProposals.length})
          </Button>
        )}
      </div>

      {/* Proposals Grid */}
      <div className="grid gap-6">
        {proposals.map((proposal) => (
          <Card 
            key={proposal.id}
            className={`transition-all hover:shadow-md cursor-pointer ${
              selectedProposals.includes(proposal.id) ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleProposalClick(proposal)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleProposalSelection(proposal.id);
                      }}
                      className="rounded"
                    />
                    <CardTitle className="text-lg">Expert Proposal</CardTitle>
                    <Badge variant={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(proposal.totalPrice, proposal.currency)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(proposal.estimatedStartDate), 'MMM d')}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {Math.ceil(
                          (new Date(proposal.estimatedEndDate).getTime() - 
                           new Date(proposal.estimatedStartDate).getTime()) / 
                          (1000 * 60 * 60 * 24 * 7)
                        )} weeks
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{proposal.milestones.length} milestones</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Deliverables Preview */}
              <div>
                <h4 className="font-medium mb-2">Key deliverables:</h4>
                <ul className="space-y-1">
                  {proposal.deliverables.slice(0, 3).map((deliverable, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{deliverable.title}</span>
                    </li>
                  ))}
                  {proposal.deliverables.length > 3 && (
                    <li className="text-sm text-muted-foreground italic">
                      +{proposal.deliverables.length - 3} more deliverables
                    </li>
                  )}
                </ul>
              </div>

              {/* Milestones Preview */}
              <div>
                <h4 className="font-medium mb-2">Payment schedule:</h4>
                <div className="flex flex-wrap gap-2">
                  {proposal.milestones.map((milestone, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {milestone.name}: {milestone.paymentPercent}%
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartChat(proposal.id);
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask Questions
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(proposal.id);
                  }}
                  className="flex-1"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Accept & Escrow
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Created {format(new Date(proposal.createdAt), 'MMM d, yyyy')} • 
                Last updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Compare proposals carefully</p>
              <p className="text-muted-foreground">
                Select multiple proposals to compare deliverables, timelines, and pricing side-by-side.
                You can also chat with experts to clarify requirements before making a decision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalList;