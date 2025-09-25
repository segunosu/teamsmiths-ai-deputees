import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessUplift {
  slug: string;
  title: string;
  description: string;
  benefit: string;
  delivered?: string;
  timeframe?: string;
  outcome?: string;
}

interface BusinessUpliftCardProps {
  uplift: BusinessUplift;
  onBusinessUpliftClick: (type: 'add_to_plan' | 'fixed_price', slug: string) => void;
}

export const BusinessUpliftCard: React.FC<BusinessUpliftCardProps> = ({
  uplift,
  onBusinessUpliftClick
}) => {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{uplift.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-base">
          {uplift.description}
        </CardDescription>
        
        {uplift.delivered && (
          <div className="text-sm">
            <span className="font-medium">What you get:</span> {uplift.delivered}
          </div>
        )}
        
        {uplift.timeframe && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Delivered in:</span> {uplift.timeframe}
          </div>
        )}
        
        {uplift.outcome && (
          <div className="text-sm text-primary/80">
            <span className="font-medium">Result:</span> {uplift.outcome}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            asChild 
            className="w-full"
            onClick={() => onBusinessUpliftClick('add_to_plan', uplift.slug)}
          >
            <Link to={`/pricing?ref=${uplift.slug}`}>Add to Plan (from £495/month)</Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            className="w-full"
            onClick={() => onBusinessUpliftClick('fixed_price', uplift.slug)}
          >
            <Link to={`/brief-builder?mode=quote&origin=solutions&ref=${uplift.slug}#form`}>
              Get Fixed Price Quote
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="ghost" 
            size="sm" 
            className="w-full"
          >
            <Link to="/contact">Book a Call First</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};