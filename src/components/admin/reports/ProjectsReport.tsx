import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ProjectData {
  total: number;
  project_id: string;
  title: string;
  status: string;
  created_at: string;
  currency: string;
  total_price: number;
  org_id: string;
  teamsmith_user_id: string;
  agency_id: string;
  milestones_count: number;
  deliverables_count: number;
  qa_reviews_count: number;
}

const ProjectsReport = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    status: '',
    org_id: '',
    agency_id: '',
    q: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadProjects();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_projects', {
        p_filters: filters,
        p_limit: pageSize,
        p_offset: (currentPage - 1) * pageSize,
        p_order: 'created_at.desc'
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setTotalCount(data[0].total || 0);
        setProjects(data);
      } else {
        setTotalCount(0);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_list_projects', {
        p_filters: filters,
        p_limit: 10000, // Export all matching records
        p_offset: 0
      });

      if (error) throw error;

      const csvContent = convertToCSV(data || []);
      downloadCSV(csvContent, `projects_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Projects report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const convertToCSV = (data: ProjectData[]) => {
    const headers = [
      'Project ID', 'Title', 'Status', 'Created', 'Currency', 'Value', 
      'Milestones', 'Deliverables', 'QA Reviews'
    ];
    
    const rows = data.map(project => [
      project.project_id,
      project.title,
      project.status,
      new Date(project.created_at).toLocaleDateString(),
      project.currency,
      project.total_price || 0,
      project.milestones_count,
      project.deliverables_count,
      project.qa_reviews_count
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
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'default' as const, label: 'Completed' },
      draft: { variant: 'secondary' as const, label: 'Draft' },
      awaiting_client: { variant: 'outline' as const, label: 'Awaiting Client' },
      in_review: { variant: 'outline' as const, label: 'In Review' }
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

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Projects Report
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
              placeholder="Search projects..."
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
              loadProjects();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="awaiting_client">Awaiting Client</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
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
                <TableHead>Value</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Milestones</TableHead>
                <TableHead>Deliverables</TableHead>
                <TableHead>QA Reviews</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-24" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-8" /></TableCell>
                  </TableRow>
                ))
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No projects found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.project_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {project.project_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      {formatCurrency(project.total_price, project.currency)}
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">{project.milestones_count}</TableCell>
                    <TableCell className="text-center">{project.deliverables_count}</TableCell>
                    <TableCell className="text-center">{project.qa_reviews_count}</TableCell>
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} projects
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

export default ProjectsReport;