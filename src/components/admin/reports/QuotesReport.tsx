import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteData {
  total: number;
  quote_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  currency: string;
  valid_until: string;
  created_by: string;
  user_id: string;
  request_id: string;
  project_title: string;
  budget_range: string;
}

const QuotesReport = () => {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    q: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQuotes();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadQuotes();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_quotes', {
        p_filters: filters,
        p_limit: pageSize,
        p_offset: (currentPage - 1) * pageSize,
        p_order: 'created_at.desc'
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setTotalCount(data[0].total || 0);
        setQuotes(data);
      } else {
        setTotalCount(0);
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_list_quotes', {
        p_filters: filters,
        p_limit: 10000,
        p_offset: 0
      });

      if (error) throw error;

      const csvContent = convertToCSV(data || []);
      downloadCSV(csvContent, `quotes_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Quotes report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const convertToCSV = (data: QuoteData[]) => {
    const headers = [
      'Quote ID', 'Project Title', 'Status', 'Amount', 'Currency', 'Created', 'Valid Until', 'Budget Range'
    ];
    
    const rows = data.map(quote => [
      quote.quote_id,
      quote.project_title || 'N/A',
      quote.status,
      quote.total_amount || 0,
      quote.currency,
      new Date(quote.created_at).toLocaleDateString(),
      quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'N/A',
      quote.budget_range || 'N/A'
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
      sent: { variant: 'outline' as const, label: 'Sent' },
      client_approved: { variant: 'default' as const, label: 'Approved' },
      client_rejected: { variant: 'destructive' as const, label: 'Rejected' },
      pending_admin_review: { variant: 'outline' as const, label: 'Pending Review' },
      modified: { variant: 'secondary' as const, label: 'Modified' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
      { variant: 'secondary' as const, label: status };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: currency || 'GBP' 
    }).format(amount || 0);

  const isExpired = (validUntil: string) => {
    return validUntil && new Date(validUntil) < new Date();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotes Report
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
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
              loadQuotes();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="client_approved">Approved</SelectItem>
              <SelectItem value="client_rejected">Rejected</SelectItem>
              <SelectItem value="pending_admin_review">Pending Review</SelectItem>
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
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Budget Range</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Valid Until</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                  </TableRow>
                ))
              ) : quotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No quotes found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                quotes.map((quote) => (
                  <TableRow key={quote.quote_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.project_title || 'Untitled Project'}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {quote.quote_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>
                      {formatCurrency(quote.total_amount, quote.currency)}
                    </TableCell>
                    <TableCell>
                      {quote.budget_range ? (
                        <Badge variant="outline">{quote.budget_range}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(quote.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {quote.valid_until ? (
                        <div className={isExpired(quote.valid_until) ? 'text-destructive' : ''}>
                          {new Date(quote.valid_until).toLocaleDateString()}
                          {isExpired(quote.valid_until) && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No expiry</span>
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} quotes
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

export default QuotesReport;