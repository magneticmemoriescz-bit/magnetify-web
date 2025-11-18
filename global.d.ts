
export {};

declare global {
    interface Window {
        Packeta: any;
        uploadcare: any;
        emailjs: any;
        dataLayer: any[];
        gtag: (...args: any[]) => void;
    }
}
