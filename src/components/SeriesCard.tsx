import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock } from 'lucide-react';

interface SeriesCardProps {
  series: {
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
    }>;
  };
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const getMinPrice = () => {
    if (!series.products || series.products.length === 0) return 0;
    return Math.min(...series.products.map(p => p.base_price));
  };

  const getTierCount = () => {
    return series.products?.length || 0;
  };

  const getMostPopularTier = () => {
    const popularProduct = series.products?.find(p => p.most_popular);
    return popularProduct ? popularProduct.tier : null;
  };

  const getMinTimeline = () => {
    if (!series.products || series.products.length === 0) return null;
    const timelines = series.products
      .map(p => p.timeline_days)
      .filter((days): days is number => days !== null && days !== undefined);
    
    if (timelines.length === 0) return null;
    return Math.min(...timelines);
  };

  const formatPrice = (price: number) => {
    return `£${(price / 100).toLocaleString()}`;
  };

  const formatTimeline = (days: number) => {
    if (days <= 7) return `${days} days`;
    if (days <= 28) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  const minPrice = getMinPrice();
  const tierCount = getTierCount();
  const popularTier = getMostPopularTier();
  const minTimeline = getMinTimeline();

  return (
    <Card className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {series.category.name}
            </Badge>
            {series.subcategory && (
              <Badge variant="outline" className="text-xs">
                {series.subcategory.name}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              From {formatPrice(minPrice)}
            </div>
            <div className="text-xs text-muted-foreground">
              {tierCount} tier{tierCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <CardTitle className="text-xl">{series.name}</CardTitle>
        <CardDescription className="text-base" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {series.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          {minTimeline && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>From {formatTimeline(minTimeline)}</span>
            </div>
          )}
          
          {popularTier && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-muted-foreground">
                Most popular: <span className="font-medium capitalize">{popularTier}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <Button asChild className="w-full">
            <Link to={`/series/${series.slug}`}>
              View Series
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};