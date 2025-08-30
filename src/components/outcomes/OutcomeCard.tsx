import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, ArrowRight, ExternalLink, Info } from 'lucide-react';

export type OutcomeCardProps = {
  id: string;
  title: string;
  subtitle?: string;
  deliverables: string[];            // show up to 3
  durationEstimate: string;          // e.g., "2–4 weeks"
  priceBand?: { low?: number; typical?: number; high?: number; currency: string };
  evidence?: Array<{ type: 'case' | 'tool'; text: string; link?: string }>;
  expertBadges?: Array<{ role: string; expertiseTag?: string }>; // anonymized role chips
  tags?: string[];
  viewMode: 'proof' | 'catalog';
  onUseOutcome?: (id: string) => void;       // catalog primary
  onRequestQuote: (id: string) => void;      // both views (secondary on catalog)
  onSeeProof?: (id: string) => void;
};

const OutcomeCard: React.FC<OutcomeCardProps> = ({
  id,
  title,
  subtitle,
  deliverables,
  durationEstimate,
  priceBand,
  evidence = [],
  expertBadges = [],
  tags = [],
  viewMode,
  onUseOutcome,
  onRequestQuote,
  onSeeProof
}) => {
  const formatPrice = (amount?: number, currency = 'gbp') => {
    if (!amount) return '';
    const symbol = currency === 'gbp' ? '£' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const renderPriceBand = () => {
    if (!priceBand || (!priceBand.low && !priceBand.typical && !priceBand.high)) {
      return null;
    }

    const parts = [];
    
    if (priceBand.low) {
      parts.push(`From ${formatPrice(priceBand.low, priceBand.currency)}`);
    }
    if (priceBand.typical) {
      parts.push(`Typical ${formatPrice(priceBand.typical, priceBand.currency)}`);
    }
    if (priceBand.high) {
      parts.push(`Up to ${formatPrice(priceBand.high, priceBand.currency)}`);
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{parts.join(' • ')}</span>
              <Info className="h-3 w-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Price varies by scope. Request a quote for an exact price.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="h-full flex flex-col group hover:shadow-md transition-shadow">
      {/* Top strip - compact */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {/* Expert badges */}
          {expertBadges.slice(0, 3).map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {badge.role}
              {badge.expertiseTag && (
                <span className="ml-1 text-muted-foreground">• {badge.expertiseTag}</span>
              )}
            </Badge>
          ))}
          
          {/* Evidence items */}
          {evidence.slice(0, 2).map((item, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className={`text-xs ${item.type === 'case' ? 'border-green-200 text-green-700' : 'border-blue-200 text-blue-700'}`}
            >
              {item.type === 'case' ? '📊' : '🔧'} {item.text}
              {item.link && <ExternalLink className="ml-1 h-2 w-2" />}
            </Badge>
          ))}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {/* Deliverables */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Key deliverables</h4>
            <ul className="space-y-1">
              {deliverables.slice(0, 3).map((deliverable, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{deliverable}</span>
                </li>
              ))}
              {deliverables.length > 3 && (
                <li className="text-sm text-muted-foreground italic">
                  +{deliverables.length - 3} more deliverables
                </li>
              )}
            </ul>
          </div>

          {/* Duration & Price */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{durationEstimate}</span>
            </div>
            {renderPriceBand()}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {tags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Sticky footer with CTAs */}
      <CardFooter className="pt-0">
        <div className="w-full space-y-2">
            {viewMode === 'proof' ? (
              <Button 
                onClick={() => onRequestQuote(id)}
                className="w-full"
                size="lg"
                aria-label={`Request expert quote for ${title}`}
              >
                Request expert quote
              </Button>
            ) : (
              // Catalog view: Primary "Use this outcome" + secondary "Request expert quote"
              <div className="space-y-2">
                <Button 
                  onClick={() => onUseOutcome?.(id)}
                  className="w-full"
                  aria-label={`Use outcome: ${title}`}
                >
                  Use this outcome
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onRequestQuote(id)}
                  className="w-full"
                  aria-label={`Request expert quote for ${title}`}
                >
                  Request expert quote
                </Button>
              </div>
            )}
          
          {/* Footer link */}
          {onSeeProof && (
            <button
              onClick={() => onSeeProof(id)}
              className="w-full text-xs text-primary hover:underline pt-1"
            >
              See proof / case studies
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default OutcomeCard;