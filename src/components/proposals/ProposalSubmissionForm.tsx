import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const milestoneSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().optional(),
});

const proposalSchema = z.object({
  scope: z.object({
    overview: z.string().min(10, 'Please provide a detailed overview'),
    deliverables: z.array(z.string()).min(1, 'At least one deliverable required'),
    timeline: z.string().min(5, 'Timeline is required'),
    assumptions: z.string().optional(),
  }),
  price_total: z.number().min(1, 'Price must be greater than 0'),
  milestones: z.array(milestoneSchema).min(1, 'At least one milestone required'),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface Props {
  briefId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProposalSubmissionForm({ briefId, onSuccess, onCancel }: Props) {
  const [deliverables, setDeliverables] = useState<string[]>(['']);
  const [milestones, setMilestones] = useState([{ title: '', amount: 0, description: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      scope: {
        overview: '',
        deliverables: [''],
        timeline: '',
        assumptions: '',
      },
      price_total: 0,
      milestones: [{ title: '', amount: 0, description: '' }],
    },
  });

  const addDeliverable = () => {
    const newDeliverables = [...deliverables, ''];
    setDeliverables(newDeliverables);
    form.setValue('scope.deliverables', newDeliverables);
  };

  const removeDeliverable = (index: number) => {
    const newDeliverables = deliverables.filter((_, i) => i !== index);
    setDeliverables(newDeliverables);
    form.setValue('scope.deliverables', newDeliverables);
  };

  const updateDeliverable = (index: number, value: string) => {
    const newDeliverables = [...deliverables];
    newDeliverables[index] = value;
    setDeliverables(newDeliverables);
    form.setValue('scope.deliverables', newDeliverables);
  };

  const addMilestone = () => {
    const newMilestones = [...milestones, { title: '', amount: 0, description: '' }];
    setMilestones(newMilestones);
    form.setValue('milestones', newMilestones);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = milestones.filter((_, i) => i !== index);
    setMilestones(newMilestones);
    form.setValue('milestones', newMilestones);
  };

  const updateMilestone = (index: number, field: keyof typeof milestones[0], value: string | number) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
    form.setValue('milestones', newMilestones);
  };

  const calculateTotal = () => {
    return milestones.reduce((sum, milestone) => sum + (milestone.amount || 0), 0);
  };

  const onSubmit = async (data: ProposalFormData) => {
    setSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to submit a proposal",
          variant: "destructive",
        });
        return;
      }

      // Calculate total from milestones
      const calculatedTotal = calculateTotal();
      
      const { error } = await supabase
        .from('project_proposals')
        .insert({
          brief_id: briefId,
          expert_id: user.id,
          scope: data.scope,
          price_total: calculatedTotal,
          milestones: data.milestones,
        });

      if (error) throw error;

      toast({
        title: "Proposal submitted!",
        description: "Your proposal has been submitted successfully",
      });

      onSuccess();
    } catch (error) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Proposal</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Scope Overview */}
            <FormField
              control={form.control}
              name="scope.overview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Overview</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a comprehensive overview of your approach to this project..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deliverables */}
            <div className="space-y-4">
              <FormLabel>Key Deliverables</FormLabel>
              {deliverables.map((deliverable, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Describe a key deliverable..."
                    value={deliverable}
                    onChange={(e) => updateDeliverable(index, e.target.value)}
                    className="flex-1"
                  />
                  {deliverables.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDeliverable(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addDeliverable}>
                <Plus className="h-4 w-4 mr-2" />
                Add Deliverable
              </Button>
            </div>

            {/* Timeline */}
            <FormField
              control={form.control}
              name="scope.timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 8-12 weeks" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Milestones */}
            <div className="space-y-4">
              <FormLabel>Project Milestones</FormLabel>
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Milestone title"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Amount (£)"
                        value={milestone.amount || ''}
                        onChange={(e) => updateMilestone(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                      {milestones.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMilestone(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Milestone description (optional)"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addMilestone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </div>

            {/* Total Price */}
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span className="font-semibold">Total Project Value:</span>
              <Badge variant="secondary" className="text-lg">
                £{calculateTotal().toLocaleString()}
              </Badge>
            </div>

            {/* Assumptions */}
            <FormField
              control={form.control}
              name="scope.assumptions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assumptions & Terms (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any assumptions or specific terms for this proposal..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}