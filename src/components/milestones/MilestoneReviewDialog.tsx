import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  MessageSquare, 
  Flag, 
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { Milestone } from './MilestoneList';

interface MilestoneReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  onAccept: () => Promise<void>;
  onRequestChanges: (message: string) => Promise<void>;
  onDispute: (reason: string) => Promise<void>;
}

export const MilestoneReviewDialog: React.FC<MilestoneReviewDialogProps> = ({
  isOpen,
  onClose,
  milestone,
  onAccept,
  onRequestChanges,
  onDispute
}) => {
  const [action, setAction] = useState<'review' | 'changes' | 'dispute'>('review');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async () => {
    if (action === 'changes' && !message.trim()) return;
    if (action === 'dispute' && !message.trim()) return;

    setIsProcessing(true);
    try {
      switch (action) {
        case 'review':
          await onAccept();
          break;
        case 'changes':
          await onRequestChanges(message.trim());
          break;
        case 'dispute':
          await onDispute(message.trim());
          break;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionButton = () => {
    const configs = {
      review: {
        label: 'Accept & Release Payment',
        icon: CheckCircle,
        variant: 'default' as const
      },
      changes: {
        label: 'Request Changes',
        icon: MessageSquare,
        variant: 'outline' as const
      },
      dispute: {
        label: 'Raise Dispute',
        icon: Flag,
        variant: 'destructive' as const
      }
    };

    const config = configs[action];
    const IconComponent = config.icon;

    return (
      <Button
        onClick={handleAction}
        disabled={isProcessing || ((action === 'changes' || action === 'dispute') && !message.trim())}
        variant={config.variant}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {isProcessing ? 'Processing...' : config.label}
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Review Milestone: {milestone.name}</span>
            <Badge>
              Payment: {milestone.paymentPercent}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Milestone Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-muted-foreground">
                      {new Date(milestone.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-muted-foreground">
                    {milestone.submittedAt 
                      ? new Date(milestone.submittedAt).toLocaleDateString()
                      : 'Not submitted'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Iteration</p>
                  <p className="text-muted-foreground">#{milestone.iterationCount}</p>
                </div>
              </div>
              
              {milestone.description && (
                <div className="mt-4">
                  <p className="font-medium mb-2">Description</p>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables */}
          {milestone.deliverables && milestone.deliverables.length > 0 && (
            <div>
              <Label className="text-base font-semibold">Deliverables</Label>
              <div className="space-y-3 mt-3">
                {milestone.deliverables.map((deliverable) => (
                  <Card key={deliverable.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{deliverable.title}</h4>
                          {deliverable.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {deliverable.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {deliverable.fileUrl && (
                            <>
                              <Button variant="outline" size="sm" asChild>
                                <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a href={deliverable.fileUrl} download>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* QC Status */}
          {milestone.qcChecklist && (
            <div>
              <Label className="text-base font-semibold">Quality Control</Label>
              <div className="mt-3 space-y-2">
                {Object.entries(milestone.qcChecklist).map(([key, passed]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {passed ? '✓' : '✗'}
                    </div>
                    <span className="text-sm capitalize">
                      {key.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Selection */}
          <div>
            <Label className="text-base font-semibold">Review Decision</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <Card 
                className={`cursor-pointer transition-colors ${
                  action === 'review' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAction('review')}
              >
                <CardContent className="pt-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h4 className="font-medium">Accept</h4>
                  <p className="text-xs text-muted-foreground">
                    Approve work & release payment
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  action === 'changes' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAction('changes')}
              >
                <CardContent className="pt-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h4 className="font-medium">Request Changes</h4>
                  <p className="text-xs text-muted-foreground">
                    Send back for revisions
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  action === 'dispute' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setAction('dispute')}
              >
                <CardContent className="pt-4 text-center">
                  <Flag className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <h4 className="font-medium">Dispute</h4>
                  <p className="text-xs text-muted-foreground">
                    Escalate to admin review
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Message Input */}
          {(action === 'changes' || action === 'dispute') && (
            <div>
              <Label htmlFor="message">
                {action === 'changes' ? 'What changes are needed?' : 'Why are you disputing this milestone?'}
              </Label>
              <Textarea
                id="message"
                placeholder={
                  action === 'changes' 
                    ? 'Please explain what changes are needed...'
                    : 'Please explain the reason for dispute...'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          )}

          {action === 'review' && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Ready to Accept</h4>
                    <p className="text-sm text-green-700">
                      Accepting this milestone will release {milestone.paymentPercent}% of the project payment 
                      to the expert. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {getActionButton()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};