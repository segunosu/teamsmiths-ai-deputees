import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface FreelancerData {
  total: number;
  user_id: string;
  full_name: string;
  email: string;
  skills: string[];
  price_band_min: number;
  price_band_max: number;
  availability_weekly_hours: number;
  active_projects: number;
  completed_projects: number;
  csat_avg: number;
  created_at: string;
}

const FreelancersReport = () => {
  const [freelancers, setFreelancers] = useState<FreelancerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    q: '',
    min_price: '',
    max_price: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFreelancers();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadFreelancers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadFreelancers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('admin_list_freelancers', {
        p_filters: filters,
        p_limit: pageSize,
        p_offset: (currentPage - 1) * pageSize,
        p_order: 'created_at.desc'
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setTotalCount(data[0].total || 0);
        setFreelancers(data);
      } else {
        setTotalCount(0);
        setFreelancers([]);
      }
    } catch (error) {
      console.error('Error loading freelancers:', error);
      toast.error('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_list_freelancers', {
        p_filters: filters,
        p_limit: 10000,
        p_offset: 0
      });

      if (error) throw error;

      const csvContent = convertToCSV(data || []);
      downloadCSV(csvContent, `freelancers_report_${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Freelancers report exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const convertToCSV = (data: FreelancerData[]) => {
    const headers = [
      'Name', 'Email', 'Skills', 'Price Min', 'Price Max', 'Weekly Hours',
      'Active Projects', 'Completed Projects', 'CSAT', 'Joined'
    ];
    
    const rows = data.map(freelancer => [
      freelancer.full_name || 'N/A',
      freelancer.email,
      (freelancer.skills || []).join('; '),
      freelancer.price_band_min || 0,
      freelancer.price_band_max || 0,
      freelancer.availability_weekly_hours || 0,
      freelancer.active_projects,
      freelancer.completed_projects,
      freelancer.csat_avg || 0,
      new Date(freelancer.created_at).toLocaleDateString()
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

  const formatPriceRange = (min: number, max: number) => {
    if (!min && !max) return 'Not set';
    if (!min) return `Up to £${max}/hr`;
    if (!max) return `From £${min}/hr`;
    return `£${min}-£${max}/hr`;
  };

  const getCSATBadge = (score: number) => {
    if (score >= 4.5) return <Badge variant="default">Excellent</Badge>;
    if (score >= 4.0) return <Badge variant="outline">Good</Badge>;
    if (score >= 3.5) return <Badge variant="secondary">Average</Badge>;
    if (score > 0) return <Badge variant="destructive">Needs Improvement</Badge>;
    return <Badge variant="secondary">No Data</Badge>;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Freelancers Report
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
              placeholder="Search freelancers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="number"
            placeholder="Min price (£/hr)"
            value={filters.min_price}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, min_price: e.target.value }));
              setCurrentPage(1);
              loadFreelancers();
            }}
          />
          <Input
            type="number"
            placeholder="Max price (£/hr)"
            value={filters.max_price}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, max_price: e.target.value }));
              setCurrentPage(1);
              loadFreelancers();
            }}
          />
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
                <TableHead>Freelancer</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>CSAT</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-12" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                  </TableRow>
                ))
              ) : freelancers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No freelancers found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                freelancers.map((freelancer) => (
                  <TableRow key={freelancer.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{freelancer.full_name || 'No Name'}</div>
                        <div className="text-xs text-muted-foreground">{freelancer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(freelancer.skills || []).slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(freelancer.skills || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(freelancer.skills || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatPriceRange(freelancer.price_band_min, freelancer.price_band_max)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {freelancer.availability_weekly_hours || 0}h/week
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{freelancer.active_projects} active</div>
                        <div className="text-xs text-muted-foreground">
                          {freelancer.completed_projects} completed
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCSATBadge(freelancer.csat_avg)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(freelancer.created_at).toLocaleDateString()}
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} freelancers
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

export default FreelancersReport;