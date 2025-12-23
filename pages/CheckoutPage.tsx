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

    const openPacketaWidget = () => {
        if (window.Packeta && window.Packeta.Widget) {
            window.Packeta.Widget.pick('6335340808940801', (point: any) => {
                if (point) {
                    setPacketaPoint(point);
                }
            }, {
                language: 'cs',
                primaryButtonColor: '#0066FF'
            });
        } else {
            console.error("Packeta widget not loaded");
            alert("Služba Zásilkovna není momentálně k dispozici. Zkuste to prosím později.");
        }
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCosts: { [key: string]: number } = { 'zasilkovna': 79, 'posta': 119, 'osobne': 0 };
    const paymentCosts: { [key: string]: number } = { 'prevodem': 0, 'faktura': 0, 'dobirka': 30 };
    const total = subtotal + (shippingMethod ? shippingCosts[shippingMethod] : 0) + (paymentMethod ? paymentCosts[paymentMethod] : 0);

    const triggerMakeWebhook = async (order: OrderDetails) => {
        if (!MAKE_WEBHOOK_URL) return;

        const makePayload = {
            order_number: order.orderNumber,
            created_at: new Date().toISOString(),
            total: order.total,
            currency: 'CZK',
            billing: {
                name: order.company.isCompany ? order.company.companyName : `${order.contact.firstName} ${order.contact.lastName}`,
                street: order.contact.street,
                city: order.contact.city,
                zip: order.contact.zip,
                ico: order.company.ico,
                dic: order.company.dic,
                is_company: order.company.isCompany
            },
            contact: {
                first_name: order.contact.firstName,
                last_name: order.contact.lastName,
                email: order.contact.email,
                phone: order.contact.phone,
                street: order.contact.street,
                city: order.contact.city,
                zip: order.contact.zip
            },
            notes: order.contact.additionalInfo,
            shipping: {
                method: order.shipping,
                point_name: order.packetaPoint?.name || null,
                point_id: order.packetaPoint?.id || null,
                cost: order.shippingCost
            },
            payment: {
                method: order.payment,
                cost: order.paymentCost
            },
            items: order.items.map(item => ({
                name: item.product.name,
                variant: item.variant?.name || null,
                quantity: item.quantity,
                unit_price: item.price,
                price_total: item.price * item.quantity,
                photo_urls: item.photos.map(p => p.url)
            })),
            marketing_consent: order.marketingConsent
        };

        return fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload)
        });
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        if (!window.emailjs) return;

        const logoUrl = "https://i.imgur.com/b4WFqRi.png";
        const primaryColor = "#0066FF";
        const navyColor = "#0B1121";
        const fullName = `${order.contact.firstName} ${order.contact.lastName}`;

        const itemsTable = (includeLinks: boolean) => `
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-family: sans-serif;">
                <thead>
                    <tr style="background: ${navyColor}; color: #ffffff;">
                        <th style="padding: 12px; text-align: left; font-size: 12px;">Položka</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px;">Množství</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px;">Cena</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr style="border-bottom: 1px solid #edf2f7;">
                            <td style="padding: 12px; font-size: 14px;">
                                <strong>${item.product.name}</strong>
                                ${item.variant ? `<br><span style="color: #718096; font-size: 12px;">Varianta: ${item.variant.name}</span>` : ''}
                                ${includeLinks ? `<br>${item.photos.map((p, i) => `<a href="${p.url}" style="color: ${primaryColor}; font-size: 11px; text-decoration: underline; margin-right: 8px;">Soubor ${i+1}</a>`).join('')}` : ''}
                            </td>
                            <td style="padding: 12px; text-align: center; font-size: 14px; color: #4a5568;">${item.quantity} ks</td>
                            <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: bold; color: ${navyColor};">${item.price * item.quantity} Kč</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const addressBox = `
            <div style="background: #f7fafc; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #2d3748;">
                <strong style="font-size: 16px; color: ${navyColor};">${fullName}</strong><br>
                ${order.company.isCompany ? `<span style="color: ${primaryColor}; font-weight: bold;">${order.company.companyName}</span><br>IČO: ${order.company.ico}<br>` : ''}
                ${order.contact.street}<br>${order.contact.zip} ${order.contact.city}<br>
                <span style="color: ${primaryColor}; font-weight: bold;">Email: ${order.contact.email}</span><br>
                <span style="color: ${primaryColor}; font-weight: bold;">Tel: ${order.contact.phone}</span>
                ${order.shipping === 'zasilkovna' && order.packetaPoint ? `
                    <div style="margin-top: 15px; padding: 10px; background: #ebf8ff; border-left: 4px solid ${primaryColor}; border-radius: 4px;">
                        <strong style="color: #2b6cb0;">Zásilkovna - výdejní místo:</strong><br>${order.packetaPoint.name}
                    </div>
                ` : ''}
            </div>
        `;

        const notesBox = order.contact.additionalInfo ? `
            <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-family: sans-serif;">
                <strong style="color: #92400e; font-size: 14px;">Poznámka k objednávce:</strong><br>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #78350f;">${order.contact.additionalInfo}</p>
            </div>
        ` : '';

        const customerHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border: 1px solid #edf2f7;">
                <div style="text-align: center; margin-bottom: 25px;"><img src="${logoUrl}" alt="Magnetify.cz" style="height: 60px;"></div>
                <h1 style="color: ${navyColor}; text-align: center; font-size: 24px; margin-bottom: 10px;">Objednávka přijata</h1>
                <p style="text-align: center; color: #4a5568; margin-bottom: 30px;">Dobrý den, Vaši objednávku č. <strong>${order.orderNumber}</strong> jsme v pořádku přijali a začínáme na ní pracovat.</p>
                
                ${order.payment === 'prevodem' ? `
                    <div style="background: #f0f9ff; padding: 25px; border: 2px solid #bae6fd; border-radius: 16px; margin-bottom: 30px; text-align: center;">
                        <h2 style="margin: 0 0 15px 0; color: #0369a1; font-size: 18px;">Podklady k platbě</h2>
                        <p style="margin: 5px 0;">Číslo účtu: <strong>3524601011/3030</strong></p>
                        <p style="margin: 5px 0;">Variabilní symbol: <strong style="color: ${primaryColor}; font-size: 18px;">${order.orderNumber}</strong></p>
                        <p style="margin: 5px 0;">Částka k úhradě: <strong style="font-size: 20px;">${order.total} Kč</strong></p>
                    </div>
                ` : ''}

                <h3 style="color: ${navyColor}; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">Shrnutí objednávky</h3>
                ${itemsTable(true)}
                ${notesBox}
                
                <h3 style="color: ${navyColor}; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; margin-top: 30px;">Doručovací údaje</h3>
                ${addressBox}

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #edf2f7; text-align: center; font-size: 12px; color: #a0aec0;">
                    Magnetify.cz | <a href="mailto:objednavky@magnetify.cz" style="color: ${primaryColor}; text-decoration: none;">objednavky@magnetify.cz</a>
                </div>
            </div>
        `;

        const adminHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid ${navyColor};">
                <h1 style="color: ${navyColor}; margin: 0 0 10px 0;">NOVÁ OBJEDNÁVKA: ${order.orderNumber}</h1>
                <div style="padding: 10px; background: ${order.marketingConsent ? '#dcfce7' : '#fee2e2'}; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 20px;">
                    ${order.marketingConsent ? '✓ SOUHLAS SE ZVEŘEJNĚNÍM UDĚLEN' : '✕ SOUHLAS SE ZVEŘEJNĚNÍM ODMÍTNUT'}
                </div>

                <h3>Zákazník & Adresa:</h3>
                ${addressBox}
                ${notesBox}

                <h3>Produkty k výrobě:</h3>
                ${itemsTable(true)}
                <div style="text-align: right; font-size: 18px; font-weight: bold;">CELKEM: ${order.total} Kč</div>

                <div style="margin-top: 30px; padding: 20px; background: #edf2f7; border-radius: 12px;">
                    <h3 style="margin-top: 0; color: ${primaryColor};">TISKOVÁ DATA KE STAŽENÍ (Cloudinary):</h3>
                    ${order.items.map(item => `
                        <div style="margin-bottom: 15px; border-bottom: 1px solid #cbd5e0; padding-bottom: 10px;">
                            <strong style="font-size: 14px;">${item.product.name}:</strong><br>
                            ${item.photos.map((p, i) => `
                                <a href="${p.url}" target="_blank" style="display: inline-block; background: ${primaryColor}; color: white; padding: 8px 12px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; margin: 5px 5px 0 0;">
                                    STÁHNOUT SOUBOR ${i+1}
                                </a>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
                
                <p style="margin-top: 20px; font-size: 12px; color: #718096;">Způsob platby: ${order.payment} | Doprava: ${order.shipping}</p>
            </div>
        `;

        try {
            await window.emailjs.send('service_2pkoish', 'template_n389n7r', {
                to_email: order.contact.email,
                subject: `Potvrzení objednávky č. ${order.orderNumber} | Magnetify.cz`,
                order_number: order.orderNumber,
                customer_name: fullName,
                message_html: customerHtml
            });

            await window.emailjs.send('service_2pkoish', 'template_n389n7r', {
                to_email: 'objednavky@magnetify.cz',
                subject: `[ADMIN] Nová objednávka ${order.orderNumber} - ${order.contact.lastName}`,
                order_number: order.orderNumber,
                customer_name: fullName,
                message_html: adminHtml
            });
        } catch (e) {
            console.error("EmailJS error:", e);
        }
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
        if (!agreedToTerms) errors.terms = 'Musíte souhlasit s obchodními podmínkami.';

        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            const orderNumber = (function(){
                const today = new Date();
                const datePrefix = `${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}`;
                const storageKey = `orderSequence_${datePrefix}`;
                let sequence = 1;
                try {
                    const lastSequence = localStorage.getItem(storageKey);
                    if (lastSequence) sequence = parseInt(lastSequence, 10) + 1;
                    localStorage.setItem(storageKey, sequence.toString());
                } catch (e) {}
                return `${datePrefix}${sequence.toString().padStart(3, '0')}`;
            })();

            const orderDetails: OrderDetails = {
                contact: { ...formData },
                company: { isCompany, companyName: formData.companyName, ico: formData.ico, dic: formData.dic },
                shipping: shippingMethod!,
                payment: paymentMethod!,
                packetaPoint,
                items,
                total,
                subtotal,
                shippingCost: shippingMethod ? shippingCosts[shippingMethod] : 0,
                paymentCost: paymentMethod ? paymentCosts[paymentMethod] : 0,
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
                console.error(error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (items.length === 0) return <PageWrapper title="Košík"><div className="text-center py-10"><Link to="/produkty" className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg">PROCHÁZET PRODUKTY</Link></div></PageWrapper>;

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-extrabold text-center mb-10 text-brand-navy">Pokladna</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
                             <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)} className="h-5 w-5 text-brand-primary rounded focus:ring-brand-primary border-gray-300" />
                                <span className="ml-3 font-bold text-brand-navy text-sm uppercase tracking-wide">Nakupuji na IČO</span>
                            </label>
                            {isCompany && (
                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2"><FormInput name="companyName" label="Název firmy" value={formData.companyName} onChange={handleFormChange} error={formErrors.companyName} /></div>
                                    <FormInput name="ico" label="IČO" value={formData.ico} onChange={handleFormChange} error={formErrors.ico} />
                                    <FormInput name="dic" label="DIČ (nepovinné)" value={formData.dic} onChange={handleFormChange} />
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
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka k objednávce</label>
                                <textarea name="additionalInfo" value={formData.additionalInfo} onChange={handleFormChange} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm border py-2.5 px-3" placeholder="Zde nám můžete nechat vzkaz..."></textarea>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-brand-navy text-xl mb-4">Doprava</h3>
                            <div className="space-y-3">
                                <RadioCard title="Zásilkovna - Výdejní místo" price="79 Kč" checked={shippingMethod === 'zasilkovna'} onChange={() => setShippingMethod('zasilkovna')} />
                                {shippingMethod === 'zasilkovna' && (
                                    <div className="ml-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between">
                                        <div className="text-sm font-medium text-brand-navy">{packetaPoint ? packetaPoint.name : 'Není vybráno místo'}</div>
                                        <button type="button" onClick={openPacketaWidget} className="text-xs font-bold text-brand-primary underline uppercase">{packetaPoint ? 'Změnit' : 'Vybrat'}</button>
                                    </div>
                                )}
                                <RadioCard title="Česká pošta" price="119 Kč" checked={shippingMethod === 'posta'} onChange={() => setShippingMethod('posta')} />
                                <RadioCard title="Osobní odběr Turnov" price="Zdarma" checked={shippingMethod === 'osobne'} onChange={() => setShippingMethod('osobne')} />
                                {formErrors.shipping && <p className="text-red-500 text-xs mt-1">{formErrors.shipping}</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-brand-navy text-xl mb-4">Platba</h3>
                            <div className="space-y-3">
                                <RadioCard title="Bankovní převod" price="Zdarma" checked={paymentMethod === 'prevodem'} onChange={() => setPaymentMethod('prevodem')} />
                                <RadioCard title="Dobírka" price="30 Kč" checked={paymentMethod === 'dobirka'} onChange={() => setPaymentMethod('dobirka')} />
                                {formErrors.payment && <p className="text-red-500 text-xs mt-1">{formErrors.payment}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 mt-12 lg:mt-0">
                        <div className="bg-gray-50 p-8 rounded-3xl sticky top-24 border border-gray-200 shadow-xl">
                            <h3 className="font-black text-2xl mb-6 text-brand-navy border-b pb-4">Souhrn</h3>
                            <div className="divide-y divide-gray-200 overflow-y-auto max-h-[300px]">
                                {items.map(item => (
                                    <div key={item.id} className="py-4 flex justify-between text-sm items-start">
                                        <div><p className="font-bold">{item.product.name}</p><p className="text-xs text-gray-500">{item.quantity}x {item.price} Kč</p></div>
                                        <span className="font-black text-brand-navy">{item.price * item.quantity} Kč</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 mt-6 space-y-4">
                                <div className="flex justify-between font-bold text-xl pt-4 text-brand-primary border-t border-brand-primary/10 mt-4">
                                    <span>Celkem</span>
                                    <span>{total} Kč</span>
                                </div>
                                <p className="text-[10px] text-gray-400 text-right uppercase tracking-widest font-bold">Nejsme plátci DPH</p>
                            </div>
                            
                            <div className="mt-10 space-y-6">
                                <div className="space-y-4">
                                    <label className="flex items-start cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={agreedToTerms} 
                                            onChange={(e) => setAgreedToTerms(e.target.checked)} 
                                            className="mt-1 h-5 w-5 text-brand-primary rounded border-gray-300 focus:ring-brand-primary" 
                                        />
                                        <span className="ml-3 text-sm text-gray-800 leading-tight">
                                            <strong>Souhlasím s</strong> <Link to="/obchodni-podminky" className="text-brand-primary underline hover:text-blue-700" target="_blank">obchodními podmínkami</Link> *
                                        </span>
                                    </label>
                                    
                                    <label className="flex items-start cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={marketingConsent} 
                                            onChange={(e) => setMarketingConsent(e.target.checked)} 
                                            className="mt-1 h-5 w-5 text-brand-primary rounded border-gray-300 focus:ring-brand-primary" 
                                        />
                                        <span className="ml-3 text-sm text-gray-400 leading-tight">
                                            Souhlasím se zveřejněním produktů pro reklamní účely (např. na sociálních sítích)
                                        </span>
                                    </label>
                                </div>
                                
                                {formErrors.terms && <p className="text-red-600 text-xs font-bold text-center">{formErrors.terms}</p>}
                                
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-lg uppercase"
                                >
                                    {isSubmitting ? 'Zpracovávám...' : 'Odeslat objednávku'}
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
