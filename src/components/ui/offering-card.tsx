import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfferingCardProps {
  variant: "outcome" | "impact";
  title: string;
  price?: string;
  duration: string;
  benefit: string;
  bullets: string[];
  kpis?: string; // shown only for outcomes
  icon: React.ReactNode;
  ctas: {
    primary: {
      label: string;
      sku?: string;
      onClick?: () => void;
    };
    secondary: {
      label: string;
      link: string;
    };
    tertiary: {
      label: string;
      link: string;
    };
  };
  microcopy?: React.ReactNode;
}

export const OfferingCard: React.FC<OfferingCardProps> = ({
  variant,
  title,
  price,
  duration,
  benefit,
  bullets,
  kpis,
  icon,
  ctas,
  microcopy
}) => {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-card/80 text-left">
      <CardHeader className="pb-6">
        <div className="mb-6">
          {icon}
        </div>
        <CardTitle className="text-3xl font-bold">{title}</CardTitle>
        <div className="flex items-center gap-3 mt-3 mb-4">
          {price && <Badge variant="secondary" className="text-lg font-bold">{price}</Badge>}
          <Badge variant="outline">{duration}</Badge>
        </div>
        <p className="text-lg font-semibold text-primary mb-2">{benefit}</p>
        {variant === "outcome" && (
          <p className="text-lg font-medium text-muted-foreground">
            {title.includes("Proposal") && "Draft proposals from your last call; branded & tracked with AI Deputee™"}
            {title.includes("Sales") && "Transcript-to-quote + SMS/email nudges"}
            {title.includes("Cashflow") && "Connect Xero/QBO; aging analysis; tone ladder"}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-4 mb-6">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
              <span className="text-base leading-relaxed">{bullet}</span>
            </li>
          ))}
          {variant === "outcome" && kpis && (
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-success mt-1 flex-shrink-0" />
              <span className="text-base leading-relaxed">KPIs: {kpis}</span>
            </li>
          )}
        </ul>
        
        <div className="flex flex-col gap-3">
          <Button 
            className="w-full" 
            onClick={ctas.primary.onClick}
            disabled={!ctas.primary.sku && !ctas.primary.onClick}
            title={!ctas.primary.sku && !ctas.primary.onClick ? "Temporarily unavailable — please Start a Brief." : undefined}
          >
            {ctas.primary.label}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to={ctas.secondary.link}>{ctas.secondary.label}</Link>
          </Button>
          <Link 
            to={ctas.tertiary.link}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {ctas.tertiary.label}
          </Link>
          {microcopy}
        </div>
      </CardContent>
    </Card>
  );
};