import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload,
  Eye,
  MessageSquare,
  Flag
} from 'lucide-react';
import { MilestoneSubmitDialog } from './MilestoneSubmitDialog';
import { MilestoneReviewDialog } from './MilestoneReviewDialog';

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  paymentPercent: number;
  status: 'pending' | 'in_progress' | 'submitted' | 'accepted' | 'revision_requested' | 'disputed';
  deliverables?: Array<{
    id: string;
    title: string;
    fileUrl?: string;
    notes?: string;
  }>;
  submittedAt?: string;
  acceptedAt?: string;
  iterationCount: number;
  qcChecklist?: Record<string, boolean>;
  expertId: string;
  clientId: string;
}

interface MilestoneListProps {
  milestones: Milestone[];
  projectId: string;
  userRole: 'expert' | 'client';
  onSubmit: (milestoneId: string, payload: any) => Promise<void>;
  onAccept: (milestoneId: string) => Promise<void>;
  onRequestChanges: (milestoneId: string, message: string) => Promise<void>;
  onDispute: (milestoneId: string, reason: string) => Promise<void>;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  projectId,
  userRole,
  onSubmit,
  onAccept,
  onRequestChanges,
  onDispute
}) => {
  const [submitDialogOpen, setSubmitDialogOpen] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null);

  const getStatusBadge = (status: Milestone['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      in_progress: { variant: 'default' as const, label: 'In Progress', icon: Clock },
      submitted: { variant: 'default' as const, label: 'Submitted', icon: Upload },
      accepted: { variant: 'default' as const, label: 'Accepted', icon: CheckCircle },
      revision_requested: { variant: 'destructive' as const, label: 'Revision Requested', icon: MessageSquare },
      disputed: { variant: 'destructive' as const, label: 'Disputed', icon: Flag }
    };

    const config = variants[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateProgress = () => {
    const completed = milestones.filter(m => m.status === 'accepted').length;
    return (completed / milestones.length) * 100;
  };

  const getTotalPayment = () => {
    return milestones.reduce((sum, m) => sum + m.paymentPercent, 0);
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Milestones</span>
            <span className="text-sm font-normal text-muted-foreground">
              {milestones.filter(m => m.status === 'accepted').length} of {milestones.length} completed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={calculateProgress()} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress: {Math.round(calculateProgress())}%</span>
              <span>Payment scheduled: {getTotalPayment()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Cards */}
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  )}
                </div>
                {getStatusBadge(milestone.status)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Due Date</span>
                  <p>{new Date(milestone.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Payment</span>
                  <p>{milestone.paymentPercent}%</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Iterations</span>
                  <p>{milestone.iterationCount}</p>
                </div>
              </div>

              {/* Deliverables */}
              {milestone.deliverables && milestone.deliverables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Deliverables</h4>
                  <div className="space-y-2">
                    {milestone.deliverables.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{deliverable.title}</p>
                          {deliverable.notes && (
                            <p className="text-sm text-muted-foreground">{deliverable.notes}</p>
                          )}
                        </div>
                        {deliverable.fileUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={deliverable.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {userRole === 'expert' && (
                  <>
                    {(milestone.status === 'pending' || milestone.status === 'in_progress' || milestone.status === 'revision_requested') && (
                      <Button
                        onClick={() => setSubmitDialogOpen(milestone.id)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {milestone.status === 'revision_requested' ? 'Resubmit' : 'Submit'}
                      </Button>
                    )}
                  </>
                )}

                {userRole === 'client' && milestone.status === 'submitted' && (
                  <>
                    <Button
                      onClick={() => setReviewDialogOpen(milestone.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review & Accept
                    </Button>
                  </>
                )}

                {milestone.status === 'disputed' && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      Under dispute - Admin review in progress
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogs */}
      {submitDialogOpen && (
        <MilestoneSubmitDialog
          isOpen={true}
          onClose={() => setSubmitDialogOpen(null)}
          milestone={milestones.find(m => m.id === submitDialogOpen)!}
          onSubmit={async (payload) => {
            await onSubmit(submitDialogOpen, payload);
            setSubmitDialogOpen(null);
          }}
        />
      )}

      {reviewDialogOpen && (
        <MilestoneReviewDialog
          isOpen={true}
          onClose={() => setReviewDialogOpen(null)}
          milestone={milestones.find(m => m.id === reviewDialogOpen)!}
          onAccept={async () => {
            await onAccept(reviewDialogOpen);
            setReviewDialogOpen(null);
          }}
          onRequestChanges={async (message) => {
            await onRequestChanges(reviewDialogOpen, message);
            setReviewDialogOpen(null);
          }}
          onDispute={async (reason) => {
            await onDispute(reviewDialogOpen, reason);
            setReviewDialogOpen(null);
          }}
        />
      )}
    </div>
  );
};