import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, User, Mail, Phone, Settings, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Brief {
  id: string;
  origin: string;
  origin_id?: string;
  status: string;
  contact_name?: string;
  contact_email: string;
  contact_phone?: string;
  structured_brief: any;
  proposal_json?: any;
  assured_mode: boolean;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  proposal_ready: 'bg-green-100 text-green-800',
  qa_in_review: 'bg-yellow-100 text-yellow-800',
  qa_passed: 'bg-emerald-100 text-emerald-800',
  accepted: 'bg-purple-100 text-purple-800',
  archived: 'bg-gray-100 text-gray-500'
};

export const BriefDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBrief(id);
    }
  }, [id]);

  const fetchBrief = async (briefId: string) => {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', briefId)
        .single();

      if (error) {
        console.error('Error fetching brief:', error);
        toast({
          title: "Error",
          description: "Failed to load brief details",
          variant: "destructive"
        });
        return;
      }

      setBrief(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load brief details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookCurator = () => {
    const calendlyUrl = `https://calendly.com/teamsmiths/curator-call?prefill_custom_1=${id}&prefill_email=${brief?.contact_email}`;
    window.open(calendlyUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Brief not found</h1>
        <Link to="/dashboard" className="text-primary hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {brief.structured_brief?.goal || 'Brief Details'}
            </h1>
            <div className="flex items-center gap-3">
              <Badge className={statusColors[brief.status]}>
                {brief.status.replace('_', ' ')}
              </Badge>
              {brief.assured_mode && (
                <Badge variant="outline">Assured Mode</Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBookCurator}>
              Talk to Curator
            </Button>
            {brief.status === 'proposal_ready' && (
              <Button>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Proposal
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Brief Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Brief Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Goal</h4>
                <p className="text-muted-foreground">
                  {brief.structured_brief?.goal || 'No goal specified'}
                </p>
              </div>
              
              {brief.structured_brief?.industry && (
                <div>
                  <h4 className="font-semibold mb-2">Industry</h4>
                  <p className="text-muted-foreground">{brief.structured_brief.industry}</p>
                </div>
              )}
              
              {brief.structured_brief?.company_size && (
                <div>
                  <h4 className="font-semibold mb-2">Company Size</h4>
                  <p className="text-muted-foreground">{brief.structured_brief.company_size}</p>
                </div>
              )}
              
              {brief.structured_brief?.budget_band && (
                <div>
                  <h4 className="font-semibold mb-2">Budget</h4>
                  <p className="text-muted-foreground">{brief.structured_brief.budget_band}</p>
                </div>
              )}
              
              {brief.structured_brief?.timeline && (
                <div>
                  <h4 className="font-semibold mb-2">Timeline</h4>
                  <p className="text-muted-foreground">{brief.structured_brief.timeline}</p>
                </div>
              )}
              
              {brief.structured_brief?.constraints && (
                <div>
                  <h4 className="font-semibold mb-2">Constraints</h4>
                  <p className="text-muted-foreground">{brief.structured_brief.constraints}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Proposal Preview */}
          {brief.proposal_json && (
            <Card>
              <CardHeader>
                <CardTitle>Deputee™ AI™ Proposal Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.proposal_json.roles && (
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Roles</h4>
                    <div className="space-y-2">
                      {brief.proposal_json.roles.map((role: string, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          {role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {brief.proposal_json.milestones && (
                  <div>
                    <h4 className="font-semibold mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {brief.proposal_json.milestones.map((milestone: string, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <span className="font-medium">Phase {index + 1}:</span> {milestone}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {brief.proposal_json.success_metrics && (
                  <div>
                    <h4 className="font-semibold mb-2">Success Metrics</h4>
                    <div className="space-y-2">
                      {brief.proposal_json.success_metrics.map((metric: string, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {brief.contact_name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{brief.contact_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{brief.contact_email}</span>
              </div>
              
              {brief.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{brief.contact_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium">Submitted</span>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(brief.created_at), 'MMM d, yyyy at h:mm a')}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Last Updated</span>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(brief.updated_at), 'MMM d, yyyy at h:mm a')}
                </p>
              </div>
              
              <div>
                <span className="text-sm font-medium">Origin</span>
                <p className="text-sm text-muted-foreground capitalize">
                  {brief.origin}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};