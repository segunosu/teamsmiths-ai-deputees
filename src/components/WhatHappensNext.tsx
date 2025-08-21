import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const WhatHappensNext = () => {
  const [settings, setSettings] = useState({
    shortlist_size_default: 3,
    invite_response_sla_hours: 24,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['shortlist_size_default', 'invite_response_sla_hours']);

      if (error) throw error;

      const settingsObj = data.reduce((acc, setting) => {
        const value = setting.setting_value as any;
        if (setting.setting_key === 'shortlist_size_default') {
          acc.shortlist_size_default = value?.value || 3;
        } else if (setting.setting_key === 'invite_response_sla_hours') {
          acc.invite_response_sla_hours = value?.value || 24;
        }
        return acc;
      }, { shortlist_size_default: 3, invite_response_sla_hours: 24 });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults if error
    }
  };

  const steps = [
    'We refine your brief (AI-assist)',
    `We shortlist the top ${settings.shortlist_size_default} experts`,
    `You receive comparable quotes within ${settings.invite_response_sla_hours}h`,
    'You choose; milestones are escrowed; QA on every deliverable'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>What happens next</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatHappensNext;