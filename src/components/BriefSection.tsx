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
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">{title}:</span>
        <Badge variant="outline" className="ml-auto">{safeText(data)}</Badge>
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
                {normalized.metric && (
                  <div>
                    <span className="text-xs text-muted-foreground">Metric:</span>
                    <Chips data={[normalized.metric]} className="mt-1" />
                  </div>
                )}
                {normalized.timeframe && (
                  <div>
                    <span className="text-xs text-muted-foreground">Timeframe:</span>
                    <Chips data={[normalized.timeframe]} className="mt-1" />
                  </div>
                )}
                {normalized.objective && (
                  <div>
                    <span className="text-xs text-muted-foreground">Objective:</span>
                    <Chips data={[normalized.objective]} className="mt-1" />
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
                {normalized.hardware_support && (
                  <div>
                    <span className="text-xs text-muted-foreground">Hardware Support:</span>
                    <Chips data={[normalized.hardware_support]} className="mt-1" />
                  </div>
                )}
                {normalized.integration_software && (
                  <div>
                    <span className="text-xs text-muted-foreground">Integration Software:</span>
                    <Chips data={[normalized.integration_software]} className="mt-1" />
                  </div>
                )}
                {normalized.ai_model_compatibility && (
                  <div>
                    <span className="text-xs text-muted-foreground">AI Model Compatibility:</span>
                    <Chips data={[normalized.ai_model_compatibility]} className="mt-1" />
                  </div>
                )}
              </>
            )}
            
            {/* Generic fallback for other normalized fields */}
            {Object.entries(normalized).map(([key, value]) => {
              const isHandled = ['metric', 'timeframe', 'objective', 'industry', 'org_size', 'region', 'hardware_support', 'integration_software', 'ai_model_compatibility'].includes(key);
              if (isHandled || !value) return null;
              
              return (
                <div key={key}>
                  <span className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                  <Chips data={Array.isArray(value) ? value : [value]} className="mt-1" />
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

      </CardContent>
    </Card>
  );
}