import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StickyMobileBarProps {
  briefOrigin?: string;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ briefOrigin }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/98 backdrop-blur-lg supports-[backdrop-filter]:bg-background/95 border-t border-border shadow-lg">
        <div className="flex gap-2 px-3 py-2.5 max-w-lg mx-auto">
          <Button asChild size="sm" className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
            <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
              Book Diagnostic
              <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
            <Link to="/results">
              See Case Studies
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
