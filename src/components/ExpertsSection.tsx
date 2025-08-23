import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Star, ArrowRight } from 'lucide-react';

const ExpertsSection = () => {
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const expertProfiles = [
    {
      id: 1,
      name: "Amira K.",
      role: "Growth Strategist",
      tagline: "Scaled 25 SMBs to 7-figure revenue in 3 years",
      rating: 5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "SaaS"
    },
    {
      id: 2,
      name: "David O.",
      role: "AI Consultant",
      tagline: "Delivered AI cost-savings of 30% for retail and SaaS clients",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Retail"
    },
    {
      id: 3,
      name: "Maria G.",
      role: "Scrum Master",
      tagline: "Helped 40+ teams double sprint output using TPU framework",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS"
    },
    {
      id: 4,
      name: "James P.",
      role: "Sales Coach",
      tagline: "Trained 200+ sales reps, lifting close rates by 25%",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services"
    },
    {
      id: 5,
      name: "Priya N.",
      role: "Growth Strategist",
      tagline: "Built SMB demand gen engines delivering 5X ROI",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "Manufacturing"
    },
    {
      id: 6,
      name: "Luca F.",
      role: "AI Consultant",
      tagline: "Saved SMB clients £10M+ through cost optimisation",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Manufacturing"
    },
    {
      id: 7,
      name: "Tom S.",
      role: "AI Consultant",
      tagline: "Streamlined workflows reducing lead times by 40%",
      rating: 5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "Manufacturing"
    },
    {
      id: 8,
      name: "Hannah R.",
      role: "Growth Strategist",
      tagline: "Transformed retention, boosting staff engagement by 30%",
      rating: 4,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services"
    },
    {
      id: 9,
      name: "Chen L.",
      role: "AI Consultant",
      tagline: "Guided 15 startups from concept to market success",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS"
    },
    {
      id: 10,
      name: "Aisha M.",
      role: "Sales Coach",
      tagline: "Lifted NPS by +40 points in service-led SMBs",
      rating: 5,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Services"
    },
    {
      id: 11,
      name: "Rob T.",
      role: "Scrum Master",
      tagline: "Delivered £2M in IT transformation projects on time & budget",
      rating: 4.5,
      qaVerified: true,
      insuranceEligible: false,
      industry: "SaaS"
    },
    {
      id: 12,
      name: "Elena V.",
      role: "Growth Strategist",
      tagline: "Cut logistics costs by 20% for manufacturing SMBs",
      rating: 4,
      qaVerified: true,
      insuranceEligible: true,
      industry: "Manufacturing"
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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Meet the Experts Powering Your Outcomes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
            Curated, QA-certified, and AI-matched to your business needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
            <span>Outcome Assurance™</span>
            <span>•</span>
            <span>AI + Human QA</span>
            <span>•</span>
            <span>Risk-Free Replacement Option</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 max-w-2xl mx-auto">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredExperts.map((expert) => (
            <Card key={expert.id} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {getAvatarInitials(expert.name)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-1">
                      {expert.name} – {expert.role}
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {expert.tagline}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  {renderStars(expert.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    Teamsmiths Verified Rating
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    🟢 QA Certified
                  </Badge>
                  {expert.insuranceEligible && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      🛡️ Insurance Eligible
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button asChild className="w-full">
                  <Link to="/catalog">
                    Match Me with an Expert Like This
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Highlight Strip */}
        {filteredExperts.length >= 3 && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-8 mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-accent" />
              <h3 className="text-2xl font-bold text-foreground">
                Outcome Assurance™ — The Teamsmiths Difference
              </h3>
            </div>
            <div className="space-y-2 text-lg text-muted-foreground max-w-3xl mx-auto">
              <p>Every engagement monitored by AI & human QA</p>
              <p>Optional insurance: replace your expert if things don't work out</p>
              <p className="font-semibold text-foreground">That's the Teamsmiths Guarantee.</p>
            </div>
          </div>
        )}

        {/* Closing CTA */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-foreground mb-6">
            Ready to get matched?
          </h3>
          <Button asChild size="lg" className="text-lg px-10 py-6 h-auto">
            <Link to="/catalog">
              Start My Match
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ExpertsSection;