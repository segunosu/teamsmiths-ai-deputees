import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasEngaged, setHasEngaged] = useState(false);

  // Track user engagement
  useEffect(() => {
    const trackEngagement = () => {
      // Check if user has already dismissed or seen the prompt
      const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
      if (dismissed) return;

      // Track scroll depth as engagement signal
      const handleScroll = () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > 50) {
          setHasEngaged(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      // Track time on site as engagement signal (30 seconds)
      const timeoutId = setTimeout(() => {
        setHasEngaged(true);
      }, 30000);

      window.addEventListener('scroll', handleScroll);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    };

    trackEngagement();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show if user has engaged with the site
      if (hasEngaged) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [hasEngaged]);

  // Show prompt when engagement is detected and we have a deferred prompt
  useEffect(() => {
    if (hasEngaged && deferredPrompt && !sessionStorage.getItem('pwa-prompt-dismissed')) {
      setShowPrompt(true);
    }
  }, [hasEngaged, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-sm">Install Teamsmiths App</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Install our app for quick access and a better experience
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm" className="flex-1">
                Install
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Not now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
