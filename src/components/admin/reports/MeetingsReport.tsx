import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Calendar, ChevronLeft, ChevronRight, ExternalLink, Video } from 'lucide-react';
import { toast } from 'sonner';

interface MeetingData {
  meeting_id: string;
  project_id: string;
  provider: string;
  title: string;
  starts_at: string;
  ends_at: string;
  join_url: string;
  recording_consent: boolean;
  created_at: string;
  organizer_user_id: string;
}

const MeetingsReport = () => {
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [filters, setFilters] = useState({
    provider: '',
    date_range: '',
    q: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMeetings();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchQuery }));
      setCurrentPage(1);
      loadMeetings();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      
      // Query admin meetings using secure RPC
      const { data, error, count } = await supabase.rpc('admin_list_meetings', {
        p_provider: filters.provider || null,
        p_q: filters.q || null,
        p_since: (() => {
          if (!filters.date_range) return null;
          
          const now = new Date();
          let startDate = new Date();
          
          switch (filters.date_range) {
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate.setMonth(now.getMonth() - 1);
              break;
            default:
              return null;
          }
          return startDate.toISOString();
        })(),
        p_limit: pageSize,
        p_offset: (currentPage - 1) * pageSize,
        p_order: 'starts_at.desc'
      });

      if (error) throw error;

      setMeetings(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = convertToCSV(meetings);
    downloadCSV(csvContent, `meetings_report_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Meetings report exported successfully');
  };

  const convertToCSV = (data: MeetingData[]) => {
    const headers = [
      'Meeting ID', 'Title', 'Provider', 'Start Time', 'End Time', 'Duration', 
      'Recording Consent', 'Join URL', 'Created'
    ];
    
    const rows = data.map(meeting => {
      const duration = meeting.starts_at && meeting.ends_at 
        ? Math.round((new Date(meeting.ends_at).getTime() - new Date(meeting.starts_at).getTime()) / (1000 * 60))
        : 0;
      
      return [
        meeting.meeting_id,
        meeting.title,
        meeting.provider,
        meeting.starts_at ? new Date(meeting.starts_at).toLocaleString() : 'N/A',
        meeting.ends_at ? new Date(meeting.ends_at).toLocaleString() : 'N/A',
        `${duration} minutes`,
        meeting.recording_consent ? 'Yes' : 'No',
        meeting.join_url,
        new Date(meeting.created_at).toLocaleDateString()
      ];
    });

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

  const getProviderBadge = (provider: string) => {
    const providerConfig = {
      google: { variant: 'default' as const, label: 'Google Meet', icon: Video },
      zoom: { variant: 'outline' as const, label: 'Zoom', icon: Video },
      teams: { variant: 'secondary' as const, label: 'Teams', icon: Video },
      jitsi: { variant: 'outline' as const, label: 'Jitsi', icon: Video },
      manual: { variant: 'secondary' as const, label: 'Manual', icon: ExternalLink }
    };

    const config = providerConfig[provider as keyof typeof providerConfig] || 
      { variant: 'secondary' as const, label: provider, icon: Video };

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getMeetingStatus = (startsAt: string, endsAt: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (now < start) {
      return <Badge variant="outline">Upcoming</Badge>;
    } else if (now >= start && now <= end) {
      return <Badge variant="default">Live</Badge>;
    } else {
      return <Badge variant="secondary">Completed</Badge>;
    }
  };

  const formatDuration = (startsAt: string, endsAt: string) => {
    if (!startsAt || !endsAt) return 'N/A';
    const duration = Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / (1000 * 60));
    return `${duration} min`;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meetings Report
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
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.provider} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, provider: value }));
              setCurrentPage(1);
              loadMeetings();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Providers</SelectItem>
              <SelectItem value="google">Google Meet</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="teams">Teams</SelectItem>
              <SelectItem value="jitsi">Jitsi</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.date_range} 
            onValueChange={(value) => {
              setFilters(prev => ({ ...prev, date_range: value }));
              setCurrentPage(1);
              loadMeetings();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
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
                <TableHead>Meeting</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Recording</TableHead>
                <TableHead>Join</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-32" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-12" /></TableCell>
                    <TableCell><div className="h-4 bg-muted rounded animate-pulse w-16" /></TableCell>
                  </TableRow>
                ))
              ) : meetings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No meetings found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                meetings.map((meeting) => (
                  <TableRow key={meeting.meeting_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{meeting.title}</div>
                        <div className="text-xs text-muted-foreground">
                          ID: {meeting.meeting_id.substring(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getProviderBadge(meeting.provider)}</TableCell>
                    <TableCell>
                      {meeting.starts_at && meeting.ends_at 
                        ? getMeetingStatus(meeting.starts_at, meeting.ends_at)
                        : <Badge variant="secondary">Scheduled</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      {meeting.starts_at ? (
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(meeting.starts_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(meeting.starts_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {meeting.ends_at && (
                              ` - ${new Date(meeting.ends_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}`
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(meeting.starts_at, meeting.ends_at)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meeting.recording_consent ? (
                        <Badge variant="default" className="text-xs">Enabled</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {meeting.join_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => window.open(meeting.join_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">No URL</span>
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
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} meetings
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

export default MeetingsReport;