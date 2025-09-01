import React from 'react';
import AdminOnly from '@/components/admin/AdminOnly';
import ToolSuggestionManager from '@/components/admin/ToolSuggestionManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ToolSuggestionsPage() {
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
              <h1 className="text-3xl font-bold">Tool Suggestions</h1>
              <p className="text-muted-foreground">Review and manage tool suggestions from freelancers</p>
            </div>
          </div>
          
          <ToolSuggestionManager />
        </div>
      </div>
    </AdminOnly>
  );
}