import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const imageClass = "w-full h-full object-center object-cover group-hover:opacity-90 transition-opacity";
  
  // Logic to alternate styles based on index
  const isGradient = index % 2 === 0;

  const buttonBaseClass = "text-center block w-full py-3 px-4 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-brand-primary/50 rounded-full transform hover:scale-105 duration-300";
  
  const buttonClass = isGradient
    ? `${buttonBaseClass} text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:brightness-110 shadow-lg shadow-brand-primary/30 border border-transparent`
    : `${buttonBaseClass} text-brand-primary bg-white border-2 border-brand-primary hover:bg-brand-primary hover:text-white shadow-sm hover:shadow-md`;

  const isPerPiece = product.id === 'promo-magnets' || product.id === 'magnetic-business-cards';

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col w-full">
      <div className="w-full h-64 bg-gray-100 overflow-hidden relative">
        <img src={product.imageUrl} alt={product.name} className={imageClass} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
          <Link to={`/produkty/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.shortDescription}</p>
        <p className="mt-4 text-2xl font-bold text-brand-navy">
          {product.price} Kč 
          {isPerPiece && <span className="text-xs text-gray-500 ml-1 font-medium italic">/ kus</span>}
          <span className="text-xs text-gray-400 font-normal ml-2">bez DPH</span>
        </p>
      </div>
      <div className='p-6 pt-0'>
        <Link 
            to={`/produkty/${product.id}`} 
            className={buttonClass}
        >
            Detail produktu
        </Link>
      </div>
    </div>
  );
};
