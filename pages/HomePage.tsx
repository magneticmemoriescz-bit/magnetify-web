
import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { HOW_IT_WORKS_STEPS } from '../constants';
import { ProductCard } from '../components/ProductCard';

const HomePage: React.FC = () => {
    const { products } = useProducts();

    return (
        <>
            {/* Hero Section with Magnetic Induction Lines */}
            <section className="relative bg-brand-navy flex items-center min-h-[600px] text-white overflow-hidden">
                 {/* Abstract Magnetic Field Background */}
                 <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-brand-navy"></div>
                    <svg className="absolute w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Left Pole Radiating Lines */}
                        <path d="M-20,50 C20,20 50,0 100,0" stroke="#00E0FF" strokeWidth="0.2" fill="none" />
                        <path d="M-20,50 C20,30 60,10 120,10" stroke="#0066FF" strokeWidth="0.2" fill="none" />
                        <path d="M-20,50 C30,50 70,50 120,50" stroke="#00E0FF" strokeWidth="0.2" fill="none" />
                        <path d="M-20,50 C20,70 60,90 120,90" stroke="#0066FF" strokeWidth="0.2" fill="none" />
                        <path d="M-20,50 C20,80 50,100 100,100" stroke="#00E0FF" strokeWidth="0.2" fill="none" />
                        
                        {/* Curved Field Lines */}
                        <path d="M0,20 Q50,50 100,20" stroke="#0066FF" strokeWidth="0.1" fill="none" />
                        <path d="M0,80 Q50,50 100,80" stroke="#0066FF" strokeWidth="0.1" fill="none" />
                        <path d="M10,10 Q50,60 90,10" stroke="#00E0FF" strokeWidth="0.1" fill="none" opacity="0.5"/>
                        <path d="M10,90 Q50,40 90,90" stroke="#00E0FF" strokeWidth="0.1" fill="none" opacity="0.5"/>

                        {/* Dynamic Accents */}
                        <circle cx="20" cy="50" r="0.5" fill="#00E0FF" opacity="0.8" />
                        <circle cx="80" cy="20" r="0.8" fill="#0066FF" opacity="0.6" />
                        <circle cx="60" cy="80" r="0.6" fill="#00E0FF" opacity="0.4" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-transparent to-brand-navy/50"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/20 via-transparent to-brand-navy"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                            Magnetická reklama, která <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary">zaujme.</span>
                        </h1>
                        <p className="mt-6 text-xl text-gray-200 leading-relaxed font-light">
                            <span className="font-semibold text-white">Marketing, který zaujme a drží.</span> Tisk na míru pro živnostníky i korporace.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link to="/produkty" className="inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:brightness-110 shadow-lg shadow-brand-primary/40 transition-all transform hover:scale-105 md:py-4 md:text-lg md:px-10">
                                Prohlédnout produkty
                            </Link>
                            <Link to="/jak-to-funguje" className="inline-flex justify-center items-center px-8 py-3 border-2 border-brand-accent text-base font-bold rounded-full text-brand-accent hover:bg-brand-accent hover:text-brand-navy transition-all md:py-4 md:text-lg md:px-10">
                                Jak to funguje
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* B2B Benefits */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-brand-navy mb-2">Netradiční formát</h3>
                            <p className="text-gray-600">Obyčejnou vizitku každý dostal již tolikrát, že už nikoho nezaujme. Magnetická vizitka nebo kalendář ale zaujme díky své originalitě i praktičnosti.</p>
                        </div>
                        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-brand-navy mb-2">Zapamatovatelnost</h3>
                            <p className="text-gray-600">Magnetická vizitka neskončí v koši. Klienti si ji dají na lednici nebo magnetickou nástěnku a mají vás stále na očích.</p>
                        </div>
                        <div className="p-8 bg-blue-50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow">
                            <h3 className="text-xl font-bold text-brand-navy mb-2">Množstevní slevy</h3>
                            <p className="text-gray-600">Vybavte celou firmu nebo připravte merch na veletrh. Nabízíme výhodné ceny pro větší odběry.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Overview Section */}
            <section className="py-16 sm:py-24 bg-light-gray">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent tracking-wide uppercase">Portfolio</h2>
                        <p className="mt-1 text-3xl font-extrabold text-dark-gray sm:text-4xl">Řešení pro vaši firmu</p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-8">
                        {products.map((product, index) => (
                            <div key={product.id} className="w-full max-w-sm flex">
                                <ProductCard product={product} index={index} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-dark-gray">Realizace zakázky</h2>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">Zvládneme kusovou výrobu i tisíce kusů pro vaši kampaň.</p>
                    </div>
                    <div className="mt-16 grid md:grid-cols-4 gap-10">
                        {HOW_IT_WORKS_STEPS.map((step, index) => (
                             <div key={index} className="text-center group">
                                 <div className="flex items-center justify-center h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary to-brand-navy text-white shadow-lg group-hover:scale-110 transition-transform">
                                     {step.icon}
                                 </div>
                                 <h3 className="mt-6 text-lg font-bold text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-sm text-gray-500">{step.description}</p>
                             </div>
                        ))}
                    </div>
                    
                    <div className="mt-16 text-center">
                        <Link to="/kontakt" className="inline-flex items-center text-brand-primary font-bold hover:text-brand-navy transition-colors text-lg">
                            Potřebujete individuální kalkulaci? Napište nám <span aria-hidden="true" className="ml-2">&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;
