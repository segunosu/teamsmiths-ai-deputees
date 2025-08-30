import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Sparkles, Star, Clock, MapPin, DollarSign, CheckCircle, Award, TrendingUp, HeartHandshake } from 'lucide-react';
import { OutcomeAssurance } from '@/components/OutcomeAssurance';
import { useToast } from '@/hooks/use-toast';
import { ASSURANCE } from '@/content/assurance';

const CapabilityGallery = () => {
  const [selectedIntent, setSelectedIntent] = useState<'goal' | 'packs' | 'curator'>('goal');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddToShortlist = (expertName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add experts to your shortlist.",
      });
      navigate('/auth');
      return;
    }
    
    toast({
      title: "Added to shortlist",
      description: `${expertName} has been added to your shortlist.`,
    });
  };

  const capabilityCards = [
    {
      id: 'sales-proposal-accelerator',
      headline: 'Close deals faster with AI-assisted proposals',
      expert: 'Maria — Sales Ops Lead',
      tools: 'Deputee Uplift™, HubSpot AI, Docs AI',
      metric: '40% faster proposal cycle',
      bullets: [
        'Auto-draft from discovery call transcripts',
        'One-click scope variants and pricing options',
        'Risk/redline flags before client review'
      ],
      industries: ['SaaS', 'Professional Services', 'Manufacturing'],
      roleChip: 'Sales',
      tpuChip: 'Productivity',
      qaInsurance: true
    },
    {
      id: 'marketing-content-engine',
      headline: 'Scale content that converts with AI workflows',
      expert: 'James — Growth Marketing Lead',
      tools: 'Canva, Suno (hooks), Copy.ai, Meta Advantage',
      metric: '3× engagement uplift',
      bullets: [
        'Audience insights → winning angles automatically',
        '10+ ad variants from single brief',
        'Live "next best action" recommendations'
      ],
      industries: ['E-commerce', 'B2B SaaS', 'Consumer Brands'],
      roleChip: 'Marketing',
      tpuChip: 'Performance',
      qaInsurance: true
    },
    {
      id: 'ops-streamliner',
      headline: 'Save 120+ hours/month with workflow automation',
      expert: 'Sarah — Operations Director',
      tools: 'Notion AI, Zapier, Deputee Uplift™',
      metric: '120+ hours saved/month',
      bullets: [
        'Form→CRM→invoice→Slack in seconds',
        'Weekly ops report with exception queue',
        'Process documentation that updates itself'
      ],
      industries: ['Professional Services', 'Healthcare', 'Finance'],
      roleChip: 'Ops',
      tpuChip: 'Productivity',
      qaInsurance: true
    },
    {
      id: 'data-insight-translator',
      headline: 'Get next best actions from your data in 48h',
      expert: 'Alex — Data Strategy Lead',
      tools: 'Deputee CI Lead™, Power BI, ChatGPT',
      metric: 'Next best actions in 48h',
      bullets: [
        'Unify data sources into single dashboard',
        'Plain English explanations of trends',
        'Action playbooks for every insight'
      ],
      industries: ['Retail', 'Manufacturing', 'Healthcare'],
      roleChip: 'Data',
      tpuChip: 'Performance',
      qaInsurance: true
    },
    {
      id: 'customer-success-multiplier',
      headline: 'Boost retention +25% with proactive AI',
      expert: 'Emma — Customer Success Lead',
      tools: 'Intercom AI, Notion, Deputee Uplift™',
      metric: '+25% retention',
      bullets: [
        'Journey mapping with intervention points',
        'Proactive nudges before customers churn',
        'Churn risk alerts with recovery playbooks'
      ],
      industries: ['SaaS', 'Subscription Services', 'E-learning'],
      roleChip: 'CX',
      tpuChip: 'Well-being',
      qaInsurance: true
    }
  ];

  const getAvatarInitials = (name: string) => {
    return name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || '');
  };

  const getTpuColor = (focus: string) => {
    switch (focus) {
      case 'Productivity': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Performance': return 'bg-green-100 text-green-700 border-green-200';
      case 'Well-being': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderStars = (rating: number = 4.8) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}</span>
      </div>
    );
  };

  const visibleExperts = capabilityCards.slice(0, 6);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Proof in Action
          </h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm mb-6">
            <Badge variant="outline" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Outcome Assurance™
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Deputee™ AI™ + Human QA
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Award className="h-3 w-3 mr-1" />
              Performance Safeguard
            </Badge>
          </div>
        </div>

        {/* Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
          {visibleExperts.map((capability) => (
            <Card key={capability.id} className="rounded-2xl border border-neutral-200/60 bg-white shadow-sm hover:shadow-md transition-all p-5 md:p-6">
              <div className="space-y-4">
                {/* Headline */}
                <h3 className="text-lg md:text-xl font-semibold leading-snug">
                  {capability.headline}
                </h3>

                {/* Expert + Tools */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getAvatarInitials(capability.expert)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-600">
                      <span className="font-medium">{capability.expert}</span> • Masters {capability.tools}
                    </p>
                  </div>
                </div>

                {/* Proof Metric */}
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-sm font-medium text-primary flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {capability.metric}
                  </p>
                </div>

                {/* Chips Row */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full border px-2.5 py-1 text-xs">
                    {capability.roleChip}
                  </Badge>
                  <Badge variant="outline" className={`rounded-full border px-2.5 py-1 text-xs ${getTpuColor(capability.tpuChip)}`}>
                    TPU: {capability.tpuChip}
                  </Badge>
                  {capability.qaInsurance && (
                    <Badge variant="outline" className="rounded-full border px-2.5 py-1 text-xs bg-green-50 text-green-700 border-green-200">
                      QA + Performance Safeguard
                    </Badge>
                  )}
                </div>

                {/* CTA */}
                <Button 
                  asChild 
                  variant="default" 
                  size="sm"
                  className="w-full"
                >
                  <Link to={`/brief-builder?capability_id=${capability.id}`}>
                    Customize this outcome
                  </Link>
                </Button>

                {/* View Details Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      View highlights
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{capability.headline}</DialogTitle>
                      <DialogDescription>
                        Detailed breakdown of this capability
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {capability.bullets.map((bullet, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Industries:</h4>
                        <div className="flex flex-wrap gap-1">
                          {capability.industries.map((industry) => (
                            <Badge key={industry} variant="outline" className="text-xs">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>

        {/* Outcome Assurance Strip */}
        {visibleExperts.length >= 3 && (
          <div className="py-6 px-8 bg-muted/30 rounded-lg border border-border/50 mb-8">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2 flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {ASSURANCE.title}
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{ASSURANCE.body[0]}</p>
                <p>{ASSURANCE.body[1]}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default CapabilityGallery;