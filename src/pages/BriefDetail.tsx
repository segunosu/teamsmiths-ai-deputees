import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CheckCircle, Calendar, DollarSign, Users, Target } from 'lucide-react';
import { BriefSection } from '@/components/BriefSection';
import { safeText } from '@/lib/safeRender';
import { useAnalytics } from '@/hooks/useAnalytics';

type Brief = {
  id: string;
  status: 'draft'|'submitted'|'proposal_ready'|'qa_in_review'|'qa_passed'|'accepted'|'archived';
  contact_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  structured_brief: Record<string, unknown> | null;
  proposal_json: Record<string, unknown> | null;
  origin: string;
  origin_id: string | null;
  assured_mode: boolean | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SUPABASE_URL = "https://iyqsbjawaampgcavsgcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0";

export default function BriefDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const analytics = useAnalytics();
  const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_KEY), []);
  const [state, setState] = useState<'idle'|'loading'|'ready'|'not_found'|'error'>('idle');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    console.log('BriefDetail mounted with id:', id);
    
    if (!id || !UUID_RE.test(id)) {
      console.log('Invalid ID, setting not_found');
      setState('not_found');
      return;
    }
    
    let cancelled = false;
    setState('loading');
    
    (async () => {
      try {
        console.log('Fetching brief with id:', id);
        const { data, error } = await supabase
          .from('briefs')
          .select('id,status,contact_email,contact_name,structured_brief,proposal_json,created_at')
          .eq('id', id)
          .maybeSingle();

        if (cancelled) return;

        console.log('Brief fetch result:', { data, error });

        if (error) {
          console.error('BriefDetail.select.error', { error, id });
          // Distinguish not found vs real error
          if (String(error.code || '').startsWith('PGRST1') || error.details?.includes('Results contain 0 rows')) {
            setState('not_found');
          } else {
            setErr(error.message || 'Failed to load brief.');
            setState('error');
          }
          return;
        }
        
        if (!data) {
          console.log('No data returned, setting not_found');
          setState('not_found');
          return;
        }
        
        console.log('Brief loaded successfully:', data);
        setBrief(data as Brief);
        setState('ready');
        
        // Analytics: track detail page open
        analytics.trackEvent('detail.open', { 
          brief_id: id, 
          status: data.status 
        });
      } catch (e: any) {
        console.error('BriefDetail.select.catch', e);
        if (!cancelled) {
          setErr(e?.message || 'Unexpected error.');
          setState('error');
          
          // Analytics: track detail page error
          analytics.trackEvent('detail.error', { 
            brief_id: id, 
            code: e?.code || 'unknown',
            message: e?.message || 'Unexpected error'
          });
        }
      }
    })();
    
    return () => { cancelled = true; };
  }, [id, supabase]);

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    proposal_ready: 'bg-green-100 text-green-800 hover:bg-green-200',
    qa_in_review: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    qa_passed: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
    accepted: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    archived: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Proposal generating — QA validation <2h.';
      case 'proposal_ready':
        return 'Your proposal is ready for review.';
      case 'qa_in_review':
        return 'QA reviewing proposal…';
      case 'qa_passed':
        return 'Proposal has passed quality assurance.';
      case 'accepted':
        return 'Proposal accepted. Project setup in progress.';
      case 'archived':
        return 'This brief has been archived.';
      default:
        return '';
    }
  };

  const handleAcceptProposal = async () => {
    try {
      analytics.trackEvent('proposal.accepted', { 
        brief_id: id, 
        assured_mode: brief?.assured_mode || false 
      });
      
      // TODO: Implement proposal acceptance flow
      console.log('Accept proposal for brief:', id);
    } catch (error) {
      console.error('Error accepting proposal:', error);
    }
  };

  const handleBookCurator = () => {
    analytics.trackEvent('curator.booking_clicked', { brief_id: id });
    // TODO: Open Calendly with brief_id param
    window.open(`https://calendly.com/teamsmiths?brief_id=${id}`, '_blank');
  };

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Loading your brief…</p>
      </div>
    );
  }

  if (state === 'not_found') {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Brief Not Found</CardTitle>
            </div>
            <CardDescription>
              We can't find that brief. The ID might be wrong or you don't have access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {id && (
              <div className="p-3 bg-muted rounded text-sm font-mono">
                Brief ID: {id}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Go to My Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error Loading Brief</CardTitle>
            </div>
            <CardDescription>
              We hit a snag loading your brief. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {err && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
                {err}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // READY state - render the brief
  const sb = brief?.structured_brief ?? {};
  const proposal = brief?.proposal_json ?? null;
  const missing = Array.isArray(sb.missing) ? sb.missing : [];

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Brief Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusColors[brief!.status] || statusColors.draft}>
              {brief!.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(brief!.created_at).toLocaleDateString()}
            </span>
            {brief!.assured_mode && (
              <Badge variant="outline" className="text-xs">
                Assured Mode
              </Badge>
            )}
          </div>
          {getStatusMessage(brief!.status) && (
            <p className="text-sm text-muted-foreground mt-1">
              {getStatusMessage(brief!.status)}
            </p>
          )}
        </div>
      </div>

          {missing.length > 0 && brief!.status === 'submitted' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Complete Your Brief
            </CardTitle>
            <CardDescription>
              We need a few more details to generate your proposal:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {missing.map((field: string) => (
              <div key={field} className="p-3 bg-background rounded border">
                <p className="text-sm font-medium mb-2">
                  {field.replace('_', ' ')}:
                </p>
                {/* TODO: Add inline form fields for missing data */}
                <p className="text-xs text-muted-foreground">
                  Field completion form will be implemented here
                </p>
              </div>
            ))}
            <div className="flex gap-2">
              <Button size="sm">Update Brief</Button>
              <Button variant="outline" size="sm" onClick={handleBookCurator}>
                Book a Curator
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {(brief!.contact_name || brief!.contact_email) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {brief!.contact_name && (
              <p><span className="font-medium">Name:</span> {safeText(brief!.contact_name)}</p>
            )}
            {brief!.contact_email && (
              <p><span className="font-medium">Email:</span> {safeText(brief!.contact_email)}</p>
            )}
            {brief!.contact_phone && (
              <p><span className="font-medium">Phone:</span> {safeText(brief!.contact_phone)}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Brief Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Brief Analysis
        </h2>
        
        {/* AI-processed sections */}
        {sb.goal && <BriefSection title="Goal" data={sb.goal} type="goal" />}
        {sb.context && <BriefSection title="Context" data={sb.context} type="context" />}
        {sb.constraints && <BriefSection title="Constraints" data={sb.constraints} type="constraints" />}
        
        {/* Scalar fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sb.timeline && <BriefSection title="Timeline" data={sb.timeline} type="scalar" />}
              {sb.urgency && <BriefSection title="Urgency" data={sb.urgency} type="scalar" />}
              {sb.budget_range && <BriefSection title="Budget Range" data={sb.budget_range} type="scalar" />}
              {sb.expert_style && <BriefSection title="Expert Style" data={sb.expert_style} type="scalar" />}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Brief Origin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <BriefSection title="Origin" data={brief!.origin || 'Direct submission'} type="scalar" />
              {brief!.origin_id && <BriefSection title="Origin ID" data={brief!.origin_id} type="scalar" />}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Deputee™ AI Proposal
          </CardTitle>
          <CardDescription>
            {proposal ? 'Generated proposal based on your brief' : 'Proposal generation status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposal ? (
            <div className="space-y-6">
              {/* Proposal Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proposal.timeline_weeks && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{safeText(proposal.timeline_weeks)} weeks</span>
                  </div>
                )}
                {proposal.budget_band && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{safeText(proposal.budget_band)}</span>
                  </div>
                )}
                {Array.isArray(proposal.roles) && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{proposal.roles.length} expert{proposal.roles.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Expert Roles */}
              {Array.isArray(proposal.roles) && proposal.roles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Expert Team</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.roles.map((role: any, index: number) => (
                      <Badge key={index} variant="outline">
                        {safeText(role)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              <div>
                <h3 className="font-semibold mb-3">Project Milestones</h3>
                {Array.isArray(proposal.milestones) && proposal.milestones.length > 0 ? (
                  <div className="space-y-3">
                    {proposal.milestones.map((milestone: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{safeText(milestone.title || `Milestone ${index + 1}`)}</h4>
                          {milestone.eta_days && (
                            <Badge variant="secondary" className="text-xs">
                              {safeText(milestone.eta_days)} days
                            </Badge>
                          )}
                        </div>
                        {Array.isArray(milestone.outcomes) && milestone.outcomes.length > 0 && (
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {milestone.outcomes.map((outcome: any, outcomeIndex: number) => (
                              <li key={outcomeIndex}>• {safeText(outcome)}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Deputee™ AI is generating your proposal milestones. QA validation &lt;2h.
                  </p>
                )}
              </div>

              {/* Success Metrics */}
              {Array.isArray(proposal.success_metrics) && proposal.success_metrics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Success Metrics</h3>
                  <ul className="text-sm space-y-1">
                    {proposal.success_metrics.map((metric: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {safeText(metric)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assured Mode Note */}
              {brief!.assured_mode && proposal.assured_addon_note && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Assured Mode Benefits</h4>
                  <p className="text-sm text-blue-800">{safeText(proposal.assured_addon_note)}</p>
                </div>
              )}

              {/* Action Buttons */}
              {brief!.status === 'proposal_ready' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleAcceptProposal} className="flex-1">
                    Accept Proposal
                  </Button>
                  <Button variant="outline" onClick={handleBookCurator}>
                    Book a Curator
                  </Button>
                  <Button variant="outline">
                    Ask a Question
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                Proposal Generation in Progress
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Deputee™ AI is generating your proposal. QA validation in &lt;2h. You'll get an email when it's ready.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}