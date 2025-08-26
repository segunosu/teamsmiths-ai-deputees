import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { Chips } from '@/components/ui/chips';
import { safeText } from '@/lib/safeRender';

interface BriefSectionProps {
  title: string;
  data: any;
  type?: 'goal' | 'context' | 'constraints' | 'scalar';
}

export function BriefSection({ title, data, type = 'scalar' }: BriefSectionProps) {
  if (!data) return null;

  // Handle scalar values (simple fields)
  if (type === 'scalar') {
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-muted-foreground">{title}:</span>
        <Badge variant="outline">{safeText(data)}</Badge>
      </div>
    );
  }

  // Handle structured AI-processed sections
  const confidence = data.confidence || null;
  const interpreted = data.interpreted || '';
  const normalized = data.normalized || {};
  const warnings = data.warnings || [];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {title}
            {confidence && (
              <Badge variant="secondary" className="text-xs">
                Confidence {(confidence * 100).toFixed(0)}%
              </Badge>
            )}
          </CardTitle>
          {warnings.length > 0 && (
            <Badge variant="outline" className="text-amber-600 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {interpreted && (
          <p className="text-sm leading-relaxed">{interpreted}</p>
        )}
        
        {Object.keys(normalized).length > 0 && (
          <div className="space-y-2">
            {type === 'goal' && (
              <>
                {normalized.metrics && (
                  <div>
                    <span className="text-xs text-muted-foreground">Metrics:</span>
                    <Chips data={normalized.metrics} className="mt-1" />
                  </div>
                )}
                {normalized.timeframe && (
                  <div>
                    <span className="text-xs text-muted-foreground">Timeframe:</span>
                    <Chips data={normalized.timeframe} className="mt-1" />
                  </div>
                )}
              </>
            )}
            
            {type === 'context' && (
              <>
                {normalized.industry && (
                  <div>
                    <span className="text-xs text-muted-foreground">Industry:</span>
                    <Chips data={normalized.industry} className="mt-1" />
                  </div>
                )}
                {normalized.org_size && (
                  <div>
                    <span className="text-xs text-muted-foreground">Organization:</span>
                    <Chips data={normalized.org_size} className="mt-1" />
                  </div>
                )}
                {normalized.region && (
                  <div>
                    <span className="text-xs text-muted-foreground">Region:</span>
                    <Chips data={normalized.region} className="mt-1" />
                  </div>
                )}
              </>
            )}
            
            {type === 'constraints' && (
              <>
                {normalized.integrations && (
                  <div>
                    <span className="text-xs text-muted-foreground">Integrations:</span>
                    <Chips data={normalized.integrations} className="mt-1" />
                  </div>
                )}
                {normalized.tools && (
                  <div>
                    <span className="text-xs text-muted-foreground">Tools:</span>
                    <Chips data={normalized.tools} className="mt-1" />
                  </div>
                )}
                {normalized.approvals && (
                  <div>
                    <span className="text-xs text-muted-foreground">Approvals:</span>
                    <Chips data={normalized.approvals} className="mt-1" />
                  </div>
                )}
              </>
            )}
            
            {/* Generic fallback for other normalized fields */}
            {Object.entries(normalized).map(([key, value]) => {
              const isHandled = ['metrics', 'timeframe', 'industry', 'org_size', 'region', 'integrations', 'tools', 'approvals'].includes(key);
              if (isHandled || !value) return null;
              
              return (
                <div key={key}>
                  <span className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                  <Chips data={value as any} className="mt-1" />
                </div>
              );
            })}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {warnings.map((warning: any, index: number) => (
                  <p key={index} className="text-sm text-amber-800">
                    {safeText(warning)}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <details className="mt-4">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Debug Information
          </summary>
          <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto">
            {safeText(data)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}