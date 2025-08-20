import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { VideoIcon } from 'lucide-react';

const AdminMeetingsSettings = () => {
  const [settings, setSettings] = useState({
    fireflies_enabled: true,
    fireflies_bot_email: '',
    fireflies_default_on: false,
    fireflies_privacy_note: 'Recording requires consent. Participants are notified.',
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
        .in('setting_key', [
          'fireflies_enabled',
          'fireflies_bot_email',
          'fireflies_default_on',
          'fireflies_privacy_note',
        ]);

      if (error) throw error;

      const settingsObj = data.reduce((acc, setting) => {
        const value = setting.setting_value;
        if (typeof value === 'object' && value !== null) {
          if ('enabled' in value) {
            acc[setting.setting_key] = value.enabled;
          } else if ('email' in value) {
            acc[setting.setting_key] = value.email;
          } else if ('text' in value) {
            acc[setting.setting_key] = value.text;
          }
        }
        return acc;
      }, {} as any);

      setSettings(prev => ({ ...prev, ...settingsObj }));
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
      const updates = [
        {
          setting_key: 'fireflies_enabled',
          setting_value: { enabled: settings.fireflies_enabled },
        },
        {
          setting_key: 'fireflies_bot_email',
          setting_value: { email: settings.fireflies_bot_email },
        },
        {
          setting_key: 'fireflies_default_on',
          setting_value: { enabled: settings.fireflies_default_on },
        },
        {
          setting_key: 'fireflies_privacy_note',
          setting_value: { text: settings.fireflies_privacy_note },
        },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .upsert(update, { onConflict: 'setting_key' });

        if (error) throw error;
      }

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
          <VideoIcon className="h-5 w-5" />
          Meetings & Recording
        </CardTitle>
        <CardDescription>
          Configure meeting providers and Fireflies recording settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="fireflies_enabled"
              checked={settings.fireflies_enabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, fireflies_enabled: checked }))
              }
            />
            <Label htmlFor="fireflies_enabled">Enable Fireflies Integration</Label>
          </div>

          <div>
            <Label htmlFor="fireflies_bot_email">Fireflies Bot Email</Label>
            <Input
              id="fireflies_bot_email"
              value={settings.fireflies_bot_email}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, fireflies_bot_email: e.target.value }))
              }
              placeholder="fred@fireflies.ai"
              disabled={!settings.fireflies_enabled}
            />
            <p className="text-sm text-muted-foreground mt-1">
              The email address of your Fireflies bot
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="fireflies_default_on"
              checked={settings.fireflies_default_on}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, fireflies_default_on: checked }))
              }
              disabled={!settings.fireflies_enabled}
            />
            <Label htmlFor="fireflies_default_on">Enable Fireflies by Default</Label>
          </div>

          <div>
            <Label htmlFor="fireflies_privacy_note">Privacy Notice</Label>
            <Textarea
              id="fireflies_privacy_note"
              value={settings.fireflies_privacy_note}
              onChange={(e) => 
                setSettings(prev => ({ ...prev, fireflies_privacy_note: e.target.value }))
              }
              rows={3}
              disabled={!settings.fireflies_enabled}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This message will be posted to chat when recording is enabled
            </p>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Info:</strong> When enabled, the Fireflies bot will be invited to Google Calendar events 
            when you toggle 'Invite Fireflies' during meeting creation. Recording requires participant consent.
          </p>
        </div>

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminMeetingsSettings;