import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, User, DollarSign, Clock, Award, MapPin } from 'lucide-react';

interface FreelancerProfile {
  id?: string;
  user_id: string;
  skills: string[];
  industries: string[];
  tools: string[];
  price_band_min: number | null;
  price_band_max: number | null;
  certifications: string[];
  locales: string[];
  availability_weekly_hours: number;
  pto_ranges: any[];
  connected_calendar: boolean;
  outcome_history: {
    csat_score?: number;
    on_time_rate?: number;
    revision_rate?: number;
    pass_at_qa_rate?: number;
    dispute_rate?: number;
  };
}

const COMMON_SKILLS = [
  'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Python', 'Java',
  'UI/UX Design', 'Graphic Design', 'Web Design', 'Product Design',
  'Content Writing', 'Copywriting', 'Technical Writing', 'SEO',
  'Digital Marketing', 'Social Media', 'PPC', 'Analytics',
  'Project Management', 'Agile', 'Scrum', 'DevOps',
  'WordPress', 'Shopify', 'WooCommerce', 'HubSpot', 'Salesforce'
];

const INDUSTRIES = [
  'FinTech', 'Healthcare', 'Education', 'E-commerce', 'SaaS',
  'Consulting', 'Agency', 'Startup', 'Enterprise', 'Non-profit',
  'Real Estate', 'Automotive', 'Travel', 'Food & Beverage'
];

const TOOLS = [
  'Figma', 'Adobe Creative Suite', 'Sketch', 'InVision',
  'WordPress', 'Webflow', 'Shopify', 'WooCommerce',
  'HubSpot', 'Salesforce', 'MailChimp', 'Google Analytics',
  'Slack', 'Asana', 'Trello', 'Jira', 'GitHub'
];

const LOCALES = [
  'en-GB', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-PT', 'nl-NL'
];

const FreelancerProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FreelancerProfile>({
    user_id: user?.id || '',
    skills: [],
    industries: [],
    tools: [],
    price_band_min: null,
    price_band_max: null,
    certifications: [],
    locales: ['en-GB'],
    availability_weekly_hours: 40,
    pto_ranges: [],
    connected_calendar: false,
    outcome_history: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          price_band_min: data.price_band_min || null,
          price_band_max: data.price_band_max || null,
          pto_ranges: Array.isArray(data.pto_ranges) ? data.pto_ranges : [],
          outcome_history: typeof data.outcome_history === 'object' ? data.outcome_history : {}
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const profileData = {
        ...profile,
        user_id: user.id,
        // Convert price bands to pence
        price_band_min: profile.price_band_min ? profile.price_band_min * 100 : null,
        price_band_max: profile.price_band_max ? profile.price_band_max * 100 : null,
      };

      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: 'Profile saved',
        description: 'Your freelancer profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({
        ...profile,
        skills: [...profile.skills, skill]
      });
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  const addCertification = () => {
    if (newCertification && !profile.certifications.includes(newCertification)) {
      setProfile({
        ...profile,
        certifications: [...profile.certifications, newCertification]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setProfile({
      ...profile,
      certifications: profile.certifications.filter(c => c !== cert)
    });
  };

  const toggleArrayItem = (array: string[], item: string, field: keyof FreelancerProfile) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setProfile({
      ...profile,
      [field]: newArray
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Freelancer Profile</h1>
          <p className="text-muted-foreground">
            Complete your profile to receive relevant project invitations
          </p>
        </div>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills & Expertise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>
              Add your key skills to match with relevant projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Skills</Label>
              <div className="flex gap-2 mb-2">
                <Select onValueChange={addSkill}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_SKILLS.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Input
                    placeholder="Custom skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                  />
                  <Button size="sm" onClick={() => addSkill(newSkill)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Industries</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {INDUSTRIES.map(industry => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={profile.industries.includes(industry)}
                      onCheckedChange={() => toggleArrayItem(profile.industries, industry, 'industries')}
                    />
                    <Label htmlFor={industry} className="text-sm">{industry}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Tools & Platforms</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TOOLS.slice(0, 10).map(tool => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool}
                      checked={profile.tools.includes(tool)}
                      onCheckedChange={() => toggleArrayItem(profile.tools, tool, 'tools')}
                    />
                    <Label htmlFor={tool} className="text-sm">{tool}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pricing & Availability
            </CardTitle>
            <CardDescription>
              Set your rates and availability for better matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Rate (£/hour)</Label>
                <Input
                  type="number"
                  value={profile.price_band_min || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    price_band_min: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label>Max Rate (£/hour)</Label>
                <Input
                  type="number"
                  value={profile.price_band_max || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    price_band_max: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="150"
                />
              </div>
            </div>

            <div>
              <Label>Weekly Availability (hours)</Label>
              <Input
                type="number"
                value={profile.availability_weekly_hours}
                onChange={(e) => setProfile({
                  ...profile,
                  availability_weekly_hours: parseInt(e.target.value) || 40
                })}
                min={1}
                max={60}
              />
            </div>

            <div>
              <Label>Languages/Locales</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {LOCALES.map(locale => (
                  <div key={locale} className="flex items-center space-x-2">
                    <Checkbox
                      id={locale}
                      checked={profile.locales.includes(locale)}
                      onCheckedChange={() => toggleArrayItem(profile.locales, locale, 'locales')}
                    />
                    <Label htmlFor={locale} className="text-sm">{locale}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications
            </CardTitle>
            <CardDescription>
              Add certifications to boost your vetting score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add certification"
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCertification()}
              />
              <Button onClick={addCertification}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              {profile.certifications.map(cert => (
                <div key={cert} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{cert}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCertification(cert)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Performance History
            </CardTitle>
            <CardDescription>
              Track record metrics (updated automatically)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CSAT Score</Label>
                <div className="text-2xl font-bold text-primary">
                  {profile.outcome_history.csat_score 
                    ? `${profile.outcome_history.csat_score.toFixed(1)}/5.0`
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <Label>On-Time Rate</Label>
                <div className="text-2xl font-bold text-primary">
                  {profile.outcome_history.on_time_rate
                    ? `${(profile.outcome_history.on_time_rate * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <Label>QA Pass Rate</Label>
                <div className="text-2xl font-bold text-primary">
                  {profile.outcome_history.pass_at_qa_rate
                    ? `${(profile.outcome_history.pass_at_qa_rate * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </div>
              </div>
              <div>
                <Label>Revision Rate</Label>
                <div className="text-2xl font-bold text-primary">
                  {profile.outcome_history.revision_rate
                    ? `${(profile.outcome_history.revision_rate * 100).toFixed(0)}%`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerProfile;