import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FreelancerOnboardingWizard } from '@/components/FreelancerOnboardingWizard';
import FreelancerProfile from '@/components/FreelancerProfile';

export default function FreelancerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    checkExistingProfile();
  }, [user, navigate]);

  const checkExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('id, practical_skills, outcome_preferences, outcome_band_min, outcome_band_max')
        .eq('user_id', user?.id)
        .single();

      // Check if profile exists AND has the new required fields
      const hasCompleteProfile = !!(data && !error && 
        data.practical_skills?.length > 0 && 
        data.outcome_preferences?.length > 0 &&
        (data.outcome_band_min || data.outcome_band_max));

      setHasProfile(hasCompleteProfile);
    } catch (error) {
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setHasProfile(true);
    navigate('/freelancer-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto py-8">
        {hasProfile ? (
          <FreelancerProfile />
        ) : (
          <FreelancerOnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </div>
    </div>
  );
}