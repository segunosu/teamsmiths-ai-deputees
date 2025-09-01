import React from 'react';
import AdminOnly from '@/components/admin/AdminOnly';
import CaseStudyManager from '@/components/admin/CaseStudyManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CaseStudiesPage() {
  return (
    <AdminOnly>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Case Study Management</h1>
              <p className="text-muted-foreground">Review and verify freelancer case studies</p>
            </div>
          </div>
          
          <CaseStudyManager />
        </div>
      </div>
    </AdminOnly>
  );
}