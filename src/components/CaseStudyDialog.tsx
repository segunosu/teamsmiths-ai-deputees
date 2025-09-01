import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';

interface CaseStudyDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

const COMMON_TOOLS = [
  'OpenAI GPT', 'Claude', 'LangChain', 'Pinecone', 'Supabase', 'N8N', 'Zapier', 'Make.com',
  'Whisper', 'ElevenLabs', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Retool', 'Bubble',
  'Airtable', 'HubSpot', 'Salesforce', 'Notion', 'Slack'
];

const COMMON_INDUSTRIES = [
  'SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Education', 'Professional Services',
  'Manufacturing', 'Construction', 'Public Sector', 'Marketing', 'Real Estate'
];

export function CaseStudyDialog({ children, onSuccess }: CaseStudyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    tools: [] as string[],
    industries: [] as string[],
    metrics: {},
    evidence_url: ''
  });
  const [newTool, setNewTool] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');

  const addTool = (tool: string) => {
    if (tool && !formData.tools.includes(tool)) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, tool]
      }));
    }
    setNewTool('');
  };

  const removeTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter(t => t !== tool)
    }));
  };

  const addIndustry = (industry: string) => {
    if (industry && !formData.industries.includes(industry)) {
      setFormData(prev => ({
        ...prev,
        industries: [...prev.industries, industry]
      }));
    }
    setNewIndustry('');
  };

  const removeIndustry = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      industries: prev.industries.filter(i => i !== industry)
    }));
  };

  const addMetric = () => {
    if (metricKey && metricValue) {
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricKey]: metricValue
        }
      }));
      setMetricKey('');
      setMetricValue('');
    }
  };

  const removeMetric = (key: string) => {
    setFormData(prev => {
      const newMetrics = { ...prev.metrics };
      delete newMetrics[key];
      return {
        ...prev,
        metrics: newMetrics
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('case_studies')
        .insert([{
          user_id: user.id,
          title: formData.title,
          summary: formData.summary,
          tools: formData.tools,
          industries: formData.industries,
          metrics: formData.metrics,
          evidence_url: formData.evidence_url || null,
          source: 'manual',
          is_verified: false
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Case study added successfully! It will be reviewed for verification.',
      });

      setFormData({
        title: '',
        summary: '',
        tools: [],
        industries: [],
        metrics: {},
        evidence_url: ''
      });
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add case study',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Case Study</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., AI-Powered Customer Support Chatbot"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Project Summary *</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Describe the project, challenges solved, and your approach..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tools & Technologies Used</Label>
            <div className="flex gap-2 mb-2">
              <select
                className="flex-1 p-2 border rounded"
                value=""
                onChange={(e) => e.target.value && addTool(e.target.value)}
              >
                <option value="">Select a tool...</option>
                {COMMON_TOOLS.map(tool => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom tool"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTool(newTool))}
                />
                <Button type="button" size="sm" onClick={() => addTool(newTool)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tools.map(tool => (
                <Badge key={tool} variant="secondary" className="flex items-center gap-1">
                  {tool}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTool(tool)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Industries</Label>
            <div className="flex gap-2 mb-2">
              <select
                className="flex-1 p-2 border rounded"
                value=""
                onChange={(e) => e.target.value && addIndustry(e.target.value)}
              >
                <option value="">Select an industry...</option>
                {COMMON_INDUSTRIES.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry(newIndustry))}
                />
                <Button type="button" size="sm" onClick={() => addIndustry(newIndustry)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.industries.map(industry => (
                <Badge key={industry} variant="outline" className="flex items-center gap-1">
                  {industry}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeIndustry(industry)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Success Metrics</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Metric name (e.g., Response Time)"
                value={metricKey}
                onChange={(e) => setMetricKey(e.target.value)}
              />
              <Input
                placeholder="Value (e.g., Reduced by 80%)"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
              />
              <Button type="button" onClick={addMetric}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {Object.entries(formData.metrics).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">
                    <strong>{key}:</strong> {String(value)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMetric(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evidence_url">Evidence URL (optional)</Label>
            <Input
              id="evidence_url"
              type="url"
              value={formData.evidence_url}
              onChange={(e) => setFormData(prev => ({ ...prev, evidence_url: e.target.value }))}
              placeholder="https://... (link to live project, repository, or case study)"
            />
            <p className="text-xs text-muted-foreground">
              Providing evidence helps with verification and increases credibility
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Adding...' : 'Add Case Study'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}