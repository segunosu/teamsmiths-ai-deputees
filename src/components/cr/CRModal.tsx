import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const crSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120, 'Title must be under 120 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be under 2000 characters'),
  deliverables: z.array(z.object({
    title: z.string().min(1, 'Deliverable title is required')
  })).optional(),
  milestones: z.array(z.object({
    name: z.string().min(1, 'Milestone name is required'),
    durationDays: z.number().optional(),
    acceptanceCriteria: z.string().optional(),
    paymentPercent: z.number().min(0).max(100).optional()
  })).optional(),
  budgetMin: z.number().optional(),
  budgetTypical: z.number().optional(),
  budgetMax: z.number().optional(),
  requiredSkills: z.array(z.string()).optional(),
  desiredStartDate: z.date().optional(),
  anonymityFlag: z.boolean().default(true),
  guestEmail: z.string().email().optional()
}).refine((data) => {
  if (data.budgetMin && data.budgetTypical && data.budgetMax) {
    return data.budgetMin <= data.budgetTypical && data.budgetTypical <= data.budgetMax;
  }
  return true;
}, {
  message: "Budget must follow: min ≤ typical ≤ max",
  path: ["budgetTypical"]
}).refine((data) => {
  if (data.milestones?.length) {
    const totalPercent = data.milestones.reduce((sum, m) => sum + (m.paymentPercent || 0), 0);
    return totalPercent <= 100;
  }
  return true;
}, {
  message: "Total payment percentages cannot exceed 100%",
  path: ["milestones"]
});

type CRFormData = z.infer<typeof crSchema>;

interface CRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CRModal: React.FC<CRModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CRFormData>({
    resolver: zodResolver(crSchema),
    defaultValues: {
      title: '',
      description: '',
      deliverables: [],
      milestones: [],
      requiredSkills: [],
      anonymityFlag: true,
      guestEmail: ''
    }
  });

  const watchedSkills = form.watch('requiredSkills') || [];
  const watchedDeliverables = form.watch('deliverables') || [];
  const watchedMilestones = form.watch('milestones') || [];

  const addSkill = (skill: string) => {
    if (skill.trim() && !watchedSkills.includes(skill.trim())) {
      form.setValue('requiredSkills', [...watchedSkills, skill.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue('requiredSkills', watchedSkills.filter(skill => skill !== skillToRemove));
  };

  const addDeliverable = () => {
    form.setValue('deliverables', [...watchedDeliverables, { title: '' }]);
  };

  const removeDeliverable = (index: number) => {
    const newDeliverables = watchedDeliverables.filter((_, i) => i !== index);
    form.setValue('deliverables', newDeliverables);
  };

  const addMilestone = () => {
    form.setValue('milestones', [...watchedMilestones, { 
      name: '', 
      durationDays: undefined, 
      acceptanceCriteria: '', 
      paymentPercent: undefined 
    }]);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = watchedMilestones.filter((_, i) => i !== index);
    form.setValue('milestones', newMilestones);
  };

  const onSaveDraft = async (data: CRFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to save draft
      console.log('Saving draft:', data);
      
      if (!user && data.guestEmail) {
        toast.success("We'll email you a private link so you can finish this request later.", {
          duration: 5000
        });
      } else {
        toast.success('Draft saved successfully');
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: CRFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to submit CR
      console.log('Submitting CR:', data);
      toast.success('Request submitted! Finding matching experts...');
      onClose();
      // TODO: Navigate to match results
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a custom quote</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your project in a few words" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what you need, your goals, and any specific requirements..."
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Required Skills */}
            <div className="space-y-3">
              <FormLabel>Required Skills</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addSkill(skillInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {watchedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedSkills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-3">
              <FormLabel>Budget Range (optional)</FormLabel>
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="budgetMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Minimum</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="£1,000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetTypical"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Typical</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="£5,000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budgetMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">Maximum</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="£10,000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Start Date */}
            <FormField
              control={form.control}
              name="desiredStartDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Desired Start Date (optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Anonymity Flag */}
            <FormField
              control={form.control}
              name="anonymityFlag"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Keep my identity anonymous</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Experts will see your project details but not your identity
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Guest Email */}
            {!user && (
              <FormField
                control={form.control}
                name="guestEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your@email.com"
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      We'll email you a private link so you can finish this request later.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit(onSaveDraft)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Save & Continue Later
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </div>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CRModal;