
import React from 'react';
import { Link } from 'react-router-dom';
import { HOW_IT_WORKS_STEPS } from '../constants';

const HowItWorksPage: React.FC = () => {
    // Updated to use brand colors (Navy -> Primary -> Accent -> Navy)
    const iconColors = ['bg-brand-navy', 'bg-brand-primary', 'bg-brand-accent', 'bg-dark-gray'];
    
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base font-semibold text-brand-primary tracking-wide uppercase">Jak to funguje</h2>
                    <p className="mt-1 text-4xl font-extrabold text-dark-gray sm:text-5xl sm:tracking-tight lg:text-6xl">Vaše reklama ve 4 krocích</p>
                    <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">Celý proces od výběru po objednávku je rychlý a efektivní.</p>
                </div>
                <div className="mt-20 grid md:grid-cols-2 gap-16">
                    {HOW_IT_WORKS_STEPS.map((step, index) => (
                         <div key={index} className="flex space-x-6 items-center">
                             <div className={`flex-shrink-0 flex items-center justify-center h-20 w-20 rounded-full ${iconColors[index % iconColors.length]} text-white shadow-lg`}>
                                 {step.icon}
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold text-dark-gray">{step.title}</h3>
                                 <p className="mt-2 text-base text-gray-500">{step.description}</p>
                             </div>
                         </div>
                    ))}
                </div>
                
                <div className="mt-20 text-center">
                    <Link to="/produkty" className="inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/50">
                        OBJEDNAT TISK
                    </Link>
                </div>

                <div className="mt-24 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-dark-gray">Proč zvolit magnetickou reklamu?</h2>
                    
                    <div className="mt-12 text-left grid md:grid-cols-2 gap-12 items-start">
                        <div>
                            <h3 className="text-xl font-bold text-dark-gray">Flexibilita a mobilita</h3>
                            <p className="mt-2 text-gray-600">
                                Označte své firemní vozy během pracovní doby a o víkendu je používejte soukromě bez reklam. Magnetické logo nasadíte i sundáte během vteřiny.
                            </p>
                        </div>
                        <div>
                             <h3 className="text-xl font-bold text-dark-gray">Trvalá viditelnost u klienta</h3>
                            <p className="mt-2 text-gray-600">
                                Papírové vizitky se ztrácejí. Magnetická vizitka zůstává na očích – na lednici v kuchyňce, na digestoři nebo na magnetické tabuli v kanceláři.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 text-left">
                        <h3 className="text-xl font-bold text-dark-gray text-center mb-6">Ideální řešení pro</h3>
                        <ul className="list-disc pl-6 space-y-4 max-w-2xl mx-auto text-gray-600">
                            <li><strong>Živnostníky a řemeslníky:</strong> Rychlé označení vozu a zapamatovatelné vizitky.</li>
                            <li><strong>Firmy s vozovým parkem:</strong> Jednotný branding, který lze snadno měnit.</li>
                            <li><strong>Marketingové kampaně:</strong> Rozdávací předměty na veletrhy, které lidé nevyhodí.</li>
                            <li><strong>Věrnostní programy:</strong> Drobné dárky pro stálé zákazníky.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold text-dark-gray">Připraveni zviditelnit svou firmu?</h3>
                    <p className="mt-2 text-gray-600">Nahrajte svá data a my se postaráme o zbytek.</p>
                    <Link to="/produkty" className="mt-8 inline-block bg-gradient-to-r from-brand-navy via-brand-primary to-brand-accent text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/50">
                        CHCI OBJEDNAT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;
