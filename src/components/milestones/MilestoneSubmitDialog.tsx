import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, AlertTriangle } from 'lucide-react';
import { Milestone } from './MilestoneList';

interface MilestoneSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: Milestone;
  onSubmit: (payload: {
    deliverables: Array<{ file: File; notes?: string }>;
    qcChecklist: Record<string, boolean>;
    overrideReason?: string;
  }) => Promise<void>;
}

export const MilestoneSubmitDialog: React.FC<MilestoneSubmitDialogProps> = ({
  isOpen,
  onClose,
  milestone,
  onSubmit
}) => {
  const [deliverables, setDeliverables] = useState<Array<{ file: File; notes: string }>>([]);
  const [qcChecklist, setQcChecklist] = useState<Record<string, boolean>>({
    'deliverables-complete': false,
    'quality-reviewed': false,
    'client-requirements-met': false,
    'no-known-issues': false
  });
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const qcItems = [
    { key: 'deliverables-complete', label: 'All deliverables are complete and ready for review' },
    { key: 'quality-reviewed', label: 'Work has been quality reviewed and tested' },
    { key: 'client-requirements-met', label: 'All client requirements have been addressed' },
    { key: 'no-known-issues', label: 'No known issues or defects remain' }
  ];

  const allQcPassed = Object.values(qcChecklist).every(Boolean);
  const canSubmit = allQcPassed || (overrideReason.trim().length > 0);

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    
    const newDeliverables = Array.from(files).map(file => ({
      file,
      notes: ''
    }));
    
    setDeliverables(prev => [...prev, ...newDeliverables]);
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const updateDeliverableNotes = (index: number, notes: string) => {
    setDeliverables(prev => prev.map((item, i) => 
      i === index ? { ...item, notes } : item
    ));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        deliverables,
        qcChecklist,
        overrideReason: overrideReason.trim() || undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Milestone: {milestone.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload">Upload Deliverables</Label>
            <div className="mt-2">
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={(e) => handleFileAdd(e.target.files)}
                accept=".pdf,.docx,.doc,.zip,.png,.jpg,.jpeg"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supported: PDF, DOCX, ZIP, PNG, JPG (max 10MB each, 30MB total)
              </p>
            </div>
          </div>

          {/* Deliverable List */}
          {deliverables.length > 0 && (
            <div>
              <Label>Selected Files</Label>
              <div className="space-y-3 mt-2">
                {deliverables.map((deliverable, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{deliverable.file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Add notes about this deliverable (optional)"
                      value={deliverable.notes}
                      onChange={(e) => updateDeliverableNotes(index, e.target.value)}
                      className="text-sm"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QC Checklist */}
          <div>
            <Label>Quality Control Checklist</Label>
            <div className="space-y-3 mt-3">
              {qcItems.map((item) => (
                <div key={item.key} className="flex items-start space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={qcChecklist[item.key]}
                    onCheckedChange={(checked) =>
                      setQcChecklist(prev => ({
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

          {/* Override Section */}
          {!allQcPassed && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Quality control checks must pass before submission.</p>
                  <div>
                    <Label htmlFor="override-reason">Override Reason (if applicable)</Label>
                    <Textarea
                      id="override-reason"
                      placeholder="Explain why you need to override the QC requirements..."
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Milestone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};