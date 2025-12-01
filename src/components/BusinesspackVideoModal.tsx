import { useEffect, useRef, useState } from "react";
import { Play, Award, Heart, Share2 } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";

type VideoConfig = {
  id: string;
  label: string;
  description?: string;
  src: string;
};

interface BusinesspackVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: VideoConfig[];
  defaultVideoId: string;
  coverImage: string;
}

export const BusinesspackVideoModal = ({
  isOpen,
  onClose,
  videos,
  defaultVideoId,
  coverImage,
}: BusinesspackVideoModalProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeVideoId, setActiveVideoId] = useState(defaultVideoId);
  const [showOverlay, setShowOverlay] = useState(true);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  const activeVideo = videos.find((v) => v.id === activeVideoId) ?? videos[0] ?? null;

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch {}
      }
      return;
    }

    setActiveVideoId(defaultVideoId);
    setShowOverlay(true);
    setHasPlayedOnce(false);

    if (videoRef.current && videos.length > 0) {
      const defaultVideo = videos.find((v) => v.id === defaultVideoId) ?? videos[0];
      videoRef.current.src = defaultVideo.src;
      videoRef.current.currentTime = 0;
    }
  }, [isOpen, defaultVideoId, videos]);

  const handleSelectVideo = (videoId: string) => {
    const selected = videos.find((v) => v.id === videoId);
    if (!selected || !videoRef.current) return;

    setActiveVideoId(videoId);
    const el = videoRef.current;

    if (el.src !== selected.src) {
      el.src = selected.src;
      el.currentTime = 0;
    }

    setShowOverlay(false);
    setHasPlayedOnce(true);

    const playPromise = el.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
  };

  const handleOverlayPlay = () => {
    if (!videoRef.current || !activeVideo) return;

    const el = videoRef.current;
    if (el.src !== activeVideo.src) {
      el.src = activeVideo.src;
    }

    const playPromise = el.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }

    setShowOverlay(false);
    setHasPlayedOnce(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 max-h-[95vh] overflow-y-auto">
        <div className="bg-background rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 md:p-8 pb-3 md:pb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-bold text-xl md:text-2xl text-foreground">
                Team Recognition - Example
              </h1>
              <div className="flex gap-2">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video.id)}
                    className={`px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-md transition-colors ${
                      activeVideo?.id === video.id
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border bg-background hover:bg-accent"
                    }`}
                  >
                    {video.label}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Use fullscreen for the best experience.
            </p>
          </div>

          <div className="relative w-full aspect-[3/4] md:aspect-video bg-black">
            <video
              ref={videoRef}
              controls={!showOverlay}
              playsInline
              className="w-full h-full"
              poster={coverImage}
              onPlay={() => setShowOverlay(false)}
              onPause={() => setShowOverlay(true)}
            >
              Your browser does not support the video tag.
            </video>

            {showOverlay && (
              <div 
                className={`absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-10 ${
                  hasPlayedOnce ? 'md:items-end md:pb-20 items-end pb-20' : 'items-center'
                }`}
                onClick={handleOverlayPlay}
              >
                <button
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 hover:bg-white text-primary flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-2xl animate-gentle-pulse"
                  onClick={handleOverlayPlay}
                >
                  <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                </button>
              </div>
            )}
          </div>

          <div className="p-3 md:p-8 bg-muted/30">
            {/* Mobile Version */}
            <div className="grid grid-cols-1 gap-2 md:hidden">
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm mb-0.5 flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4" /> Studio Quality
                </h3>
                <p className="text-xs text-muted-foreground">
                  Professional production polished by real producers
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm mb-0.5 flex items-center justify-center gap-1.5">
                  <Heart className="w-4 h-4" /> Fully Personalized
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tailored to your team's story and achievements
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground text-sm mb-0.5 flex items-center justify-center gap-1.5">
                  <Share2 className="w-4 h-4" /> Highly Shareable
                </h3>
                <p className="text-xs text-muted-foreground">
                  Teams love sharing their recognition on social
                </p>
              </div>
            </div>

            {/* Desktop Version */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                  <Award className="w-5 h-5" /> Studio Quality
                </h3>
                <p className="text-sm text-muted-foreground">
                  Professional studio-grade AI vocals, polished by real music producers for cinematic quality
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                  <Heart className="w-5 h-5" /> Fully Personalized
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tailored to your team's story, achievements and music preferences. 24hr delivery options
                </p>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground text-base mb-1 flex items-center gap-2">
                  <Share2 className="w-5 h-5" /> Highly Shareable
                </h3>
                <p className="text-sm text-muted-foreground">
                  Teams love sharing their recognition on social. Businesses love the brand exposure and reach
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
