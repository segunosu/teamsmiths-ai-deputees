import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Clock, DollarSign, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const BriefBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [briefData, setBriefData] = useState({
    goal: '',
    context: '',
    constraints: '',
    budget_range: '',
    timeline: '',
    urgency: 'standard',
    expert_style: ''
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

  const [proposal, setProposal] = useState({
    roles: ['Growth Strategist', 'AI Consultant'],
    timeline: '4–6 weeks',
    budget: '£3,950–£6,250',
    roiBenchmark: 'Typical 200-300% ROI within 6 months'
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setBriefData(prev => ({ ...prev, [field]: value }));
    
    // Simulate AI response with realistic delays
    setTimeout(() => {
      generateAiResponse(field, value);
    }, 800);
  };

  const generateAiResponse = (field: string, value: string) => {
    const responses = {
      goal: `I've understood that you want to ${value.toLowerCase()}. That typically involves strategic planning and execution. Does that sound right?`,
      context: `Thanks. Many SMBs in your industry face challenges with scaling efficiently. I'll factor that into your project scope.`,
      constraints: `Got it — ${value.toLowerCase()} is important. I'll suggest experts and timelines that address your specific needs.`,
      budget: `Thanks. I'll align recommendations with the budget range you've set.`,
      timeline: `Noted. This timeline will influence the mix of experts I propose.`,
      urgency: `Understood. Deputee™ AI will balance urgency against cost optimization.`,
      style: `Perfect. I'll weight recommendations toward experts who match this approach.`
    };

    setAiResponses(prev => ({
      ...prev,
      [field]: responses[field as keyof typeof responses] || `Thanks for that information about ${field}.`
    }));
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowProposal(true);
    setLoading(false);
    
    toast({
      title: "Proposal Generated!",
      description: "Deputee™ AI has created your instant proposal. QA validation in progress.",
    });
  };

  const handleConfirmProposal = () => {
    if (!user) {
      navigate('/auth?flow=signup&redirect=brief-builder');
      return;
    }
    
    toast({
      title: "Proposal Confirmed!",
      description: "Proceeding to project setup and milestone creation.",
    });
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
            <h1 className="text-3xl font-bold mb-2">Deputee™ AI Proposal Preview</h1>
            <p className="text-muted-foreground">AI-generated proposal • QA confirmation in &lt;2 hours</p>
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
                    Based on your brief, here's what Deputee™ AI recommends
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
                    <h3 className="font-semibold mb-2">ROI Benchmark</h3>
                    <p className="text-muted-foreground">{proposal.roiBenchmark}</p>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleConfirmProposal} size="lg" className="w-full">
                      Confirm & Proceed
                      <ArrowRight className="ml-2 h-4 w-4" />
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
          <h1 className="text-3xl font-bold mb-2">Deputee™ AI Brief Builder</h1>
          <p className="text-muted-foreground mb-4">
            Let our AI guide you through creating the perfect project brief
          </p>
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
                  <Button onClick={handleNext} disabled={loading}>
                    {loading ? 'Processing...' : currentStep === 7 ? 'Generate Proposal' : 'Next'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
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