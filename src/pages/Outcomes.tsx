import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CapabilityGallery from '@/components/CapabilityGallery';
import Catalog from './Catalog';

const Outcomes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeView, setActiveView] = useState<'proof' | 'catalog'>(
    searchParams.get('view') === 'catalog' ? 'catalog' : 'proof'
  );

  const handleViewChange = (view: 'proof' | 'catalog') => {
    setActiveView(view);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', view);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header with Toggle Pills */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Outcomes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore proven capabilities and outcome packages from our expert network
            </p>
          </div>
          
          {/* Toggle Pills */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg bg-muted p-1">
              <button
                onClick={() => handleViewChange('proof')}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                  activeView === 'proof'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Proof in Action
              </button>
              <button
                onClick={() => handleViewChange('catalog')}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                  activeView === 'catalog'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Outcome Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeView === 'proof' ? <CapabilityGallery /> : <Catalog />}
      </div>
    </div>
  );
};

export default Outcomes;