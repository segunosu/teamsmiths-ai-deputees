import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, ArrowLeft, Star, Clock, Package, CheckCircle2, Users, Building2 } from 'lucide-react';

interface SeriesProduct {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  base_price: number;
  tier: 'lite' | 'team' | 'org';
  timeline_days?: number;
  most_popular: boolean;
  outcomes?: any;
}

interface Series {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  products: SeriesProduct[];
}

const SeriesDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [series, setSeries] = useState<Series | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        if (!slug) return;

        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select(`
            *,
            category:categories(id, name, slug),
            subcategory:subcategories(id, name, slug)
          `)
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (seriesError) throw seriesError;

        if (!seriesData) {
          throw new Error('Series not found');
        }

        // Fetch products for this series
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('series_id', seriesData.id)
          .eq('is_active', true)
          .order('base_price');

        if (productsError) throw productsError;

        setSeries({
          ...seriesData,
          products: (productsData || []).map(product => ({
            ...product,
            tier: product.tier as 'lite' | 'team' | 'org'
          }))
        });
      } catch (error: any) {
        toast({
          title: "Error loading series",
          description: error.message,
          variant: "destructive",
        });
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [slug, toast, navigate]);

  const handleCheckout = async (product: SeriesProduct) => {
    try {
      setLoadingProductId(product.id);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user?.email) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to purchase this pack.',
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { product_id: product.id },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to initiate checkout');
      }
      
      if (data && !data.ok) {
        throw new Error(data.error || 'Payment system error');
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received. Please try again.');
      }
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err.message || 'Please contact support if this persists.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProductId(null);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'lite':
        return <Users className="h-5 w-5" />;
      case 'team':
        return <Users className="h-5 w-5" />;
      case 'org':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'lite':
        return 'Lite';
      case 'team':
        return 'Team';
      case 'org':
        return 'Org';
      default:
        return tier;
    }
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toLocaleString()}`;
  };

  const formatTimeline = (days?: number) => {
    if (!days) return 'Contact for timeline';
    if (days <= 7) return `${days} days`;
    if (days <= 28) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  const formatDeliverables = (deliverables: string) => {
    return deliverables.split('\n')
      .filter(item => item.trim())
      .map(item => item.replace(/^[•\s]+/, '').trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading series...</p>
        </div>
      </div>
    );
  }

  if (!series) {
    return null;
  }

  const sortedProducts = [...series.products].sort((a, b) => {
    const tierOrder = { lite: 0, team: 1, org: 2 };
    return (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99);
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground">
            <Link to="/catalog" className="hover:text-foreground">Catalog</Link>
            <span className="mx-2">→</span>
            <span>{series.category.name}</span>
            {series.subcategory && (
              <>
                <span className="mx-2">→</span>
                <span>{series.subcategory.name}</span>
              </>
            )}
          </nav>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary">{series.category.name}</Badge>
            {series.subcategory && (
              <Badge variant="outline">{series.subcategory.name}</Badge>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            {series.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {series.description}
          </p>
        </div>

        {/* Tier Comparison */}
        {sortedProducts.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {sortedProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`relative ${product.most_popular ? 'border-primary shadow-lg scale-105' : 'hover:shadow-lg'} transition-all duration-300`}
              >
                {product.most_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-2">
                    {getTierIcon(product.tier)}
                  </div>
                  <CardTitle className="text-2xl capitalize">{getTierLabel(product.tier)}</CardTitle>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(product.base_price)}
                  </div>
                  <CardDescription>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Clock className="h-4 w-4" />
                      {formatTimeline(product.timeline_days)}
                    </div>
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        What's included:
                      </h4>
                      <ul className="space-y-2 text-sm">
                        {formatDeliverables(product.deliverables).map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={() => handleCheckout(product)}
                        disabled={loadingProductId === product.id}
                      >
                        {loadingProductId === product.id ? 'Processing...' : (
                          <>
                            Buy {getTierLabel(product.tier)} Pack
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/customize/${product.id}`}>Customize This Pack</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              This series is being prepared. Check back soon for available tiers.
            </p>
            <Button asChild>
              <Link to={`/customize?series=${series.slug}`}>Request Custom Quote</Link>
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center p-8 bg-muted/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Need something different?</h3>
          <p className="text-muted-foreground mb-6">
            Every outcome pack can be fully customized. Our experts will tailor any solution to your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/customize">Discuss Customization</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Book Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;