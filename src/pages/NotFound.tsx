import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, FileCheck, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            We can't find that page.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link to="/outcome-packs">
              <FileCheck className="mr-2 h-5 w-5" />
              Outcome Packs
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link to="/audit">
              <Search className="mr-2 h-5 w-5" />
              Start with an Audit
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;