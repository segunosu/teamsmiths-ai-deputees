import React from 'react';

interface AIDeputeeProps {
  className?: string;
}

export const AIDeputee: React.FC<AIDeputeeProps> = ({ className = "" }) => {
  return (
    <span className={className}>
      AI Deputee<sup className="text-xs">™</sup>
    </span>
  );
};