import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Clock, DollarSign, Users, Shield, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const BriefBuilder = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get prefill data from URL params
  const capabilityId = searchParams.get('capability_id');
  const packId = searchParams.get('pack_id');
  const briefOrigin = capabilityId ? 'capability' : packId ? 'catalog' : null;
  const [prefilledOutcome, setPrefilledOutcome] = useState<string>('');

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

  const [aiResponses, setAiResponses] = useState({
    goal: '',
    context: '',
    constraints: '',
    budget: '',
    timeline: '',
    urgency: '',
    style: ''
  });

  // Debounce timers per-field to avoid calling AI on every keystroke
  const typingTimers = useRef<Record<string, number | undefined>>({});

  const [showContactForm, setShowContactForm] = useState(false);

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

  // Track analytics events
  const trackEvent = (eventName: string, properties = {}) => {
    // Analytics implementation would go here
    console.log('Analytics:', eventName, properties);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track intent selection
    if (briefOrigin) {
      trackEvent('experts.intent_select', { 
        intent: briefOrigin === 'capability' ? 'brief' : 'catalog' 
      });
      
      if (capabilityId) {
        trackEvent('capability.customize_clicked', { capability_id: capabilityId });
      } else if (packId) {
        trackEvent('catalog.customize_clicked', { pack_id: packId });
      }
    }
  }, []);

  // Prefill data based on capability or pack
  useEffect(() => {
    const loadPrefillData = () => {
      if (capabilityId) {
        // Map capability IDs to prefill data
        const capabilityMappings: Record<string, any> = {
          'sales-proposal-accelerator': {
            goal: 'Close deals faster with AI-assisted proposals',
            tools: 'Deputee Uplift™, HubSpot AI, Docs AI',
            success_metric: '40% faster proposal cycle',
            outcome: 'Sales Proposal Accelerator'
          },
          'marketing-content-engine': {
            goal: 'Scale content that converts with AI workflows',
            tools: 'Canva, Suno, Copy.ai, Meta Advantage',
            success_metric: '3× engagement uplift',
            outcome: 'Marketing Content Engine'
          },
          'ops-streamliner': {
            goal: 'Save 120+ hours/month with workflow automation',
            tools: 'Notion AI, Zapier, Deputee Uplift™',
            success_metric: '120+ hours saved/month',
            outcome: 'Ops Streamliner'
          },
          'data-insight-translator': {
            goal: 'Get next best actions from your data in 48h',
            tools: 'Deputee CI Lead™, Power BI, ChatGPT',
            success_metric: 'Next best actions in 48h',
            outcome: 'Data Insight Translator'
          },
          'customer-success-multiplier': {
            goal: 'Boost retention +25% with proactive AI',
            tools: 'Intercom AI, Notion, Deputee Uplift™',
            success_metric: '+25% retention',
            outcome: 'Customer Success Multiplier'
          }
        };

        const prefillData = capabilityMappings[capabilityId];
        if (prefillData) {
          setBriefData(prev => ({
            ...prev,
            goal: prefillData.goal,
            constraints: `Tools: ${prefillData.tools}`
          }));
          setPrefilledOutcome(prefillData.outcome);
        }
      } else if (packId) {
        // This would fetch pack data from database in real implementation
        setPrefilledOutcome('Selected Outcome Pack');
        setBriefData(prev => ({
          ...prev,
          goal: 'Customize this outcome pack to fit your specific needs'
        }));
      }
    };

    loadPrefillData();
  }, [capabilityId, packId]);

  const handleInputChange = (field: string, value: string) => {
    setBriefData(prev => ({ ...prev, [field]: value }));

    // Track analytics for answers
    trackEvent('brief_builder.answer', {
      brief_id: `brief_${Date.now()}`,
      question_id: field,
      value: value.slice(0, 50) // Truncate for privacy
    });

    // Cancel any pending call for this field
    const currentTimer = typingTimers.current[field];
    if (currentTimer) window.clearTimeout(currentTimer);

    // Only trigger sensemaking when the user has typed a meaningful chunk
    const trimmed = value.trim();
    if (trimmed.length < 8) {
      setAiResponses(prev => ({ ...prev, [field]: '' }));
      return;
    }

    // Don't trigger AI for prefilled placeholder values
    if (briefOrigin && field === 'goal' && trimmed === briefData.goal && !trimmed.includes('Customize this outcome')) {
      return;
    }

    typingTimers.current[field] = window.setTimeout(() => {
      generateAiResponse(field, trimmed);
    }, 700);
  };

  const generateAiResponse = async (field: string, value: string) => {
    if (!value.trim()) return;

    const fieldFallbacks: Record<string, string> = {
      goal: "Try a clear objective in one sentence (e.g., 'Increase qualified leads by 30% by December'). You can add details later.",
      context: "Add company type, size or industry if relevant.",
      constraints: "Share any constraints (time, budget, compliance) if important.",
      budget_range: "Pick a range that feels right; we can refine later.",
      timeline: "State a rough target date or duration.",
      urgency: "Choose urgent, standard, or flexible.",
      expert_style: "Prefer strategic, hands-on, or hybrid?"
    };

    try {
      const { data, error } = await supabase.functions.invoke('brief-sensemaking', {
        body: { field, value }
      });

      if (error) throw error;

      const interpreted: string = data?.interpreted ?? '';
      const confidence: number = data?.confidence ?? 0.0;
      const warnings: string[] = data?.warnings ?? [];

      let response = interpreted?.trim();
      if (!response) {
        response = fieldFallbacks[field] || "Let's keep going.";
      } else if (confidence < 0.4) {
        response = `${response} (Confidence is low — refine if this misses the mark.)`;
      }

      setAiResponses(prev => ({
        ...prev,
        [field]: response
      }));
    } catch (err) {
      console.error('Sensemaking failed', err);
      setAiResponses(prev => ({
        ...prev,
        [field]: fieldFallbacks[field] || 'Please add a bit more detail.'
      }));
    }
  };
  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowContactForm(true);
    }
  };

  const handleContactSubmit = async () => {
    setLoading(true);
    
    // Track analytics
    trackEvent('brief_builder.submit_contact', { 
      brief_id: `brief_${Date.now()}`,
      origin: briefOrigin 
    });
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowProposal(true);
    setLoading(false);
    
    // Track proposal preview
    trackEvent('proposal.preview_shown', { 
      brief_id: `brief_${Date.now()}`,
      origin: briefOrigin 
    });
    
    toast({
      title: "Proposal Generated!",
      description: "Deputee™ AI™ has created your instant proposal. QA validation in <2 hours.",
    });
  };

  const handleConfirmProposal = () => {
    trackEvent('proposal.confirmed', { 
      brief_id: `brief_${Date.now()}`,
      assured_mode: proposal.assuredMode,
      origin: briefOrigin 
    });
    
    toast({
      title: "Proposal Confirmed!",
      description: "Our team will contact you within 2 hours to finalize your project.",
    });
  };

  const handleCuratorBooking = () => {
    trackEvent('curator.booking_clicked', { 
      brief_id: `brief_${Date.now()}`,
      origin: briefOrigin 
    });
    
    window.open('https://calendly.com/osu/brief-chat?brief_id=123&email=' + encodeURIComponent(contactData.email || ''), '_blank');
  };

  const steps = [
    { number: 1, title: "Project Goal", field: "goal" },
    { number: 2, title: "Context", field: "context" },
    { number: 3, title: "Constraints", field: "constraints" },
    { number: 4, title: "Budget Range", field: "budget_range" },
    { number: 5, title: "Timeline", field: "timeline" },
    { number: 6, title: "Urgency", field: "urgency" },
    { number: 7, title: "Expert Style", field: "expert_style" }
  ];

  if (showProposal) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Deputee™ AI™ Proposal Preview</h1>
            <p className="text-muted-foreground">AI-generated; QA validation in &lt;2 hours.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Instant Proposal
                  </CardTitle>
                  <CardDescription>
                    Based on your brief, here's what Deputee™ AI™ recommends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Recommended Expert Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {proposal.roles.map((role, idx) => (
                        <Badge key={idx} variant="secondary">{role}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Estimated Timeline
                    </h3>
                    <p className="text-lg font-medium text-primary">{proposal.timeline}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Budget Range
                    </h3>
                    <p className="text-lg font-medium text-primary">{proposal.budget}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Project Milestones</h3>
                    <ul className="space-y-2">
                      {proposal.milestones.map((milestone, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Success Metrics</h3>
                    <ul className="space-y-2">
                      {proposal.successMetrics.map((metric, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">Enable Assured Mode</span>
                      </div>
                      <Badge variant="outline" className="text-xs">QA + insurance add-on</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get additional QA coverage and expert replacement insurance
                    </p>
                    <Button 
                      variant={proposal.assuredMode ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setProposal(prev => ({ ...prev, assuredMode: !prev.assuredMode }))}
                    >
                      {proposal.assuredMode ? 'Assured Mode Enabled' : 'Enable Assured Mode'}
                    </Button>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button onClick={handleConfirmProposal} size="lg" className="w-full">
                      Confirm & Proceed
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="w-full"
                      onClick={handleCuratorBooking}
                    >
                      Book a 15-min curator call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>What Happens Next</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Deputee™ AI generates draft proposal instantly</div>
                      <div className="text-sm text-muted-foreground">Automated matching & scoping</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">QA team validates in &lt;2 hours</div>
                      <div className="text-sm text-muted-foreground">Human verification of AI recommendations</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Optional consultation call if needed</div>
                      <div className="text-sm text-muted-foreground">Clarify any complex requirements</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium">Final quote & milestone-based project start</div>
                      <div className="text-sm text-muted-foreground">Outcome Assurance™ activated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-muted/10">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" onClick={() => setShowContactForm(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Brief
            </Button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Almost There!</h1>
            <p className="text-muted-foreground mb-4">
              Let's get your contact details so we can send you the proposal and next steps
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Contact Information</CardTitle>
              <CardDescription>
                We'll use this to send your instant Deputee™ AI proposal and coordinate next steps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={contactData.name}
                    onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={contactData.email}
                    onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    placeholder="Acme Corp"
                    value={contactData.company}
                    onChange={(e) => setContactData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+44 123 456 7890"
                    value={contactData.phone}
                    onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleContactSubmit} 
                  disabled={loading || !contactData.name || !contactData.email || !contactData.company}
                  size="lg" 
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Confirm & Get My Proposal'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-muted/10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Deputee™ AI™ Brief Builder</h1>
          <p className="text-muted-foreground mb-4">
            Deputee™ AI™ is drafting your plan in real time.
          </p>
          {briefOrigin && prefilledOutcome && (
            <Alert className="max-w-2xl mx-auto mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                You're customizing the <strong>{prefilledOutcome}</strong> outcome. Deputee™ AI™ has prefilled the details — adjust anything you like.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant="outline">Step {currentStep} of 7</Badge>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Instant AI matching</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {steps[currentStep - 1].title}
                </CardTitle>
                <CardDescription>
                  {currentStep === 1 && "What's your main goal or challenge?"}
                  {currentStep === 2 && "Tell us about your company/industry"}
                  {currentStep === 3 && "Any specific constraints or focus areas?"}
                  {currentStep === 4 && "What's your budget range?"}
                  {currentStep === 5 && "What's your preferred timeline?"}
                  {currentStep === 6 && "How urgent is this project?"}
                  {currentStep === 7 && "What expert style do you prefer?"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 1 && (
                  <div>
                    <Textarea
                      placeholder="Grow inbound leads by 30%"
                      value={briefData.goal}
                      onChange={(e) => handleInputChange('goal', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <Textarea
                      placeholder="B2B SaaS, 15 staff, £2M turnover"
                      value={briefData.context}
                      onChange={(e) => handleInputChange('context', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <Textarea
                      placeholder="We need fast results within 2 months"
                      value={briefData.constraints}
                      onChange={(e) => handleInputChange('constraints', e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <Select onValueChange={(value) => handleInputChange('budget_range', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3950-6000">£3,950–£6,000</SelectItem>
                        <SelectItem value="6000-10000">£6,000–£10,000</SelectItem>
                        <SelectItem value="10000-20000">£10,000–£20,000</SelectItem>
                        <SelectItem value="20000+">£20,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentStep === 5 && (
                  <div>
                    <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-4weeks">2–4 weeks</SelectItem>
                        <SelectItem value="1-2months">1–2 months</SelectItem>
                        <SelectItem value="3+months">3+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {currentStep === 6 && (
                  <div>
                    <Select onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      Deputee™ AI will balance urgency against cost
                    </p>
                  </div>
                )}

                {currentStep === 7 && (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {['Hands-on implementer', 'Strategic advisor', 'Hybrid'].map((style) => (
                        <Button
                          key={style}
                          variant={briefData.expert_style === style ? 'default' : 'outline'}
                          onClick={() => handleInputChange('expert_style', style)}
                          className="h-auto p-4 text-center"
                        >
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Response */}
                {aiResponses[steps[currentStep - 1].field as keyof typeof aiResponses] && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription className="font-medium">
                      <span className="text-primary">Deputee™ AI:</span> {aiResponses[steps[currentStep - 1].field as keyof typeof aiResponses]}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  <Button onClick={handleNext}>
                    {currentStep === 7 ? 'Continue to Contact Details' : 'Next'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Deputee™ AI Process
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.number} className={`flex items-center gap-3 ${step.number <= currentStep ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.number < currentStep ? 'bg-success text-success-foreground' :
                        step.number === currentStep ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.number < currentStep ? <CheckCircle className="h-3 w-3" /> : step.number}
                      </div>
                      <span className={`text-sm ${step.number <= currentStep ? 'font-medium' : ''}`}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-sm">Why Deputee™ AI?</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Instant expert matching</li>
                    <li>• Outcome Assurance™ built-in</li>
                    <li>• QA validation in &lt;2 hours</li>
                    <li>• Premium consulting experience</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BriefBuilder;