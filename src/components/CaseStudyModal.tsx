import { useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CaseStudy } from "@/hooks/useCaseStudies";
import { track } from "@/lib/analytics";
import { useSwipeable } from "react-swipeable";

interface CaseStudyModalProps {
  caseStudy: CaseStudy | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

export const CaseStudyModal = ({
  caseStudy,
  isOpen,
  onClose,
  onPrev,
  onNext,
  canNavigatePrev,
  canNavigateNext,
}: CaseStudyModalProps) => {
  const handlePrev = useCallback(() => {
    if (canNavigatePrev && caseStudy) {
      track("case_prev", { slug: caseStudy.slug, direction: "prev" });
      onPrev();
    }
  }, [canNavigatePrev, caseStudy, onPrev]);

  const handleNext = useCallback(() => {
    if (canNavigateNext && caseStudy) {
      track("case_next", { slug: caseStudy.slug, direction: "next" });
      onNext();
    }
  }, [canNavigateNext, caseStudy, onNext]);

  const handleClose = useCallback(() => {
    if (caseStudy) {
      track("case_close", { slug: caseStudy.slug });
    }
    onClose();
  }, [caseStudy, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose, handlePrev, handleNext]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    onSwipedDown: handleClose,
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  if (!caseStudy) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
        aria-labelledby="case-study-title"
        {...swipeHandlers}
      >
        {/* Close button */}
        <DialogClose 
          className="absolute right-4 top-4 rounded-full bg-background/80 backdrop-blur-sm p-2 hover:bg-accent transition-colors z-50"
          aria-label="Close case study (Esc)"
        >
          <X className="h-6 w-6" />
        </DialogClose>

        {/* Navigation Chevrons */}
        {canNavigatePrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-accent transition-all z-50 hover:scale-110"
            aria-label="Previous case study (Left arrow)"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
        )}
        
        {canNavigateNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-3 hover:bg-accent transition-all z-50 hover:scale-110"
            aria-label="Next case study (Right arrow)"
          >
            <ChevronRight className="h-7 w-7" />
          </button>
        )}

        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <DialogTitle id="case-study-title" className="text-3xl font-bold">
              {caseStudy.title}
            </DialogTitle>
            {caseStudy.client_profile && (
              <p className="text-lg text-muted-foreground">{caseStudy.client_profile}</p>
            )}
          </div>

          {/* Results Box */}
          {caseStudy.results && caseStudy.results.length > 0 && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">RESULTS</h3>
              <div className="grid grid-cols-2 gap-6">
                {caseStudy.results.map((result, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-4xl font-bold text-primary">{result.value}</div>
                    <div className="text-sm text-muted-foreground">{result.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {caseStudy.challenge && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Challenge</h3>
                  <p className="text-muted-foreground">{caseStudy.challenge}</p>
                </div>
              )}

              {caseStudy.solution && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Solution</h3>
                  <p className="text-muted-foreground">{caseStudy.solution}</p>
                </div>
              )}

              {caseStudy.measurement && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">How we measured</h3>
                  <p className="text-muted-foreground">{caseStudy.measurement}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {caseStudy.timeline_days && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                  <p className="text-muted-foreground">{caseStudy.timeline_days} days</p>
                </div>
              )}

              {caseStudy.deliverables && caseStudy.deliverables.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deliverables</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {caseStudy.deliverables.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {caseStudy.quote && (
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                  <p className="italic text-muted-foreground">{caseStudy.quote}</p>
                </div>
              )}

              {caseStudy.roi_example && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">ROI Example</h3>
                  <p className="text-sm text-muted-foreground">{caseStudy.roi_example}</p>
                </div>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {caseStudy.cta_primary && caseStudy.cta_primary_url && (
              <Button asChild size="lg" className="flex-1">
                <a href={caseStudy.cta_primary_url}>{caseStudy.cta_primary}</a>
              </Button>
            )}
            {caseStudy.cta_secondary && caseStudy.cta_secondary_url && (
              <Button asChild variant="outline" size="lg" className="flex-1">
                <a href={caseStudy.cta_secondary_url}>{caseStudy.cta_secondary}</a>
              </Button>
            )}
            <Button variant="ghost" size="lg" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
