import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, DollarSign, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface MilestoneData {
  milestone_id: string;
  project_id: string;
  title: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  payment_status: string;
  stripe_payment_intent_id: string;
}

const MilestonesReport = () => {
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    q: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMilestones();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadMilestones();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadMilestones = async () => {
    try {
      setLoading(true);
      
      // Query admin milestones using secure RPC
      const { data, error, count } = await supabase.rpc('admin_list_milestones', {
        p_status: filters.status || null,
        p_payment_status: filters.payment_status || null,
        p_q: filters.q || null,
        p_limit: pageSize,
        p_offset: (currentPage - 1) * pageSize,
        p_order: 'created_at.desc'
      });

      if (error) throw error;

      setMilestones(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading milestones:', error);
      toast.error('Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = convertToCSV(milestones);
    downloadCSV(csvContent, `milestones_report_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Milestones report exported successfully');
  };

  const convertToCSV = (data: MilestoneData[]) => {
    const headers = [
      'Milestone ID', 'Title', 'Amount', 'Status', 'Payment Status', 'Due Date', 
      'Created', 'Stripe Intent ID'
    ];
    
    const rows = data.map(milestone => [
      milestone.milestone_id,
      milestone.title,
      milestone.amount || 0,
      milestone.status,
      milestone.payment_status || 'N/A',
      milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'N/A',
      new Date(milestone.created_at).toLocaleDateString(),
      milestone.stripe_payment_intent_id || 'N/A'
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
      planned: { variant: 'secondary' as const, label: 'Planned' },
      in_progress: { variant: 'outline' as const, label: 'In Progress' },
      submitted: { variant: 'outline' as const, label: 'Submitted' },
      approved: { variant: 'default' as const, label: 'Approved' },
      paid: { variant: 'default' as const, label: 'Paid' },
      blocked: { variant: 'destructive' as const, label: 'Blocked' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    if (!status) return <Badge variant="secondary">No Payment</Badge>;
    
    const statusConfig = {
      succeeded: { variant: 'default' as const, label: 'Paid' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      canceled: { variant: 'secondary' as const, label: 'Canceled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP' 
    }).format(amount || 0);

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || ['approved', 'paid'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Milestones & Payments Report
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
              placeholder="Search milestones..."
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
              loadMilestones();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.payment_status} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, payment_status: value }));
              setCurrentPage(1);
              loadMilestones();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Payments</SelectItem>
              <SelectItem value="succeeded">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
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
                <TableHead>Milestone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Stripe ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                  </TableRow>
                ))
              ) : milestones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No milestones found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                milestones.map((milestone) => (
                  <TableRow key={milestone.milestone_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {milestone.milestone_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(milestone.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(milestone.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(milestone.payment_status)}</TableCell>
                    <TableCell>
                      {milestone.due_date ? (
                        <div className={isOverdue(milestone.due_date, milestone.status) ? 'text-destructive' : ''}>
                          {new Date(milestone.due_date).toLocaleDateString()}
                          {isOverdue(milestone.due_date, milestone.status) && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(milestone.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {milestone.stripe_payment_intent_id ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {milestone.stripe_payment_intent_id.substring(0, 12)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => window.open(`https://dashboard.stripe.com/payments/${milestone.stripe_payment_intent_id}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No payment</span>
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} milestones
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

export default MilestonesReport;