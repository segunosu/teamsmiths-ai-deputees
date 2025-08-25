import { useCallback } from 'react';

export interface AnalyticsEvent {
  'experts.intent_select': { intent: string };
  'capability.customize_clicked': { capability_id: string };
  'catalog.customize_clicked': { pack_id: string };
  'brief_builder.answer': { field: string; length: number };
  'brief_builder.ai_processed': { field: string; has_extraction: boolean };
  'brief_builder.submit_contact': { has_ai_responses: boolean };
  'proposal.preview_shown': Record<string, never>;
  'proposal.confirmed': { assured_mode: boolean };
  'curator.booking_clicked': { brief_id: string; email: string };
}

export const useAnalytics = () => {
  const trackEvent = useCallback(<T extends keyof AnalyticsEvent>(
    eventName: T, 
    properties: AnalyticsEvent[T]
  ) => {
    // In a real implementation, this would send to your analytics service
    // For now, we'll console.log with structured data for debugging
    console.log('📊 Analytics Event:', {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100) + '...'
    });
    
    // You could also send to multiple analytics services:
    // - Google Analytics
    // - Mixpanel
    // - PostHog
    // - Custom analytics endpoint
    
    // Example for future implementation:
    // if (window.gtag) {
    //   window.gtag('event', eventName, properties);
    // }
    
    // if (window.mixpanel) {
    //   window.mixpanel.track(eventName, properties);
    // }
  }, []);

  return { trackEvent };
};