import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export const ScrollManager = () => {
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const handleScroll = () => {
      const hash = location.hash.replace('#', '');
      
      if (hash) {
        // Robustly scroll to the anchor. Heavy pages mount after the first tick,
        // and the global `scroll-behavior: smooth` lets a competing scroll cancel
        // a smooth scrollIntoView mid-flight. So: poll until the element exists,
        // then jump INSTANTLY (overriding CSS smooth) and re-assert twice.
        try { (window as any).__TS_SCROLL_FIX = 'v3'; } catch (e) {}
        let tries = 0;
        const HEADER_OFFSET = 96; // matches scroll-mt on anchored sections
        const jumpTo = (element: HTMLElement) => {
          const y = element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top: y, left: 0, behavior: 'auto' });
        };
        const tryScroll = () => {
          const element = document.getElementById(hash) as HTMLElement | null;
          if (element) {
            jumpTo(element);
            trackEvent('scroll_target_hit', { id: hash, route: location.pathname });
            // Re-assert against late layout shifts / competing scrolls.
            setTimeout(() => { const e2 = document.getElementById(hash) as HTMLElement | null; if (e2) jumpTo(e2); }, 250);
            setTimeout(() => { const e3 = document.getElementById(hash) as HTMLElement | null; if (e3) jumpTo(e3); }, 600);
          } else if (tries++ < 60) {
            setTimeout(tryScroll, 50);
          }
        };
        setTimeout(tryScroll, 50);
      } else {
        // No hash, scroll to top
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }

      // Focus main content for accessibility
      setTimeout(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.focus({ preventScroll: true });
        }
      }, 200);
    };

    handleScroll();

    // Also listen for hash changes within the same page
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Track the scroll target hit
          trackEvent('scroll_target_hit', { id: hash, route: location.pathname });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location, trackEvent]);

  return null;
};