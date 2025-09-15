import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ArrowLeft, Clock, Package, Tag, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import WhatHappensNext from '@/components/WhatHappensNext';

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
  subcategory: {
    id: string;
    name: string;
    slug: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        navigate('/catalog');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(id, name, slug),
            subcategory:subcategories(id, name, slug)
          `)
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          throw error;
        }

        setProduct(data);
      } catch (error: any) {
        toast({
          title: "Product not found",
          description: "The product you're looking for doesn't exist or is no longer available.",
          variant: "destructive",
        });
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handleCheckout = async () => {
    if (!product) return;

    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to purchase this pack.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    try {
      setCheckoutLoading(true);
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { product_id: product.id },
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toLocaleString()}`;
  };

  const formatDeliverables = (deliverables: string) => {
    return deliverables.split('\n').filter(item => item.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/catalog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {product.category?.name}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {product.subcategory?.name}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
              <p className="text-xl text-muted-foreground">{product.description}</p>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{product.timeline}</p>
              </CardContent>
            </Card>

            {/* Deliverables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {formatDeliverables(product.deliverables).map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item.replace(/^•\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {formatPrice(product.base_price)}
                  </div>
                  <p className="text-sm text-muted-foreground">Outcome pack starting price</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? 'Processing...' : (
                    <>
                      Buy Outcome Pack
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link to={`/brief-builder?product_id=${product.id}`}>Customize This</Link>
                </Button>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Proven outcome pack foundation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Fully customizable scope</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Human QA included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Pay by milestone</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <WhatHappensNext />
          </div>
        </div>

        {/* Customization CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Want to customize this outcome pack?</h3>
          <p className="text-muted-foreground mb-6">
            Every outcome pack can be fully tailored to your needs. Discuss modifications, additions, or complete customizations with our experts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/brief-builder">Discuss Customization</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Book Consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;