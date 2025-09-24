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

        <Button 
          asChild 
          className="w-full"
          onClick={() => onBusinessUpliftClick('add_to_plan', uplift.slug)}
        >
          <Link to={`/start?engage=subscription&ref=${uplift.slug}`}>Add to Plan</Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Tailored to your business during onboarding.
        </p>
        <Button 
          asChild 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onBusinessUpliftClick('fixed_price', uplift.slug)}
        >
          <Link to={`/brief-builder?mode=quote&origin=solutions&ref=${uplift.slug}#form`}>
            Prefer a project? Get a fixed price in 24h
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};