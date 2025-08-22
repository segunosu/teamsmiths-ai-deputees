import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Clock, Package, ChevronDown, ChevronUp, Zap, Wrench } from 'lucide-react';

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
      title?: string;
      deliverables?: string;
      tags?: string[];
    }>;
  };
}

export const SeriesCard: React.FC<SeriesCardProps> = ({ series }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getMinPrice = () => {
    if (!series.products || series.products.length === 0) return 0;
    return Math.min(...series.products.map(p => p.base_price));
  };

  const getMaxPrice = () => {
    if (!series.products || series.products.length === 0) return 0;
    return Math.max(...series.products.map(p => p.base_price));
  };

  const getPriceRange = () => {
    const min = getMinPrice();
    const max = getMaxPrice();
    if (min === max) return formatPrice(min);
    return `${formatPrice(min)} – ${formatPrice(max)}`;
  };

  const getSampleDeliverables = () => {
    if (!series.products || series.products.length === 0) return [];
    
    // Get deliverables from all products and parse them
    const allDeliverables: string[] = [];
    series.products.forEach(product => {
      if (product.deliverables) {
        // Split by bullet points and clean up
        const deliverables = product.deliverables
          .split(/[•\n]/)
          .map(d => d.trim())
          .filter(d => d.length > 0);
        allDeliverables.push(...deliverables);
      }
    });

    // Remove duplicates and take top 3
    const uniqueDeliverables = Array.from(new Set(allDeliverables));
    return uniqueDeliverables.slice(0, 3);
  };

  const getAllTags = () => {
    if (!series.products || series.products.length === 0) return [];
    
    const allTags: string[] = [];
    series.products.forEach(product => {
      if (product.tags) {
        allTags.push(...product.tags);
      }
    });

    // Remove duplicates and take top 4
    const uniqueTags = Array.from(new Set(allTags));
    return uniqueTags.slice(0, 4);
  };

  const getTimelineRange = () => {
    if (!series.products || series.products.length === 0) return null;
    const timelines = series.products
      .map(p => p.timeline_days)
      .filter((days): days is number => days !== null && days !== undefined);
    
    if (timelines.length === 0) return null;
    
    const min = Math.min(...timelines);
    const max = Math.max(...timelines);
    
    if (min === max) return formatTimeline(min);
    
    const minFormatted = formatTimeline(min);
    const maxFormatted = formatTimeline(max);
    return `${minFormatted} – ${maxFormatted}`;
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

  const priceRange = getPriceRange();
  const tierCount = getTierCount();
  const popularTier = getMostPopularTier();
  const timelineRange = getTimelineRange();
  const sampleDeliverables = getSampleDeliverables();
  const allTags = getAllTags();

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
            <div className="text-lg font-bold text-primary">
              {priceRange}
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
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Timeline and Popular Tier */}
        <div className="flex items-center justify-between">
          {timelineRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{timelineRange}</span>
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

        {/* Sample Deliverables */}
        {sampleDeliverables.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Package className="h-4 w-4" />
              <span>Key Deliverables</span>
            </div>
            <div className="space-y-1">
              {sampleDeliverables.map((deliverable, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="line-clamp-1">{deliverable}</span>
                </div>
              ))}
              {series.products.some(p => p.deliverables && p.deliverables.split(/[•\n]/).filter(d => d.trim().length > 0).length > 3) && (
                <div className="text-xs text-muted-foreground italic">+ more</div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Tier Preview (when expanded) */}
        {isExpanded && (
          <div className="space-y-3 mb-4">
            <div className="text-sm font-medium text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Available Tiers
            </div>
            <div className="space-y-2">
              {series.products.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-medium">{product.tier}</span>
                    {product.most_popular && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(product.base_price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
          {/* Quick Expand Button */}
          <Button 
            variant="outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
            size="sm"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Preview Tiers
              </>
            )}
          </Button>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to={`/series/${series.slug}`}>
                <Zap className="mr-2 h-4 w-4" />
                View Series
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/customize">
                <Wrench className="mr-2 h-4 w-4" />
                Customize
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};