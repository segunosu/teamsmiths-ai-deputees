import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft } from 'lucide-react';

type Brief = {
  id: string;
  status: 'draft'|'submitted'|'proposal_ready'|'qa_in_review'|'qa_passed'|'accepted'|'archived';
  contact_email: string | null;
  contact_name: string | null;
  structured_brief: Record<string, unknown> | null;
  proposal_json: Record<string, unknown> | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SUPABASE_URL = "https://iyqsbjawaampgcavsgcz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXNiamF3YWFtcGdjYXZzZ2N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTI2MTgsImV4cCI6MjA2NjE2ODYxOH0.yOhYxzUyFYbxdu1neuagXqa2xXuhIAoWBYr3w0acNb0";

export default function BriefDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      } catch (e: any) {
        console.error('BriefDetail.select.catch', e);
        if (!cancelled) {
          setErr(e?.message || 'Unexpected error.');
          setState('error');
        }
      }
    })();
    
    return () => { cancelled = true; };
  }, [id, supabase]);

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    proposal_ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    qa_in_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    qa_passed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    accepted: 'bg-primary text-primary-foreground',
    archived: 'bg-muted text-muted-foreground',
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

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Brief Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusColors[brief!.status] || statusColors.draft}>
              {brief!.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created {new Date(brief!.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {(brief!.contact_name || brief!.contact_email) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {brief!.contact_name && (
              <p><span className="font-medium">Name:</span> {brief!.contact_name}</p>
            )}
            {brief!.contact_email && (
              <p><span className="font-medium">Email:</span> {brief!.contact_email}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Brief Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brief Summary</CardTitle>
          <CardDescription>
            The structured information from your brief submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(sb).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(sb).map(([key, value]) => (
                <div key={key} className="border-l-2 border-muted pl-3">
                  <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm mt-1">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No structured brief data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Proposal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Proposal</CardTitle>
          <CardDescription>
            {proposal ? 'Generated proposal based on your brief' : 'Proposal generation status'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {proposal ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <pre className="text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(proposal, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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