import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ToolSuggestion {
  id: string;
  tool_name: string;
  rationale: string | null;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export default function ToolSuggestionManager() {
  const [suggestions, setSuggestions] = useState<ToolSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_tool_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions((data || []) as ToolSuggestion[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tool suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (suggestionId: string, newStatus: 'approved' | 'rejected', toolName?: string) => {
    try {
      // Update suggestion status
      const { error: updateError } = await supabase
        .from('admin_tool_suggestions')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', suggestionId);

      if (updateError) throw updateError;

      // If approved, add to tools_master
      if (newStatus === 'approved' && toolName) {
        const { error: toolError } = await supabase
          .from('tools_master')
          .insert({
            name: toolName,
            category: 'User Suggested',
            is_certifiable: false,
            is_active: true
          });

        if (toolError) {
          // Check if it's a unique constraint error (tool already exists)
          if (!toolError.message.includes('duplicate key')) {
            throw toolError;
          }
        }
      }

      toast({
        title: 'Success',
        description: `Tool suggestion ${newStatus}${newStatus === 'approved' ? ' and added to catalog' : ''}`,
      });

      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tool Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading suggestions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Suggestions</CardTitle>
        <CardDescription>
          Review and manage tool suggestions from freelancers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tool suggestions yet
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{suggestion.tool_name}</h4>
                      {getStatusIcon(suggestion.status)}
                      <Badge className={getStatusColor(suggestion.status)}>
                        {suggestion.status}
                      </Badge>
                    </div>
                    {suggestion.rationale && (
                      <p className="text-sm text-muted-foreground">{suggestion.rationale}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Suggested {new Date(suggestion.created_at).toLocaleDateString()}
                      {suggestion.reviewed_at && (
                        <span> • Reviewed {new Date(suggestion.reviewed_at).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                  
                  {suggestion.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(suggestion.id, 'approved', suggestion.tool_name)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReview(suggestion.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}