import React from 'react';

interface AIDeputeeProps {
  className?: string;
  showExplanation?: boolean;
}

export const AIDeputee: React.FC<AIDeputeeProps> = ({ className = "", showExplanation = false }) => {
  return (
    <>
      <span className={className}>
        AI Deputee<sup className="text-xs">™</sup>
      </span>
      {showExplanation && (
        <span className="text-sm text-muted-foreground font-normal"> (smart automation, supervised by real experts, delivers each project fast and right)</span>
      )}
    </>
  );
};