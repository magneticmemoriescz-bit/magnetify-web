
import React from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductCard } from '../components/ProductCard';

const ProductsPage: React.FC = () => {
    const { products } = useProducts();
    return (
        <div className="bg-white">
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
                <div className="mt-16 text-center border-t border-gray-200 pt-8">
                     <p className="text-gray-600 text-lg">
                        Pokud hledáte dárek pro vaše blízké, podívejte se i na <a href="https://www.magneticmemories.cz" target="_blank" className="text-brand-primary font-bold hover:underline">Magnetic Memories</a>.
                     </p>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
