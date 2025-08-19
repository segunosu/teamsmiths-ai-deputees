import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AlertTriangle, TrendingUp, Zap, CheckCircle, X } from 'lucide-react';

interface Insight {
  id: string;
  insight_type: string;
  title: string;
  content: string;
  confidence_score: number;
  status: string;
  created_at: string;
}

interface ProjectInsightsProps {
  projectId: string;
  className?: string;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ projectId, className = '' }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-warning" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'risk':
        return 'destructive';
      case 'opportunity':
        return 'default';
      case 'optimization':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('project_insights')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Failed to load project insights.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInsightStatus = async (insightId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('project_insights')
        .update({ status })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.filter(insight => insight.id !== insightId));
      
      toast({
        title: "Success",
        description: `Insight ${status === 'implemented' ? 'marked as implemented' : 'dismissed'}.`,
      });
    } catch (error) {
      console.error('Error updating insight:', error);
      toast({
        title: "Error",
        description: "Failed to update insight status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [projectId]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No insights available yet. Start a conversation with the AI to generate project insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.insight_type)}
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getInsightColor(insight.insight_type)} className="text-xs">
                    {insight.insight_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(insight.confidence_score * 100)}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.content}
              </p>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateInsightStatus(insight.id, 'dismissed')}
                  className="h-8 px-3"
                >
                  <X className="h-3 w-3 mr-1" />
                  Dismiss
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => updateInsightStatus(insight.id, 'implemented')}
                  className="h-8 px-3"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Mark Done
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectInsights;