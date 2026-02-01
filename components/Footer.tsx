import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS, FOOTER_INFO_LINKS, FOOTER_LEGAL_LINKS } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2">
                <img 
                    src="https://i.imgur.com/b4WFqRi.png" 
                    alt="Magnetic Memories" 
                    className="h-16 md:h-24 w-auto object-contain" 
                />
                <p className="mt-4 text-gray-400 text-base max-w-sm">
                    Marketing, který zaujme a drží.
                </p>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Navigace</h3>
                <ul className="mt-4 space-y-4">
                    {NAV_LINKS.map(link => (
                        <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Informace</h3>
                <ul className="mt-4 space-y-4">
                    {FOOTER_INFO_LINKS.map(link => (
                        <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                    {FOOTER_LEGAL_LINKS.map(link => (
                         <li key={link.name}>
                            <Link to={link.path} className="text-base text-gray-300 hover:text-white">
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-base text-gray-500 text-center sm:text-left">&copy; {new Date().getFullYear()} Magnetic Memories. Všechna práva vyhrazena.</p>
             <div className="text-center sm:text-right mt-4 sm:mt-0">
                <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">Administrace</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};
