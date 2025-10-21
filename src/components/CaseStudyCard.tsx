import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { CaseStudy } from "@/hooks/useCaseStudies";
import { track } from "@/lib/analytics";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onOpenModal: () => void;
  onHoverStart?: () => void;
}

export const CaseStudyCard = ({ caseStudy, onOpenModal, onHoverStart }: CaseStudyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHoverStart?.();
    track("case_hover", { slug: caseStudy.slug });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    track("case_open", { slug: caseStudy.slug });
    onOpenModal();
  };

  const primaryResult = caseStudy.results?.[0];
  const secondaryResult = caseStudy.results?.[1];

  return (
    <Card
      className="relative p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-lg group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Hover Summary Overlay */}
      {isHovered && caseStudy.short_summary && (
        <div className="hidden sm:block absolute top-3 right-3 left-3 bg-card/95 backdrop-blur-sm border rounded-md p-2 text-xs text-muted-foreground animate-fade-in z-10">
          {caseStudy.short_summary}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-lg sm:text-xl font-semibold pr-12 sm:pr-16 leading-tight">{caseStudy.title}</h3>
        
        {caseStudy.client_profile && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{caseStudy.client_profile}</p>
        )}

        {/* Results */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
          {primaryResult && (
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{primaryResult.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{primaryResult.label}</div>
            </div>
          )}
          {secondaryResult && (
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{secondaryResult.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground leading-tight">{secondaryResult.label}</div>
            </div>
          )}
        </div>

        {/* Timeline */}
        {caseStudy.timeline_days && (
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Delivered in:</span>{" "}
            <span className="font-medium">{caseStudy.timeline_days} days</span>
          </div>
        )}

        {/* View Case Button - visible on hover */}
        <Button
          variant="outline"
          size="sm"
          className="w-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-xs sm:text-sm"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          View full case
        </Button>
      </div>
    </Card>
  );
};
