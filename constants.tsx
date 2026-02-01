
import React from 'react';
import { Product } from './types';

// ---------------------------------------------------------------------------
// KONFIGURACE MAKE.COM (AUTOMATIZACE)
// Zde vložte URL vašeho Webhooku z Make.com.
// Pokud automatizaci nepoužíváte, můžete nechat prázdné, ale objednávky se nebudou posílat do Fakturoidu/Excelu.
// ---------------------------------------------------------------------------
export const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/ka7qi8xh2kear7rhbyg2re3eg83pfybn';

export const PRODUCTS: Product[] = [
  {
    id: 'magnetic-business-cards',
    name: 'Magnetické vizitky',
    price: 25,
    shortDescription: 'Vizitky, které neskončí v koši. Rozměr 90x50 nebo 85x55 mm.',
    description: 'Odlište se od konkurence. Magnetická vizitka zůstane klientovi na očích – <strong>vhodné na lednici v kuchyňce nebo magnetickou nástěnku v kanceláři</strong>. Ideální pro řemeslníky, servisy, rozvozy jídla a služby.<br><br><strong>Rozměry:</strong> Standardní formát 90x50 mm nebo 85x55 mm.<br><br>Cena je uvedena za 1 kus při odběru základního balení 50 ks.',
    imageUrl: 'https://i.imgur.com/YeFWk8H.png',
    gallery: [
      'https://i.imgur.com/YeFWk8H.png',
    ],
    requiredPhotos: 1,
    variants: [
        { id: '50-pcs', name: '50 ks', photoCount: 1, price: 1250 },
        { id: '100-pcs', name: '100 ks', photoCount: 1, price: 2450 },
        { id: '200-pcs', name: '200 ks', photoCount: 1, price: 4900 },
        { id: '500-pcs', name: '500 ks', photoCount: 1, price: 12250 },
    ]
  },
  {
    id: 'corporate-calendar',
    name: 'Firemní magnetický kalendář',
    price: 990,
    shortDescription: 'Praktický dárek pro vaše partnery a klienty.',
    description: 'Roční kalendář s vaším logem a grafikou. Skvělý způsob, jak být klientům na očích po celý rok. <strong>Nahrajte prosím 12 fotografií (1 pro každý měsíc).</strong> Vysoce kvalitní tisk na magnetickém podkladu.',
    imageUrl: 'https://i.imgur.com/OUbniet.png',
    gallery: [
      'https://i.imgur.com/OUbniet.png',
    ],
    requiredPhotos: 12,
    variants: [
      { id: 'a5', name: 'A5', photoCount: 12, price: 990 },
      { id: 'a4', name: 'A4', photoCount: 12, price: 1800 },
    ]
  },
  {
    id: 'promo-magnets',
    name: 'Reklamní magnety (Merch)',
    price: 25,
    shortDescription: 'Drobné předměty pro podporu značky.',
    description: 'Rozdávejte svou značku. Malé, cenově dostupné a efektivní reklamní předměty. <strong>Ideální jako dárky pro zákazníky, zaměstnance nebo na veletrhy.</strong><br><br>Ceny jsou uvedeny za 1 kus.',
    imageUrl: 'https://i.imgur.com/jHvipIX.png',
    gallery: [
      'https://i.imgur.com/jHvipIX.png',
    ],
    requiredPhotos: 1,
    variants: [
      { id: 'square-5x5', name: 'Čtverec 5x5 cm', photoCount: 1, price: 25 },
      { id: 'rect-5x10', name: 'Obdélník 5x10 cm', photoCount: 1, price: 50 },
      { id: 'square-10x10', name: 'Čtverec 10x10 cm', photoCount: 1, price: 100 },
    ]
  },
  {
    id: 'car-magnet-logo',
    name: 'Magnetické logo na auto',
    price: 800,
    shortDescription: 'Proměňte své firemní auto v pojízdnou reklamu.',
    description: 'Efektivní reklama, která neničí lak vašeho vozu. Magnetické fólie s vysokou přilnavostí jsou ideální pro dočasné označení firemních vozidel. <strong>Logo je kdykoliv snímatelné, což oceníte například při soukromých cestách.</strong> Odolné vůči povětrnostním vlivům a UV záření.',
    imageUrl: 'https://i.imgur.com/LiYGCeu.png',
    gallery: [
        'https://i.imgur.com/LiYGCeu.png',
    ],
    requiredPhotos: 1,
    variants: [
      { id: 'a5', name: 'A5 (21x15 cm)', photoCount: 1, price: 650 },
      { id: 'a4', name: 'A4 (30x21 cm)', photoCount: 1, price: 800 },
      { id: 'a3', name: 'A3 (42x30 cm)', photoCount: 1, price: 1500 },
    ]
  }
];

export const NAV_LINKS = [
    { name: 'Domů', path: '/' },
    { name: 'Produkty', path: '/produkty' },
    { name: 'Pro firmy', path: '/jak-to-funguje' },
    { name: 'Kontakt', path: '/kontakt' }
];

export const FOOTER_LEGAL_LINKS = [
    { name: 'Obchodní podmínky (B2B)', path: '/obchodni-podminky' },
    { name: 'GDPR', path: '/ochrana-udaju' },
];

export const FOOTER_INFO_LINKS = [
    { name: 'Doprava a fakturace', path: '/doprava' },
];

const IconSelect = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const IconProduction = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const IconDelivery = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;

export const HOW_IT_WORKS_STEPS = [
    { title: '1. Konfigurace', description: 'Vyberte produkt, rozměr a počet kusů pro vaši kampaň.', icon: <IconSelect /> },
    { title: '2. Tisková data', description: 'Nahrajte vaše logo nebo hotovou grafiku v PDF/JPG.', icon: <IconUpload /> },
    { title: '3. Výroba', description: 'Tiskneme na kvalitní materiály s důrazem na odolnost.', icon: <IconProduction /> },
    { title: '4. Dodání', description: 'Kurýrem přímo do vaší firmy nebo na pobočku.', icon: <IconDelivery /> },
];
