
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
  imageLoaded?: any; 
  setImageLoaded?: any;
  cardBgClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

const ProductCard = React.memo(({ product, navigate, cardBgClass, textPrimaryClass, textSecondaryClass }: ProductCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
        }
      },
      { rootMargin: '200px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleInteraction = () => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/product/${product.id}`;
    document.head.appendChild(link);
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => navigate(`/product/${product.id}`)}
      onTouchStart={handleInteraction}
      onMouseEnter={handleInteraction}
      className={`group rounded-[1.5rem] p-2 shadow-sm border active:scale-[0.98] transition-transform duration-200 cursor-pointer overflow-hidden relative ${cardBgClass}`}
    >
      <div className="relative aspect-square rounded-[1.2rem] overflow-hidden bg-gray-100/10 mb-2">
        {isVisible ? (
          <>
            <img 
              src={product.image} 
              alt={product.name} 
              loading="lazy" 
              decoding="async"
              onLoad={() => setIsImgLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-500 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isImgLoaded && <div className="absolute inset-0 bg-gray-200/20 animate-pulse" />}
          </>
        ) : (
          <div className="absolute inset-0 bg-gray-100/5" />
        )}
        
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          className="absolute bottom-1 right-1 w-10 h-10 bg-white text-primary rounded-xl flex items-center justify-center shadow-md active:scale-90 transition-transform z-20"
        >
          <ShoppingBag size={18} strokeWidth={3} />
        </button>

        <div className="absolute bottom-1 left-1 bg-white/90 px-2 py-0.5 rounded-lg z-10 shadow-sm">
           <span className="text-xs font-black text-primary">{product.price}₽</span>
        </div>

        {product.tags && isVisible && (
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
            {product.tags.includes('hit') && <div className="bg-red-500 text-white p-1 rounded-md"><Star size={10} fill="currentColor"/></div>}
            {product.tags.includes('new') && <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black">NEW</div>}
            {product.tags.includes('vegan') && <div className="bg-green-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black">VEG</div>}
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className={`font-bold text-xs uppercase leading-tight mb-1 line-clamp-2 min-h-[2.4em] ${textPrimaryClass}`}>{product.name}</h3>
      </div>
    </div>
  );
});

export default ProductCard;
