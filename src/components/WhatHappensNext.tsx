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
      const { data, error } = await supabase.rpc('get_public_settings');

      if (error) throw error;

      const settingsData = data as Record<string, any>;
      const shortlistSetting = settingsData?.shortlist_size_default;
      const slaSetting = settingsData?.invite_response_sla_hours;

      setSettings({
        shortlist_size_default: shortlistSetting?.value || 3,
        invite_response_sla_hours: slaSetting?.value || 24,
      });
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