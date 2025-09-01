import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Check, Star, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AssuranceTier {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  recommended?: boolean;
  icon: React.ReactNode;
}

interface Props {
  projectId: string;
  projectTitle: string;
  onSuccess: () => void;
}

const ASSURANCE_TIERS: AssuranceTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Assurance',
    description: 'Essential ongoing support',
    price: 199,
    features: [
      'Monthly performance check',
      'Email support',
      'Basic troubleshooting',
      'Performance reports',
    ],
    icon: <Shield className="h-6 w-6" />,
  },
  {
    id: 'silver',
    name: 'Silver Assurance',
    description: 'Enhanced protection & support',
    price: 399,
    features: [
      'Bi-weekly performance checks',
      'Priority email & chat support',
      'Proactive issue resolution',
      'Detailed analytics reports',
      'Minor updates included',
    ],
    recommended: true,
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: 'gold',
    name: 'Gold Assurance',
    description: 'Premium comprehensive coverage',
    price: 699,
    features: [
      'Weekly performance monitoring',
      '24/7 priority support',
      'Proactive optimization',
      'Advanced analytics & insights',
      'All updates & improvements',
      'Dedicated success manager',
    ],
    icon: <Zap className="h-6 w-6" />,
  },
];

export function AssurancePlan({ projectId, projectTitle, onSuccess }: Props) {
  const [selectedTier, setSelectedTier] = useState<string | null>('silver');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (tierId: string) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to subscribe to assurance",
          variant: "destructive",
        });
        return;
      }

      // Create Stripe subscription for assurance
      const { data, error } = await supabase.functions.invoke('create-assurance-subscription', {
        body: {
          project_id: projectId,
          assurance_plan: tierId,
          user_id: user.id,
        },
      });

      if (error) throw error;

      // Redirect to Stripe checkout
      if (data?.url) {
        window.open(data.url, '_blank');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating assurance subscription:', error);
      toast({
        title: "Subscription failed",
        description: "Failed to create assurance subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Keep Your Outcome Alive</h2>
        <p className="text-lg text-muted-foreground">
          Add ongoing assurance to maintain and enhance your project results
        </p>
        <p className="text-sm text-muted-foreground">
          For project: <span className="font-medium">{projectTitle}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {ASSURANCE_TIERS.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative cursor-pointer transition-all ${
              selectedTier === tier.id 
                ? 'ring-2 ring-primary shadow-lg' 
                : 'hover:shadow-md'
            } ${tier.recommended ? 'scale-105' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 p-3 rounded-full bg-primary/10 text-primary w-fit">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
              <div className="text-3xl font-bold">
                £{tier.price}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full"
                variant={selectedTier === tier.id ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubscribe(tier.id);
                }}
                disabled={loading}
              >
                {loading && selectedTier === tier.id ? 'Processing...' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          What is Performance Assurance?
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Continuous Monitoring</h4>
            <p className="text-muted-foreground">
              Regular checks ensure your outcomes remain effective and performing optimally.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Proactive Support</h4>
            <p className="text-muted-foreground">
              We identify and resolve issues before they impact your results.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Ongoing Optimization</h4>
            <p className="text-muted-foreground">
              Continuous improvements based on performance data and industry best practices.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Risk Protection</h4>
            <p className="text-muted-foreground">
              Coverage against performance degradation and technical issues.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Cancel anytime • No long-term contracts • 30-day satisfaction guarantee
        </p>
      </div>
    </div>
  );
}