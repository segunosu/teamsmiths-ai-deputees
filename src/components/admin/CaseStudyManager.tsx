import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, ExternalLink, User, TrendingUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CaseStudyWithProfile {
  id: string;
  title: string;
  summary: string;
  tools: string[] | null;
  industries: string[] | null;
  metrics: Record<string, any>;
  evidence_url: string | null;
  is_verified: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export default function CaseStudyManager() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifyByEmail, setNotifyByEmail] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const fetchCaseStudies = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select(`
          *,
          profiles:user_id(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCaseStudies((data || []) as unknown as CaseStudyWithProfile[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch case studies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (study: CaseStudyWithProfile) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', study.id);

      if (error) throw error;

      await supabase.functions.invoke('audit-admin-action', {
        body: { entity: 'case_studies', action: 'verify', entity_id: study.id, meta: { is_verified: true } }
      });

      await supabase.rpc('create_notification', {
        p_user_id: study.user_id,
        p_type: 'case_study_update',
        p_title: 'Case study verified',
        p_message: `Your case study "${study.title}" has been verified by Teamsmiths.`,
        p_related_id: study.id
      });

      if (notifyByEmail && study.profiles?.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: study.profiles.email,
            type: 'case_study_verified',
            data: { title: 'Case Study Verified', freelancerName: study.profiles.full_name || 'there', caseStudyTitle: study.title }
          }
        });
      }

      toast({ title: 'Success', description: 'Case study verified.' });
      fetchCaseStudies();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to verify case study', variant: 'destructive' });
    }
  };

  const handleReject = async (study: CaseStudyWithProfile) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', study.id);

      if (error) throw error;

      await supabase.functions.invoke('audit-admin-action', {
        body: { entity: 'case_studies', action: 'reject', entity_id: study.id, meta: { is_verified: false } }
      });

      await supabase.rpc('create_notification', {
        p_user_id: study.user_id,
        p_type: 'case_study_update',
        p_title: 'Case study update',
        p_message: `Update on your case study "${study.title}". It was not verified at this time.`,
        p_related_id: study.id
      });

      if (notifyByEmail && study.profiles?.email) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: study.profiles.email,
            type: 'case_study_rejected',
            data: { title: 'Case Study Update', freelancerName: study.profiles.full_name || 'there', caseStudyTitle: study.title }
          }
        });
      }

      toast({ title: 'Success', description: 'Case study rejected.' });
      fetchCaseStudies();
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to reject case study', variant: 'destructive' });
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderMetrics = (metrics: Record<string, any>) => {
    if (!metrics || Object.keys(metrics).length === 0) {
      return <span className="text-muted-foreground text-sm">No metrics provided</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(metrics).map(([key, value]) => (
          <Badge key={key} variant="secondary" className="text-xs">
            {key}: {String(value)}
          </Badge>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Case Studies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading case studies...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Case Study Verification</CardTitle>
            <CardDescription>
              Review and verify freelancer case studies to boost their credibility in client-facing views
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="notify-email-cs" checked={notifyByEmail} onCheckedChange={(v) => setNotifyByEmail(Boolean(v))} />
            <Label htmlFor="notify-email-cs" className="text-sm">Notify freelancer by email</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {caseStudies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No case studies to review
          </div>
        ) : (
          <div className="space-y-6">
            {caseStudies.map((study) => (
              <div key={study.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {study.profiles?.full_name || 'Unknown User'}
                      </span>
                    </div>
                    {study.is_verified && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        Teamsmiths Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {study.evidence_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a 
                          href={study.evidence_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Evidence
                        </a>
                      </Button>
                    )}
                    
                    <TooltipProvider>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(study.id)}
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rejected case studies remain private to the freelancer.</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(study)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified case studies boost freelancer credibility in client views.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  </div>
                </div>
                
                <h4 className="font-semibold text-lg mb-2">{study.title}</h4>
                
                <p className="text-muted-foreground mb-3">
                  {truncateText(study.summary)}
                </p>
                
                <div className="space-y-3">
                  {study.tools && study.tools.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Tools used:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {study.tools.map((tool, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {study.industries && study.industries.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Industries:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {study.industries.map((industry, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Metrics:</span>
                    </div>
                    {renderMetrics(study.metrics)}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Submitted: {new Date(study.created_at).toLocaleDateString()}
                  {study.updated_at !== study.created_at && (
                    <> • Updated: {new Date(study.updated_at).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}