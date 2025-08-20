import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

const AdminIntakeSettings = () => {
  const [settings, setSettings] = useState({
    allow_custom_request_without_login: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'allow_custom_request_without_login')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.setting_value) {
        const value = data.setting_value as any;
        setSettings({
          allow_custom_request_without_login: value?.enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'allow_custom_request_without_login',
          setting_value: { enabled: settings.allow_custom_request_without_login },
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Intake & Access
        </CardTitle>
        <CardDescription>
          Configure how clients can submit customization requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="allow-without-login">Allow customization request without login</Label>
            <p className="text-sm text-muted-foreground">
              When ON, visitors can submit a brief with email and receive a magic-link to claim their request. When OFF, login is required before submitting.
            </p>
          </div>
          <Switch
            id="allow-without-login"
            checked={settings.allow_custom_request_without_login}
            onCheckedChange={(checked) => 
              setSettings({ allow_custom_request_without_login: checked })
            }
          />
        </div>

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminIntakeSettings;