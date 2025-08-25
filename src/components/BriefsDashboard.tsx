import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Calendar, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Brief {
  id: string;
  origin: string;
  origin_id?: string;
  status: string;
  contact_name?: string;
  contact_email: string;
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

const originLabels: Record<string, string> = {
  capability: 'Capability',
  catalog: 'Catalog',
  bespoke: 'Custom'
};

export const BriefsDashboard = () => {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    try {
      const { data, error } = await supabase
        .from('briefs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching briefs:', error);
        toast({
          title: "Error",
          description: "Failed to load briefs",
          variant: "destructive"
        });
        return;
      }

      setBriefs(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load briefs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBriefs = briefs.filter(brief => {
    const matchesSearch = !searchTerm || 
      brief.structured_brief?.goal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brief.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || brief.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getBriefTitle = (brief: Brief) => {
    return brief.structured_brief?.goal || 'Untitled Brief';
  };

  const handleViewBrief = (briefId: string) => {
    console.log('Navigating to brief:', briefId);
    // Use React Router navigation instead of window.location for better UX
    navigate(`/dashboard/briefs/${briefId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Requests</h2>
          <p className="text-muted-foreground">Track your brief submissions and proposals</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search briefs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="proposal_ready">Proposal Ready</option>
            <option value="qa_in_review">QA Review</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {filteredBriefs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No briefs match your filters' 
                : 'No briefs found. Submit your first brief to get started!'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBriefs.map((brief) => (
            <Card key={brief.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg truncate max-w-md">
                        {getBriefTitle(brief)}
                      </h3>
                      <Badge className={statusColors[brief.status]}>
                        {brief.status.replace('_', ' ')}
                      </Badge>
                      {brief.assured_mode && (
                        <Badge variant="outline" className="text-xs">
                          Assured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(brief.created_at), 'MMM d, yyyy')}
                      </span>
                      <span>Origin: {originLabels[brief.origin]}</span>
                      {brief.contact_name && (
                        <span>Contact: {brief.contact_name}</span>
                      )}
                    </div>
                    
                    {brief.structured_brief?.budget_band && (
                      <div className="text-sm">
                        <span className="font-medium">Budget:</span> {brief.structured_brief.budget_band}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewBrief(brief.id)}
                      className="whitespace-nowrap"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};