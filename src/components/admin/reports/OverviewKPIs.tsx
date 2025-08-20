import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, TrendingUp, Clock, CheckCircle, Target, Star } from 'lucide-react';

interface KPIData {
  totalGMV: number;
  monthlyGMV: number;
  avgTimeToQuote: number;
  quoteWinRate: number;
  onTimeMilestones: number;
  qaPassRate: number;
  avgCSAT: number;
  activeProjects: number;
}

const OverviewKPIs = () => {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats from our views
      const [projectsResponse, quotesResponse, milestonesResponse] = await Promise.all([
        supabase.rpc('admin_list_projects', { p_limit: 1000 }),
        supabase.rpc('admin_list_quotes', { p_limit: 1000 }),
        supabase.from('milestones').select('amount, status, due_date, created_at').limit(1000)
      ]);

      const projects = projectsResponse.data || [];
      const quotes = quotesResponse.data || [];
      const milestones = milestonesResponse.data || [];

      // Calculate KPIs
      const totalGMV = milestones
        .filter(m => m.status === 'paid')
        .reduce((sum, m) => sum + (parseFloat(String(m.amount)) || 0), 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyGMV = milestones
        .filter(m => m.status === 'paid' && new Date(m.created_at) >= thisMonth)
        .reduce((sum, m) => sum + (parseFloat(String(m.amount)) || 0), 0);

      const activeProjects = projects.filter(p => 
        ['active', 'awaiting_client', 'in_review'].includes(p.status)
      ).length;

      const completedQuotes = quotes.filter(q => 
        ['client_approved', 'client_rejected'].includes(q.status)
      );
      const wonQuotes = quotes.filter(q => q.status === 'client_approved');
      const quoteWinRate = completedQuotes.length > 0 
        ? (wonQuotes.length / completedQuotes.length) * 100 
        : 0;

      const dueMilestones = milestones.filter(m => m.due_date);
      const onTimeMilestones = dueMilestones.filter(m => 
        m.status === 'approved' && new Date(m.created_at) <= new Date(m.due_date)
      ).length;
      const onTimeRate = dueMilestones.length > 0 
        ? (onTimeMilestones / dueMilestones.length) * 100 
        : 0;

      setData({
        totalGMV,
        monthlyGMV,
        avgTimeToQuote: 2.5, // Placeholder
        quoteWinRate,
        onTimeMilestones: onTimeRate,
        qaPassRate: 85, // Placeholder
        avgCSAT: 4.2, // Placeholder
        activeProjects
      });

    } catch (error) {
      console.error('Error loading KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Failed to load KPI data</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GMV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalGMV)}</div>
            <p className="text-xs text-muted-foreground">All-time gross value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly GMV</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.monthlyGMV)}</div>
            <p className="text-xs text-muted-foreground">This month's revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quote Win Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.quoteWinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Approved vs total quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.onTimeMilestones.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Milestones delivered on time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QA Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.qaPassRate}%</div>
            <p className="text-xs text-muted-foreground">First-pass approvals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg CSAT</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgCSAT}/5.0</div>
            <p className="text-xs text-muted-foreground">Customer satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to Quote</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgTimeToQuote}d</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quote Conversion</span>
            <Badge variant={data.quoteWinRate > 30 ? "default" : "secondary"}>
              {data.quoteWinRate > 30 ? "Strong" : "Needs Improvement"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Delivery Performance</span>
            <Badge variant={data.onTimeMilestones > 80 ? "default" : "secondary"}>
              {data.onTimeMilestones > 80 ? "Excellent" : "Monitor"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Quality Control</span>
            <Badge variant={data.qaPassRate > 80 ? "default" : "secondary"}>
              {data.qaPassRate > 80 ? "Strong" : "Needs Focus"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewKPIs;