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
      const { error } = await supabase.rpc('update_admin_setting', {
        p_key: 'allow_custom_request_without_login',
        p_value: { enabled: settings.allow_custom_request_without_login }
      });

      if (error) throw error;

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save settings: ${error.message || 'Unknown error'}`);
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
            onCheckedChange={async (checked) => {
              const originalValue = settings.allow_custom_request_without_login;
              
              // Optimistic update
              setSettings({ allow_custom_request_without_login: checked });
              setSaving(true);
              
              try {
                const { error } = await supabase.rpc('update_admin_setting', {
                  p_key: 'allow_custom_request_without_login',
                  p_value: { enabled: checked }
                });

                if (error) throw error;

                toast.success(`Setting ${checked ? 'enabled' : 'disabled'}.`);
              } catch (error: any) {
                // Rollback optimistic update
                setSettings({ allow_custom_request_without_login: originalValue });
                console.error('Error updating setting:', error);
                toast.error(`Failed to update setting: ${error.message || 'Unknown error'}`);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminIntakeSettings;