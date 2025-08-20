import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, FileText, Users, DollarSign, Target, MessageSquare, Calendar } from 'lucide-react';
import ProjectsReport from '@/components/admin/reports/ProjectsReport';
import FreelancersReport from '@/components/admin/reports/FreelancersReport';
import QuotesReport from '@/components/admin/reports/QuotesReport';
import MilestonesReport from '@/components/admin/reports/MilestonesReport';
import DeliverablesReport from '@/components/admin/reports/DeliverablesReport';
import MeetingsReport from '@/components/admin/reports/MeetingsReport';
import OverviewKPIs from '@/components/admin/reports/OverviewKPIs';

const AdminReports = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <p className="text-muted-foreground">Please log in to access admin reports.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Reports & Operations</h1>
          <p className="text-muted-foreground">Comprehensive platform insights and data analytics</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="freelancers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Freelancers</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Quotes</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Milestones</span>
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">QA</span>
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Meetings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewKPIs />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsReport />
        </TabsContent>

        <TabsContent value="freelancers">
          <FreelancersReport />
        </TabsContent>

        <TabsContent value="quotes">
          <QuotesReport />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestonesReport />
        </TabsContent>

        <TabsContent value="deliverables">
          <DeliverablesReport />
        </TabsContent>

        <TabsContent value="meetings">
          <MeetingsReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;