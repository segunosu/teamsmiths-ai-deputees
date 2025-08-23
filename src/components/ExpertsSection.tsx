import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Star, ArrowRight, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

const ExpertsSection = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedIntent, setSelectedIntent] = useState('goal');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToShortlist = (expertName: string) => {
    if (!user) {
      navigate(`/auth?redirect=shortlist&expert=${encodeURIComponent(expertName)}`);
      return;
    }
    
    // TODO: Implement shortlist functionality for authenticated users
    toast({
      title: "Added to shortlist",
      description: `${expertName} has been added to your shortlist.`,
    });
  };

  const expertProfiles = [
    {
      id: 1,
      name: "Amira K.",
      role: "Growth Strategist",
      tagline: "Scaled 25 SMBs to 7-figure revenue in 3 years",
      rating: 5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "SaaS",
      tpuFocus: "Performance",
      achievements: ["Scaled 25 SMBs to 7-figure revenue", "Avg 300% growth in 18 months", "Specialist in B2B SaaS scaling"],
      tools: ["HubSpot", "Salesforce", "Google Analytics", "Mixpanel"]
    },
    {
      id: 2,
      name: "David O.",
      role: "AI Consultant",
      tagline: "Delivered AI cost-savings of 30% for retail and SaaS clients",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Retail",
      tpuFocus: "Productivity",
      achievements: ["30% cost reduction via AI implementation", "Automated 50+ business processes", "ML model deployment specialist"],
      tools: ["Python", "TensorFlow", "AWS", "Azure ML"]
    },
    {
      id: 3,
      name: "Maria G.",
      role: "Scrum Master",
      tagline: "Helped 40+ teams double sprint output using TPU framework",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS",
      tpuFocus: "Productivity",
      achievements: ["Doubled team velocity for 40+ teams", "TPU framework specialist", "Agile transformation expert"],
      tools: ["Jira", "Azure DevOps", "Miro", "Confluence"]
    },
    {
      id: 4,
      name: "James P.",
      role: "Sales Coach",
      tagline: "Trained 200+ sales reps, lifting close rates by 25%",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services",
      tpuFocus: "Performance",
      achievements: ["Trained 200+ sales professionals", "25% improvement in close rates", "B2B sales methodology expert"],
      tools: ["Salesforce", "HubSpot", "Gong", "Outreach"]
    },
    {
      id: 5,
      name: "Priya N.",
      role: "Marketing Strategist",
      tagline: "Built SMB demand gen engines delivering 5X ROI",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "Manufacturing",
      tpuFocus: "Performance",
      achievements: ["5X ROI on demand generation", "Built 15+ marketing engines", "Digital transformation specialist"],
      tools: ["Marketo", "Google Ads", "LinkedIn", "Pardot"]
    },
    {
      id: 6,
      name: "Luca F.",
      role: "Finance Advisor",
      tagline: "Saved SMB clients £10M+ through cost optimisation",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Manufacturing",
      tpuFocus: "Productivity",
      achievements: ["£10M+ in cost savings delivered", "Financial process optimization", "SMB growth finance expert"],
      tools: ["QuickBooks", "Xero", "Excel", "Power BI"]
    },
    {
      id: 7,
      name: "Tom S.",
      role: "Operations Expert",
      tagline: "Streamlined workflows reducing lead times by 40%",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "Manufacturing",
      tpuFocus: "Productivity",
      achievements: ["40% lead time reduction", "Lean methodology expert", "Supply chain optimization"],
      tools: ["SAP", "Lean Six Sigma", "Kanban", "Monday.com"]
    },
    {
      id: 8,
      name: "Hannah R.",
      role: "HR & People Advisor",
      tagline: "Transformed retention, boosting staff engagement by 30%",
      rating: 4,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services",
      tpuFocus: "Well-being",
      achievements: ["30% improvement in staff engagement", "Reduced turnover by 50%", "Culture transformation specialist"],
      tools: ["BambooHR", "Culture Amp", "Slack", "Microsoft Teams"]
    },
    {
      id: 9,
      name: "Chen L.",
      role: "Product Strategist",
      tagline: "Guided 15 startups from concept to market success",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS",
      tpuFocus: "Performance",
      achievements: ["15 successful product launches", "Product-market fit specialist", "User experience optimization"],
      tools: ["Figma", "Mixpanel", "Amplitude", "ProductBoard"]
    },
    {
      id: 10,
      name: "Aisha M.",
      role: "Customer Experience Consultant",
      tagline: "Lifted NPS by +40 points in service-led SMBs",
      rating: 5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services",
      tpuFocus: "Performance",
      achievements: ["+40 NPS point improvement", "Customer journey optimization", "Service excellence frameworks"],
      tools: ["Zendesk", "Intercom", "Qualtrics", "Salesforce Service"]
    },
    {
      id: 11,
      name: "Rob T.",
      role: "Tech Project Manager",
      tagline: "Delivered £2M in IT transformation projects on time & budget",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS",
      tpuFocus: "Productivity",
      achievements: ["£2M+ in IT projects delivered", "100% on-time delivery rate", "Digital transformation specialist"],
      tools: ["Jira", "Microsoft Project", "Azure", "GitHub"]
    },
    {
      id: 12,
      name: "Elena V.",
      role: "Supply Chain Expert",
      tagline: "Cut logistics costs by 20% for manufacturing SMBs",
      rating: 4,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Manufacturing",
      tpuFocus: "Productivity",
      achievements: ["20% logistics cost reduction", "Supply chain optimization", "Vendor management expertise"],
      tools: ["SAP SCM", "Oracle WMS", "Excel", "Tableau"]
    }
  ];

  const roles = ['AI Consultant', 'Scrum Master', 'Sales Coach', 'Growth Strategist'];
  const industries = ['Manufacturing', 'SaaS', 'Retail', 'Services'];

  const filteredExperts = expertProfiles.filter(expert => {
    const roleMatch = selectedRole === 'all' || expert.role === selectedRole;
    const industryMatch = selectedIndustry === 'all' || expert.industry === selectedIndustry;
    return roleMatch && industryMatch;
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />);
    }

    return stars;
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getTpuColor = (tpu: string) => {
    switch(tpu) {
      case 'Performance': return 'bg-success/20 text-success-foreground border-success/30';
      case 'Productivity': return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'Well-being': return 'bg-accent/20 text-accent-foreground border-accent/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Meet the Experts Powering Your Outcomes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            Curated, QA-certified, and AI-matched to your business needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-muted-foreground">
            <span>Outcome Assurance™</span>
            <span>•</span>
            <span>Deputee™ AI + Human QA</span>
            <span>•</span>
            <span>Risk-Free Replacement Option</span>
          </div>
        </div>

        {/* Intent Selector */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              What's your goal today?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <Button 
                asChild
                variant={selectedIntent === 'goal' ? 'default' : 'outline'}
                className="h-auto p-4 text-left flex-col items-start"
              >
                <Link to="/brief-builder">
                  <div className="font-medium mb-1">I have a business goal</div>
                  <div className="text-sm opacity-75">Get matched via Deputee™ AI Brief Builder</div>
                </Link>
              </Button>
              <Button 
                asChild
                variant={selectedIntent === 'packs' ? 'default' : 'outline'}
                className="h-auto p-4 text-left flex-col items-start"
              >
                <Link to="/catalog">
                  <div className="font-medium mb-1">Browse outcome packs</div>
                  <div className="text-sm opacity-75">Ready-made solutions for common needs</div>
                </Link>
              </Button>
              <Button 
                asChild
                variant={selectedIntent === 'curator' ? 'default' : 'outline'}
                className="h-auto p-4 text-left flex-col items-start"
              >
                <Link to="/contact">
                  <div className="font-medium mb-1">Talk to a curator</div>
                  <div className="text-sm opacity-75">Human guidance for complex requirements</div>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 max-w-2xl mx-auto">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filter by Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Industries</SelectItem>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expert Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredExperts.map((expert) => (
            <Card key={expert.id} className="border border-border bg-card hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm">
                    {getAvatarInitials(expert.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold mb-1">
                      {expert.name} – {expert.role}
                    </CardTitle>
                    <CardDescription className="text-sm leading-snug">
                      {expert.tagline}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(expert.rating)}
                  <span className="text-xs text-muted-foreground ml-1">
                    Teamsmiths Verified Rating
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20 hover:bg-success/10">
                    🟢 QA Certified
                  </Badge>
                  {expert.insuranceEligible && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                      🛡️ Insurance Eligible
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {expert.industry}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getTpuColor(expert.tpuFocus)}`}>
                    {expert.tpuFocus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleAddToShortlist(expert.name)}
                >
                  Add to Shortlist
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                      View highlights
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{expert.name} – {expert.role}</DialogTitle>
                      <DialogDescription>{expert.tagline}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Key Achievements
                        </h4>
                        <ul className="text-sm space-y-1">
                          {expert.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Tools & Expertise</h4>
                        <div className="flex flex-wrap gap-1">
                          {expert.tools.map((tool, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button asChild className="w-full">
                          <Link to="/brief-builder">
                            Match Me with {expert.name}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outcome Assurance Strip */}
        {filteredExperts.length >= 3 && (
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">
                Outcome Assurance™ — The Teamsmiths Difference
              </h3>
            </div>
            <div className="space-y-1 text-muted-foreground max-w-3xl mx-auto">
              <p>Every engagement monitored by Deputee™ AI + human QA</p>
              <p>Optional insurance: replace your expert if things don't work out</p>
              <p className="font-medium text-foreground">That's the Teamsmiths Guarantee.</p>
            </div>
          </div>
        )}

        {/* Bottom CTAs */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Ready to get matched?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="flex-1">
              <Link to="/brief-builder">
                Start a Bespoke Brief
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link to="/catalog">
                Browse Outcome Packs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertsSection;