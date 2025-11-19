
import React from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';
import { SEO } from '../components/SEO';

const ProductsPage: React.FC = () => {
    const { products } = useProducts();
    return (
        <div className="bg-white">
             <SEO title="Produkty | Magnetify.cz" description="Prohlédněte si naši nabídku magnetických reklamních předmětů." />
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-dark-gray text-center">Všechny produkty</h1>
                {/* FIX: Changed from grid to a centered flex layout */}
                <div className="mt-12 flex flex-wrap justify-center gap-8">
                    {products.map((product, index) => (
                        <div key={product.id} className="w-full max-w-sm flex">
                            <ProductCard product={product} index={index} />
                        </div>
                    ))}
                </div>

                 {/* Cross-promotion Banner */}
                 <div className="mt-20 text-center border-t border-gray-200 pt-10 max-w-2xl mx-auto">
                    <p className="text-gray-600 mb-3">Hledáte originální fotodárky pro své blízké?</p>
                    <a href="https://www.magneticmemories.cz" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-lg font-medium text-brand-primary hover:text-brand-navy hover:underline transition-colors">
                        Podívejte se i na <span className="font-bold">Magnetic Memories</span> &rarr;
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
