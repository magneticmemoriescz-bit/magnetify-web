export {};

declare global {
    interface Window {
        Packeta: any;
        cloudinary: any;
        emailjs: any;
        gtag: (...args: any[]) => void;
        dataLayer: any[];
    }
}
