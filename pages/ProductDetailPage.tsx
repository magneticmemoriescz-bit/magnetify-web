
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ProductVariant, CartItem } from '../types';
import { FileUpload, UploadedFilesInfo } from '../components/FileUpload';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { products } = useProducts();
    const product = products.find(p => p.id === id);
    const { dispatch } = useCart();
    const navigate = useNavigate();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(product?.variants?.[0]);
    const [uploadedPhotoInfo, setUploadedPhotoInfo] = useState<UploadedFilesInfo>({ photos: [], groupId: null });
    const [customText, setCustomText] = useState<{ [key: string]: string }>({});
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const isMerch = product?.id === 'promo-magnets';
    const isCalendar = product?.id === 'corporate-calendar';
    const isBusinessCards = product?.id === 'magnetic-business-cards';

    useEffect(() => {
        const currentProduct = products.find(p => p.id === id);
        if (currentProduct) {
            setUploadedPhotoInfo({ photos: [], groupId: null });
            setCustomText({});
            setSelectedVariant(currentProduct.variants?.[0]);
            setOrientation('portrait');
            
            // Set default quantity to 50 for Merch, otherwise 1
            if (currentProduct.id === 'promo-magnets') {
                setQuantity(50);
            } else {
                setQuantity(1);
            }
            
            setError(null);
        }
    }, [id, products]);

    if (!product) {
        return <div className="text-center py-20">Produkt nenalezen.</div>;
    }

    const photoCount = selectedVariant ? selectedVariant.photoCount : product.requiredPhotos;
    const displayPrice = selectedVariant?.price ?? product.price;
    
    // Prioritize variant-specific image if available
    const variantImage = selectedVariant?.imageUrl;

    const displayImage = variantImage ? variantImage : 
        isCalendar ? 
            (orientation === 'portrait' ? product.imageUrl_portrait : product.imageUrl_landscape) || product.imageUrl 
        : product.imageUrl;

    const handleFilesChange = (filesInfo: UploadedFilesInfo) => {
        setUploadedPhotoInfo(filesInfo);
        if (filesInfo.photos.length === photoCount) {
            setError(null);
        }
    };

    const handleAddToCart = () => {
        if (uploadedPhotoInfo.photos.length !== photoCount) {
            setError(`Prosím, nahrajte přesně ${photoCount} souborů (logo/grafika).`);
            return;
        }

        setError(null);
        const cartItem: CartItem = {
            id: `${product.id}-${selectedVariant?.id}-${isCalendar ? orientation : ''}-${Date.now()}`,
            product,
            quantity: quantity,
            price: displayPrice,
            variant: selectedVariant,
            photos: uploadedPhotoInfo.photos,
            photoGroupId: uploadedPhotoInfo.groupId,
            customText,
            ...(isCalendar && { orientation: orientation })
        };
        dispatch({ type: 'ADD_ITEM', payload: cartItem });
        navigate('/kosik');
    };

    const handleVariantChange = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setUploadedPhotoInfo({ photos: [], groupId: null });
        setError(null);
    }
    
    const imageClass = "w-full h-full object-center object-contain sm:rounded-lg bg-gray-50 border border-gray-100";

    // Generate quantity options for Merch (bulk steps) vs Standard (1-50)
    const getQuantityOptions = () => {
        if (isMerch) {
            const options = [];
            // Start at 50, go to 100 by 10s
            for(let i = 50; i <= 100; i+=10) options.push(i);
            // 150 to 500 by 50s
            for(let i = 150; i <= 500; i+=50) options.push(i);
            return options;
        } else {
            // Standard 1-50
            return Array.from({length: 50}, (_, i) => i + 1);
        }
    };

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Image gallery */}
                    <div className="lg:col-span-7">
                        <img src={displayImage} alt={product.name} className={imageClass} />
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:col-span-5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-dark-gray">{product.name}</h1>
                        <div className="mt-3">
                            <p className="text-3xl font-bold text-brand-primary">{displayPrice} Kč <span className="text-sm font-normal text-gray-500">bez DPH</span></p>
                            {isMerch && <p className="text-sm text-gray-500 mt-1">Cena za 1 kus</p>}
                        </div>
                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 space-y-6" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
                            {product.variants && (
                                <div className="mt-8">
                                    {!isBusinessCards && <h3 className="text-sm text-dark-gray font-medium mb-4">Vyberte variantu</h3>}
                                    <fieldset>
                                        <div className="flex flex-nowrap overflow-x-auto pb-2 gap-4 no-scrollbar">
                                            {product.variants.map((variant) => (
                                                <label key={variant.id} className={`relative border rounded-md p-4 flex-shrink-0 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${selectedVariant?.id === variant.id ? 'bg-brand-navy border-brand-navy text-white shadow-md' : 'bg-white border-gray-200 text-dark-gray hover:border-brand-navy hover:text-brand-navy'}`}>
                                                    <input type="radio" name="variant-option" value={variant.id} className="sr-only" checked={selectedVariant?.id === variant.id} onChange={() => handleVariantChange(variant)}/>
                                                    <span>{variant.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                     {isMerch && (
                                        <div className="mt-3">
                                            <Link to="/kontakt" className="text-sm text-brand-primary hover:underline flex items-center font-medium">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Poptat jiný rozměr
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quantity Selector - Moved immediately after variants */}
                            {!isBusinessCards && (
                                <div className="mt-6">
                                    <h3 className="text-sm text-dark-gray font-medium">Počet kusů</h3>
                                    <select
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="mt-2 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md bg-white text-gray-900 shadow-sm cursor-pointer"
                                    >
                                        {getQuantityOptions().map((val) => (
                                            <option key={val} value={val}>
                                                {val}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <p className="mt-2 text-xs text-brand-primary">
                                        Potřebujete více než {isMerch ? '500' : '50'} ks? <Link to="/kontakt" className="underline">Kontaktujte nás pro individuální kalkulaci.</Link>
                                    </p>
                                </div>
                            )}

                            {isCalendar && (
                                <div className="mt-8">
                                    <h3 className="text-sm text-dark-gray font-medium">Orientace</h3>
                                    <fieldset className="mt-4">
                                        <div className="flex items-center space-x-4">
                                            <label className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${orientation === 'portrait' ? 'bg-brand-navy border-brand-navy text-white shadow-md' : 'bg-white border-gray-200 text-dark-gray hover:border-brand-navy hover:text-brand-navy'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="orientation-option" 
                                                    value="portrait" 
                                                    className="sr-only" 
                                                    checked={orientation === 'portrait'} 
                                                    onChange={() => setOrientation('portrait')}
                                                />
                                                <span>Na výšku</span>
                                            </label>
                                            <label className={`relative border rounded-md p-4 flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${orientation === 'landscape' ? 'bg-brand-navy border-brand-navy text-white shadow-md' : 'bg-white border-gray-200 text-dark-gray hover:border-brand-navy hover:text-brand-navy'}`}>
                                                <input 
                                                    type="radio" 
                                                    name="orientation-option" 
                                                    value="landscape" 
                                                    className="sr-only" 
                                                    checked={orientation === 'landscape'} 
                                                    onChange={() => setOrientation('landscape')}
                                                />
                                                <span>Na šířku</span>
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>
                            )}

                            <div className="mt-8">
                                <h3 className="text-sm text-dark-gray font-medium">Tisková data (Logo/Grafika)</h3>
                                <p className="text-xs text-gray-500 mb-3">Nahrajte prosím data v tiskové kvalitě (PDF, JPG, PNG).</p>
                                <FileUpload 
                                    maxFiles={photoCount} 
                                    onFilesChange={handleFilesChange} 
                                    uploadedFilesInfo={uploadedPhotoInfo}
                                    isReorderable={false}
                                />
                            </div>
                            
                            <div className="mt-10">
                                {error && <p className="text-red-600 text-sm text-center mb-4 bg-red-50 p-2 rounded">{error}</p>}
                                <button type="button" onClick={handleAddToCart} className="w-full bg-brand-primary border border-transparent rounded-md py-4 px-8 flex items-center justify-center text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary shadow-lg transition-colors">
                                    Vložit do košíku
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
