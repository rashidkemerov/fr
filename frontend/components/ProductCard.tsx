import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
  imageLoaded: Record<string, boolean>;
  setImageLoaded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

const ProductCard = React.memo(({ product, navigate, imageLoaded, setImageLoaded, cardBgClass, textPrimaryClass, textSecondaryClass }: ProductCardProps) => {
  const handleInteraction = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/product/${product.id}`;
    document.head.appendChild(link);
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      onTouchStart={handleInteraction}
      onMouseEnter={handleInteraction}
      className={`group rounded-[1.5rem] p-2 shadow-sm border active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative backdrop-blur-sm ${cardBgClass}`}
    >
      <div className="relative aspect-square rounded-[1.2rem] overflow-hidden bg-gray-100/10 mb-2">
        {!imageLoaded[product.id] && <div className="absolute inset-0 skeleton" />}
        <img 
          src={product.image} alt={product.name} loading="lazy"
          onLoad={() => setImageLoaded((prev: any) => ({...prev, [product.id]: true}))}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded[product.id] ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Quick Add Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          className="absolute bottom-1 right-1 w-10 h-10 bg-white/90 backdrop-blur text-primary rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20"
        >
          <ShoppingBag size={18} strokeWidth={3} />
        </button>

        <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg z-10">
           <span className="text-xs font-black text-primary">{product.price}₽</span>
        </div>

        {/* Tags */}
        {product.tags && (
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
            {product.tags.includes('hit') && <div className="bg-red-500 text-white p-1 rounded-md shadow-lg shadow-red-500/20"><Star size={10} fill="currentColor"/></div>}
            {product.tags.includes('new') && <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black shadow-lg shadow-blue-500/20">NEW</div>}
            {product.tags.includes('vegan') && <div className="bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black shadow-lg shadow-green-500/20">VEG</div>}
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className={`font-bold text-xs uppercase leading-tight mb-1 line-clamp-2 min-h-[2.4em] ${textPrimaryClass}`}>{product.name}</h3>
        <p className={`text-[10px] font-medium line-clamp-1 ${textSecondaryClass}`}>{product.description}</p>
      </div>
    </div>
  );
});

export default ProductCard;