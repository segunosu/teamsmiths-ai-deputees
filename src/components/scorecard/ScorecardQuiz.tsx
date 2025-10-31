import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { usePersistentForm } from '@/hooks/usePersistentForm';

const questions = [
  // Readiness (R1-R4)
  { id: 'r1', category: 'Readiness', question: 'How clearly has your leadership articulated AI goals and priorities?' },
  { id: 'r2', category: 'Readiness', question: 'How mature is your data infrastructure for AI deployment?' },
  { id: 'r3', category: 'Readiness', question: 'How well-defined are your AI use cases and business outcomes?' },
  { id: 'r4', category: 'Readiness', question: 'How prepared is your team to adopt and use AI tools?' },
  
  // Reach (RP1-RP4)
  { id: 'rp1', category: 'Reach', question: 'How extensively is AI being deployed across your organization?' },
  { id: 'rp2', category: 'Reach', question: 'How many business functions are actively using AI?' },
  { id: 'rp3', category: 'Reach', question: 'How integrated are AI tools into your daily workflows?' },
  { id: 'rp4', category: 'Reach', question: 'How many employees have access to AI capabilities?' },
  
  // Prowess (PP1-PP4)
  { id: 'pp1', category: 'Prowess', question: 'How sophisticated are your AI implementations?' },
  { id: 'pp2', category: 'Prowess', question: 'How well do you measure AI ROI and business impact?' },
  { id: 'pp3', category: 'Prowess', question: 'How advanced is your AI talent and expertise?' },
  { id: 'pp4', category: 'Prowess', question: 'How effectively do you iterate and improve AI solutions?' },
  
  // Protection (PR1-PR4)
  { id: 'pr1', category: 'Protection', question: 'How robust are your AI governance and compliance frameworks?' },
  { id: 'pr2', category: 'Protection', question: 'How well do you manage AI-related risks and ethics?' },
  { id: 'pr3', category: 'Protection', question: 'How secure is your AI data and model protection?' },
  { id: 'pr4', category: 'Protection', question: 'How prepared are you for AI regulations and audits?' },
];

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  role: z.string().optional(),
  consentToStore: z.boolean().optional(),
  r1: z.number().min(0).max(100),
  r2: z.number().min(0).max(100),
  r3: z.number().min(0).max(100),
  r4: z.number().min(0).max(100),
  rp1: z.number().min(0).max(100),
  rp2: z.number().min(0).max(100),
  rp3: z.number().min(0).max(100),
  rp4: z.number().min(0).max(100),
  pp1: z.number().min(0).max(100),
  pp2: z.number().min(0).max(100),
  pp3: z.number().min(0).max(100),
  pp4: z.number().min(0).max(100),
  pr1: z.number().min(0).max(100),
  pr2: z.number().min(0).max(100),
  pr3: z.number().min(0).max(100),
  pr4: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface ScorecardQuizProps {
  onComplete: (data: any) => void;
}

export const ScorecardQuiz: React.FC<ScorecardQuizProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ignoreSubmitUntil = useRef<number>(0);
  const totalSteps = Math.ceil(questions.length / 3) + 1; // Group questions + contact info
  
  // Get persisted form data from localStorage
  const { formData: persistedData } = usePersistentForm({
    name: '',
    email: '',
    company: '',
    role: '',
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: persistedData.name || '',
      email: persistedData.email || '',
      company: persistedData.company || '',
      role: persistedData.role || '',
      consentToStore: false,
      r1: 50, r2: 50, r3: 50, r4: 50,
      rp1: 50, rp2: 50, rp3: 50, rp4: 50,
      pp1: 50, pp2: 50, pp3: 50, pp4: 50,
      pr1: 50, pr2: 50, pr3: 50, pr4: 50,
    },
  });

  // Save to localStorage whenever contact fields change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name || value.email || value.company || value.role) {
        localStorage.setItem('userFormData', JSON.stringify({
          name: value.name,
          email: value.email,
          company: value.company,
          role: value.role,
        }));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const calculateScores = (values: FormValues) => {
    const readiness = (values.r1 + values.r2 + values.r3 + values.r4) / 4;
    const reach = (values.rp1 + values.rp2 + values.rp3 + values.rp4) / 4;
    const prowess = (values.pp1 + values.pp2 + values.pp3 + values.pp4) / 4;
    const protection = (values.pr1 + values.pr2 + values.pr3 + values.pr4) / 4;
    
    const total = readiness * 0.25 + reach * 0.25 + prowess * 0.30 + protection * 0.20;
    
    let segment: 'Explorer' | 'Implementer' | 'Accelerator';
    if (total < 40) segment = 'Explorer';
    else if (total < 70) segment = 'Implementer';
    else segment = 'Accelerator';
    
    return { readiness, reach, prowess, protection, total, segment };
  };

  const onSubmit = async (values: FormValues) => {
    // Prevent accidental submit right after advancing to final step
    if (Date.now() < ignoreSubmitUntil.current) {
      return;
    }
    // Guard: if not on final step, just advance instead of submitting
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    setIsSubmitting(true);
    try {
      const scores = calculateScores(values);
      const urlParams = new URLSearchParams(window.location.search);
      
      const { data: user } = await supabase.auth.getUser();
      
      const payload = {
        user_id: user.user?.id || null,
        name: values.name,
        email: values.email,
        company: values.company || null,
        role: values.role || null,
        r1: values.r1,
        r2: values.r2,
        r3: values.r3,
        r4: values.r4,
        rp1: values.rp1,
        rp2: values.rp2,
        rp3: values.rp3,
        rp4: values.rp4,
        pp1: values.pp1,
        pp2: values.pp2,
        pp3: values.pp3,
        pp4: values.pp4,
        pr1: values.pr1,
        pr2: values.pr2,
        pr3: values.pr3,
        pr4: values.pr4,
        readiness_score: scores.readiness,
        reach_score: scores.reach,
        prowess_score: scores.prowess,
        protection_score: scores.protection,
        total_score: scores.total,
        segment: scores.segment,
        source: urlParams.get('source') || 'direct',
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
      };

      const { error } = await supabase
        .from('scorecard_responses')
        .insert(payload);

      if (error) throw error;

      // Save to user_profiles if consent given
      if (values.consentToStore && values.email) {
        const nameParts = values.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await supabase.from('user_profiles').upsert({
          email: values.email,
          first_name: firstName,
          last_name: lastName,
          company: values.company || null,
          consent_given: true,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'email'
        });
      }

      const scorecardId = 'pending';

      // Trigger email report immediately (correct payload structure)
      await supabase.functions.invoke('send-scorecard-report', {
        body: {
          to_email: values.email,
          user_name: values.name,
          score: Math.round(scores.total),
          readiness: Math.round(scores.readiness),
          reach: Math.round(scores.reach),
          prowess: Math.round(scores.prowess),
          protection: Math.round(scores.protection),
        },
      });

      // Trigger alerts for hot leads (background task)
      if (scorecardId !== 'pending') {
        supabase.functions.invoke('trigger-scorecard-alerts', {
          body: { scorecardId },
        }).catch(error => console.error('Failed to trigger alerts:', error));
      }

      toast.success('Scorecard completed! Check your email for the full report.');
      onComplete({
        id: scorecardId,
        name: values.name,
        email: values.email,
        readiness_score: scores.readiness,
        reach_score: scores.reach,
        prowess_score: scores.prowess,
        protection_score: scores.protection,
        total_score: scores.total,
        segment: scores.segment,
      } as any);
    } catch (error) {
      console.error('Error submitting scorecard:', error);
      toast.error('Failed to submit scorecard. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((step + 1) / totalSteps) * 100;
  const currentQuestions = step === 0 ? [] : questions.slice((step - 1) * 3, step * 3);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step < totalSteps - 1) {
      e.preventDefault();
      setStep(step + 1);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Discover Your AI Impact Score
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Take 5 minutes to assess your organization's AI readiness and get personalized recommendations
        </p>
      </div>

      <Progress value={progress} className="mb-8" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">
          <Card className="p-6 md:p-8">
            {step === 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold mb-6">Let's start with your details</h2>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Role</FormLabel>
                      <FormControl>
                        <Input placeholder="Head of Innovation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                   )}
                 />
                 
                 <FormField
                   control={form.control}
                   name="consentToStore"
                   render={({ field }) => (
                     <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-muted/30">
                       <FormControl>
                         <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                         />
                       </FormControl>
                       <div className="space-y-1 leading-none">
                         <FormLabel className="text-sm font-normal cursor-pointer">
                           I agree to have my contact details securely stored to improve my experience 
                           and pre-fill future forms. You can withdraw consent anytime by contacting{' '}
                           <a href="mailto:privacy@teamsmiths.ai" className="text-primary hover:underline">
                             privacy@teamsmiths.ai
                           </a>
                         </FormLabel>
                       </div>
                     </FormItem>
                   )}
                 />
               </div>
             ) : (
               <div className="space-y-8">
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">
                    {currentQuestions[0]?.category}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Rate each statement from 0 (Not at all) to 100 (Completely)
                  </p>
                </div>
                
                {currentQuestions.map((q) => (
                  <FormField
                    key={q.id}
                    control={form.control}
                    name={q.id as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">{q.question}</FormLabel>
                        <div className="flex items-center gap-4">
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="flex-1"
                            />
                          </FormControl>
                          <div className="w-12 text-center font-semibold text-primary">
                            {field.value}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            )}
          </Card>

          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0 || isSubmitting}
            >
              Back
            </Button>
            
            {step < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (step === totalSteps - 2) {
                    ignoreSubmitUntil.current = Date.now() + 600; // ignore rapid submit
                  }
                  setStep(step + 1);
                }}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  'Get My Score'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
