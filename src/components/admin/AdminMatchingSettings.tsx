import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Settings } from 'lucide-react';

interface MatchingSettings {
  outcome_weight: number;
  tools_weight: number;
  industry_weight: number;
  availability_weight: number;
  history_weight: number;
  min_score_default: number;
  max_invites_default: number;
  cert_boost: number;
  boost_verified_certs: boolean;
  normalize_region_rates: boolean;
  hide_hourly_rates: boolean;
  tool_synonyms: Record<string, string[]>;
  industry_synonyms: Record<string, string[]>;
}

const defaultSettings: MatchingSettings = {
  outcome_weight: 0.40,
  tools_weight: 0.30,
  industry_weight: 0.15,
  availability_weight: 0.10,
  history_weight: 0.05,
  min_score_default: 0.65,
  max_invites_default: 5,
  cert_boost: 0.10,
  boost_verified_certs: true,
  normalize_region_rates: true,
  hide_hourly_rates: true,
  tool_synonyms: {},
  industry_synonyms: {}
};

export default function AdminMatchingSettings() {
  const [settings, setSettings] = useState<MatchingSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [synonymsText, setSynonymsText] = useState('{}');
  const [industrySynonymsText, setIndustrySynonymsText] = useState('{}');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-get-matching-settings');
      
      if (error) throw error;
      
      if (data?.success) {
        const loadedSettings = { ...defaultSettings, ...data.settings };
        setSettings(loadedSettings);
        setSynonymsText(JSON.stringify(loadedSettings.tool_synonyms, null, 2));
        setIndustrySynonymsText(JSON.stringify(loadedSettings.industry_synonyms, null, 2));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load matching settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Parse synonyms JSON
      let toolSynonyms = {};
      let industrySynonyms = {};
      
      try {
        toolSynonyms = JSON.parse(synonymsText);
      } catch {
        toast({
          title: 'Error',
          description: 'Invalid JSON in tool synonyms',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }
      
      try {
        industrySynonyms = JSON.parse(industrySynonymsText);
      } catch {
        toast({
          title: 'Error',
          description: 'Invalid JSON in industry synonyms',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const settingsToSave = {
        ...settings,
        tool_synonyms: toolSynonyms,
        industry_synonyms: industrySynonyms
      };

      const { data, error } = await supabase.functions.invoke('admin-update-matching-settings', {
        body: settingsToSave
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Success',
          description: 'Matching settings saved successfully',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save matching settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleWeightChange = (key: keyof MatchingSettings, value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSwitchChange = (key: keyof MatchingSettings, checked: boolean) => {
    setSettings(prev => ({ ...prev, [key]: checked }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setSynonymsText('{}');
    setIndustrySynonymsText('{}');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Matching Settings
          </h1>
          <p className="text-muted-foreground">
            Configure matching algorithm weights and behavior
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Weights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Outcomes ({settings.outcome_weight.toFixed(2)})</Label>
              <Slider
                value={[settings.outcome_weight]}
                onValueChange={(value) => handleWeightChange('outcome_weight', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Tools ({settings.tools_weight.toFixed(2)})</Label>
              <Slider
                value={[settings.tools_weight]}
                onValueChange={(value) => handleWeightChange('tools_weight', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Industry ({settings.industry_weight.toFixed(2)})</Label>
              <Slider
                value={[settings.industry_weight]}
                onValueChange={(value) => handleWeightChange('industry_weight', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Availability ({settings.availability_weight.toFixed(2)})</Label>
              <Slider
                value={[settings.availability_weight]}
                onValueChange={(value) => handleWeightChange('availability_weight', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Case Study History ({settings.history_weight.toFixed(2)})</Label>
              <Slider
                value={[settings.history_weight]}
                onValueChange={(value) => handleWeightChange('history_weight', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Total: {(settings.outcome_weight + settings.tools_weight + settings.industry_weight + settings.availability_weight + settings.history_weight).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Matching Defaults & Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Defaults & Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Default Min Score ({settings.min_score_default})</Label>
              <Slider
                value={[settings.min_score_default]}
                onValueChange={(value) => handleWeightChange('min_score_default', value)}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Default Max Invites ({settings.max_invites_default})</Label>
              <Slider
                value={[settings.max_invites_default]}
                onValueChange={(value) => handleWeightChange('max_invites_default', value)}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Certification Boost (+{settings.cert_boost.toFixed(2)})</Label>
              <Slider
                value={[settings.cert_boost]}
                onValueChange={(value) => handleWeightChange('cert_boost', value)}
                min={0}
                max={0.20}
                step={0.01}
                className="w-full"
              />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Boost verified certifications</Label>
                  <p className="text-sm text-muted-foreground">Add score boost for verified certs</p>
                </div>
                <Switch
                  checked={settings.boost_verified_certs}
                  onCheckedChange={(checked) => handleSwitchChange('boost_verified_certs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Normalize region rates</Label>
                  <p className="text-sm text-muted-foreground">Don't penalize by geographic cost differences</p>
                </div>
                <Switch
                  checked={settings.normalize_region_rates}
                  onCheckedChange={(checked) => handleSwitchChange('normalize_region_rates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Hide hourly rates</Label>
                  <p className="text-sm text-muted-foreground">Show outcome bands instead of hourly rates</p>
                </div>
                <Switch
                  checked={settings.hide_hourly_rates}
                  onCheckedChange={(checked) => handleSwitchChange('hide_hourly_rates', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tool Synonyms */}
        <Card>
          <CardHeader>
            <CardTitle>Tool Synonyms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Tool Synonyms (JSON)</Label>
              <Textarea
                value={synonymsText}
                onChange={(e) => setSynonymsText(e.target.value)}
                placeholder='{"OpenAI": ["GPT", "ChatGPT"], "N8N": ["n8n.io"]}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define tool aliases for better matching. Format: {`{"tool": ["synonym1", "synonym2"]}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Industry Synonyms */}
        <Card>
          <CardHeader>
            <CardTitle>Industry Synonyms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Industry Synonyms (JSON)</Label>
              <Textarea
                value={industrySynonymsText}
                onChange={(e) => setIndustrySynonymsText(e.target.value)}
                placeholder='{"SaaS": ["Software", "Tech"], "E-commerce": ["eCommerce", "Online Retail"]}'
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Define industry aliases for better matching. Format: {`{"industry": ["synonym1", "synonym2"]}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}