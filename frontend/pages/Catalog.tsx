
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { History, ShoppingBag, Settings, Search, Flame, Leaf, Star, ChevronDown, Palette, Type, Moon, Sun, X } from 'lucide-react';
import { Theme, FontSize } from '../types';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, products, categories, isLoading, theme, fontSize, setTheme, setFontSize } = useStore();
  
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
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
      
      const scrollPosition = window.scrollY + 180;
      
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Appearance Helpers
  const cardBgClass = theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-gray-400';

  if (isLoading) {
    return <CatalogSkeleton />;
  }

  return (
    <div className={`min-h-screen pb-28 transition-colors duration-300`}>
      {/* Sticky Header */}
      <div ref={headerRef} className={`sticky top-0 z-30 ${theme === 'dark' ? 'bg-[#3b445b]/95 border-b border-slate-700' : 'bg-[#fffdeb]/95 border-b border-orange-100'} backdrop-blur-md shadow-sm transition-all duration-300`}>
         <div className="flex justify-between items-center px-4 py-3">
           <div className="flex flex-col">
             <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondaryClass}`}>Меню</span>
             <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-orange-400' : 'text-primary'}`}>KisKis</h1>
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => setIsSettingsOpen(true)}
               className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-primary'}`}
               aria-label="Настройки вида"
             >
                <Palette size={20} strokeWidth={2} />
             </button>
             <button 
               onClick={() => navigate('/admin')}
               className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-primary'}`}
               aria-label="Админ панель"
             >
                <Settings size={20} strokeWidth={2} />
             </button>
             <button 
               onClick={() => navigate('/history')}
               className={`w-10 h-10 rounded-full shadow-md flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-primary'}`}
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
                className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent transition-all shadow-sm ${theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-gray-200'}`}
              />
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondaryClass}`} size={18} />
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
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 select-none border ${
                activeCategory === cat.name
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 border-transparent'
                  : theme === 'dark' 
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' 
                    : 'bg-white text-gray-500 shadow-sm border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <div className="w-2 flex-shrink-0" /> 
        </div>
      </div>

      {/* Catalog Feed */}
      <div className="px-2 md:px-4 pt-4 space-y-8 relative z-10">
        {categories.map(category => {
          const categoryProducts = filteredProducts.filter(p => p.category === category.name);
          if (categoryProducts.length === 0) return null;

           // Group by Subcategory
           const grouped: Record<string, typeof categoryProducts> = {};
           const others: typeof categoryProducts = [];
           categoryProducts.forEach(p => {
             if (p.subcategory) {
               if (!grouped[p.subcategory]) grouped[p.subcategory] = [];
               grouped[p.subcategory].push(p);
             } else {
               others.push(p);
             }
           });

          return (
            <div 
              key={category.id} 
              ref={(el) => { categoryRefs.current[category.name] = el; }}
              className="scroll-mt-36"
            >
              <h2 className={`text-lg font-black mb-4 px-2 flex items-center gap-2 ${textPrimaryClass}`}>
                <span className="w-1.5 h-6 bg-accent rounded-full block"></span>
                {category.name}
              </h2>

              {/* Subcategories */}
              {Object.entries(grouped).map(([sub, items]) => (
                <div key={sub} className="mb-6 pl-2">
                   <h3 className={`text-xs font-bold uppercase mb-3 flex items-center gap-1 ${textSecondaryClass}`}>
                    <ChevronDown size={14}/> {sub}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {items.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        navigate={navigate} 
                        imageLoaded={imageLoaded} 
                        setImageLoaded={setImageLoaded}
                        cardBgClass={cardBgClass}
                        textPrimaryClass={textPrimaryClass}
                        textSecondaryClass={textSecondaryClass}
                        theme={theme}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Others */}
              {others.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                  {others.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      navigate={navigate} 
                      imageLoaded={imageLoaded} 
                      setImageLoaded={setImageLoaded}
                      cardBgClass={cardBgClass}
                      textPrimaryClass={textPrimaryClass}
                      textSecondaryClass={textSecondaryClass}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            Ничего не найдено
          </div>
        )}
      </div>

      {/* Sticky Bottom Cart Bar */}
      <div className={`fixed bottom-0 left-0 w-full p-4 z-40 transition-transform duration-300 ${totalItems > 0 ? 'translate-y-0' : 'translate-y-[120%]'}`}>
        <div className="glass-panel rounded-3xl shadow-2xl p-2 border border-white/60 backdrop-blur-xl">
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
           <div className={`w-full max-w-sm rounded-3xl p-6 animate-slide-up ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Настройки вида</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100/10 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div>
                   <label className={`text-xs font-bold uppercase mb-3 block ${textSecondaryClass}`}>Тема оформления</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${theme === 'light' ? 'border-accent bg-orange-50 text-accent' : 'border-transparent bg-slate-100/10'}`}
                      >
                        <Sun size={18} /> Светлая
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${theme === 'dark' ? 'border-accent bg-slate-700 text-accent' : 'border-transparent bg-slate-100/10'}`}
                      >
                        <Moon size={18} /> Темная
                      </button>
                   </div>
                </div>

                {/* Font Size Toggle */}
                <div>
                   <label className={`text-xs font-bold uppercase mb-3 block ${textSecondaryClass}`}>Размер шрифта</label>
                   <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                        <button 
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 font-bold transition-all ${fontSize === size ? 'border-accent bg-orange-50/10 text-accent' : 'border-transparent bg-slate-100/10'}`}
                        >
                          <Type size={size === 'small' ? 14 : size === 'medium' ? 18 : 22} />
                          <span className="text-[10px] uppercase">{size === 'small' ? 'Мелкий' : size === 'medium' ? 'Средний' : 'Крупный'}</span>
                        </button>
                      ))}
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const ProductCard = ({ product, navigate, imageLoaded, setImageLoaded, cardBgClass, textPrimaryClass, textSecondaryClass, theme }: any) => {
  // Prefetch logic
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
      className={`group rounded-[1.5rem] p-2 shadow-sm border active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative ${cardBgClass}`}
    >
      <div className="relative aspect-square rounded-[1.2rem] overflow-hidden bg-gray-100 mb-2">
        {!imageLoaded[product.id] && <div className="absolute inset-0 skeleton" />}
        <img 
          src={product.image} 
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded((prev: any) => ({...prev, [product.id]: true}))}
          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded[product.id] ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Quick Add Button (Fitts's Law optimization) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Quick Add Logic would go here
            navigate(`/product/${product.id}`); 
          }}
          className="absolute bottom-1 right-1 w-10 h-10 bg-white/90 backdrop-blur text-primary rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform z-20"
        >
          <ShoppingBag size={18} strokeWidth={3} />
        </button>

        <div className="absolute bottom-1 left-1 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg z-10">
           <span className="text-xs font-black text-primary">{product.price}₽</span>
        </div>

        {product.tags && (
          <div className="absolute top-1 right-1 flex flex-col gap-1 z-10">
            {product.tags.includes('hit') && <div className="bg-red-500 text-white p-1 rounded-md"><Star size={10} fill="currentColor"/></div>}
            {product.tags.includes('new') && <div className="bg-blue-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black">NEW</div>}
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className={`font-bold text-xs uppercase leading-tight mb-1 line-clamp-2 min-h-[2.4em] ${textPrimaryClass}`}>
          {product.name}
        </h3>
        <p className={`text-[10px] font-medium line-clamp-1 ${textSecondaryClass}`}>
          {product.description}
        </p>
      </div>
    </div>
  );
};

const CatalogSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] px-4 py-4 space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
      <div className="flex gap-2">
         <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
         <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="h-12 w-full bg-slate-200 rounded-xl animate-pulse"></div>
    <div className="flex gap-2 overflow-hidden">
       {[1,2,3,4].map(i => <div key={i} className="h-8 w-24 bg-slate-200 rounded-lg animate-pulse flex-shrink-0"></div>)}
    </div>
    <div className="grid grid-cols-2 gap-4">
       {[1,2,3,4,5,6].map(i => (
         <div key={i} className="h-48 bg-slate-200 rounded-2xl animate-pulse"></div>
       ))}
    </div>
  </div>
);

export default Catalog;