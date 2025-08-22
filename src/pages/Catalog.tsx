import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, Package, Tag, Rocket, Shield, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  title: string;
  description: string;
  deliverables: string;
  timeline: string;
  base_price: number;
  tags: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const Catalog = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch only active categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        setCategories(categoriesData || []);

        // Fetch products with category info
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('is_active', true);

        if (productsError) {
          throw productsError;
        }

        setProducts(productsData || []);
      } catch (error: any) {
        toast({
          title: "Error loading catalog",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleCheckout = async (product: Product) => {
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
      
      // Handle edge function errors
      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to initiate checkout');
      }
      
      // Handle structured error responses from edge function
      if (data && !data.ok) {
        console.error('Payment error:', data);
        throw new Error(data.error || 'Payment system error');
      }
      
      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast({
        title: 'Checkout failed',
        description: err.message || 'Please contact support if this persists.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProductId(null);
    }
  };

  // Filter and sort products
  const filteredProducts = (selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category?.slug === selectedCategory))
    .sort((a, b) => {
      // Group by similar names first, then by price
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      // Extract base name (before numbers/descriptors)
      const getBaseName = (title: string) => {
        return title.replace(/\d+|\b(starter|pilot|advanced|pro|premium|lite|basic)\b/g, '').trim();
      };
      
      const aBaseName = getBaseName(aTitle);
      const bBaseName = getBaseName(bTitle);
      
      // If same base name, sort by price
      if (aBaseName === bBaseName) {
        return a.base_price - b.base_price;
      }
      
      // Different base names, sort alphabetically
      return aBaseName.localeCompare(bBaseName);
    });

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'sales acceleration':
        return <Rocket className="h-5 w-5 text-primary" />;
      case 'compliance':
        return <Shield className="h-5 w-5 text-primary" />;
      case 'performance improvement':
        return <TrendingUp className="h-5 w-5 text-primary" />;
      case 'process optimization':
        return <Brain className="h-5 w-5 text-primary" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toLocaleString()}`;
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
          <p className="text-muted-foreground">Loading catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Outcome Packs
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Pre-scoped solutions. Delivered fast. Human QA. Pay by milestone.
          </p>
        </div>

        {/* Primary CTA (above category tabs) */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="sm">
            <Link to="/customize">Discuss Customization</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/auth">Book Consultation</Link>
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories
              .sort((a, b) => {
                // Order: Sales Acceleration, Performance Improvement, Process Optimization, Compliance
                const order = ['sales-acceleration', 'performance-improvement', 'process-optimization', 'compliance'];
                return order.indexOf(a.slug) - order.indexOf(b.slug);
              })
              .map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(product.category?.name || '')}
                    <Badge variant="secondary" className="text-xs">
                      {product.category?.name}
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(product.base_price)}
                  </div>
                </div>
                <CardTitle className="text-xl">{product.title}</CardTitle>
                <CardDescription className="text-base" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Clock className="h-4 w-4" />
                    <span>{product.timeline}</span>
                  </div>
                  <div className="text-xs text-primary/70 ml-6">
                    Fast track available - contact for expedited delivery
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    <span>Deliverables:</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-0.5 ml-6 list-disc">
                    {formatDeliverables(product.deliverables).slice(0, 3).map((item, index) => {
                      const words = item.split(' ');
                      const firstPart = words.slice(0, 3).join(' ');
                      const restPart = words.slice(3).join(' ');
                      return (
                        <li key={index}>
                          <span className="font-medium text-foreground">{firstPart}</span>
                          {restPart && <span className="ml-1">{restPart}</span>}
                        </li>
                      );
                    })}
                    {formatDeliverables(product.deliverables).length > 3 && (
                      <li className="list-none text-xs text-muted-foreground">+ more</li>
                    )}
                  </ul>
                </div>

                {product.tags && product.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Tag className="h-4 w-4" />
                      <span>Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />
                
                <div className="mt-auto">
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <Link to={`/product/${product.id}`}>See Details or Customize</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCheckout(product)}
                      disabled={loadingProductId === product.id}
                    >
                      {loadingProductId === product.id ? 'Processing...' : (
                        <>
                          Buy Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No outcome packs found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back soon for new outcome packs.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Need full customization?</h3>
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

export default Catalog;