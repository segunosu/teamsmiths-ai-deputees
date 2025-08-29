import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CapabilityGallery from '@/components/CapabilityGallery';
import Catalog from './Catalog';
import OutcomesHeader from '@/components/outcomes/OutcomesHeader';

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

  const handleBrowsePacks = () => {
    // If we're on proof view, switch to catalog
    if (activeView === 'proof') {
      handleViewChange('catalog');
    } else {
      // Already on catalog, scroll to content
      const catalogElement = document.querySelector('[data-catalog-section]');
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <OutcomesHeader
        activeView={activeView}
        onViewChange={handleViewChange}
        onBrowsePacks={handleBrowsePacks}
      />

      {/* Content */}
      <div className="flex-1" data-catalog-section>
        {activeView === 'proof' ? <CapabilityGallery /> : <Catalog />}
      </div>
    </div>
  );
};

export default Outcomes;