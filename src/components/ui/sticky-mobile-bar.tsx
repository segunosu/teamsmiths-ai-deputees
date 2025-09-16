import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface StickyMobileBarProps {
  briefOrigin: string;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ briefOrigin }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t border-border p-4 pb-safe">
        <div className="flex gap-3 max-w-sm mx-auto">
          <Button asChild variant="outline" className="flex-1">
            <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
              Book a Call
            </a>
          </Button>
          <Button asChild className="flex-1">
            <Link to={`/brief-builder?origin=${briefOrigin}`}>
              Start a Brief
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};