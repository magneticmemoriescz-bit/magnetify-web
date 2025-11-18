
import { GOOGLE_ADS_ID } from '../constants';

/**
 * Log a page view.
 * Note: GA4 usually handles this automatically with the History API,
 * but this can be used for virtual pageviews if needed.
 */
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

/**
 * Track a purchase/conversion event.
 * Sends data to both GA4 and Google Ads.
 */
export const trackPurchase = (order: {
  id: string;
  total: number;
  currency: string;
  items: any[];
}) => {
  if (window.gtag) {
    // 1. Send purchase event to GA4
    window.gtag('event', 'purchase', {
      transaction_id: order.id,
      value: order.total,
      currency: order.currency,
      items: order.items,
    });

    // 2. Send conversion event to Google Ads (if ID is configured)
    // Replace 'CONVERSION_LABEL' with the actual label from your Google Ads account (e.g., "AbC_CLjx1NoBENj...")
    if (GOOGLE_ADS_ID && GOOGLE_ADS_ID !== 'AW-XXXXXXXXX') {
       // This is a generic send_to. Usually you need a specific Label.
       // Example: window.gtag('event', 'conversion', { 'send_to': `${GOOGLE_ADS_ID}/YOUR_CONVERSION_LABEL`, ... });
       // For now, we just log that we would send it.
       console.log("Google Ads Conversion triggered (configure specific label in utils/analytics.ts)");
    }
  }
};

/**
 * Track generic events (e.g., "generate_lead", "add_to_cart")
 */
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
  }
};
