import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { History, Settings, Search, ChevronDown, Palette, Type, Sun, Moon, X, ShoppingBag } from 'lucide-react';
import { FontSize, Product } from '../types';
import ProductCard from '../components/ProductCard';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, products, categories, isLoading, theme, fontSize, setTheme, setFontSize } = useStore();
  
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Performance: Deferred Rendering
  const [renderedCategoriesCount, setRenderedCategoriesCount] = useState(2);

  // Dropdown & Header State
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{top: number, left: number} | null>(null);
  const [showTopBar, setShowTopBar] = useState(true);
  
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const subcategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastScrollY = useRef(0);
  const isScrollingRef = useRef(false);

  // Pre-calculate structure for dropdowns
  const categoryStructure = useMemo(() => {
    const struct: Record<string, string[]> = {};
    categories.forEach(cat => {
      const catProducts = products.filter(p => p.category === cat.name);
      const subs = new Set<string>();
      catProducts.forEach(p => {
        if (p.subcategory) subs.add(p.subcategory);
      });
      struct[cat.name] = Array.from(subs);
    });
    return struct;
  }, [categories, products]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
    if (!isLoading && categories.length > 0) {
      const timer = setTimeout(() => {
        setRenderedCategoriesCount(categories.length);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [categories, activeCategory, isLoading]);

  useEffect(() => {
    setTotalPrice(getCartTotal());
  }, [cart, getCartTotal]);

  useEffect(() => {
    const handleScroll = () => {
      // If we are scrolling programmatically (clicking a category), do NOT update UI state
      // to prevent the header from jumping or dropdowns from closing prematurely.
      if (isScrollingRef.current) return;

      const currentScrollY = window.scrollY;

      // Smart Header Logic
      if (currentScrollY > 60) {
        if (currentScrollY > lastScrollY.current + 5) {
          setShowTopBar(false); // Hide Top Bar (Logo)
        } else if (currentScrollY < lastScrollY.current - 5) {
          setShowTopBar(true); // Show Top Bar
        }
      } else {
        setShowTopBar(true);
      }
      lastScrollY.current = currentScrollY;

      if (openSubmenu) setOpenSubmenu(null);

      // ScrollSpy Logic
      const headerVisibleHeight = showTopBar ? 164 : 112; 
      const scrollPosition = currentScrollY + headerVisibleHeight + 20; 
      
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
  }, [categories, openSubmenu, showTopBar]);

  const scrollToSection = (refMap: React.MutableRefObject<Record<string, HTMLDivElement | null>>, key: string) => {
    isScrollingRef.current = true;
    const element = refMap.current[key];
    if (element) {
      // Offset increased to 180px to ensure the section title lands cleanly below the sticky header
      // and accounts for the top margin we introduced.
      const offset = 180; 
      const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      
      // Release the scroll lock after animation completes
      setTimeout(() => { isScrollingRef.current = false; }, 800);
    } else {
      isScrollingRef.current = false;
    }
  };

  const handleCategoryClick = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const hasSubs = categoryStructure[catName]?.length > 0;
    
    // 1. Scroll to the section
    scrollToSection(categoryRefs, catName);
    setActiveCategory(catName);

    // 2. Open Dropdown if applicable
    if (hasSubs) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      
      // Use setTimeout to ensure the dropdown state is set AFTER any immediate scroll events
      // and persists during the smooth scroll.
      setTimeout(() => {
        setDropdownPos({ top: rect.bottom + 8, left: rect.left }); 
        setOpenSubmenu(prev => prev === catName ? null : catName);
      }, 50);
    } else {
      setOpenSubmenu(null);
    }
  };

  const filteredProducts = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
  [products, searchQuery]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cardBgClass = theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-white/60 border-white/40';
  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-gray-500';

  if (isLoading) return <CatalogSkeleton />;

  return (
    <div className={`min-h-screen pb-28 pt-[170px] transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-[#F8FAFC]'}`} onClick={() => setOpenSubmenu(null)}>
      
      {/* Fixed Header Wrapper */}
      <div 
        className={`fixed top-0 left-0 right-0 z-30 shadow-sm transition-transform duration-300 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-[#F8FAFC]/95 border-slate-200'}`}
        // Changed to -52px to leave a small top margin (12px) visible when collapsed
        style={{ transform: showTopBar ? 'translateY(0)' : 'translateY(-52px)' }} 
      >
         
         {/* Top Section (Logo) - Collapses on scroll */}
         <div className="h-[64px] flex justify-between items-center px-4 py-3 transition-opacity duration-300" style={{ opacity: showTopBar ? 1 : 0, pointerEvents: showTopBar ? 'auto' : 'none' }}>
           <div className="flex flex-col">
             <span className={`text-[10px] font-bold uppercase tracking-widest ${textSecondaryClass}`}>Меню</span>
             <h1 className={`text-xl font-black ${theme === 'dark' ? 'text-orange-400' : 'text-primary'}`}>KisKis</h1>
           </div>
           <div className="flex gap-2">
             <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }} className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-primary shadow-sm'}`}>
                <Palette size={20} strokeWidth={2} />
             </button>
             <button onClick={() => navigate('/admin')} className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-primary shadow-sm'}`}>
                <Settings size={20} strokeWidth={2} />
             </button>
             <button onClick={() => navigate('/history')} className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-transform ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-primary shadow-sm'}`}>
               <History size={20} strokeWidth={2} />
             </button>
           </div>
         </div>

         {/* Search & Categories - Stays Visible (No inner transform) */}
         <div className="flex flex-col gap-2 pb-3">
           {/* Search */}
           <div className="px-4">
              <div className="relative group">
                <input 
                  type="text" placeholder="Поиск блюд..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-2xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all ${theme === 'dark' ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-slate-900 border-gray-100 shadow-sm'}`}
                />
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondaryClass}`} size={18} />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14}/></button>}
              </div>
           </div>

           {/* Categories */}
           <div className="flex overflow-x-auto no-scrollbar px-4 gap-2">
            {categories.map((cat) => {
              const hasSubs = categoryStructure[cat.name]?.length > 0;
              const isActive = activeCategory === cat.name;
              const isMenuOpen = openSubmenu === cat.name;
              
              return (
                <div key={cat.id} className="relative flex-shrink-0">
                  <button
                    onClick={(e) => handleCategoryClick(cat.name, e)}
                    className={`flex items-center gap-1 whitespace-nowrap px-4 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 border-transparent'
                        : theme === 'dark' 
                          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' 
                          : 'bg-white text-gray-500 shadow-sm border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                    {hasSubs && <ChevronDown size={12} className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />}
                  </button>
                </div>
              );
            })}
            <div className="w-2 flex-shrink-0" /> 
          </div>
         </div>
      </div>

      {/* Fixed Dropdown Portal */}
      {openSubmenu && dropdownPos && categoryStructure[openSubmenu] && (
        <div 
          className={`fixed z-[60] min-w-[160px] glass-panel rounded-2xl p-1.5 shadow-2xl flex flex-col gap-0.5 animate-fade-in border border-white/20 backdrop-blur-2xl ${theme === 'dark' ? 'bg-slate-800/95' : 'bg-white/95'}`}
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {categoryStructure[openSubmenu].map(sub => (
            <button
              key={sub}
              onClick={(e) => { e.stopPropagation(); setOpenSubmenu(null); scrollToSection(subcategoryRefs, sub); }}
              className={`text-left px-3 py-3 rounded-xl text-xs font-bold transition-all ${theme === 'dark' ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-primary'}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Catalog Grid */}
      <div className="px-2 md:px-4 space-y-8 relative z-10">
        {categories.slice(0, renderedCategoriesCount).map(category => {
          const categoryProducts = filteredProducts.filter(p => p.category === category.name);
          if (categoryProducts.length === 0) return null;

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
              className="scroll-mt-40 content-auto"
            >
              <h2 className={`text-lg font-black mb-4 px-2 flex items-center gap-2 ${textPrimaryClass}`}>
                <span className="w-1.5 h-6 bg-accent rounded-full block shadow-[0_0_10px_rgba(249,115,22,0.5)]"></span>
                {category.name}
              </h2>

              {Object.entries(grouped).map(([sub, items]) => (
                <div key={sub} ref={(el) => { subcategoryRefs.current[sub] = el; }} className="mb-6 pl-2 scroll-mt-48">
                   <h3 className={`text-xs font-bold uppercase mb-3 flex items-center gap-1 ${textSecondaryClass}`}>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"/> {sub}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                    {items.map(product => (
                      <ProductCard key={product.id} product={product} navigate={navigate} imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} cardBgClass={cardBgClass} textPrimaryClass={textPrimaryClass} textSecondaryClass={textSecondaryClass} />
                    ))}
                  </div>
                </div>
              ))}
              
              {others.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                  {others.map((product) => (
                    <ProductCard key={product.id} product={product} navigate={navigate} imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} cardBgClass={cardBgClass} textPrimaryClass={textPrimaryClass} textSecondaryClass={textSecondaryClass} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-400">Ничего не найдено</div>
        )}
      </div>

      {/* Floating Cart */}
      <div className={`fixed bottom-0 left-0 w-full p-4 z-40 transition-transform duration-300 safe-bottom ${totalItems > 0 ? 'translate-y-0' : 'translate-y-[120%]'}`}>
        <div className="glass-panel rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-2 border border-white/40 backdrop-blur-2xl">
          <div className="flex justify-between items-center bg-primary rounded-[1.5rem] p-1 pr-2 shadow-lg overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="flex flex-col px-5 py-2 relative z-10">
               <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Итого</span>
               <span className="text-lg font-black text-white">{totalPrice}₽</span>
            </div>
            
            <button onClick={() => navigate('/cart')} className="bg-white text-primary rounded-2xl px-6 py-3 font-bold uppercase tracking-wider flex items-center gap-3 active:scale-95 transition-transform relative z-10">
              Заказать 
              <span className="bg-accent text-white text-xs px-2 py-0.5 rounded-lg font-black min-w-[20px] text-center">{totalItems}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}>
           <div className={`w-full max-w-sm rounded-[2rem] p-6 animate-slide-up shadow-2xl ${theme === 'dark' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900'}`} onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Настройки</h2>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-gray-100/10 rounded-full"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <div>
                   <label className={`text-xs font-bold uppercase mb-3 block ${textSecondaryClass}`}>Тема</label>
                   <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setTheme('light')} className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${theme === 'light' ? 'border-accent bg-orange-50/50 text-accent' : 'border-transparent bg-gray-100/5'}`}><Sun size={18} /> Светлая</button>
                      <button onClick={() => setTheme('dark')} className={`p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${theme === 'dark' ? 'border-accent bg-slate-700 text-accent' : 'border-transparent bg-gray-100/5'}`}><Moon size={18} /> Темная</button>
                   </div>
                </div>

                <div>
                   <label className={`text-xs font-bold uppercase mb-3 block ${textSecondaryClass}`}>Размер шрифта</label>
                   <div className="grid grid-cols-3 gap-2">
                      {(['small', 'medium', 'large'] as FontSize[]).map((size) => (
                        <button key={size} onClick={() => setFontSize(size)} className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 font-bold transition-all ${fontSize === size ? 'border-accent bg-orange-50/10 text-accent' : 'border-transparent bg-gray-100/5'}`}>
                          <Type size={size === 'small' ? 14 : size === 'medium' ? 18 : 22} />
                          <span className="text-[10px] uppercase">{size}</span>
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

const CatalogSkeleton = () => (
  <div className="min-h-screen bg-[#F8FAFC] px-4 py-4 space-y-6">
    <div className="flex justify-between items-center">
      <div className="h-8 w-24 bg-slate-200 rounded-xl animate-pulse"></div>
      <div className="flex gap-2">
         <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
         <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse"></div>
      </div>
    </div>
    <div className="h-12 w-full bg-slate-200 rounded-2xl animate-pulse"></div>
    <div className="flex gap-2 overflow-hidden">
       {[1,2,3,4].map(i => <div key={i} className="h-10 w-24 bg-slate-200 rounded-2xl animate-pulse flex-shrink-0"></div>)}
    </div>
    <div className="grid grid-cols-2 gap-4">
       {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-slate-200 rounded-[1.5rem] animate-pulse"></div>)}
    </div>
  </div>
);

export default Catalog;