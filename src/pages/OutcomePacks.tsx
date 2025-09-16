import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileCheck, BarChart3, CreditCard, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const OutcomePacks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const packs = [
    {
      icon: <FileCheck className="h-12 w-12 text-accent" />,
      title: "Proposal Velocity Pack",
      price: "£1,950",
      duration: "2 weeks",
      outcome: "More proposals, faster.",
      description: "Draft proposals from your last call; branded & tracked with AI Deputee™",
      items: [
        "Two follow-up cadences included",
        "KPIs: proposals/week • time-to-proposal • open rate"
      ]
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-accent" />,
      title: "Sales Uplift Pack", 
      price: "£1,950",
      duration: "2 weeks",
      outcome: "Quotes out faster; more wins.",
      description: "Transcript-to-quote + SMS/email nudges",
      items: [
        "Simple pipeline tracker",
        "KPIs: quotes/week • time-to-quote • conversion to job"
      ]
    },
    {
      icon: <CreditCard className="h-12 w-12 text-accent" />,
      title: "Cashflow Control Pack",
      price: "£2,500", 
      duration: "3 weeks",
      outcome: "DSO down; cash in sooner.",
      description: "Connect Xero/QBO; aging analysis; tone ladder",
      items: [
        "Owner weekly cash digest",
        "KPIs: DSO • £ aged >30/60 days • response rate"
      ]
    }
  ];

  const slugify = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCheckout = async (title: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user?.email) {
        navigate('/auth');
        return;
      }
      const { data: product, error: pErr } = await supabase
        .from('products')
        .select('id')
        .eq('title', title)
        .eq('is_active', true)
        .single();
      if (pErr || !product) throw new Error('This pack is currently unavailable');
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { product_id: product.id },
      });
      if (error || !data?.url) throw new Error(error?.message || 'Checkout failed');
      window.open(data.url, '_blank');
    } catch (e: any) {
      toast({ title: 'Checkout failed', description: e.message || 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
            Business Outcomes
          </h1>
          <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-16 max-w-4xl mx-auto leading-relaxed">
            Packaged, rapid solutions delivered in weeks — focused on revenue, speed, and cost.
          </p>

          {/* Packs Grid */}
          <div className="grid lg:grid-cols-3 gap-10 mb-16">
            {packs.map((pack, index) => (
              <Card key={index} className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 text-left">
                <CardHeader className="pb-6">
                  <div className="mb-6">
                    {pack.icon}
                  </div>
                  <CardTitle className="text-3xl font-bold">{pack.title}</CardTitle>
                  <div className="flex items-center gap-3 mt-3 mb-4">
                    <Badge variant="secondary" className="text-lg font-bold">{pack.price}</Badge>
                    <Badge variant="outline">{pack.duration}</Badge>
                  </div>
                  <p className="text-lg font-semibold text-primary mb-2">{pack.outcome}</p>
                  <CardDescription className="text-lg font-medium text-muted-foreground">
                    {pack.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-4 mb-6">
                    {pack.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                        <span className="text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full" onClick={() => handleCheckout(pack.title)}>Book this Pack</Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/brief-builder?product=${encodeURIComponent(pack.title)}`}>Customise this Brief</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* De-risk note */}
          <div className="bg-muted/50 p-6 rounded-lg mb-8 max-w-4xl mx-auto">
            <p className="text-base font-medium">
              <strong>De-risk:</strong> Live workflow by Day 10 or your Pack fee is credited toward a retainer.
            </p>
            <p className="text-base font-medium mt-2">
              <strong>Performance option:</strong> Eligible clients can add +5% uplift participation after baseline sign-off.
            </p>
          </div>

          {/* Final CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">Book a Call</a>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.scrollTo(0, 0)}
              >
                <Link to="/audit">Start with an Audit</Link>
              </Button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default OutcomePacks;