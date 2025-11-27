import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Heart, Minus, Plus } from 'lucide-react';
import { BackButton } from '../components/ui/BackButton';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProduct, addToCart, favorites, toggleFavorite, getCartTotal, cart } = useStore();
  
  const product = getProduct(id || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Initialize selected option if available
  useEffect(() => {
    if (product?.options && product.options.length > 0) {
      setSelectedOption(product.options[0].id);
    }
  }, [product]);

  if (!product) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  const isFav = favorites.includes(product.id);
  
  // Calculate current price based on options
  const currentPrice = product.price + (selectedOption 
    ? (product.options?.find(o => o.id === selectedOption)?.priceModifier || 0) 
    : 0);

  const totalCartPrice = getCartTotal();
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = () => {
    setIsAnimating(true);
    addToCart(product.id, quantity, selectedOption);
    setQuantity(1);
    setTimeout(() => {
      setIsAnimating(false);
      navigate(-1);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white relative flex flex-col">
      {/* Top Nav (Absolute) */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between z-30 pointer-events-none">
        <div className="pointer-events-auto">
           <BackButton className="bg-white/80 backdrop-blur-md" />
        </div>
        <button 
          onClick={() => toggleFavorite(product.id)}
          className="pointer-events-auto w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <Heart 
            size={24} 
            className={`transition-colors duration-300 ${isFav ? "fill-red-500 text-red-500" : "text-primary"}`} 
            strokeWidth={isFav ? 0 : 2}
          />
        </button>
      </div>

      {/* Immersive Image Area */}
      <div className="relative w-full h-[50vh] bg-slate-100 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content Sheet */}
      <div className="flex-1 bg-white -mt-10 rounded-t-[2.5rem] relative z-20 px-6 pb-36 animate-slide-up">
        {/* Drag Handle Indicator */}
        <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-4 mb-6" />

        <div className="flex justify-between items-start gap-4 mb-2">
           <h1 className="text-2xl font-black text-primary uppercase leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Price & Weight */}
        <div className="flex items-baseline gap-3 mb-6">
           <span className="text-3xl font-black text-accent">
             {currentPrice}₽
           </span>
           {product.oldPrice && (
             <span className="text-lg text-gray-400 line-through font-bold decoration-2">
               {product.oldPrice}₽
             </span>
           )}
        </div>

        {/* Description */}
        <p className="text-gray-500 font-medium leading-relaxed mb-6 text-sm">
          {product.description}
        </p>

        {/* Ingredients/Details */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Состав</h3>
          <div className="space-y-2 text-sm font-semibold text-primary/80">
            {product.ingredients.map((ing, i) => (
               <div key={i} className="flex items-start gap-2">
                 <span className="text-accent">•</span>
                 <span>{ing}</span>
               </div>
            ))}
          </div>
        </div>

        {/* Options */}
        {product.options && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Опции</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 ${
                    selectedOption === opt.id 
                      ? 'border-accent text-accent bg-orange-50' 
                      : 'border-transparent bg-slate-100 text-gray-500'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span>{opt.name}</span>
                    {opt.priceModifier > 0 && <span className="text-[10px] opacity-70">+{opt.priceModifier}₽</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 z-50 glass-panel border-t-0">
         <div className="flex items-center gap-4">
            {/* Stepper */}
            <div className="flex items-center gap-4 bg-slate-100 rounded-2xl px-2 h-16 w-36 justify-between">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-full flex items-center justify-center text-primary active:text-accent disabled:opacity-30"
                  disabled={quantity <= 1}
                >
                  <Minus size={22} strokeWidth={3} />
                </button>
                <span className="text-xl font-black text-primary">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-full flex items-center justify-center text-primary active:text-accent"
                >
                  <Plus size={22} strokeWidth={3} />
                </button>
            </div>

            {/* Add Button */}
            <button 
              onClick={handleAddToCart}
              className={`flex-1 h-16 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 flex flex-col items-center justify-center transition-transform ${isAnimating ? 'scale-95' : 'active:scale-95'}`}
            >
              <span className="text-sm font-bold uppercase tracking-wider">Добавить</span>
              <span className="text-xs opacity-80">{currentPrice * quantity}₽</span>
            </button>
         </div>
         
         {/* Mini Cart Status (Only if items exist elsewhere) */}
         {totalCartItems > 0 && (
           <div className="mt-2 text-center">
             <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
               Всего в корзине: {totalCartItems} шт. ({totalCartPrice}₽)
             </span>
           </div>
         )}
      </div>
    </div>
  );
};

export default ProductDetail;