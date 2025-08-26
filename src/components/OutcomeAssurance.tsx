import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { ASSURANCE } from '@/content/assurance';

interface OutcomeAssuranceProps {
  className?: string;
}

export const OutcomeAssurance: React.FC<OutcomeAssuranceProps> = ({ className = "" }) => {
  return (
    <div className={`bg-muted/50 border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-6 w-6" />
            <Lock className="h-5 w-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {ASSURANCE.title}
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{ASSURANCE.body[0]}</p>
            <p>{ASSURANCE.body[1]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};