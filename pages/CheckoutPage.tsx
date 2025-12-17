import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { PageWrapper } from '../components/layout/PageWrapper';
import { FormInput } from '../components/forms/FormInput';
import { RadioCard } from '../components/forms/RadioCard';
import { MAKE_WEBHOOK_URL } from '../constants';

interface OrderDetails {
    contact: { [key: string]: string };
    company: { isCompany: boolean; companyName: string; ico: string; dic: string };
    shipping: string;
    payment: string;
    packetaPoint: any | null;
    items: CartItem[];
    total: number;
    subtotal: number;
    shippingCost: number;
    paymentCost: number;
    orderNumber: string;
    agreedToTerms: boolean;
    marketingConsent: boolean;
}

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const { items } = state;
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    const [isCompany, setIsCompany] = useState(true);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        additionalInfo: '',
        companyName: '',
        ico: '',
        dic: '',
    });
    const [shippingMethod, setShippingMethod] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [packetaPoint, setPacketaPoint] = useState<any | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const shippingCosts: { [key: string]: number } = {
        'zasilkovna': 79,
        'posta': 119,
        'osobne': 0
    };
    const paymentCosts: { [key: string]: number } = {
        'prevodem': 0,
        'faktura': 0,
        'dobirka': 30,
    };

    const shippingCost = shippingMethod ? shippingCosts[shippingMethod] : 0;
    const paymentCost = paymentMethod ? paymentCosts[paymentMethod] : 0;
    const total = subtotal + shippingCost + paymentCost;
    
    const handleRemoveItem = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { id } });
    };

    const handleUpdateQuantity = (id: string, newQuantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: newQuantity } });
    };

    const openPacketaWidget = () => {
        const PACKETA_API_KEY = '15e63288a4805214';
        if (window.Packeta) {
            window.Packeta.Widget.pick(PACKETA_API_KEY, (point: any) => {
                if (point) {
                    setPacketaPoint(point);
                    setFormErrors(prev => ({...prev, packetaPoint: ''}))
                }
            }, {
               country: 'cz',
               language: 'cs'
            });
        }
    };
    
    const generateOrderNumber = (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const datePrefix = `${year}${month}`;
        const storageKey = `orderSequence_${datePrefix}`;
        let sequence = 1;
        try {
            const lastSequence = localStorage.getItem(storageKey);
            if (lastSequence) sequence = parseInt(lastSequence, 10) + 1;
            localStorage.setItem(storageKey, sequence.toString());
        } catch (e) {}
        return `${datePrefix}${sequence.toString().padStart(3, '0')}`;
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        if (!window.emailjs) return;

        // 1. Marketing Consent HTML
        const marketingConsentHtml = order.marketingConsent 
            ? `<div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; color: #166534; font-family: sans-serif;">
                <strong>Marketingový souhlas:</strong> Zákazník souhlasí se zveřejněním produktů pro reklamní účely.
               </div>`
            : `<div style="padding: 15px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-family: sans-serif;">
                <strong>Marketingový souhlas:</strong> Zákazník NESOUHLASÍ se zveřejněním produktů pro reklamní účely.
               </div>`;

        // 2. Items Table
        const itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; margin-bottom: 10px;">
                <thead>
                    <tr style="background-color: #f8fafc;">
                        <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Produkt</th>
                        <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Ks</th>
                        <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">Cena</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #e2e8f0;">
                                <strong>${item.product.name}</strong>
                                ${item.variant ? `<br><small style="color: #64748b;">${item.variant.name}</small>` : ''}
                            </td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: right;">${item.price * item.quantity} Kč</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // 3. Address HTML
        let addressBlock = `<strong>${order.contact.firstName} ${order.contact.lastName}</strong><br>`;
        if (order.company.isCompany) {
            addressBlock += `<strong>${order.company.companyName}</strong><br>IČO: ${order.company.ico}<br>${order.company.dic ? `DIČ: ${order.company.dic}<br>` : ''}`;
        }
        addressBlock += `${order.contact.street}<br>${order.contact.zip} ${order.contact.city}<br>Tel: ${order.contact.phone}`;
        
        let shippingAddressHtml = `<div style="margin-top: 10px; font-family: sans-serif;">${addressBlock}</div>`;
        if (order.shipping === 'zasilkovna' && order.packetaPoint) {
            shippingAddressHtml += `<div style="margin-top: 10px; border-top: 1px dashed #ddd; pt: 10px;"><strong>Výdejní místo:</strong><br>${order.packetaPoint.name}<br>${order.packetaPoint.street}, ${order.packetaPoint.city}</div>`;
        }

        // 4. Payment Details HTML
        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <div style="margin-top: 15px; padding: 15px; background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; font-family: sans-serif;">
                    <h3 style="margin: 0 0 10px 0; color: #0369a1;">Platební údaje</h3>
                    <p style="margin: 0 0 5px 0;">Číslo účtu: <strong>3524601011/3030</strong></p>
                    <p style="margin: 0 0 5px 0;">Variabilní symbol: <strong>${order.orderNumber}</strong></p>
                    <p style="margin: 0 0 5px 0;">Částka: <strong>${order.total} Kč</strong></p>
                    <p style="margin: 10px 0 0 0; font-weight: bold; color: #0284c7;">Na objednávce budeme pracovat po připsání peněz na účet.</p>
                </div>`;
        }

        // 5. Photos Section
        const ownerPhotosHtml = order.items
            .filter(item => item.photos && item.photos.length > 0)
            .map(item => `
                <div style="margin-top: 5px;">
                    <strong>${item.product.name}:</strong><br>
                    ${item.photos.map((p, i) => `<a href="${p.url}" style="color: #2563eb; font-size: 12px;">Soubor ${i+1}</a>`).join(', ')}
                </div>`).join('');

        const photosConfirmationHtml = ownerPhotosHtml 
            ? `<div style="margin-top: 20px; font-family: sans-serif; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0;"><strong>Nahraná data:</strong>${ownerPhotosHtml}</div>` 
            : '';

        const params = {
            first_name: order.contact.firstName,
            order_number: order.orderNumber,
            subtotal: order.subtotal,
            shipping_cost: order.shippingCost,
            payment_cost: order.paymentCost,
            total: order.total,
            shipping_method: order.shipping === 'zasilkovna' ? 'Zásilkovna' : order.shipping === 'posta' ? 'Česká pošta' : 'Osobní odběr',
            items_html: itemsHtml,
            shipping_address_html: shippingAddressHtml,
            marketing_consent_html: marketingConsentHtml,
            payment_details_html: paymentDetailsHtml,
            photos_confirmation_html: photosConfirmationHtml,
            invoice_html: `<p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">Fakturu Vám zašleme elektronicky po vyřízení objednávky.</p>`,
            email: order.contact.email,
            to_email: order.contact.email,
            reply_to: 'objednavky@magnetify.cz'
        };

        const emailJsOptions = { publicKey: 'sVd3x5rH1tZu6JGUR' };
        
        // Send to Customer
        await window.emailjs.send('service_2pkoish', 'template_n389n7r', params, emailJsOptions);
        // Send Copy to Admin
        await window.emailjs.send('service_2pkoish', 'template_n389n7r', { ...params, to_email: 'objednavky@magnetify.cz', email: 'objednavky@magnetify.cz' }, emailJsOptions);
    };

    const triggerMakeWebhook = async (order: OrderDetails) => {
        if (!MAKE_WEBHOOK_URL) return;
        const payload = { ...order, created: new Date().toISOString() };
        return fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = formData;
        let errors: { [key: string]: string } = {};

        if (!data.firstName) errors.firstName = 'Jméno je povinné.';
        if (!data.lastName) errors.lastName = 'Příjmení je povinné.';
        if (!data.email) errors.email = 'Email je povinný.';
        if (!data.phone) errors.phone = 'Telefon je povinný.';
        if (!data.street) errors.street = 'Ulice je povinná.';
        if (!data.city) errors.city = 'Město je povinné.';
        if (!data.zip) errors.zip = 'PSČ je povinné.';
        if (isCompany) {
            if (!data.companyName) errors.companyName = 'Název firmy je povinný.';
            if (!data.ico) errors.ico = 'IČO je povinné.';
        }
        if (!shippingMethod) errors.shipping = 'Vyberte dopravu.';
        if (shippingMethod === 'zasilkovna' && !packetaPoint) errors.packetaPoint = 'Vyberte výdejní místo.';
        if (!paymentMethod) errors.payment = 'Vyberte platbu.';
        if (!agreedToTerms) errors.terms = 'Musíte souhlasit s podmínkami.';

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            const orderNumber = generateOrderNumber();
            const orderDetails: OrderDetails = {
                contact: { ...formData },
                company: { isCompany, companyName: formData.companyName, ico: formData.ico, dic: formData.dic },
                shipping: shippingMethod!,
                payment: paymentMethod!,
                packetaPoint,
                items,
                total,
                subtotal,
                shippingCost,
                paymentCost,
                orderNumber,
                agreedToTerms,
                marketingConsent
            };
            
            try {
                await triggerMakeWebhook(orderDetails);
                await sendEmailNotifications(orderDetails);
                dispatch({ type: 'CLEAR_CART' });
                navigate('/dekujeme', { state: { order: orderDetails } });
            } catch (error) {
                setSubmitError(`Chyba při odesílání. Kontaktujte nás na objednavky@magnetify.cz`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (items.length === 0) return <PageWrapper title="Košík"><div className="text-center"><p>Košík je prázdný.</p><Link to="/produkty" className="mt-4 inline-block bg-brand-primary text-white py-2 px-6 rounded">Zpět do obchodu</Link></div></PageWrapper>;

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-center mb-10">Dokončení objednávky</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                             <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} className="h-5 w-5 text-brand-primary border-gray-300 rounded" />
                                <span className="ml-3 font-medium">Nakupuji na firmu / IČO</span>
                            </label>
                            {isCompany && (
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2"><FormInput name="companyName" label="Název firmy" value={formData.companyName} onChange={handleFormChange} error={formErrors.companyName} /></div>
                                    <FormInput name="ico" label="IČO" value={formData.ico} onChange={handleFormChange} error={formErrors.ico} />
                                    <FormInput name="dic" label="DIČ" value={formData.dic} onChange={handleFormChange} />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput name="firstName" label="Jméno" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} />
                            <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} />
                            <FormInput name="phone" label="Telefon" type="tel" value={formData.phone} onChange={handleFormChange} error={formErrors.phone} />
                            <div className="sm:col-span-2"><FormInput name="street" label="Ulice a č.p." value={formData.street} onChange={handleFormChange} error={formErrors.street} /></div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} error={formErrors.city} />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} error={formErrors.zip} />
                        </div>

                        <div>
                            <h3 className="font-bold mb-3">Doprava</h3>
                            <div className="space-y-2">
                                <RadioCard title="Zásilkovna" price="79 Kč" checked={shippingMethod === 'zasilkovna'} onChange={() => setShippingMethod('zasilkovna')} />
                                {shippingMethod === 'zasilkovna' && (
                                    <button type="button" onClick={openPacketaWidget} className="text-sm text-brand-primary underline ml-8">
                                        {packetaPoint ? `${packetaPoint.name} (Změnit)` : 'Vybrat výdejní místo'}
                                    </button>
                                )}
                                <RadioCard title="Česká pošta" price="119 Kč" checked={shippingMethod === 'posta'} onChange={() => setShippingMethod('posta')} />
                                <RadioCard title="Osobní odběr Turnov" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={() => setShippingMethod('osobne')} />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold mb-3">Platba</h3>
                            <div className="space-y-2">
                                <RadioCard title="Bankovní převod" price="Zdarma" checked={paymentMethod === 'prevodem'} onChange={() => setPaymentMethod('prevodem')} />
                                <RadioCard title="Na fakturu (partneři)" price="Zdarma" checked={paymentMethod === 'faktura'} onChange={() => setPaymentMethod('faktura')} />
                                <RadioCard title="Dobírka" price="30 Kč" checked={paymentMethod === 'dobirka'} onChange={() => setPaymentMethod('dobirka')} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 mt-12 lg:mt-0">
                        <div className="bg-gray-50 p-6 rounded-lg sticky top-24 border border-gray-200">
                            <h3 className="font-bold text-lg mb-4">Shrnutí</h3>
                            <div className="divide-y divide-gray-200">
                                {items.map(item => (
                                    <div key={item.id} className="py-4 flex justify-between text-sm">
                                        <span>{item.product.name} ({item.quantity}x)</span>
                                        <span className="font-medium">{item.price * item.quantity} Kč</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span>Doprava</span><span>{shippingCost} Kč</span></div>
                                <div className="flex justify-between"><span>Platba</span><span>{paymentCost} Kč</span></div>
                                <div className="flex justify-between font-bold text-lg pt-2 text-brand-primary"><span>Celkem</span><span>{total} Kč</span></div>
                            </div>
                            
                            <div className="mt-8 space-y-4">
                                <label className="flex items-start cursor-pointer">
                                    <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 h-4 w-4 text-brand-primary border-gray-300 rounded" />
                                    <span className="ml-3 text-sm text-gray-600">Souhlasím se zveřejněním produktů pro reklamní účely (např. na sociálních sítích)</span>
                                </label>
                                <label className="flex items-start cursor-pointer">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 h-4 w-4 text-brand-primary border-gray-300 rounded" />
                                    <span className="ml-3 text-sm text-gray-600">Souhlasím s <Link to="/obchodni-podminky" className="underline">obchodními podmínkami</Link></span>
                                </label>
                                {formErrors.terms && <p className="text-red-500 text-xs">{formErrors.terms}</p>}
                                
                                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {isSubmitting ? 'Odesílám...' : 'Závazně objednat'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
