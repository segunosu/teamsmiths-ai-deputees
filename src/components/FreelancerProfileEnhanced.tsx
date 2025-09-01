import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  X, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Globe,
  Code,
  Wrench,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FreelancerProfile {
  skills: string[];
  tools: string[];
  industries: string[];
  locales: string[];
  practical_skills: string[];
  outcome_preferences: string[];
  price_band_min: number;
  price_band_max: number;
  availability_weekly_hours: number;
  connected_calendar: boolean;
  certifications: string[];
  outcome_band_min: number;
  outcome_band_max: number;
  pto_ranges: Array<{ start: string; end: string; reason: string }>;
}

const SKILL_CATEGORIES = {
  technical: ['React', 'Node.js', 'Python', 'AI/ML', 'Data Science', 'DevOps', 'Mobile Development'],
  design: ['UI/UX Design', 'Graphic Design', 'Brand Design', 'Product Design', 'Illustration'],
  marketing: ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media', 'Email Marketing'],
  business: ['Strategy', 'Project Management', 'Business Analysis', 'Operations', 'Sales']
};

const POPULAR_TOOLS = [
  'Figma', 'Adobe Creative Suite', 'Slack', 'Notion', 'Asana', 'Jira', 
  'Google Analytics', 'HubSpot', 'Salesforce', 'Stripe', 'AWS', 'Docker'
];

const INDUSTRIES = [
  'Fintech', 'Healthcare', 'E-commerce', 'SaaS', 'EdTech', 'Real Estate',
  'Nonprofit', 'Manufacturing', 'Media', 'Gaming', 'Travel', 'Fashion'
];

const LOCALES = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 'Italian',
  'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Russian', 'Arabic'
];

const PRACTICAL_SKILLS = [
  'AI Agent Development', 'Automation Workflows', 'Data Pipeline Creation',
  'API Integration', 'System Architecture', 'Performance Optimization',
  'Security Implementation', 'Testing & QA', 'Documentation', 'Training & Support'
];

const OUTCOME_PREFERENCES = [
  'Revenue Growth', 'Cost Reduction', 'Process Efficiency', 'User Experience',
  'System Reliability', 'Security Enhancement', 'Team Productivity', 'Customer Satisfaction'
];

export function FreelancerProfileEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<FreelancerProfile>({
    skills: [],
    tools: [],
    industries: [],
    locales: ['English (US)'],
    practical_skills: [],
    outcome_preferences: [],
    price_band_min: 50,
    price_band_max: 150,
    availability_weekly_hours: 40,
    connected_calendar: false,
    certifications: [],
    outcome_band_min: 5000,
    outcome_band_max: 25000,
    pto_ranges: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newPTO, setNewPTO] = useState({ start: '', end: '', reason: '' });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({
          skills: data.skills || [],
          tools: data.tools || [],
          industries: data.industries || [],
          locales: data.locales || ['English (US)'],
          practical_skills: data.practical_skills || [],
          outcome_preferences: data.outcome_preferences || [],
          price_band_min: data.price_band_min || 50,
          price_band_max: data.price_band_max || 150,
          availability_weekly_hours: data.availability_weekly_hours || 40,
          connected_calendar: data.connected_calendar || false,
          certifications: data.certifications || [],
          outcome_band_min: data.outcome_band_min || 5000,
          outcome_band_max: data.outcome_band_max || 25000,
          pto_ranges: (data.pto_ranges as any) || []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('freelancer_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your freelancer profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setProfile({ 
      ...profile, 
      skills: profile.skills.filter(s => s !== skill) 
    });
  };

  const toggleArrayItem = (array: string[], item: string, key: keyof FreelancerProfile) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
    
    setProfile({ ...profile, [key]: newArray });
  };

  const addPTO = () => {
    if (newPTO.start && newPTO.end) {
      setProfile({
        ...profile,
        pto_ranges: [...profile.pto_ranges, { ...newPTO }]
      });
      setNewPTO({ start: '', end: '', reason: '' });
    }
  };

  const removePTO = (index: number) => {
    setProfile({
      ...profile,
      pto_ranges: profile.pto_ranges.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Freelancer Profile</h1>
        <p className="text-muted-foreground">
          Complete your profile to get better matches and higher-quality projects
        </p>
      </div>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(SKILL_CATEGORIES).map(([category, categorySkills]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium capitalize">{category} Skills</h4>
              <div className="responsive-pills">
                {categorySkills.map(skill => (
                  <Badge
                    key={skill}
                    variant={profile.skills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleArrayItem(profile.skills, skill, 'skills')}
                  >
                    {skill}
                    {profile.skills.includes(skill) && <CheckCircle className="ml-1 h-3 w-3" />}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          
          <div className="flex gap-2">
            <Input
              placeholder="Add custom skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
              className="flex-1"
            />
            <Button onClick={() => addSkill(newSkill)} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {profile.skills.filter(s => !Object.values(SKILL_CATEGORIES).flat().includes(s)).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Custom Skills</h4>
              <div className="responsive-pills">
                {profile.skills
                  .filter(s => !Object.values(SKILL_CATEGORIES).flat().includes(s))
                  .map(skill => (
                    <Badge key={skill} className="bg-accent">
                      {skill}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tools & Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Tools Mastery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="responsive-pills">
            {POPULAR_TOOLS.map(tool => (
              <Badge
                key={tool}
                variant={profile.tools.includes(tool) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleArrayItem(profile.tools, tool, 'tools')}
              >
                {tool}
                {profile.tools.includes(tool) && <CheckCircle className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom tool..."
              value={newTool}
              onChange={(e) => setNewTool(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill(newTool)}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                if (newTool && !profile.tools.includes(newTool)) {
                  setProfile({ ...profile, tools: [...profile.tools, newTool] });
                }
                setNewTool('');
              }} 
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Don't see your tool?</strong> Add it above, or{' '}
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              suggest a tool
            </Button>{' '}
            for future freelancers to use.
          </div>
        </CardContent>
      </Card>

      {/* Practical AI Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Practical AI Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="responsive-pills">
            {PRACTICAL_SKILLS.map(skill => (
              <Badge
                key={skill}
                variant={profile.practical_skills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleArrayItem(profile.practical_skills, skill, 'practical_skills')}
              >
                {skill}
                {profile.practical_skills.includes(skill) && <CheckCircle className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industries & Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Industries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-pills">
              {INDUSTRIES.map(industry => (
                <Badge
                  key={industry}
                  variant={profile.industries.includes(industry) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleArrayItem(profile.industries, industry, 'industries')}
                >
                  {industry}
                  {profile.industries.includes(industry) && <CheckCircle className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="responsive-pills">
              {LOCALES.map(locale => (
                <Badge
                  key={locale}
                  variant={profile.locales.includes(locale) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleArrayItem(profile.locales, locale, 'locales')}
                >
                  {locale}
                  {profile.locales.includes(locale) && <CheckCircle className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outcome Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Outcome Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="responsive-pills">
            {OUTCOME_PREFERENCES.map(preference => (
              <Badge
                key={preference}
                variant={profile.outcome_preferences.includes(preference) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => toggleArrayItem(profile.outcome_preferences, preference, 'outcome_preferences')}
              >
                {preference}
                {profile.outcome_preferences.includes(preference) && <CheckCircle className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Pricing & Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Outcome Band (GBP)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Total project value range you typically work on
              </p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={profile.outcome_band_min}
                  onChange={(e) => setProfile({ ...profile, outcome_band_min: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={profile.outcome_band_max}
                  onChange={(e) => setProfile({ ...profile, outcome_band_max: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Weekly Availability (Hours)</Label>
              <Input
                type="number"
                value={profile.availability_weekly_hours}
                onChange={(e) => setProfile({ ...profile, availability_weekly_hours: Number(e.target.value) })}
                min="1"
                max="60"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Connected Calendar</Label>
                <p className="text-xs text-muted-foreground">
                  Sync availability with your calendar
                </p>
              </div>
              <Switch
                checked={profile.connected_calendar}
                onCheckedChange={(checked) => 
                  setProfile({ ...profile, connected_calendar: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PTO Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Time Off (PTO) Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              type="date"
              placeholder="Start Date"
              value={newPTO.start}
              onChange={(e) => setNewPTO({ ...newPTO, start: e.target.value })}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={newPTO.end}
              onChange={(e) => setNewPTO({ ...newPTO, end: e.target.value })}
            />
            <div className="flex gap-2">
              <Input
                placeholder="Reason (optional)"
                value={newPTO.reason}
                onChange={(e) => setNewPTO({ ...newPTO, reason: e.target.value })}
                className="flex-1"
              />
              <Button onClick={addPTO} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {profile.pto_ranges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Scheduled Time Off</h4>
              {profile.pto_ranges.map((pto, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">
                    {new Date(pto.start).toLocaleDateString()} - {new Date(pto.end).toLocaleDateString()}
                    {pto.reason && <span className="text-muted-foreground"> ({pto.reason})</span>}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removePTO(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveProfile} disabled={loading} size="lg">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}