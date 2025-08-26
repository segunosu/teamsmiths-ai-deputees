import React from 'react';
import { Badge } from '@/components/ui/badge';
import { safeText } from '@/lib/safeRender';

interface ChipsProps {
  data: string[] | Record<string, string | number> | null | undefined;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export function Chips({ data, variant = 'outline', className = '' }: ChipsProps) {
  if (!data) return null;
  
  if (Array.isArray(data)) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {data.map((item, index) => (
          <Badge key={index} variant={variant} className="text-xs">
            {safeText(item)}
          </Badge>
        ))}
      </div>
    );
  }
  
  if (typeof data === 'object') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {Object.entries(data).map(([key, value]) => (
          <Badge key={key} variant={variant} className="text-xs">
            {key}: {safeText(value)}
          </Badge>
        ))}
      </div>
    );
  }
  
  return null;
}