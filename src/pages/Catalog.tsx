import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Clock, Package, Tag, Rocket, Shield, Brain, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SeriesCard } from '@/components/SeriesCard';

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
  products: Array<{
    id: string;
    tier: 'lite' | 'team' | 'org';
    base_price: number;
    most_popular: boolean;
    timeline_days?: number;
    title?: string;
    deliverables?: string;
    tags?: string[];
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  category_id: string;
}

const Catalog = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get category from URL params on page load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, []);

  // Silent mapping for old category slugs to new structure
  const mapLegacyCategory = (categorySlug: string) => {
    const legacyMapping: Record<string, { category: string; subcategory: string }> = {
      'team-productivity': { category: 'continuous-improvement', subcategory: 'team-productivity' },
      'process-optimization': { category: 'continuous-improvement', subcategory: 'process-optimization' },
      'software-development': { category: 'continuous-improvement', subcategory: 'app-dev-enablers' }
    };
    return legacyMapping[categorySlug];
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active categories in specific order
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        // Order categories explicitly: Sales Acceleration, Continuous Improvement, Compliance
        const orderedCategories = (categoriesData || []).sort((a, b) => {
          const order = ['sales-acceleration', 'continuous-improvement', 'compliance'];
          const aIndex = order.indexOf(a.slug);
          const bIndex = order.indexOf(b.slug);
          if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });

        setCategories(orderedCategories);

        // Fetch active subcategories
        const { data: subcategoriesData, error: subcategoriesError } = await supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (subcategoriesError) {
          throw subcategoriesError;
        }

        setSubcategories(subcategoriesData || []);

        // Fetch series with category and subcategory info
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select(`
            *,
            category:categories(id, name, slug),
            subcategory:subcategories(id, name, slug)
          `)
          .eq('is_active', true)
          .order('name');

        if (seriesError) {
          throw seriesError;
        }

        // For each series, fetch its products to get pricing and tier info
        const seriesWithProducts = await Promise.all(
          (seriesData || []).map(async (seriesItem) => {
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('id, tier, base_price, most_popular, timeline_days, title, deliverables, tags')
              .eq('series_id', seriesItem.id)
              .eq('is_active', true);

            if (productsError) {
              console.error('Error fetching products for series:', seriesItem.slug, productsError);
            }

            return {
              ...seriesItem,
              products: (productsData || []).map(product => ({
                ...product,
                tier: product.tier as 'lite' | 'team' | 'org'
              }))
            };
          })
        );

        setSeries(seriesWithProducts);

        // Handle legacy category mapping from URL or stored state
        const currentCategory = selectedCategory;
        const legacyMap = mapLegacyCategory(currentCategory);
        if (legacyMap) {
          setSelectedCategory(legacyMap.category);
          setSelectedSubcategory(legacyMap.subcategory);
        }
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

  const filteredSeries = (() => {
    if (selectedCategory === 'all') return series;
    
    const categorySeries = series.filter(s => s.category?.slug === selectedCategory);
    
    if (selectedCategory === 'continuous-improvement' && selectedSubcategory !== 'all') {
      return categorySeries.filter(s => s.subcategory?.slug === selectedSubcategory);
    }
    
    return categorySeries;
  })();

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSelectedSubcategory('all'); // Reset subcategory when changing category
  };

  const handleSubcategoryChange = (subcategorySlug: string) => {
    setSelectedSubcategory(subcategorySlug);
  };

  const getContinuousImprovementSubcategories = () => {
    const ciCategory = categories.find(cat => cat.slug === 'continuous-improvement');
    if (!ciCategory) return [];
    
    return subcategories.filter(sub => sub.category_id === ciCategory.id);
  };

  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return 'All Categories';
    const category = categories.find(cat => cat.slug === selectedCategory);
    return category?.name || '';
  };

  const getSelectedSubcategoryName = () => {
    if (selectedSubcategory === 'all') return '';
    const subcategory = subcategories.find(sub => sub.slug === selectedSubcategory);
    return subcategory?.name || '';
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'sales acceleration':
        return <Rocket className="h-5 w-5 text-primary" />;
      case 'compliance':
        return <Shield className="h-5 w-5 text-primary" />;
      case 'continuous improvement':
        return <Brain className="h-5 w-5 text-primary" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toLocaleString()}`;
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
              onClick={() => handleCategoryChange('all')}
              className="rounded-full"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'default' : 'outline'}
                onClick={() => handleCategoryChange(category.slug)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>



        {/* Series Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSeries.map((seriesItem) => (
            <SeriesCard key={seriesItem.id} series={seriesItem} />
          ))}
        </div>

        {filteredSeries.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold mb-2">No series found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back soon for new series.
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Need full customization?</h3>
          <p className="text-muted-foreground mb-6">
            Every series can be fully customized. Our experts will tailor any solution to your specific requirements.
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