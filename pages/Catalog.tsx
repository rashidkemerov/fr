
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { History, ShoppingBag, Settings, Search, Flame, Leaf, Star } from 'lucide-react';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, products, categories, isLoading } = useStore();
  
  // Use first category as default if available
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    setTotalPrice(getCartTotal());
  }, [cart, getCartTotal]);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      
      const scrollPosition = window.scrollY + 180; // Offset for search bar
      
      for (const cat of categories) {
        const element = categoryRefs.current[cat.name];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(cat.name);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const scrollToCategory = (cat: string) => {
    isScrollingRef.current = true;
    setActiveCategory(cat);
    const element = categoryRefs.current[cat];
    if (element && headerRef.current) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(() => { isScrollingRef.current = false; }, 500);
    }
  };

  const renderTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
        {tags.includes('hit') && (
          <div className="bg-red-500 text-white p-1.5 rounded-full shadow-sm"><Star size={12} fill="currentColor" /></div>
        )}
        {tags.includes('spicy') && (
          <div className="bg-orange-500 text-white p-1.5 rounded-full shadow-sm"><Flame size={12} fill="currentColor" /></div>
        )}
        {tags.includes('vegan') && (
          <div className="bg-green-500 text-white p-1.5 rounded-full shadow-sm"><Leaf size={12} fill="currentColor" /></div>
        )}
      </div>
    );
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка меню...</div>;
  }

  return (
    <div className="min-h-screen pb-28 bg-[#F8FAFC]">
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none z-0" />

      {/* Sticky Header */}
      <div ref={headerRef} className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md shadow-sm transition-all duration-300">
         <div className="flex justify-between items-center px-4 py-3">
           <div className="flex flex-col">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Меню</span>
             <h1 className="text-xl font-black text-primary">KisKis</h1>
           </div>
           <div className="flex gap-3">
             <button 
               onClick={() => navigate('/admin')}
               className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary active:scale-95 transition-transform"
               aria-label="Админ панель"
             >
                <Settings size={20} strokeWidth={2} />
             </button>
             <button 
               onClick={() => navigate('/history')}
               className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary active:scale-95 transition-transform"
               aria-label="История заказов"
             >
               <History size={20} strokeWidth={2} />
             </button>
           </div>
         </div>

         {/* Search Bar */}
         <div className="px-4 pb-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Поиск блюд..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
         </div>

         {/* Categories */}
         <div className="flex overflow-x-auto no-scrollbar px-4 gap-2 pb-3 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.name)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 select-none ${
                activeCategory === cat.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                  : 'bg-white text-gray-500 shadow-sm border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <div className="w-2 flex-shrink-0" /> 
        </div>
      </div>

      {/* Catalog Feed */}
      <div className="px-4 pt-2 space-y-8 relative z-10">
        {categories.map(category => {
          // Filter products in this category that match search
          const categoryProducts = filteredProducts.filter(p => p.category === category.name);
          
          if (categoryProducts.length === 0) return null;

          return (
            <div 
              key={category.id} 
              ref={(el) => { categoryRefs.current[category.name] = el; }}
              className="scroll-mt-32"
            >
              <h2 className="text-lg font-bold text-primary mb-4 px-1 flex items-center gap-2">
                <span className="w-1 h-6 bg-accent rounded-full block"></span>
                {category.name}
              </h2>
              
              <div className="grid gap-6">
                {categoryProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group bg-white rounded-[2rem] p-3 shadow-lg shadow-slate-200/50 border border-slate-50 active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="flex gap-4">
                      {/* Image Container */}
                      <div className="relative w-32 h-32 flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-gray-100">
                        {!imageLoaded[product.id] && <div className="absolute inset-0 skeleton" />}
                        <img 
                          src={product.image} 
                          alt={product.name}
                          loading="lazy"
                          onLoad={() => setImageLoaded(prev => ({...prev, [product.id]: true}))}
                          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded[product.id] ? 'opacity-100' : 'opacity-0'}`}
                        />
                        <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-tl-2xl rounded-br-2xl">
                          <span className="text-sm font-black text-primary">{product.price}₽</span>
                        </div>
                        {renderTags(product.tags)}
                      </div>

                      <div className="flex-1 py-1 pr-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-primary text-sm uppercase leading-tight mb-2 line-clamp-2">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-end mt-2">
                          {product.oldPrice ? (
                            <span className="text-xs text-red-400 line-through decoration-2">
                              {product.oldPrice}₽
                            </span>
                          ) : <span />}
                          
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <ShoppingBag size={14} strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            Ничего не найдено
          </div>
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      <div className={`fixed bottom-0 left-0 w-full p-4 z-40 transition-transform duration-300 ${totalItems > 0 ? 'translate-y-0' : 'translate-y-[120%]'}`}>
        <div className="glass-panel rounded-3xl shadow-2xl p-2 border border-white/60">
          <div className="flex justify-between items-center bg-primary rounded-2xl p-1 pr-2 shadow-lg">
            <div className="flex flex-col px-5 py-2">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Итого</span>
               <span className="text-lg font-black text-white">{totalPrice}₽</span>
            </div>
            
            <button 
              onClick={() => navigate('/cart')}
              className="bg-white text-primary rounded-xl px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-3 active:scale-95 transition-transform"
            >
              Заказать 
              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-md font-black min-w-[20px] text-center">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
