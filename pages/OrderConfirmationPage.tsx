
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { CartItem } from '../types';
import { SEO } from '../components/SEO';
import { Helmet } from 'react-helmet-async';

interface OrderDetails {
    contact: { [key: string]: string };
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

const OrderConfirmationPage: React.FC = () => {
    const location = useLocation();
    const order = location.state?.order as OrderDetails | undefined;

    if (!order) {
        return <Navigate to="/" replace />;
    }

    return (
        <PageWrapper title="Objednávka přijata">
            <SEO title="Objednávka přijata" description="Potvrzení Vaší objednávky." />
            {/* Prevent search engines from indexing the thank you page */}
            <Helmet>
                <meta name="robots" content="noindex" />
            </Helmet>

            <div className="text-center py-10 px-6 bg-green-50 rounded-lg border border-green-100">
                <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-3xl font-bold text-dark-gray">Děkujeme za důvěru!</h3>
                <p className="mt-2 text-gray-600 max-w-lg mx-auto">
                    Vaše objednávka č. <strong className="text-dark-gray">{order.orderNumber}</strong> byla úspěšně zaevidována. Potvrzení a souhrn jsme Vám odeslali na email.
                </p>
            </div>

            {order.payment === 'prevodem' && (
                <div className="mt-10 max-w-lg mx-auto bg-white p-8 rounded-lg shadow border border-gray-200">
                    <h3 className="text-xl font-bold text-dark-gray text-center mb-6 border-b pb-4">Platební instrukce</h3>
                    <div className="space-y-4 text-center">
                        <p className="text-gray-600">Pro zahájení výroby prosím uhraďte zálohovou fakturu.</p>
                        <div className="grid grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded">
                            <p className="text-sm text-gray-500">Číslo účtu:</p>
                            <p className="text-base font-mono font-bold text-dark-gray text-right">3524601011/3030</p>
                            
                            <p className="text-sm text-gray-500">Částka:</p>
                            <p className="text-base font-bold text-brand-primary text-right">{order.total} Kč</p>
                            
                            <p className="text-sm text-gray-500">Var. symbol:</p>
                            <p className="text-base font-mono font-bold text-dark-gray text-right">{order.orderNumber}</p>
                        </div>
                    </div>
                </div>
            )}
             <div className="text-center mt-10">
                <Link to="/" className="inline-block bg-brand-navy text-white font-bold py-3 px-8 rounded-md shadow hover:bg-gray-800 transition-colors">
                    Zpět na hlavní stránku
                </Link>
            </div>
        </PageWrapper>
    );
};

export default OrderConfirmationPage;
