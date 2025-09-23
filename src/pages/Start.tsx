import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, TrendingUp, Clock, DollarSign, Calendar, Users, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAnalytics } from '@/hooks/useAnalytics';

interface FormData {
  focus: 'revenue' | 'speed' | 'cost' | '';
  engage: 'subscription' | 'project' | 'unsure' | '';
  email: string;
  name: string;
  company: string;
  preferredTime: string;
  notes: string;
}

const Start = () => {
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    focus: '',
    engage: '',
    email: '',
    name: '',
    company: '',
    preferredTime: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / 3) * 100;

  const focusOptions = [
    {
      id: 'revenue',
      title: 'Revenue',
      description: 'Proposals, quotes, and sales wins',
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      id: 'speed',
      title: 'Speed', 
      description: 'Cycle time and delivery pace',
      icon: <Clock className="h-6 w-6" />
    },
    {
      id: 'cost',
      title: 'Cost',
      description: 'Cashflow and time savings',
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  const engageOptions = [
    {
      id: 'subscription',
      title: 'Subscription',
      description: 'Done-for-you each month',
      recommended: true,
      icon: <Users className="h-6 w-6" />
    },
    {
      id: 'project',
      title: 'One-off project',
      description: 'Fixed scope, fixed price',
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      id: 'unsure',
      title: 'Not sure',
      description: 'Decide in a call',
      icon: <HelpCircle className="h-6 w-6" />
    }
  ];

  const handleStepComplete = (step: number, choice: string) => {
    trackEvent('start_step_complete' as any, { step, choice } as any);
  };

  const handleNext = () => {
    const step = currentStep;
    let choice = '';
    
    if (step === 1) {
      choice = formData.focus;
      if (!choice) {
        toast.error('Please select your focus area');
        return;
      }
    } else if (step === 2) {
      choice = formData.engage;
      if (!choice) {
        toast.error('Please choose how you\'d like to engage');
        return;
      }
    }
    
    handleStepComplete(step, choice);
    setCurrentStep(step + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name) {
      toast.error('Please fill in your email and name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Track submission
      trackEvent('start_submit' as any, {
        origin: 'start',
        focus: formData.focus,
        engage: formData.engage
      } as any);

      // Navigate to brief builder with prefilled data
      const params = new URLSearchParams({
        origin: 'start',
        focus: formData.focus,
        engage: formData.engage,
        email: formData.email,
        name: formData.name,
        company: formData.company,
        preferredTime: formData.preferredTime,
        notes: formData.notes
      });
      
      navigate(`/brief-builder?${params.toString()}#form`);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Get Started | Teamsmiths</title>
        <meta name="description" content="Tell us about your goals and how you'd like to work with us. Get started in minutes." />
        <link rel="canonical" href={window.location.origin + '/start'} />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 3</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                {currentStep === 1 && "What's your focus?"}
                {currentStep === 2 && "How would you like to engage?"}
                {currentStep === 3 && "Your details"}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentStep === 1 && "Pick the KPI you want to move first"}
                {currentStep === 2 && "Choose the approach that fits your needs"}
                {currentStep === 3 && "Almost there — just a few quick details"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Focus */}
              {currentStep === 1 && (
                <RadioGroup
                  value={formData.focus}
                  onValueChange={(value) => setFormData({ ...formData, focus: value as typeof formData.focus })}
                  className="space-y-4"
                >
                  {focusOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                      <Label
                        htmlFor={option.id}
                        className="flex items-center space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex-shrink-0 text-primary">
                          {option.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-base">{option.title}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Step 2: Engagement */}
              {currentStep === 2 && (
                <RadioGroup
                  value={formData.engage}
                  onValueChange={(value) => setFormData({ ...formData, engage: value as typeof formData.engage })}
                  className="space-y-4"
                >
                  {engageOptions.map((option) => (
                    <div key={option.id} className="relative">
                      <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
                      <Label
                        htmlFor={option.id}
                        className="flex items-center space-x-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex-shrink-0 text-primary">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{option.title}</span>
                            {option.recommended && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {/* Step 3: Details */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredTime">Preferred time for a call</Label>
                    <Select value={formData.preferredTime} onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (9am-12pm)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12pm-5pm)</SelectItem>
                        <SelectItem value="evening">Evening (5pm-7pm)</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Anything else we should know?</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Optional: Tell us more about your goals or situation..."
                      rows={3}
                    />
                  </div>
                </form>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Started'}
                  </Button>
                )}
              </div>

              {/* Success state with calendar link - shown after form submission */}
              {currentStep === 4 && (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-success mx-auto" />
                  <h3 className="text-xl font-semibold">Thank you!</h3>
                  <p className="text-muted-foreground">
                    We've received your details and you'll be redirected to create your brief.
                  </p>
                  <Button asChild>
                    <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Or book a call instead
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Start;