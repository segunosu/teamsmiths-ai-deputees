import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface OfferingHeroProps {
  title: string;
  subtitle: string;
  briefOrigin: string;
  helperText: string;
}

export const OfferingHero: React.FC<OfferingHeroProps> = ({
  title,
  subtitle,
  briefOrigin,
  helperText
}) => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 leading-[1.1] py-2">
          {title}
        </h1>
        <p className="text-xl sm:text-2xl text-foreground/80 font-medium mb-16 max-w-4xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Button size="lg" asChild>
            <Link to={`/brief-builder?origin=${briefOrigin}#form`}>
              Start a Brief
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="https://calendly.com/osu/brief-chat" target="_blank" rel="noopener noreferrer">
              Book a Call
            </a>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {helperText}
        </p>
      </div>
    </section>
  );
};