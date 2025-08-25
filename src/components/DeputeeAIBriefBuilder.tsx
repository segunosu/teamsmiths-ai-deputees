import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Clock, DollarSign, Users, Shield, Info, Bot, Edit3 } from 'lucide-react';
import { useAnalytics, AnalyticsEvent } from '@/hooks/useAnalytics';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AIResponse {
  interpretation: string;
  extracted_data: {
    key_points: string[];
    implied_timeline?: string;
    budget_hints?: string;
    success_metrics: string[];
  };
  follow_up?: string;
}

const DeputeeAIBriefBuilder = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();

  // Get prefill data from URL params
  const capabilityId = searchParams.get('capability_id');
  const packId = searchParams.get('pack_id');
  const briefOrigin = capabilityId ? 'capability' : packId ? 'catalog' : null;

  const [briefData, setBriefData] = useState({
    goal: '',
    context: '',
    constraints: '',
    budget_range: '',
    timeline: '',
    urgency: 'standard',
    expert_style: ''
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });

  const [aiResponses, setAiResponses] = useState<Record<string, AIResponse>>({});
  const [processingField, setProcessingField] = useState<string | null>(null);

  // Debounce timers per field
  const typingTimers = useRef<Record<string, number>>({});
  const DEBOUNCE_DELAY = 1500; // ms

  const [proposal, setProposal] = useState({
    roles: ['Growth Strategist', 'AI Consultant'],
    timeline: '4–6 weeks',
    budget: '£6,000–£10,000',
    milestones: [
      'Discovery & Strategy (Week 1)',
      'Implementation Phase 1 (Weeks 2–3)', 
      'Implementation Phase 2 (Weeks 4–5)',
      'QA Review & Optimization (Week 6)'
    ],
    successMetrics: [
      'Clear success metrics defined and tracked',
      'Outcome Assurance™ monitoring active'
    ],
    assuredMode: false
  });

  // Analytics tracking - now using proper hook
  const trackAnalyticsEvent = useCallback((eventName: keyof AnalyticsEvent, properties: any) => {
    trackEvent(eventName, { ...properties, brief_origin: briefOrigin });
  }, [briefOrigin, trackEvent]);

  // Deputee AI processing
  const processWithDeputeeAI = useCallback(async (message: string, field: string) => {
    if (!message.trim()) return;

    setProcessingField(field);
    
    try {
      const { data, error } = await supabase.functions.invoke('deputee-ai-brief', {
        body: { 
          message, 
          field, 
          context: briefData 
        }
      });

      if (error) throw error;

      setAiResponses(prev => ({
        ...prev,
        [field]: data
      }));

      // Auto-populate related fields if AI extracted data
      if (data.extracted_data) {
        const updates: Partial<typeof briefData> = {};
        
        if (field === 'goal' && data.extracted_data.implied_timeline && !briefData.timeline) {
          updates.timeline = data.extracted_data.implied_timeline;
        }
        
        if (data.extracted_data.budget_hints && !briefData.budget_range) {
          updates.budget_range = data.extracted_data.budget_hints;
        }

        if (Object.keys(updates).length > 0) {
          setBriefData(prev => ({ ...prev, ...updates }));
        }
      }

      trackAnalyticsEvent('brief_builder.ai_processed', { field, has_extraction: !!data.extracted_data });

    } catch (error) {
      console.error('Deputee AI error:', error);
      // Set a graceful fallback response instead of blocking
      setAiResponses(prev => ({
        ...prev,
        [field]: {
          interpretation: "I understand your input. Let me help you structure this information.",
          extracted_data: {
            key_points: [briefData[field]?.substring(0, 100) || "Input captured"],
            implied_timeline: null,
            budget_hints: null,
            success_metrics: []
          },
          follow_up: null
        }
      }));
    } finally {
      setProcessingField(null);
    }
  }, [briefData, toast, trackAnalyticsEvent]);

  // Debounced input handler
  const handleInputChange = useCallback((field: string, value: string) => {
    setBriefData(prev => ({ ...prev, [field]: value }));
    trackAnalyticsEvent('brief_builder.answer', { field, length: value.length });

    // Clear existing timer
    if (typingTimers.current[field]) {
      clearTimeout(typingTimers.current[field]);
    }

    // Set new timer for AI processing
    if (value.trim().length > 10) {
      typingTimers.current[field] = window.setTimeout(() => {
        processWithDeputeeAI(value, field);
      }, DEBOUNCE_DELAY);
    }
  }, [processWithDeputeeAI, trackAnalyticsEvent]);

  // Contact form submission
  const handleContactSubmit = async () => {
    if (!contactData.name || !contactData.email) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare structured brief data
      const structuredBrief = {
        goal: briefData.goal,
        ...briefData,
        ...aiResponses
      };

      // Submit to new brief system
      const { data, error } = await supabase.functions.invoke('submit-brief', {
        body: {
          contact_name: contactData.name,
          contact_email: contactData.email,
          contact_phone: contactData.phone,
          structured_brief: structuredBrief,
          proposal_json: proposal,
          assured_mode: proposal?.assuredMode || false,
          origin: briefOrigin || 'bespoke',
          origin_id: capabilityId || packId
        }
      });

      if (error) {
        console.error('Brief submission error:', error);
        toast({
          title: "Submission Issue",
          description: "We saved your answers locally. Please try again.",
          variant: "default"
        });
        return;
      }

      console.log('Brief submitted successfully:', data);
      
      trackAnalyticsEvent('brief_builder.submit_contact', { 
        brief_id: data.brief_id,
        origin: briefOrigin,
        origin_id: capabilityId || packId 
      });

      // Navigate to dashboard with success message
      toast({
        title: "Brief Submitted!",
        description: "Proposal generating — QA validation in <2h.",
      });
      
      // Navigate to dashboard with brief ID
      window.location.href = `/dashboard/briefs/${data.brief_id}`;

    } catch (error) {
      console.error('Brief submission error:', error);
      toast({
        title: "Submission Issue",
        description: "We saved your answers locally. Please try again.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProposal = () => {
    trackAnalyticsEvent('proposal.confirmed', { assured_mode: proposal.assuredMode });
    toast({
      title: "Proposal Confirmed",
      description: "We'll match you with the perfect expert within 24 hours.",
    });
    navigate('/dashboard');
  };

  const handleBookCuratorCall = () => {
    trackAnalyticsEvent('curator.booking_clicked', { 
      brief_id: 'current', 
      email: contactData.email 
    });
    
    const calendlyUrl = `https://calendly.com/osu/brief-chat?prefill_email=${encodeURIComponent(contactData.email)}&prefill_name=${encodeURIComponent(contactData.name)}`;
    window.open(calendlyUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (briefOrigin) {
      trackAnalyticsEvent('experts.intent_select', { intent: briefOrigin });
    }
  }, [briefOrigin, trackAnalyticsEvent]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      Object.values(typingTimers.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, []);

  if (showProposal) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Deputee™ AI™ Proposal Preview</h1>
            </div>
            <p className="text-muted-foreground">
              Based on your brief, here's what we recommend
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Recommended Solution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Expert Roles
                  </h4>
                  <ul className="space-y-1">
                    {proposal.roles.map((role, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        {role}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timeline
                  </h4>
                  <p className="text-lg font-medium text-primary">{proposal.timeline}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Budget Range
                </h4>
                <p className="text-lg font-medium text-primary">{proposal.budget}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Milestones</h4>
                <ul className="space-y-2">
                  {proposal.milestones.map((milestone, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                      {milestone}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Success Metrics</h4>
                <ul className="space-y-1">
                  {proposal.successMetrics.map((metric, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      {metric}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Assured Mode Toggle */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold">Outcome Assurance™ Mode</h4>
                      <p className="text-sm text-muted-foreground">
                        Additional monitoring + expert replacement insurance
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={proposal.assuredMode}
                    onCheckedChange={(checked) => 
                      setProposal(prev => ({ ...prev, assuredMode: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleConfirmProposal}>
              Confirm & Proceed
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleBookCuratorCall}>
              Book Curator Call Instead
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Deputee™ AI Brief Builder</h1>
          </div>
          <p className="text-muted-foreground">
            Tell us about your goal — our AI will interpret and structure your brief
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of 7</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / 7) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal" className="text-base font-semibold">
                    What's your business goal?
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Describe what you want to achieve. Be specific about timelines if you have them.
                  </p>
                  <Textarea
                    id="goal"
                    placeholder="e.g., 'Double our lead conversion rate within 3 months' or 'Streamline our customer onboarding process'"
                    value={briefData.goal}
                    onChange={(e) => handleInputChange('goal', e.target.value)}
                    className="min-h-[120px]"
                  />
                  
                  {/* AI Response */}
                  {processingField === 'goal' && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm text-primary">Deputee™ AI™ is analyzing...</span>
                      </div>
                    </div>
                  )}
                  
                  {aiResponses.goal && (
                    <Alert className="mt-3">
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Deputee™ AI™ interpretation:</strong>
                        <p className="mt-1">{aiResponses.goal.interpretation}</p>
                        {aiResponses.goal.extracted_data.key_points.length > 0 && (
                          <div className="mt-2">
                            <strong>Key points identified:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {aiResponses.goal.extracted_data.key_points.map((point, index) => (
                                <li key={index} className="text-sm">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="context" className="text-base font-semibold">
                    Tell us about your business
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Industry, company size, current situation
                  </p>
                  <Textarea
                    id="context"
                    placeholder="e.g., 'B2B SaaS startup, 50 employees, struggling with lead quality from paid ads'"
                    value={briefData.context}
                    onChange={(e) => handleInputChange('context', e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  {processingField === 'context' && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm text-primary">Deputee™ AI™ is analyzing...</span>
                      </div>
                    </div>
                  )}
                  
                  {aiResponses.context && (
                    <Alert className="mt-3">
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Deputee™ AI™ interpretation:</strong>
                        <p className="mt-1">{aiResponses.context.interpretation}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="constraints" className="text-base font-semibold">
                    Any constraints or requirements?
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Existing systems, compliance needs, specific requirements
                  </p>
                  <Textarea
                    id="constraints"
                    placeholder="e.g., 'Must integrate with Salesforce, need GDPR compliance, limited budget for new tools'"
                    value={briefData.constraints}
                    onChange={(e) => handleInputChange('constraints', e.target.value)}
                    className="min-h-[100px]"
                  />
                  
                  {processingField === 'constraints' && (
                    <div className="mt-3 p-3 bg-primary/5 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm text-primary">Deputee™ AI™ is analyzing...</span>
                      </div>
                    </div>
                  )}
                  
                  {aiResponses.constraints && (
                    <Alert className="mt-3">
                      <Bot className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Deputee™ AI™ interpretation:</strong>
                        <p className="mt-1">{aiResponses.constraints.interpretation}</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Budget Range</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    What's your budget for this project?
                  </p>
                  <Select value={briefData.budget_range} onValueChange={(value) => setBriefData(prev => ({ ...prev, budget_range: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-5k">Under £5,000</SelectItem>
                      <SelectItem value="5k-15k">£5,000 - £15,000</SelectItem>
                      <SelectItem value="15k-50k">£15,000 - £50,000</SelectItem>
                      <SelectItem value="50k-100k">£50,000 - £100,000</SelectItem>
                      <SelectItem value="over-100k">Over £100,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Timeline</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {briefData.timeline ? `AI detected: ${briefData.timeline}. Confirm or adjust:` : 'When do you need this completed?'}
                  </p>
                  <Select value={briefData.timeline} onValueChange={(value) => setBriefData(prev => ({ ...prev, timeline: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">ASAP (Rush job)</SelectItem>
                      <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                      <SelectItem value="3-4-weeks">3-4 weeks</SelectItem>
                      <SelectItem value="1-2-months">1-2 months</SelectItem>
                      <SelectItem value="3-6-months">3-6 months</SelectItem>
                      <SelectItem value="6-months-plus">6+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold">Urgency Level</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How urgent is this project?
                  </p>
                  <Select value={briefData.urgency} onValueChange={(value) => setBriefData(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Can wait</SelectItem>
                      <SelectItem value="standard">Standard - Normal priority</SelectItem>
                      <SelectItem value="high">High - Important for business</SelectItem>
                      <SelectItem value="critical">Critical - Business impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Preferred Working Style</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    How do you like to work with experts?
                  </p>
                  <Select value={briefData.expert_style} onValueChange={(value) => setBriefData(prev => ({ ...prev, expert_style: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select working style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hands-off">Hands-off - Just deliver results</SelectItem>
                      <SelectItem value="collaborative">Collaborative - Regular check-ins</SelectItem>
                      <SelectItem value="hands-on">Hands-on - Close partnership</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 7 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Almost there!</h3>
                  <p className="text-muted-foreground">
                    Just need your contact details to match you with the perfect expert
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactData.name}
                      onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={contactData.company}
                      onChange={(e) => setContactData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      value={contactData.phone}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+44 xxx xxx xxxx"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {currentStep < 7 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
              disabled={
                (currentStep === 1 && !briefData.goal.trim()) ||
                (currentStep === 2 && !briefData.context.trim()) ||
                (currentStep === 4 && !briefData.budget_range) ||
                (currentStep === 5 && !briefData.timeline)
              }
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleContactSubmit}
              disabled={loading || !contactData.name || !contactData.email}
            >
              {loading ? 'Processing...' : 'Generate Proposal'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeputeeAIBriefBuilder;