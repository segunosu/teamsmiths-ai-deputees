import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DebugBrief() {
  const [searchParams] = useSearchParams();
  const briefId = searchParams.get('id');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!briefId) return;
    
    setLoading(true);
    const fetchBrief = async () => {
      try {
        console.log('Debug: Fetching brief with ID:', briefId);
        const { data, error } = await supabase
          .from('briefs')
          .select('*')
          .eq('id', briefId)
          .maybeSingle();

        setResult({ data, error, timestamp: new Date().toISOString() });
        console.log('Debug: Brief fetch result:', { data, error });
      } catch (e) {
        setResult({ error: e, timestamp: new Date().toISOString() });
        console.error('Debug: Brief fetch exception:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchBrief();
  }, [briefId]);

  if (!briefId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Debug Brief</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Add ?id=&lt;brief-uuid&gt; to the URL to debug a specific brief.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Example: /debug/brief?id=123e4567-e89b-12d3-a456-426614174000
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Debug Brief: {briefId}</CardTitle>
            <Badge variant={loading ? 'secondary' : 'default'}>
              {loading ? 'Loading...' : 'Complete'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Timestamp</h3>
                <code className="block p-2 bg-muted rounded text-sm">
                  {result.timestamp}
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Raw Result</h3>
                <pre className="p-4 bg-muted rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>

              {result.data && (
                <div>
                  <h3 className="font-semibold mb-2">Brief Data</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {result.data.id}
                    </div>
                    <div>
                      <strong>Status:</strong> {result.data.status}
                    </div>
                    <div>
                      <strong>Contact Email:</strong> {result.data.contact_email || 'N/A'}
                    </div>
                    <div>
                      <strong>Contact Name:</strong> {result.data.contact_name || 'N/A'}
                    </div>
                    <div>
                      <strong>Created:</strong> {result.data.created_at}
                    </div>
                    <div>
                      <strong>User ID:</strong> {result.data.user_id || 'N/A'}
                    </div>
                  </div>
                </div>
              )}

              {result.error && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Error</h3>
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <pre className="text-sm">{JSON.stringify(result.error, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Fetching brief data...</p>
            </div>
          ) : (
            <p>No data to display</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}