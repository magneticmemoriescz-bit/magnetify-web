
import { GOOGLE_ADS_ID } from '../constants';

export const trackPageView = (url: string) => {
    if (window.gtag) {
        window.gtag('config', 'G-KSKHR7NNX3', {
            page_path: url,
        });
    }
};

interface PurchaseParams {
    id: string;
    total: number;
    currency?: string;
    items: {
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
    }[];
}

export const trackPurchase = ({ id, total, currency = 'CZK', items }: PurchaseParams) => {
    if (window.gtag) {
        // GA4 Purchase Event
        window.gtag('event', 'purchase', {
            transaction_id: id,
            value: total,
            currency: currency,
            items: items,
        });

        // Google Ads Conversion Event
        // Assuming you have set up a conversion action in Google Ads with a label
        // window.gtag('event', 'conversion', {
        //     'send_to': `${GOOGLE_ADS_ID}/YOUR_CONVERSION_LABEL`,
        //     'value': total,
        //     'currency': currency,
        //     'transaction_id': id,
        // });
        
        console.log('Analytics Purchase Event Tracked:', { id, total, items });
    }
};
