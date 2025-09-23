import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileCheck, BarChart3, CreditCard, ShieldCheck, FileLock, MegaphoneOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OfferingHero } from '@/components/ui/offering-hero';
import { OfferingCard } from '@/components/ui/offering-card';
import { StickyMobileBar } from '@/components/ui/sticky-mobile-bar';

const BusinessOutcomes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const packs = [
    {
      icon: <FileCheck className="h-12 w-12 text-accent" />,
      title: "Proposal Velocity Pack",
      duration: "2 weeks",
      benefit: "More proposals, faster.",
      bullets: [
        "Two follow-up cadences included"
      ],
      kpis: "proposals/week • time-to-proposal • open rate",
      slug: "proposal_velocity"
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-accent" />,
      title: "Sales Uplift Pack", 
      duration: "2 weeks",
      benefit: "Quotes out faster; more wins.",
      bullets: [
        "Simple pipeline tracker"
      ],
      kpis: "quotes/week • time-to-quote • conversion to job",
      slug: "sales_uplift"
    },
    {
      icon: <CreditCard className="h-12 w-12 text-accent" />,
      title: "Cashflow Control Pack",
      duration: "3 weeks",
      benefit: "DSO down; cash in sooner.",
      bullets: [
        "Owner weekly cash digest"
      ],
      kpis: "DSO • £ aged >30/60 days • response rate",
      slug: "cashflow_control"
    }
  ];

  const compliancePacks = [
    {
      icon: <ShieldCheck className="h-12 w-12 text-accent" />,
      title: "Interaction QA & Complaints",
      price: "£2,500",
      duration: "3 weeks",
      benefit: "Review 100% of calls/chats; cut escalations; prove compliance.",
      bullets: [
        "Auto-check against script/policy; risk flags + evidence pack to the owner",
        "Complaint clock, templates, audit trail to hit SLA"
      ],
      kpis: "% reviewed • escalations/month • avg complaint resolution time",
      slug: "interaction_qa"
    },
    {
      icon: <FileLock className="h-12 w-12 text-accent" />,
      title: "DSAR Fast-Track (UK GDPR)",
      price: "£1,950",
      duration: "2 weeks",
      benefit: "Hit the 1-month DSAR deadline; cut manual hours.",
      bullets: [
        "DSAR inbox & timer with ID checks + response templates",
        "Redaction checklist + evidence log (ICO-ready)"
      ],
      kpis: "DSAR on-time rate • staff hours per DSAR • rework/appeals",
      slug: "dsar"
    },
    {
      icon: <MegaphoneOff className="h-12 w-12 text-accent" />,
      title: "PECR/TPS Marketing Compliance",
      price: "£1,950",
      duration: "2 weeks",
      benefit: "Stop unlawful calls/messages; avoid ICO hassle and fines.",
      bullets: [
        "TPS/CTPS screening, consent proof, suppression automation",
        "Simple scripts & preference capture + send/call audit log"
      ],
      kpis: "TPS hit-rate • complaints/month • compliant contacts %",
      slug: "pecr"
    }
  ];

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
    <>
      <Helmet>
        <title>Business Outcomes - Packaged Solutions | Teamsmiths</title>
        <meta 
          name="description" 
          content="Packaged, rapid solutions delivered in weeks — focused on revenue, speed, and cost. Fixed-price packs with guaranteed outcomes." 
        />
        <meta name="keywords" content="business outcomes, packaged solutions, fixed price, rapid delivery, revenue growth" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <OfferingHero 
          title="Business Outcomes"
          subtitle="Packaged, rapid solutions delivered in weeks — focused on revenue, speed, and cost."
          briefOrigin="outcomes"
          helperText="Live workflow by Day 10 or your fee is credited toward a retainer."
        />

        {/* Packs Grid */}
        <section id="offers" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {packs.map((pack, index) => (
                <OfferingCard
                  key={index}
                  variant="outcome"
                  title={pack.title}
                  price={pack.price}
                  duration={pack.duration}
                  benefit={pack.benefit}
                  bullets={pack.bullets}
                  kpis={pack.kpis}
                  icon={pack.icon}
                  ctas={{
                    primary: {
                      label: "Book this Pack",
                      sku: `outcome_${pack.slug}_${pack.price.replace('£', '').replace(',', '')}`,
                      onClick: () => handleCheckout(pack.title)
                    },
                    secondary: {
                      label: "Customise this Brief",
                      link: `/brief?origin=outcomes&ref=${pack.slug}#form`
                    },
                    tertiary: {
                      label: "Start an Audit",
                      link: `/audit?origin=outcomes&ref=${pack.slug}#start`
                    }
                  }}
                />
              ))}
            </div>

            {/* Compliance Outcomes */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-12">Compliance Outcomes</h2>
              <div className="grid lg:grid-cols-3 gap-8">
                {compliancePacks.map((pack, index) => (
                  <OfferingCard
                    key={`compliance-${index}`}
                    variant="outcome"
                    title={pack.title}
                    price={pack.price}
                    duration={pack.duration}
                    benefit={pack.benefit}
                    bullets={pack.bullets}
                    kpis={pack.kpis}
                    icon={pack.icon}
                    ctas={{
                      primary: {
                        label: "Book this Pack",
                        sku: `outcome_${pack.slug}_${pack.price.replace('£', '').replace(',', '')}`
                      },
                      secondary: {
                        label: "Customise this Brief",
                        link: `/brief?origin=outcomes&ref=${pack.slug}#form`
                      },
                      tertiary: {
                        label: "Start an Audit",
                        link: `/audit?origin=outcomes&ref=${pack.slug}#start`
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom bands */}
            <div className="bg-muted/50 p-6 rounded-lg mb-8 max-w-4xl mx-auto text-center">
              <p className="text-base leading-relaxed text-muted-foreground">
                <strong>De-risk:</strong> Live workflow by Day 10 or your Pack fee is credited toward a retainer.
              </p>
              <p className="text-base leading-relaxed text-muted-foreground mt-2">
                <strong>Performance option:</strong> Eligible clients can add +5% uplift participation after baseline sign-off.
              </p>
            </div>
          </div>
        </section>

        <StickyMobileBar briefOrigin="outcomes" />
      </div>
    </>
  );
};

export default BusinessOutcomes;