// Analytics tracking for the outcomes and quotes system

export interface AnalyticsEvents {
  // Outcomes page events
  'outcomes_page_view': { view?: 'proof' | 'catalog'; page?: string };
  'outcome_card_view': { outcomeId: string };
  'card_use_outcome_click': { outcomeId: string };
  'card_request_quote_click': { outcomeId: string };
  
  // Home page events
  'home_cta_click': { label: string };
  'choose_path': { select: 'subscription' | 'project' | 'unsure' };
  'quick_outcome_click': { slug: string };
  'pricing_view': Record<string, never>;
  'plan_select': { plan: string };
  'brief_start': { mode?: string; origin?: string; ref?: string };
  
  // Quote events
  'quote_sent': { slug: string };
  'quote_accepted': { slug: string };
  
  // Start funnel events
  'start_step_complete': { step: number; choice: string };
  'start_submit': { origin: string; focus: string; engage: string };
  
  // Results tracking
  'results_tile_view': { segment: string };
  
  // Customization Request events
  'cr_start': { crId: string; userType: 'guest' | 'user' };
  'cr_save_draft': { crId: string };
  'cr_submit': { crId: string };
  
  // Matching events
  'match_results_shown': { matchJobId: string; crId: string };
  'expert_shortlisted': { crId: string; expertId: string };
  'rfp_sent': { crId: string; count: number };
  
  // Proposal events
  'proposal_submitted': { proposalId: string };
  'proposal_viewed': { proposalId: string };
  'proposal_accepted': { proposalId: string };
  
  // Project events
  'escrow_created': { escrowId: string; projectId: string };
  'milestone_submitted': { milestoneId: string };
  'milestone_accepted': { milestoneId: string };
  
  // Meetings & transcripts
  'transcript_received': { transcriptId: string };
  
  // A/B testing
  'a_b_cta_click': { variantId: string; element: string };
  
  // Case study events
  'case_hover': { slug: string };
  'case_open': { slug: string };
  'case_prev': { slug: string; direction: string };
  'case_next': { slug: string; direction: string };
  'case_close': { slug: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

/**
 * Track an analytics event
 */
export function track<T extends AnalyticsEventName>(
  eventName: T,
  properties?: AnalyticsEvents[T]
): void {
  try {
    // Create the event payload
    const eventPayload = {
      event: eventName,
      properties: properties || {},
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100) + '...',
      sessionId: getSessionId(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventPayload);
    }

    // Send to analytics services
    sendToAnalyticsServices(eventPayload);
    
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Get or create a session ID
 */
function getSessionId(): string {
  const storageKey = 'analytics_session_id';
  let sessionId = sessionStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Send event to various analytics services
 */
function sendToAnalyticsServices(eventPayload: any): void {
  // Google Analytics 4 (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventPayload.event, {
      ...eventPayload.properties,
      custom_parameter_session_id: eventPayload.sessionId,
    });
  }

  // PostHog (if available)
  if (typeof window !== 'undefined' && (window as any).posthog) {
    (window as any).posthog.capture(eventPayload.event, eventPayload.properties);
  }

  // Mixpanel (if available)
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventPayload.event, eventPayload.properties);
  }

  // Custom analytics endpoint (if configured)
  if (typeof window !== 'undefined') {
    // Send to your own analytics service
    sendToCustomEndpoint(eventPayload);
  }
}

/**
 * Send to custom analytics endpoint
 */
async function sendToCustomEndpoint(eventPayload: any): Promise<void> {
  try {
    // Only send in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !localStorage.getItem('enable_analytics_dev')) {
      return;
    }

    // Use navigator.sendBeacon for better reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(eventPayload)], {
        type: 'application/json'
      });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      // Fallback to fetch
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
        keepalive: true,
      }).catch(() => {
        // Fail silently for analytics
      });
    }
  } catch (error) {
    // Fail silently for analytics
  }
}

/**
 * Track page views automatically
 */
export function trackPageView(pageName: string, properties?: Record<string, unknown>): void {
  track('outcomes_page_view' as any, {
    page: pageName,
    ...properties,
  } as any);
}

/**
 * Initialize analytics tracking
 */
export function initAnalytics(): void {
  // Track initial page view
  if (typeof window !== 'undefined') {
    trackPageView(window.location.pathname);
    
    // Track page view changes for SPAs
    let currentPath = window.location.pathname;
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        trackPageView(currentPath);
      }
    });
    
    observer.observe(document, { subtree: true, childList: true });
  }
}