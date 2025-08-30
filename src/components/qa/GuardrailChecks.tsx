import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface GuardrailCheckProps {
  children: React.ReactNode;
  viewMode?: 'proof' | 'catalog';
  showAnonymity?: boolean;
  priceDisplay?: 'band' | 'large';
}

// Component to enforce guardrails and provide visual feedback in dev mode
export const GuardrailCheck: React.FC<GuardrailCheckProps> = ({ 
  children, 
  viewMode = 'proof',
  showAnonymity = true,
  priceDisplay = 'band'
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const violations: string[] = [];

  // Check for violations
  if (viewMode === 'proof') {
    // Look for direct expert quote buttons in proof view
    const childrenString = React.Children.toArray(children).join('');
    if (childrenString.includes('Get quote from this expert') || 
        childrenString.includes('Quote from expert')) {
      violations.push('VIOLATION: Direct expert quotes found in proof view');
    }
  }

  if (priceDisplay === 'large') {
    violations.push('VIOLATION: Large price display detected - should use price bands only');
  }

  if (!showAnonymity) {
    violations.push('WARNING: Anonymity not enforced - check identity reveal logic');
  }

  return (
    <>
      {children}
      {isDevelopment && violations.length > 0 && (
        <Alert className="mt-2 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-semibold text-orange-800 mb-2">Guardrail Violations</div>
            <ul className="space-y-1">
              {violations.map((violation, index) => (
                <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                  <X className="h-3 w-3" />
                  {violation}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

// Automated checks for key guardrails
export const runGuardrailChecks = () => {
  const results = {
    noDirectExpertQuotesInProof: true,
    priceDisplayedAsBandOnly: true,
    anonymityEnforced: true,
    violations: [] as string[]
  };

  // Check for proof view violations
  const proofElements = document.querySelectorAll('[data-view="proof"]');
  proofElements.forEach(element => {
    if (element.textContent?.includes('Get quote from this expert')) {
      results.noDirectExpertQuotesInProof = false;
      results.violations.push('Direct expert quote button found in proof view');
    }
  });

  // Check for large price displays
  const priceElements = document.querySelectorAll('[data-price-display="large"]');
  if (priceElements.length > 0) {
    results.priceDisplayedAsBandOnly = false;
    results.violations.push('Large price display found - should use bands only');
  }

  // Check anonymity enforcement
  const identityElements = document.querySelectorAll('[data-identity-revealed="true"]');
  const acceptedProposals = document.querySelectorAll('[data-proposal-status="accepted"]');
  if (identityElements.length > acceptedProposals.length) {
    results.anonymityEnforced = false;
    results.violations.push('Identity revealed without proposal acceptance');
  }

  return results;
};

// QA Status component
export const QAStatus: React.FC<{ passed: boolean; message: string }> = ({ 
  passed, 
  message 
}) => (
  <div className="flex items-center gap-2 p-2 rounded border">
    {passed ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    )}
    <span className={passed ? 'text-green-700' : 'text-red-700'}>
      {message}
    </span>
    <Badge variant={passed ? 'secondary' : 'destructive'} className="ml-auto">
      {passed ? 'PASS' : 'FAIL'}
    </Badge>
  </div>
);