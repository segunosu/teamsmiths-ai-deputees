import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';

interface QAItem {
  id: string;
  type: 'milestone' | 'project' | 'dispute';
  title: string;
  projectId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_review' | 'passed' | 'failed';
  flagReason: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  notes?: string;
  metadata?: {
    rejectionCount?: number;
    disputeDuration?: number;
    clientId: string;
    expertId: string;
  };
}

interface QAChecklist {
  'requirements-met': boolean;
  'quality-standards': boolean;
  'deliverables-complete': boolean;
  'timeline-appropriate': boolean;
  'communication-clear': boolean;
}

const QADashboard: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<QAItem | null>(null);
  const [checklist, setChecklist] = useState<QAChecklist>({
    'requirements-met': false,
    'quality-standards': false,
    'deliverables-complete': false,
    'timeline-appropriate': false,
    'communication-clear': false
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Mock data - in real app, fetch from API
  const qaItems: QAItem[] = [
    {
      id: 'qa-1',
      type: 'milestone',
      title: 'Database Design Milestone',
      projectId: 'proj-1',
      priority: 'high',
      status: 'pending',
      flagReason: 'Rejected 3 times by client',
      submittedAt: '2024-01-15T10:00:00Z',
      metadata: {
        rejectionCount: 3,
        clientId: 'client-1',
        expertId: 'expert-1'
      }
    },
    {
      id: 'qa-2',
      type: 'dispute',
      title: 'API Implementation Dispute',
      projectId: 'proj-2',
      priority: 'critical',
      status: 'in_review',
      flagReason: 'Dispute open for 7 days',
      submittedAt: '2024-01-12T14:30:00Z',
      reviewer: 'admin-2',
      metadata: {
        disputeDuration: 7,
        clientId: 'client-2',
        expertId: 'expert-2'
      }
    }
  ];

  const checklistItems = [
    { key: 'requirements-met', label: 'All client requirements have been addressed' },
    { key: 'quality-standards', label: 'Work meets professional quality standards' },
    { key: 'deliverables-complete', label: 'All deliverables are complete and functional' },
    { key: 'timeline-appropriate', label: 'Delivery timeline is reasonable and met' },
    { key: 'communication-clear', label: 'Communication between parties has been clear' }
  ];

  const getPriorityBadge = (priority: QAItem['priority']) => {
    const variants = {
      low: { variant: 'secondary' as const, label: 'Low' },
      medium: { variant: 'default' as const, label: 'Medium' },
      high: { variant: 'destructive' as const, label: 'High' },
      critical: { variant: 'destructive' as const, label: 'Critical' }
    };
    
    return (
      <Badge variant={variants[priority].variant}>
        {variants[priority].label}
      </Badge>
    );
  };

  const getStatusIcon = (status: QAItem['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'in_review':
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const handleReview = async (result: 'pass' | 'fail') => {
    if (!selectedItem) return;
    
    setIsReviewing(true);
    try {
      // API call would go here
      console.log('Reviewing item:', selectedItem.id, result, checklist, reviewNotes);
      
      // Reset form
      setSelectedItem(null);
      setChecklist({
        'requirements-met': false,
        'quality-standards': false,
        'deliverables-complete': false,
        'timeline-appropriate': false,
        'communication-clear': false
      });
      setReviewNotes('');
    } finally {
      setIsReviewing(false);
    }
  };

  const scheduleThreeWayMeeting = async (itemId: string) => {
    console.log('Scheduling 3-way meeting for:', itemId);
    // Implementation would go here
  };

  const requestRemediation = async (itemId: string) => {
    console.log('Requesting remediation for:', itemId);
    // Implementation would go here
  };

  const partialRelease = async (itemId: string) => {
    console.log('Processing partial release for:', itemId);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Quality Assurance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Pending Reviews</span>
              <p className="text-2xl font-bold text-yellow-600">
                {qaItems.filter(i => i.status === 'pending').length}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">In Review</span>
              <p className="text-2xl font-bold text-blue-600">
                {qaItems.filter(i => i.status === 'in_review').length}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Critical Issues</span>
              <p className="text-2xl font-bold text-red-600">
                {qaItems.filter(i => i.priority === 'critical').length}
              </p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Today's Reviews</span>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QA Queue */}
        <Card>
          <CardHeader>
            <CardTitle>QA Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qaItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <h4 className="font-medium">{item.title}</h4>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.flagReason}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Project: {item.projectId}</span>
                    <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {item.metadata?.rejectionCount && (
                    <Badge variant="destructive" className="mt-2">
                      {item.metadata.rejectionCount} rejections
                    </Badge>
                  )}
                  
                  {item.metadata?.disputeDuration && (
                    <Badge variant="destructive" className="mt-2">
                      {item.metadata.disputeDuration} days in dispute
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedItem ? `Review: ${selectedItem.title}` : 'Select an item to review'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedItem ? (
              <div className="space-y-6">
                {/* Item Details */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Type</span>
                      <p className="capitalize">{selectedItem.type}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1 mt-1">
                        {getStatusIcon(selectedItem.status)}
                        <span className="capitalize">{selectedItem.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-muted-foreground">Flag Reason</span>
                    <p>{selectedItem.flagReason}</p>
                  </div>
                </div>

                {/* QA Checklist */}
                <div>
                  <Label className="text-base font-semibold">QA Checklist</Label>
                  <div className="space-y-3 mt-3">
                    {checklistItems.map((item) => (
                      <div key={item.key} className="flex items-start space-x-2">
                        <Checkbox
                          id={item.key}
                          checked={checklist[item.key as keyof QAChecklist]}
                          onCheckedChange={(checked) =>
                            setChecklist(prev => ({
                              ...prev,
                              [item.key]: !!checked
                            }))
                          }
                        />
                        <Label htmlFor={item.key} className="text-sm leading-5">
                          {item.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Notes */}
                <div>
                  <Label htmlFor="review-notes">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    placeholder="Add your review notes and recommendations..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleReview('pass')}
                      disabled={isReviewing || !reviewNotes.trim()}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Pass Review
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReview('fail')}
                      disabled={isReviewing || !reviewNotes.trim()}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Fail Review
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => requestRemediation(selectedItem.id)}
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Request Remediation
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scheduleThreeWayMeeting(selectedItem.id)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => partialRelease(selectedItem.id)}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Partial Release
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an item from the queue to begin review</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QADashboard;