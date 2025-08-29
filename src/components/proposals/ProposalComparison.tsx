import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  DollarSign, 
  Calendar, 
  Check, 
  X, 
  MessageSquare,
  ArrowLeft,
  Star,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInWeeks } from 'date-fns';
import { Proposal } from '@/lib/api';
import { track } from '@/lib/analytics';

interface ProposalComparisonProps {
  proposals: Proposal[];
  onAcceptProposal: (proposalId: string) => void;
  onStartChat: (proposalId: string) => void;
  onBack: () => void;
}

const ProposalComparison: React.FC<ProposalComparisonProps> = ({
  proposals,
  onAcceptProposal,
  onStartChat,
  onBack
}) => {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'gbp' ? '£' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getDuration = (startDate: string, endDate: string) => {
    return differenceInWeeks(new Date(endDate), new Date(startDate));
  };

  const getValueScore = (proposal: Proposal) => {
    const duration = getDuration(proposal.estimatedStartDate, proposal.estimatedEndDate);
    const scorePerWeek = proposal.totalPrice / Math.max(duration, 1);
    return Math.round(100 - Math.min(scorePerWeek / 100, 100)); // Simple value scoring
  };

  const handleAccept = (proposalId: string) => {
    track('proposal_accepted', { proposalId });
    onAcceptProposal(proposalId);
  };

  const renderProposalColumn = (proposal: Proposal, index: number) => (
    <div key={proposal.id} className="flex-1 min-w-80">
      <Card className={`h-full ${selectedProposal === proposal.id ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Proposal {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                {getValueScore(proposal)}% value
              </Badge>
            </div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {formatCurrency(proposal.totalPrice, proposal.currency)}
                </div>
                <div className="text-xs text-muted-foreground">Total price</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {getDuration(proposal.estimatedStartDate, proposal.estimatedEndDate)} weeks
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">
                  {format(new Date(proposal.estimatedStartDate), 'MMM d')}
                </div>
                <div className="text-xs text-muted-foreground">Start date</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{proposal.milestones.length}</div>
                <div className="text-xs text-muted-foreground">Milestones</div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Deliverables */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Deliverables ({proposal.deliverables.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {proposal.deliverables.map((deliverable, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{deliverable.title}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Milestones */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Payment Schedule</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {proposal.milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1">
                    {milestone.name}
                  </span>
                  <span className="font-medium text-primary ml-2">
                    {milestone.paymentPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Timeline</h4>
            <div className="text-sm text-muted-foreground">
              <div>Start: {format(new Date(proposal.estimatedStartDate), 'MMM d, yyyy')}</div>
              <div>End: {format(new Date(proposal.estimatedEndDate), 'MMM d, yyyy')}</div>
            </div>
          </div>

          {proposal.terms && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-sm">Terms & Conditions</h4>
                <p className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                  {proposal.terms}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="pt-4 space-y-2">
            <Button
              onClick={() => handleAccept(proposal.id)}
              className="w-full"
              variant={selectedProposal === proposal.id ? 'default' : 'outline'}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept & Escrow
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => onStartChat(proposal.id)}
              className="w-full"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Questions
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Updated {format(new Date(proposal.updatedAt), 'MMM d, yyyy')}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Compare Proposals</h1>
          <p className="text-muted-foreground">
            Side-by-side comparison of {proposals.length} proposals
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    Math.min(...proposals.map(p => p.totalPrice)),
                    proposals[0]?.currency || 'gbp'
                  )} - {formatCurrency(
                    Math.max(...proposals.map(p => p.totalPrice)),
                    proposals[0]?.currency || 'gbp'
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Price range</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.min(...proposals.map(p => 
                    getDuration(p.estimatedStartDate, p.estimatedEndDate)
                  ))} - {Math.max(...proposals.map(p => 
                    getDuration(p.estimatedStartDate, p.estimatedEndDate)
                  ))} weeks
                </div>
                <div className="text-sm text-muted-foreground">Duration range</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {Math.min(...proposals.map(p => p.deliverables.length))} - {Math.max(...proposals.map(p => p.deliverables.length))}
                </div>
                <div className="text-sm text-muted-foreground">Deliverables range</div>
              </CardContent>
            </Card>
          </div>

          {/* Side-by-side comparison */}
          <div className="flex gap-6 overflow-x-auto pb-4">
            {proposals.map((proposal, index) => renderProposalColumn(proposal, index))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Detailed comparison table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Criteria</th>
                      {proposals.map((_, index) => (
                        <th key={index} className="text-left p-2">Proposal {index + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Total Price</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-2">{formatCurrency(p.totalPrice, p.currency)}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Duration</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-2">
                          {getDuration(p.estimatedStartDate, p.estimatedEndDate)} weeks
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Deliverables</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-2">{p.deliverables.length} items</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Milestones</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-2">{p.milestones.length} stages</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Start Date</td>
                      {proposals.map(p => (
                        <td key={p.id} className="p-2">
                          {format(new Date(p.estimatedStartDate), 'MMM d, yyyy')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Visual timeline would go here - simplified for now */}
              <div className="space-y-4">
                {proposals.map((proposal, index) => (
                  <div key={proposal.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Proposal {index + 1}</span>
                      <span className="text-sm text-muted-foreground">
                        {getDuration(proposal.estimatedStartDate, proposal.estimatedEndDate)} weeks
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2"
                        style={{ 
                          width: `${Math.min(100, (getDuration(proposal.estimatedStartDate, proposal.estimatedEndDate) / 20) * 100)}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{format(new Date(proposal.estimatedStartDate), 'MMM d')}</span>
                      <span>{format(new Date(proposal.estimatedEndDate), 'MMM d')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tips */}
      <Card className="bg-muted/50 mt-6">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Decision tips</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Consider value score alongside total price</li>
                <li>• Review deliverables carefully - more isn't always better</li>
                <li>• Check milestone structure matches your cash flow</li>
                <li>• Chat with experts to clarify any questions before deciding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalComparison;