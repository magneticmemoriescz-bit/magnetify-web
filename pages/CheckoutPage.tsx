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

        // PŘÍMÝ ODKAZ NA LOGO PRO E-MAILY
        const logoUrl = "https://i.imgur.com/b4WFqRi.png";

        // 1. Marketing Consent Block - Profi badge
        const marketingConsentHtml = order.marketingConsent 
            ? `<div style="padding: 15px; margin: 20px 0; background-color: #dcfce7; border: 2px solid #16a34a; border-radius: 12px; color: #166534; font-family: 'Inter', sans-serif; text-align: center;">
                <strong style="font-size: 18px; display: block; margin-bottom: 5px;">✓ Souhlas se zveřejněním udělen</strong>
                <span style="font-size: 13px; opacity: 0.9;">Tento produkt můžeme použít pro naše marketingové účely na sociálních sítích.</span>
               </div>`
            : `<div style="padding: 15px; margin: 20px 0; background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 12px; color: #991b1b; font-family: 'Inter', sans-serif; text-align: center;">
                <strong style="font-size: 18px; display: block; margin-bottom: 5px;">✕ Souhlas se zveřejněním ODMÍTNUT</strong>
                <span style="font-size: 13px; opacity: 0.9;">Zákazník si nepřeje zveřejňovat tento produkt pro marketingové účely.</span>
               </div>`;

        // 2. Items Table - Moderní design
        const itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; margin-bottom: 25px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
                <thead>
                    <tr style="background-color: #0B1121; color: #ffffff;">
                        <th style="padding: 14px; text-align: left; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Produkt</th>
                        <th style="padding: 14px; text-align: center; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Ks</th>
                        <th style="padding: 14px; text-align: right; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Cena</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr style="border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                            <td style="padding: 14px;">
                                <strong style="color: #0B1121; font-size: 15px; display: block;">${item.product.name}</strong>
                                ${item.variant ? `<small style="color: #64748b; font-size: 12px;">Varianta: ${item.variant.name}</small>` : ''}
                            </td>
                            <td style="padding: 14px; text-align: center; color: #475569;">${item.quantity}</td>
                            <td style="padding: 14px; text-align: right; font-weight: bold; color: #0B1121;">${item.price * item.quantity} Kč</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // 3. Adresa - Čistý box
        let addressBlock = `<div style="line-height: 1.6; color: #334155; font-family: 'Inter', sans-serif;">`;
        addressBlock += `<strong style="font-size: 17px; color: #0B1121; display: block; margin-bottom: 5px;">${order.contact.firstName} ${order.contact.lastName}</strong>`;
        if (order.company.isCompany) {
            addressBlock += `<span style="color: #0066FF; font-weight: 600; font-size: 14px;">${order.company.companyName}</span><br>IČO: ${order.company.ico}${order.company.dic ? ` | DIČ: ${order.company.dic}` : ''}<br>`;
        }
        addressBlock += `${order.contact.street}<br>${order.contact.zip} ${order.contact.city}<br>`;
        addressBlock += `<span style="color: #0066FF; font-weight: bold; font-size: 15px;">Tel: ${order.contact.phone}</span>`;
        addressBlock += `</div>`;
        
        let shippingAddressHtml = `<div style="background: #f8fafc; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px;">${addressBlock}</div>`;
        
        if (order.shipping === 'zasilkovna' && order.packetaPoint) {
            shippingAddressHtml += `
            <div style="margin-top: 15px; padding: 15px; background: #eff6ff; border-left: 5px solid #0066FF; border-radius: 0 10px 10px 0; font-family: 'Inter', sans-serif;">
                <strong style="color: #1e40af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Výdejní místo:</strong>
                <span style="font-weight: bold; color: #0B1121;">${order.packetaPoint.name}</span><br>
                <span style="font-size: 13px; color: #475569;">${order.packetaPoint.street}, ${order.packetaPoint.city}</span>
            </div>`;
        }

        // 4. Platební údaje pro převod
        let paymentInfoHtml = '';
        if (order.payment === 'prevodem') {
            paymentInfoHtml = `
            <div style="margin: 25px 0; padding: 25px; background-color: #f0f9ff; border: 2px solid #bae6fd; border-radius: 15px; font-family: 'Inter', sans-serif; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #0369a1; font-size: 18px;">Podklady pro platbu</h3>
                <div style="display: inline-block; text-align: left; width: 100%; max-width: 300px;">
                    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Číslo účtu: <strong style="color: #0B1121; float: right;">3524601011/3030</strong></p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 13px;">Variabilní symbol: <strong style="color: #0066FF; float: right;">${order.orderNumber}</strong></p>
                    <p style="margin: 15px 0 0 0; color: #0B1121; font-size: 16px; border-top: 1px solid #bae6fd; pt: 10px;">Částka: <strong style="color: #0B1121; float: right; font-size: 20px;">${order.total} Kč</strong></p>
                </div>
            </div>`;
        }

        const params = {
            first_name: order.contact.firstName,
            customer_name: `${order.contact.firstName} ${order.contact.lastName}`,
            customer_email: order.contact.email,
            customer_phone: order.contact.phone,
            order_number: order.orderNumber,
            total: order.total,
            shipping_method: order.shipping === 'zasilkovna' ? 'Zásilkovna' : order.shipping === 'posta' ? 'Česká pošta' : 'Osobní odběr',
            payment_method: order.payment === 'prevodem' ? 'Bankovní převod' : order.payment === 'faktura' ? 'Faktura' : 'Dobírka',
            items_html: itemsHtml,
            shipping_address_html: shippingAddressHtml,
            marketing_consent_html: marketingConsentHtml,
            payment_info_html: paymentInfoHtml,
            logo_url: logoUrl,
            to_email: order.contact.email,
            reply_to: 'objednavky@magnetify.cz'
        };

        try {
            // E-mail zákazníkovi
            await window.emailjs.send('service_2pkoish', 'template_n389n7r', params, { publicKey: 'sVd3x5rH1tZu6JGUR' });
            // E-mail administrátorovi
            await window.emailjs.send('service_2pkoish', 'template_n389n7r', { ...params, to_email: 'objednavky@magnetify.cz' }, { publicKey: 'sVd3x5rH1tZu6JGUR' });
        } catch (e) {
            console.error("Chyba při odesílání e-mailu přes EmailJS:", e);
        }
    };

    const triggerMakeWebhook = async (order: OrderDetails) => {
        if (!MAKE_WEBHOOK_URL) return;
        return fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...order, created: new Date().toISOString() })
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        let errors: { [key: string]: string } = {};

        if (!formData.firstName) errors.firstName = 'Jméno je povinné.';
        if (!formData.lastName) errors.lastName = 'Příjmení je povinné.';
        if (!formData.email) errors.email = 'Email je povinný.';
        if (!formData.phone) errors.phone = 'Telefon je povinný.';
        if (!shippingMethod) errors.shipping = 'Vyberte dopravu.';
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
                setSubmitError(`Chyba při odesílání objednávky. Kontaktujte nás na objednavky@magnetify.cz`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (items.length === 0) return <PageWrapper title="Košík"><div className="text-center py-10"><p className="text-gray-500 mb-6 text-lg">Váš košík je zatím prázdný.</p><Link to="/produkty" className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg">PROCHÁZET PRODUKTY</Link></div></PageWrapper>;

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-center mb-10 text-brand-navy">Pokladna</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                             <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} className="h-5 w-5 text-brand-primary rounded focus:ring-brand-primary border-gray-300" />
                                <span className="ml-3 font-bold text-brand-navy uppercase text-sm tracking-wider">Fakturační údaje (IČO / DIČ)</span>
                            </label>
                            {isCompany && (
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fadeIn">
                                    <div className="sm:col-span-2"><FormInput name="companyName" label="Název firmy" value={formData.companyName} onChange={handleFormChange} error={formErrors.companyName} /></div>
                                    <FormInput name="ico" label="IČO" value={formData.ico} onChange={handleFormChange} error={formErrors.ico} />
                                    <FormInput name="dic" label="DIČ (pokud máte)" value={formData.dic} onChange={handleFormChange} />
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
                            <h3 className="font-bold text-brand-navy text-xl mb-4">Způsob dopravy</h3>
                            <div className="space-y-3">
                                <RadioCard title="Zásilkovna - Výdejní místo" price="79 Kč" checked={shippingMethod === 'zasilkovna'} onChange={() => setShippingMethod('zasilkovna')} />
                                {shippingMethod === 'zasilkovna' && (
                                    <div className="ml-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                                        <div className="text-sm font-medium text-brand-navy">
                                            {packetaPoint ? packetaPoint.name : 'Není vybráno výdejní místo'}
                                        </div>
                                        <button type="button" onClick={openPacketaWidget} className="text-xs font-bold text-brand-primary underline uppercase tracking-tight">
                                            {packetaPoint ? 'Změnit pobočku' : 'Vybrat pobočku'}
                                        </button>
                                    </div>
                                )}
                                <RadioCard title="Česká pošta - Balík Do ruky" price="119 Kč" checked={shippingMethod === 'posta'} onChange={() => setShippingMethod('posta')} />
                                <RadioCard title="Osobní odběr Turnov" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={() => setShippingMethod('osobne')} />
                                {formErrors.shipping && <p className="text-red-500 text-xs mt-1">{formErrors.shipping}</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-brand-navy text-xl mb-4">Způsob platby</h3>
                            <div className="space-y-3">
                                <RadioCard title="Bankovní převod (Zálohová faktura)" price="Zdarma" checked={paymentMethod === 'prevodem'} onChange={() => setPaymentMethod('prevodem')} />
                                <RadioCard title="Dobírka" price="30 Kč" checked={paymentMethod === 'dobirka'} onChange={() => setPaymentMethod('dobirka')} />
                                {formErrors.payment && <p className="text-red-500 text-xs mt-1">{formErrors.payment}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 mt-12 lg:mt-0">
                        <div className="bg-gray-50 p-8 rounded-3xl sticky top-24 border border-gray-200 shadow-xl">
                            <h3 className="font-black text-2xl mb-6 text-brand-navy border-b pb-4">Souhrn objednávky</h3>
                            <div className="divide-y divide-gray-200 overflow-y-auto max-h-[300px] pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="py-4 flex justify-between text-sm items-start">
                                        <div>
                                            <p className="font-bold text-dark-gray">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantity}x {item.price} Kč</p>
                                        </div>
                                        <span className="font-black text-brand-navy">{item.price * item.quantity} Kč</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-6 mt-6 space-y-4">
                                <div className="flex justify-between font-bold text-gray-600"><span>Mezisoučet</span><span>{subtotal} Kč</span></div>
                                <div className="flex justify-between font-bold text-gray-600"><span>Doprava</span><span>{shippingCost} Kč</span></div>
                                <div className="flex justify-between font-bold text-gray-600"><span>Platba</span><span>{paymentCost} Kč</span></div>
                                <div className="flex justify-between font-black text-3xl pt-6 text-brand-primary border-t border-brand-primary/10 mt-4">
                                    <span>CELKEM</span>
                                    <span>{total} Kč</span>
                                </div>
                                <p className="text-[10px] text-gray-400 text-right uppercase tracking-widest font-bold">Nejsme plátci DPH</p>
                            </div>
                            
                            <div className="mt-10 space-y-4">
                                <label className="flex items-start cursor-pointer bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-brand-primary/30 transition-all">
                                    <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 h-5 w-5 text-brand-primary rounded border-gray-300" />
                                    <span className="ml-3 text-[11px] font-bold text-brand-navy leading-tight uppercase tracking-tight">Souhlasím se zveřejněním produktů pro reklamní účely (sociální sítě)</span>
                                </label>
                                <label className="flex items-start cursor-pointer">
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 h-5 w-5 text-brand-primary rounded border-gray-300" />
                                    <span className="ml-3 text-[12px] text-gray-600">Souhlasím s <Link to="/obchodni-podminky" className="underline font-bold" target="_blank">obchodními podmínkami</Link></span>
                                </label>
                                {formErrors.terms && <p className="text-red-600 text-xs font-bold text-center">{formErrors.terms}</p>}
                                
                                {submitError && <p className="text-red-700 font-bold text-center bg-red-50 p-3 rounded-lg border border-red-200 text-sm">{submitError}</p>}
                                
                                <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-2xl shadow-brand-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg uppercase tracking-wider">
                                    {isSubmitting ? 'Zpracovávám...' : 'Odeslat objednávku'}
                                </button>
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-tighter">Kliknutím na tlačítko odesíláte závaznou objednávku.</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
