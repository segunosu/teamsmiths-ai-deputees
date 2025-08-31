import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Plus, Check } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_certifiable: boolean;
}

interface WizardData {
  practical_skills: string[];
  tools: string[];
  outcome_preferences: string[];
  industries: string[];
  outcome_band_min: number;
  outcome_band_max: number;
  locales: string[];
  availability_weekly_hours: number;
}

const PRACTICAL_SKILLS = [
  'Agent Orchestration',
  'Workflow Automation',
  'RAG / Knowledge Agents',
  'Voice Agents',
  'Vision & Multimodal',
  'Data Pipelining',
  'Prompt Engineering (applied)',
  'Evaluation/Guardrails',
  'Integrations (APIs/Webhooks)',
  'MCP Servers & Tools'
];

const OUTCOME_PREFERENCES = [
  'Sales uplift',
  'Lead generation',
  'Customer support automation',
  'Ops automation',
  'Reporting & analytics',
  'Content scale-up',
  'Data cleanup/enrichment',
  'AI enablement/training'
];

const INDUSTRIES = [
  'SaaS',
  'E-commerce',
  'Construction',
  'Healthcare',
  'Finance',
  'Education',
  'Professional Services',
  'Manufacturing',
  'Public Sector'
];

const LOCALES = [
  'en-GB',
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'nl-NL'
];

interface Props {
  onComplete: () => void;
}

export function FreelancerOnboardingWizard({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolsByCategory, setToolsByCategory] = useState<Record<string, Tool[]>>({});
  const [showSuggestTool, setShowSuggestTool] = useState(false);
  const { toast } = useToast();

  const [wizardData, setWizardData] = useState<WizardData>({
    practical_skills: [],
    tools: [],
    outcome_preferences: [],
    industries: [],
    outcome_band_min: 0,
    outcome_band_max: 0,
    locales: ['en-GB'],
    availability_weekly_hours: 40
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const { data } = await supabase.functions.invoke('list-tools');
      if (data?.success) {
        setTools(data.tools);
        setToolsByCategory(data.toolsByCategory);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    }
  };

  const toggleSelection = (field: 'practical_skills' | 'tools' | 'outcome_preferences' | 'industries' | 'locales', value: string) => {
    setWizardData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const updateRange = (field: 'outcome_band_min' | 'outcome_band_max', value: number) => {
    setWizardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSuggestTool = async (toolData: any) => {
    try {
      const { data } = await supabase.functions.invoke('suggest-tool', {
        body: toolData
      });
      if (data?.success) {
        toast({
          title: "Tool suggested successfully",
          description: "We'll review your suggestion and add it to the catalog if approved."
        });
        setShowSuggestTool(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit tool suggestion",
        variant: "destructive"
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.functions.invoke('save-freelancer-profile', {
        body: wizardData
      });

      if (data?.success) {
        toast({
          title: "Profile completed!",
          description: "Your freelancer profile has been set up successfully."
        });
        onComplete();
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Your hands-on AI skills</CardTitle>
        <CardDescription>
          We prioritize builders who make things work in the real world.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PRACTICAL_SKILLS.map(skill => (
            <Badge
              key={skill}
              variant={wizardData.practical_skills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSelection('practical_skills', skill)}
            >
              {skill}
              {wizardData.practical_skills.includes(skill) && <Check className="w-3 h-3 ml-1" />}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tools you can ship with</CardTitle>
        <CardDescription>
          Pick what you've actually used in production. You can suggest a tool if it's missing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <div key={category}>
            <h3 className="font-medium mb-2">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {categoryTools.map(tool => (
                <Badge
                  key={tool.id}
                  variant={wizardData.tools.includes(tool.slug) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSelection('tools', tool.slug)}
                >
                  {tool.name}
                  {tool.is_certifiable && <span className="ml-1 text-xs">🏅</span>}
                  {wizardData.tools.includes(tool.slug) && <Check className="w-3 h-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        <Dialog open={showSuggestTool} onOpenChange={setShowSuggestTool}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Suggest a tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggest a Tool</DialogTitle>
            </DialogHeader>
            <SuggestToolForm onSubmit={handleSuggestTool} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>What outcomes do you deliver?</CardTitle>
        <CardDescription>
          Clients choose by outcome, not hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-2 block">Outcomes</Label>
          <div className="flex flex-wrap gap-2">
            {OUTCOME_PREFERENCES.map(outcome => (
              <Badge
                key={outcome}
                variant={wizardData.outcome_preferences.includes(outcome) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSelection('outcome_preferences', outcome)}
              >
                {outcome}
                {wizardData.outcome_preferences.includes(outcome) && <Check className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-base font-medium mb-2 block">Industries</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map(industry => (
              <Badge
                key={industry}
                variant={wizardData.industries.includes(industry) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSelection('industries', industry)}
              >
                {industry}
                {wizardData.industries.includes(industry) && <Check className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Outcome band & working language</CardTitle>
        <CardDescription>
          Choose your typical project band. We price by outcome, not timesheets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium mb-4 block">Typical Project Band (GBP)</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your typical project band (outcome-based, not hourly).
          </p>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">
                Minimum: {wizardData.outcome_band_min > 0 ? `£${wizardData.outcome_band_min.toLocaleString()}` : 'Not set'}
              </Label>
              <Slider
                value={[wizardData.outcome_band_min]}
                onValueChange={(value) => updateRange('outcome_band_min', value[0])}
                max={100000}
                min={1000}
                step={1000}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-sm">
                Maximum: {wizardData.outcome_band_max > 0 ? `£${wizardData.outcome_band_max.toLocaleString()}` : 'Not set'}
              </Label>
              <Slider
                value={[wizardData.outcome_band_max]}
                onValueChange={(value) => updateRange('outcome_band_max', value[0])}
                max={200000}
                min={5000}
                step={5000}
                className="mt-2"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Rates vary globally; this guides matching only. Final pricing is outcome-based.
          </p>
        </div>

        <div>
          <Label className="text-base font-medium mb-2 block">Working Languages</Label>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map(locale => (
              <Badge
                key={locale}
                variant={wizardData.locales.includes(locale) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleSelection('locales', locale)}
              >
                {locale}
                {wizardData.locales.includes(locale) && <Check className="w-3 h-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Setup Your Profile</h1>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of 4
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {[1, 2, 3, 4].map(step => (
          <div
            key={step}
            className={`flex-1 h-2 rounded-full ${
              step <= currentStep ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button onClick={handleNext}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save & Finish'}
          </Button>
        )}
      </div>
    </div>
  );
}

function SuggestToolForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    tool_name: '',
    category: '',
    description: '',
    use_case: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tool_name">Tool Name</Label>
        <Input
          id="tool_name"
          value={formData.tool_name}
          onChange={(e) => setFormData(prev => ({ ...prev, tool_name: e.target.value }))}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          placeholder="e.g., Agent Building, Gen Media"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the tool"
        />
      </div>
      <div>
        <Label htmlFor="use_case">Use Case</Label>
        <Textarea
          id="use_case"
          value={formData.use_case}
          onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
          placeholder="How do you use this tool in production?"
        />
      </div>
      <Button type="submit">Submit Suggestion</Button>
    </form>
  );
}