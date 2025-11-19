
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
}

const CheckoutPage: React.FC = () => {
    const { state, dispatch } = useCart();
    const { items } = state;
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    
    // Toggle for Company Purchase - Default is TRUE as requested
    const [isCompany, setIsCompany] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        zip: '',
        additionalInfo: '',
        // Company fields
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
        'zasilkovna': 79, // Updated price slightly
        'posta': 119,
        'osobne': 0
    };
    const paymentCosts: { [key: string]: number } = {
        'prevodem': 0,
        'faktura': 0,
        'dobirka': 30,
        // Gopay removed
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
            if (lastSequence) {
                sequence = parseInt(lastSequence, 10) + 1;
            }
            localStorage.setItem(storageKey, sequence.toString());
        } catch (error) {
            console.error("Could not access localStorage for order sequence.", error);
        }
        
        const sequenceString = sequence.toString().padStart(3, '0');
        return `${datePrefix}${sequenceString}`;
    };

    const sendEmailNotifications = async (order: OrderDetails) => {
        const vs = order.orderNumber;
        const invoiceNoticeHtml = `<p style="margin-top:20px; color: #555;">Daňový doklad (fakturu) Vám zašleme elektronicky po vyřízení objednávky.</p>`;
        
        let paymentDetailsHtml = '';
        if (order.payment === 'prevodem') {
            paymentDetailsHtml = `
                <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h2 style="border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px;">Platební údaje (Zálohová faktura)</h2>
                    <p>Prosím uhraďte částku <strong>${order.total} Kč</strong>.</p>
                    <table style="width: 100%; max-width: 400px; margin: 20px auto; text-align: left;">
                       <tr><td style="padding: 5px;">Číslo účtu:</td><td style="padding: 5px; font-weight: bold;">3524601011/3030</td></tr>
                       <tr><td style="padding: 5px;">Částka:</td><td style="padding: 5px; font-weight: bold;">${order.total} Kč</td></tr>
                       <tr><td style="padding: 5px;">Variabilní symbol:</td><td style="padding: 5px; font-weight: bold;">${vs}</td></tr>
                    </table>
                </div>`;
        } else if (order.payment === 'faktura') {
             paymentDetailsHtml = `
                <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                    <h2 style="border-bottom: 2px solid #1e293b; padding-bottom: 10px; margin-bottom: 20px;">Platba na fakturu</h2>
                    <p>Fakturu se splatností Vám zašleme společně s expedicí zboží.</p>
                </div>`;
        }
        
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price * item.quantity} Kč</td>
            </tr>`).join('');
        
        const shippingMethodMap: {[key: string]: string} = { zasilkovna: 'Zásilkovna', posta: 'Česká pošta', osobne: 'Osobní odběr'};
        const paymentMethodMap: {[key: string]: string} = { prevodem: 'Bankovním převodem', dobirka: 'Na dobírku', faktura: 'Na fakturu (splatnost)'};
        const additionalInfoHtml = order.contact.additionalInfo ? `<h3 style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">Poznámka k objednávce:</h3><p style="padding: 10px; background-color: #f9f9f9; border-radius: 8px;">${order.contact.additionalInfo.replace(/\n/g, '<br>')}</p>` : '';
        
        // Construct address block with optional company info
        let addressBlock = `<strong>${order.contact.firstName} ${order.contact.lastName}</strong><br>`;
        if (order.company.isCompany) {
            addressBlock += `<strong>${order.company.companyName}</strong><br>IČO: ${order.company.ico}<br>${order.company.dic ? `DIČ: ${order.company.dic}<br>` : ''}`;
        }
        addressBlock += `${order.contact.street}<br>${order.contact.zip} ${order.contact.city}`;

        let customerShippingAddressHtml = `<p><strong>Fakturační údaje:</strong><br>${addressBlock}</p>`;
        
        if (order.shipping === 'zasilkovna' && order.packetaPoint) {
            customerShippingAddressHtml += `<p><strong>Výdejní místo (Zásilkovna):</strong><br>${order.packetaPoint.name}<br>${order.packetaPoint.street}, ${order.packetaPoint.city}</p>`;
        }
        
        const customerParams = {
            from_name: 'Magnetify.cz',
            from_email: 'objednavky@magnetify.cz',
            subject_line: `Potvrzení objednávky č. ${order.orderNumber} - Magnetify.cz`,
            to_email: order.contact.email,
            customer_email: order.contact.email,
            email: order.contact.email,
            to_name: `${order.contact.firstName} ${order.contact.lastName}`,
            reply_to: 'objednavky@magnetify.cz',
            order_number: order.orderNumber,
            first_name: order.contact.firstName,
            items_html: itemsHtml,
            subtotal: order.subtotal,
            shipping_cost: order.shippingCost,
            payment_cost: order.paymentCost,
            total: order.total,
            photos_confirmation_html: '', // Removed specific photo confirmation text, generic is fine
            payment_details_html: paymentDetailsHtml + invoiceNoticeHtml,
            shipping_method: shippingMethodMap[order.shipping],
            shipping_address_html: customerShippingAddressHtml,
        };
        
         const ownerPhotosHtml = order.items
            .filter(item => item.photos && item.photos.length > 0)
            .map(item => {
                const photoListHtml = `<ol style="margin-top: 10px; padding-left: 20px; font-size: 13px; color: #555; line-height: 1.6;">` +
                    item.photos.map((photo, index) => `<li><strong>${index + 1}.</strong> <a href="${photo.url}" target="_blank">${photo.name || 'Soubor'}</a></li>`).join('') +
                    `</ol>`;

                // Use the photoGroupId if available (from Uploadcare) for the group link
                const photoManagementHtml = item.photoGroupId 
                    ? `<p style="margin-top: 15px;">
                        <a href="https://uploadcare.com/app/projects/85038abaf5d3d8c4b919/groups/${item.photoGroupId}/" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
                            Otevřít skupinu v Uploadcare
                        </a>
                       </p>`
                    : ``;

                return `
                    <div style="padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px; background-color: #fafafa;">
                        <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
                            Podklady pro: ${item.product.name} ${item.variant ? `(${item.variant.name})` : ''}
                        </h4>
                        ${photoListHtml}
                        ${photoManagementHtml}
                    </div>`;
            }).join('');

        const ownerPhotosSectionHtml = ownerPhotosHtml ? 
            `<div style="margin-top: 20px;">
                <h2 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Tisková data</h2>
                ${ownerPhotosHtml}
             </div>`
            : '';
        
        const ownerParams = {
            to_email: 'objednavky@magnetify.cz', // Added explicit recipient for admin emails
            email: 'objednavky@magnetify.cz',    // Fallback param often used
            reply_to: order.contact.email,       // Allow replying directly to customer
            from_name: 'Magnetify.cz Objednávky',
            from_email: 'objednavky@magnetify.cz',
            subject_line: `Nová objednávka č. ${order.orderNumber} (${order.company.isCompany ? order.company.companyName : order.contact.lastName})`,
            order_number: order.orderNumber,
            customer_name: `${order.contact.firstName} ${order.contact.lastName}`,
            customer_email: order.contact.email,
            shipping_details_html: customerShippingAddressHtml, // Reusing the formatted block
            payment_method: paymentMethodMap[order.payment],
            items_html_with_total: `
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead><tr><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: left;">Produkt</th><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: center;">Ks</th><th style="padding: 10px; border-bottom: 1px solid #ddd; background-color: #f9f9f9; text-align: right;">Cena</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <div style="text-align: right; margin-top: 10px;">
                    <p>Mezisoučet: ${order.subtotal} Kč</p>
                    <p>Doprava: ${order.shippingCost} Kč</p>
                    <p>Platba: ${order.paymentCost} Kč</p>
                    <h3 style="margin-top: 5px;">Celkem: ${order.total} Kč</h3>
                </div>`,
            photos_html: ownerPhotosSectionHtml,
            additional_info_html: additionalInfoHtml,
            invoice_html: invoiceNoticeHtml,
        };
        
        // We use Promise.allSettled to attempt both emails regardless if one fails
        const results = await Promise.allSettled([
            window.emailjs.send('service_rvzivlq', 'template_n389n7r', ownerParams),
            window.emailjs.send('service_rvzivlq', 'template_wgg5k5o', customerParams)
        ]);
        
        // Check if at least one failed and log it, but don't throw main error unless everything fails if you want strictness
        const rejected = results.filter(r => r.status === 'rejected');
        if (rejected.length > 0) {
            console.warn("Some emails failed to send:", rejected);
            throw new Error("Nepodařilo se odeslat některé potvrzovací emaily.");
        }
    };
    
    const triggerMakeWebhook = async (order: OrderDetails) => {
        if (!MAKE_WEBHOOK_URL) return;

        // Create a clean payload for Fakturoid via Make
        const invoiceItems = order.items.map(item => ({
            name: `${item.product.name}${item.variant ? ` - ${item.variant.name}` : ''}`,
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.price) || 0,
        }));

        if (order.shippingCost > 0) {
            invoiceItems.push({
                name: 'Doprava',
                quantity: 1,
                unit_price: Number(order.shippingCost),
            });
        }

        if (order.paymentCost > 0) {
            invoiceItems.push({
                name: 'Platba',
                quantity: 1,
                unit_price: Number(order.paymentCost),
            });
        }

        // Structured payload for easy mapping in Make.com
        const payload = {
            orderNumber: order.orderNumber,
            created: new Date().toISOString(),
            email: order.contact.email,
            // Billing object - Use this for Fakturoid Invoice Address
            billing: {
                name: order.company.isCompany ? order.company.companyName : `${order.contact.firstName} ${order.contact.lastName}`,
                street: order.contact.street,
                city: order.contact.city,
                zip: order.contact.zip,
                country: 'CZ',
                ico: order.company.isCompany ? order.company.ico.trim() : '',
                dic: order.company.isCompany ? order.company.dic.trim() : '',
                isCompany: order.company.isCompany
            },
            // Contact person object - Use this for "Contact Person" in CRM
            contactPerson: {
                firstName: order.contact.firstName,
                lastName: order.contact.lastName,
                email: order.contact.email
            },
            shipping: {
                method: order.shipping,
                cost: order.shippingCost,
                packetaPoint: order.packetaPoint ? {
                    id: order.packetaPoint.id,
                    name: order.packetaPoint.name,
                    street: order.packetaPoint.street
                } : null
            },
            payment: {
                method: order.payment,
                cost: order.paymentCost
            },
            items: invoiceItems,
            total: order.total,
            note: order.contact.additionalInfo
        };
        
        // Return the fetch promise so we can await it
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
        if (!data.street) errors.street = 'Ulice je povinná.';
        if (!data.city) errors.city = 'Město je povinné.';
        if (!data.zip) errors.zip = 'PSČ je povinné.';
        
        // Company validation
        if (isCompany) {
            if (!data.companyName) errors.companyName = 'Název firmy je povinný.';
            if (!data.ico) errors.ico = 'IČO je povinné.';
        }

        if (!shippingMethod) errors.shipping = 'Vyberte způsob dopravy.';
        if (shippingMethod === 'zasilkovna' && !packetaPoint) errors.packetaPoint = 'Vyberte výdejní místo.';
        if (!paymentMethod) errors.payment = 'Vyberte způsob platby.';
        
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            setIsSubmitting(true);
            setSubmitError('');
            
            const orderNumber = generateOrderNumber();
            
            const orderDetails: OrderDetails = {
                contact: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    street: data.street,
                    city: data.city,
                    zip: data.zip,
                    additionalInfo: data.additionalInfo
                },
                company: {
                    isCompany,
                    companyName: data.companyName,
                    ico: data.ico,
                    dic: data.dic
                },
                shipping: shippingMethod!,
                payment: paymentMethod!,
                packetaPoint: packetaPoint,
                items: items,
                total: total,
                subtotal: subtotal,
                shippingCost: shippingCost,
                paymentCost: paymentCost,
                orderNumber: orderNumber
            };
            
            try {
                // 1. Trigger Make Webhook FIRST (Critical Data Persistence)
                try {
                    await triggerMakeWebhook(orderDetails);
                } catch (webhookError) {
                    console.error("Make webhook failed:", webhookError);
                    // We continue even if webhook fails, but we log it. 
                    // Ideally, we would want to retry this server-side, but client-side we proceed.
                }

                // 2. Send Email Notifications (Secondary)
                // We wrap this in a separate try-catch so email failure doesn't block the success page
                try {
                    await sendEmailNotifications(orderDetails);
                } catch (emailError) {
                    console.error("Email notifications failed:", emailError);
                    // Notification failure shouldn't stop the checkout flow if order data was attempted
                }
                
                // 3. Clear Cart and Redirect
                dispatch({ type: 'CLEAR_CART' });
                navigate('/dekujeme', { state: { order: orderDetails } });

            } catch (error: any) {
                // This catch block is now less likely to be hit for external service errors 
                // unless something fundamental breaks in logic above
                console.error("Order processing critical failure:", error);
                setSubmitError(`Něco se pokazilo. Prosím, kontaktujte nás telefonicky nebo emailem.`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };
    
    if (items.length === 0) {
        return (
            <PageWrapper title="Nákupní košík">
                <div className="text-center py-10">
                    <p className="text-lg text-gray-600">Váš košík je prázdný.</p>
                    <Link to="/produkty" className="mt-6 inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                        Zpět k produktům
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-3xl font-extrabold tracking-tight text-dark-gray text-center mb-12">Dokončení poptávky / objednávky</h1>
                <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start xl:gap-x-16">
                    <section aria-labelledby="cart-heading" className="lg:col-span-7 bg-white p-8 rounded-lg shadow border border-gray-200">
                        
                        {/* Company Toggle */}
                        <div className="mb-8 flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="flex items-center">
                                <input
                                    id="is-company"
                                    name="is-company"
                                    type="checkbox"
                                    checked={isCompany}
                                    onChange={(e) => setIsCompany(e.target.checked)}
                                    className="h-5 w-5 text-brand-primary focus:ring-brand-primary border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="is-company" className="ml-3 block text-base font-medium text-dark-gray cursor-pointer select-none">
                                    Nakupuji na firmu (zadat IČO)
                                </label>
                            </div>
                        </div>

                        {/* Company Details (Conditional) */}
                        {isCompany && (
                            <div className="mb-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 p-4 border border-brand-primary/20 bg-blue-50/50 rounded-md">
                                <div className="sm:col-span-2">
                                    <FormInput name="companyName" label="Název firmy" value={formData.companyName} onChange={handleFormChange} error={formErrors.companyName} required />
                                </div>
                                <FormInput name="ico" label="IČO" value={formData.ico} onChange={handleFormChange} error={formErrors.ico} required />
                                <FormInput name="dic" label="DIČ (volitelné)" value={formData.dic} onChange={handleFormChange} />
                            </div>
                        )}

                        <h2 className="text-xl font-bold text-dark-gray mb-6">Fakturační a kontaktní údaje</h2>
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <FormInput name="firstName" label="Jméno kontaktní osoby" value={formData.firstName} onChange={handleFormChange} error={formErrors.firstName} required />
                            <FormInput name="lastName" label="Příjmení" value={formData.lastName} onChange={handleFormChange} error={formErrors.lastName} required />
                            <div className="sm:col-span-2">
                                <FormInput name="email" label="Email" type="email" value={formData.email} onChange={handleFormChange} error={formErrors.email} required />
                            </div>
                             <div className="sm:col-span-2">
                                <FormInput name="street" label="Ulice a č.p." value={formData.street} onChange={handleFormChange} error={formErrors.street} required />
                            </div>
                            <FormInput name="city" label="Město" value={formData.city} onChange={handleFormChange} error={formErrors.city} required />
                            <FormInput name="zip" label="PSČ" value={formData.zip} onChange={handleFormChange} error={formErrors.zip} required />
                        </div>
                        
                        <div className="mt-8">
                            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">Poznámka k objednávce</label>
                            <textarea id="additionalInfo" name="additionalInfo" rows={2} value={formData.additionalInfo} onChange={handleFormChange} className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm border-gray-300 placeholder-gray-400 bg-white"></textarea>
                        </div>
                        
                        <div className="mt-10">
                            <h2 className="text-xl font-bold text-dark-gray mb-4">Doprava</h2>
                            <div className="space-y-3">
                               <RadioCard name="shipping" value="zasilkovna" checked={shippingMethod === 'zasilkovna'} onChange={() => { setShippingMethod('zasilkovna'); setFormErrors(p => ({...p, shipping: ''})) }} title="Zásilkovna - Výdejní místo" price={`${shippingCosts.zasilkovna} Kč`} />
                                {shippingMethod === 'zasilkovna' && (
                                    <div className="pl-4 pb-2">
                                        <button type="button" onClick={openPacketaWidget} className="text-brand-primary font-medium hover:underline">
                                            {packetaPoint ? 'Změnit výdejní místo' : 'Vybrat výdejní místo'}
                                        </button>
                                        {packetaPoint && <p className="mt-1 text-sm text-gray-700 font-medium">{packetaPoint.name}, {packetaPoint.street}, {packetaPoint.city}</p>}
                                        {formErrors.packetaPoint && <p className="text-sm text-red-500 mt-1">{formErrors.packetaPoint}</p>}
                                    </div>
                                )}
                                <RadioCard name="shipping" value="posta" checked={shippingMethod === 'posta'} onChange={() => { setShippingMethod('posta'); setFormErrors(p => ({...p, shipping: ''})) }} title="Česká pošta - Balík Do ruky" price={`${shippingCosts.posta} Kč`} />
                                <RadioCard name="shipping" value="osobne" checked={shippingMethod === 'osobne'} onChange={() => { setShippingMethod('osobne'); setFormErrors(p => ({...p, shipping: ''})) }} title="Osobní odběr - Turnov" price="Zdarma" />
                                {formErrors.shipping && <p className="text-sm text-red-500">{formErrors.shipping}</p>}
                            </div>
                        </div>

                        <div className="mt-10">
                             <h2 className="text-xl font-bold text-dark-gray mb-4">Platba</h2>
                             <div className="space-y-3">
                                <RadioCard name="payment" value="prevodem" checked={paymentMethod === 'prevodem'} onChange={() => { setPaymentMethod('prevodem'); setFormErrors(p => ({...p, payment: ''})) }} title="Bankovním převodem (Zálohová faktura)" price="Zdarma" />
                                <RadioCard name="payment" value="faktura" checked={paymentMethod === 'faktura'} onChange={() => { setPaymentMethod('faktura'); setFormErrors(p => ({...p, payment: ''})) }} title="Na fakturu (pro smluvní partnery)" price="Zdarma" />
                                <RadioCard name="payment" value="dobirka" checked={paymentMethod === 'dobirka'} onChange={() => { setPaymentMethod('dobirka'); setFormErrors(p => ({...p, payment: ''})) }} title="Na dobírku" price={`${paymentCosts.dobirka} Kč`} />
                                {formErrors.payment && <p className="text-sm text-red-500">{formErrors.payment}</p>}
                            </div>
                        </div>

                    </section>
                    
                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-16 bg-gray-50 rounded-lg shadow border border-gray-200 px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5">
                        <h2 id="summary-heading" className="text-xl font-bold text-dark-gray">Souhrn objednávky</h2>
                        <ul role="list" className="mt-6 divide-y divide-gray-200">
                            {items.map(item => (
                                <li key={item.id} className="flex py-6 space-x-4">
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover object-center"/>
                                    </div>
                                    <div className="flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3>{item.product.name}</h3>
                                                <p className="ml-4 whitespace-nowrap">{item.price * item.quantity} Kč</p>
                                            </div>
                                            {item.variant && <p className="mt-1 text-sm text-gray-500">{item.variant.name}</p>}
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center border border-gray-300 rounded-md bg-white">
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                                                <span className="px-2 font-medium">{item.quantity}</span>
                                                <button type="button" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveItem(item.id)} className="font-medium text-brand-primary hover:text-brand-navy">Odstranit</button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Mezisoučet</dt><dd className="text-sm font-medium text-dark-gray">{subtotal} Kč</dd></div>
                            <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Doprava</dt><dd className="text-sm font-medium text-dark-gray">{shippingCost} Kč</dd></div>
                             <div className="flex items-center justify-between"><dt className="text-sm text-gray-600">Platba</dt><dd className="text-sm font-medium text-dark-gray">{paymentCost} Kč</dd></div>
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4"><dt className="text-lg font-bold text-dark-gray">Celkem</dt><dd className="text-lg font-bold text-brand-primary">{total} Kč</dd></div>
                        </dl>
                        
                        <div className="mt-6">
                            {submitError && <p className="text-red-600 text-sm text-center mb-4 bg-red-50 p-2 rounded border border-red-200">{submitError}</p>}
                            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-primary border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isSubmitting ? 'Zpracovávám...' : 'Závazně objednat'}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;

