import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface MatchingSettings {
  min_score_default: number;
  max_invites_default: number;
  auto_match_enabled: boolean;
  tool_synonyms: Record<string, string>;
  industry_synonyms: Record<string, string>;
}

const AdminMatchingSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<MatchingSettings>({
    min_score_default: 0.65,
    max_invites_default: 5,
    auto_match_enabled: false,
    tool_synonyms: {},
    industry_synonyms: {}
  });
  const [toolSynonymsText, setToolSynonymsText] = useState('');
  const [industrySynonymsText, setIndustrySynonymsText] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_get_matching_settings');
      
      if (error) throw error;

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const settingsData = data as unknown as MatchingSettings;
        setSettings(settingsData);
        
        // Convert JSON objects to readable text format
        setToolSynonymsText(JSON.stringify(settingsData.tool_synonyms || {}, null, 2));
        setIndustrySynonymsText(JSON.stringify(settingsData.industry_synonyms || {}, null, 2));
      }
    } catch (error: any) {
      toast({
        title: 'Error loading settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Parse JSON text inputs
      let toolSynonyms = {};
      let industrySynonyms = {};
      
      try {
        toolSynonyms = toolSynonymsText ? JSON.parse(toolSynonymsText) : {};
      } catch {
        throw new Error('Invalid JSON format in tool synonyms');
      }
      
      try {
        industrySynonyms = industrySynonymsText ? JSON.parse(industrySynonymsText) : {};
      } catch {
        throw new Error('Invalid JSON format in industry synonyms');
      }

      const settingsToSave = {
        ...settings,
        tool_synonyms: toolSynonyms,
        industry_synonyms: industrySynonyms
      };

      const { error } = await supabase.rpc('admin_update_matching_settings', {
        p_settings: settingsToSave
      });

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Matching settings have been updated successfully.',
      });
      
      // Reload to confirm changes
      await loadSettings();
      
    } catch (error: any) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = () => {
    setSettings({
      min_score_default: 0.65,
      max_invites_default: 5,
      auto_match_enabled: false,
      tool_synonyms: {
        "hubspot ai": "hubspot",
        "notion ai": "notion", 
        "zapier": "automation",
        "chatgpt": "openai",
        "claude": "anthropic"
      },
      industry_synonyms: {
        "construction & trades": "construction",
        "e-commerce": "ecommerce",
        "software as a service": "saas"
      }
    });
    
    setToolSynonymsText(JSON.stringify({
      "hubspot ai": "hubspot",
      "notion ai": "notion",
      "zapier": "automation", 
      "chatgpt": "openai",
      "claude": "anthropic"
    }, null, 2));
    
    setIndustrySynonymsText(JSON.stringify({
      "construction & trades": "construction",
      "e-commerce": "ecommerce", 
      "software as a service": "saas"
    }, null, 2));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
            <CardDescription>Core matching parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="min-score">
                Min Score Default: {settings.min_score_default}
              </Label>
              <input
                id="min-score"
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.min_score_default}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  min_score_default: parseFloat(e.target.value)
                }))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0.1</span>
                <span>1.0</span>
              </div>
            </div>

            <div>
              <Label htmlFor="max-invites">
                Max Invites Default: {settings.max_invites_default}
              </Label>
              <input
                id="max-invites"
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.max_invites_default}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  max_invites_default: parseInt(e.target.value)
                }))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-match">Auto-Match Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically match and invite experts every 15 minutes
                </p>
              </div>
              <Switch
                id="auto-match"
                checked={settings.auto_match_enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  auto_match_enabled: checked
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Enhancement */}
        <Card>
          <CardHeader>
            <CardTitle>AI Enhancement</CardTitle>
            <CardDescription>Improve matching accuracy with synonyms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tool-synonyms">Tool Synonyms (JSON)</Label>
              <Textarea
                id="tool-synonyms"
                value={toolSynonymsText}
                onChange={(e) => setToolSynonymsText(e.target.value)}
                placeholder='{"hubspot ai": "hubspot", "notion ai": "notion"}'
                className="mt-2 font-mono text-sm"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Map alternative tool names to standard terms
              </p>
            </div>

            <div>
              <Label htmlFor="industry-synonyms">Industry Synonyms (JSON)</Label>
              <Textarea
                id="industry-synonyms"
                value={industrySynonymsText}
                onChange={(e) => setIndustrySynonymsText(e.target.value)}
                placeholder='{"construction & trades": "construction"}'
                className="mt-2 font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Map industry variations to standard categories
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button variant="outline" onClick={restoreDefaults}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Restore Defaults
        </Button>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default AdminMatchingSettings;