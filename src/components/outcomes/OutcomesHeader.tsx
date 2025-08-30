import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollText, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnonymityInfoModal from '@/components/common/AnonymityInfoModal';

interface OutcomesHeaderProps {
  activeView: 'proof' | 'catalog';
  onViewChange: (view: 'proof' | 'catalog') => void;
  onBrowsePacks?: () => void;
}

const OutcomesHeader: React.FC<OutcomesHeaderProps> = ({
  activeView,
  onViewChange,
  onBrowsePacks
}) => {
  const [showAnonymityModal, setShowAnonymityModal] = useState(false);

  const handleBrowsePacks = () => {
    if (onBrowsePacks) {
      onBrowsePacks();
    } else {
      // Default behavior: scroll to catalog section or switch to catalog view
      if (activeView === 'proof') {
        onViewChange('catalog');
      } else {
        // Scroll to catalog content
        const catalogElement = document.querySelector('[data-catalog-section]');
        if (catalogElement) {
          catalogElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Outcomes
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Explore proven expert capabilities and outcome packages
            </p>
          </div>
          
          {/* Toggle Pills */}
          <div className="flex justify-center">
            <div className="inline-flex rounded-lg bg-muted p-1">
              <button
                onClick={() => onViewChange('proof')}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-all ${
                  activeView === 'proof'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Proof in Action
              </button>
              <button
                onClick={() => onViewChange('catalog')}
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

      {/* Modals */}
      <AnonymityInfoModal
        isOpen={showAnonymityModal}
        onClose={() => setShowAnonymityModal(false)}
      />
    </>
  );
};

export default OutcomesHeader;