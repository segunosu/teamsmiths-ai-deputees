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
  'proposal.submitted': { brief_id: string; authed: boolean };
  'proposal.ready': { brief_id: string };
  'proposal.accepted': { brief_id: string; assured_mode: boolean };
  'brief.missing_fields': { brief_id: string; fields: string[] };
  'curator.booking_clicked': { brief_id: string };
  'detail.open': { brief_id: string; status: string };
  'detail.error': { brief_id: string; code: string; message: string };
  'hero_join_click': { plan: string };
  'hero_demo_click': Record<string, never>;
  'nav_ai_navigator_click': Record<string, never>;
  'plan_subscribe_click': { plan_id: string; price: number };
  'plan_request_bespoke_click': { plan_id: string };
  'proof_purchase': { sprint_id: string; price: number };
  'checkout_success': { product_id: string; amount: number; user_email: string };
  // Home page analytics events
  'offers_view': { page: string };
  'hero_cta_click': { label: string };
  'pillars_cta_click': { pillar: string; cta: string };
  'card_cta_click': { section: string; slug: string; cta: string };
  'results_tile_view': { segment: string };
  'brief_start': { origin: string; ref?: string };
  'checkout_start': { sku: string; origin?: string; ref?: string };
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