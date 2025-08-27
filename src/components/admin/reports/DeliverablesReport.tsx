import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, FileCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface DeliverableData {
  deliverable_id: string;
  project_id: string;
  milestone_id: string;
  title: string;
  status: string;
  created_at: string;
  versions: number;
  last_updated: string;
  last_qa_decision: string;
}

const DeliverablesReport = () => {
  const [deliverables, setDeliverables] = useState<DeliverableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    qa_decision: '',
    q: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDeliverables();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadDeliverables();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadDeliverables = async () => {
    try {
      setLoading(true);
      
      // Query admin deliverables using secure RPCs
      const [regularDeliverables, projectDeliverables] = await Promise.all([
        supabase.rpc('admin_list_deliverables', {
          p_status: filters.status || null,
          p_q: filters.q || null,
          p_limit: 1000,
          p_offset: 0,
          p_order: 'created_at.desc'
        }),
        supabase.rpc('admin_list_project_deliverables', {
          p_status: filters.status || null,
          p_q: filters.q || null,
          p_limit: 1000,
          p_offset: 0,
          p_order: 'created_at.desc'
        })
      ]);

      // Combine and transform data
      const combinedData: DeliverableData[] = [
        ...(regularDeliverables.data || []).map((d: any) => ({
          ...d,
          versions: d.versions || 0,
          last_updated: d.last_updated || d.created_at
        })),
        ...(projectDeliverables.data || []).map((d: any) => ({
          ...d,
          versions: 1, // Project deliverables have one version
          last_updated: d.submitted_at || d.created_at,
          last_qa_decision: d.rejection_reason ? 'rejected' : (d.approved_at ? 'approved' : 'pending')
        }))
      ];

      // Apply filters
      let filteredData = combinedData;
      if (filters.status) {
        filteredData = filteredData.filter(d => d.status === filters.status);
      }
      if (filters.qa_decision) {
        filteredData = filteredData.filter(d => d.last_qa_decision === filters.qa_decision);
      }
      if (filters.q) {
        filteredData = filteredData.filter(d => 
          d.title.toLowerCase().includes(filters.q.toLowerCase())
        );
      }

      // Sort by created_at desc
      filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply pagination
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      const paginatedData = filteredData.slice(startIdx, endIdx);

      setDeliverables(paginatedData);
      setTotalCount(filteredData.length);
    } catch (error) {
      console.error('Error loading deliverables:', error);
      toast.error('Failed to load deliverables');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = convertToCSV(deliverables);
    downloadCSV(csvContent, `deliverables_report_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Deliverables report exported successfully');
  };

  const convertToCSV = (data: DeliverableData[]) => {
    const headers = [
      'Deliverable ID', 'Title', 'Status', 'Versions', 'Created', 'Last Updated', 'QA Decision'
    ];
    
    const rows = data.map(deliverable => [
      deliverable.deliverable_id,
      deliverable.title,
      deliverable.status,
      deliverable.versions || 0,
      new Date(deliverable.created_at).toLocaleDateString(),
      deliverable.last_updated ? new Date(deliverable.last_updated).toLocaleDateString() : 'N/A',
      deliverable.last_qa_decision || 'N/A'
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      in_qa: { variant: 'outline' as const, label: 'In QA' },
      ready_for_client: { variant: 'outline' as const, label: 'Ready for Client' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      submitted: { variant: 'outline' as const, label: 'Submitted' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getQADecisionBadge = (decision: string) => {
    if (!decision) return <Badge variant="secondary">No Review</Badge>;
    
    const decisionConfig = {
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      needs_revision: { variant: 'outline' as const, label: 'Needs Revision' }
    };

    const config = decisionConfig[decision as keyof typeof decisionConfig] || 
      { variant: 'secondary' as const, label: decision };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              QA & Deliverables Report
              <Badge variant="outline">{totalCount} total</Badge>
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deliverables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.status} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, status: value }));
              setCurrentPage(1);
              loadDeliverables();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_qa">In QA</SelectItem>
              <SelectItem value="ready_for_client">Ready for Client</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.qa_decision} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, qa_decision: value }));
              setCurrentPage(1);
              loadDeliverables();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="QA decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All QA Decisions</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deliverable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>QA Decision</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-12" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                  </TableRow>
                ))
              ) : deliverables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No deliverables found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                deliverables.map((deliverable) => (
                  <TableRow key={deliverable.deliverable_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{deliverable.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {deliverable.deliverable_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(deliverable.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {deliverable.versions} version{deliverable.versions !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>{getQADecisionBadge(deliverable.last_qa_decision)}</TableCell>
                    <TableCell>
                      {new Date(deliverable.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {deliverable.last_updated && deliverable.last_updated !== deliverable.created_at ? (
                        <div>
                          <div>{new Date(deliverable.last_updated).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.ceil((new Date().getTime() - new Date(deliverable.last_updated).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never updated</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} deliverables
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliverablesReport;