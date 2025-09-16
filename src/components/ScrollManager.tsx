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
        // Wait for DOM to update, then scroll to anchor
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Track the scroll target hit
            trackEvent('scroll_target_hit', { id: hash, route: location.pathname });
          }
        }, 100);
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