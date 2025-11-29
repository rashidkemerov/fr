import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { BackButton } from '../../components/ui/BackButton';
import { Plus, Trash2, Edit2, BarChart3, Package, Layers, X, ChefHat, Check, Clock, Users, TrendingUp, TrendingDown, DollarSign, Calendar, Star, ShoppingBag, PieChart, Search, ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Product, Option, Order } from '../../types';
// @ts-ignore
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart, Pie, Legend } from 'recharts';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, categories, history,
    createProduct, updateProduct, deleteProduct, 
    createCategory, deleteCategory, updateOrderStatus 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'stats' | 'kitchen'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  
  // Products Management State
  const [adminSearch, setAdminSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: 'price' | 'updatedAt' | 'name', direction: 'asc' | 'desc'}>({key: 'updatedAt', direction: 'desc'});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Statistics State
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [mockStats, setMockStats] = useState<any>(null);

  useEffect(() => {
    // Generate mock stats based on active tab and time range
    if (activeTab === 'stats') {
      generateMockStats();
    }
  }, [activeTab, timeRange]);

  // --- Product Grouping & Sorting Logic ---
  
  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const getProcessedProducts = () => {
    let filtered = products.filter(p => p.name.toLowerCase().includes(adminSearch.toLowerCase()));
    
    filtered.sort((a, b) => {
      let valA: any = a[sortConfig.key];
      let valB: any = b[sortConfig.key];

      if (sortConfig.key === 'updatedAt') {
         valA = a.updatedAt || '0';
         valB = b.updatedAt || '0';
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    const grouped: Record<string, Record<string, Product[]>> = {};

    filtered.forEach(p => {
       const cat = p.category || 'Без категории';
       const sub = p.subcategory || 'Общее';
       if (!grouped[cat]) grouped[cat] = {};
       if (!grouped[cat][sub]) grouped[cat][sub] = [];
       grouped[cat][sub].push(p);
    });

    return grouped;
  };

  const groupedProducts = getProcessedProducts();

  // --- Stats Generation ---
  const generateMockStats = () => {
    // Mock Data Generator logic
    const periods = { day: 24, week: 7, month: 30 };
    const count = periods[timeRange];
    
    // Revenue Data
    const revenueData = Array.from({ length: count }, (_, i) => ({
      name: timeRange === 'day' ? `${i}:00` : timeRange === 'week' ? `Day ${i+1}` : `Day ${i+1}`,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      orders: Math.floor(Math.random() * 20) + 1
    }));

    // Category Data
    const categoryData = categories.map(c => ({
      name: c.name,
      value: Math.floor(Math.random() * 100) + 10
    }));

    const COLORS = ['#0F172A', '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#F43F5E'];

    setMockStats({
      totalRevenue: revenueData.reduce((acc, curr) => acc + curr.revenue, 0),
      totalOrders: revenueData.reduce((acc, curr) => acc + curr.orders, 0),
      revenueData, categoryData, colors: COLORS,
      aov: 1250 + Math.floor(Math.random() * 300),
      ltv: 15400, cr: 12.5, churn: 4.2,
      topProduct: products[0] || { name: 'Борщ' },
      topCategory: categories[0] || { name: 'Супы' },
      topFavorite: products[1] || { name: 'Цезарь' }
    });
  };

  // --- Handlers ---

  const handleSaveProduct = async (product: Partial<Product>) => {
    if (product.id) {
      await updateProduct(product.id, product);
    } else {
      await createProduct(product);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openEditModal = (p?: Product) => {
    setEditingProduct(p ? JSON.parse(JSON.stringify(p)) : {
      name: '', description: '', price: 0, 
      category: categories[0]?.name || '', 
      ingredients: [], options: [], tags: [], image: 'https://placehold.co/600x400'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton onClick={() => navigate('/')} />
          <h1 className="text-xl font-black text-primary uppercase">Админ Панель</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-4 gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', icon: Package, label: 'Товары' },
          { id: 'categories', icon: Layers, label: 'Категории' },
          { id: 'kitchen', icon: ChefHat, label: 'Кухня (KDS)' },
          { id: 'stats', icon: BarChart3, label: 'Статистика' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                : 'bg-white text-slate-500'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => openEditModal()}
                className="w-full bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
              >
                <Plus size={20} /> Добавить товар
              </button>
              
              <div className="flex gap-2">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                     type="text" 
                     placeholder="Поиск по названию..."
                     value={adminSearch}
                     onChange={(e) => setAdminSearch(e.target.value)}
                     className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent"
                   />
                 </div>
                 
                 <div className="relative">
                   <select
                     value={sortConfig.key}
                     onChange={(e) => setSortConfig(prev => ({...prev, key: e.target.value as any}))}
                     className="h-full pl-3 pr-8 rounded-xl border border-slate-200 text-sm font-bold bg-white appearance-none focus:outline-none"
                   >
                     <option value="updatedAt">Дата</option>
                     <option value="price">Цена</option>
                     <option value="name">Имя</option>
                   </select>
                   <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                     <ArrowUpDown size={14} className="text-gray-400"/>
                   </div>
                 </div>

                 <button 
                   onClick={() => setSortConfig(prev => ({...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc'}))}
                   className="px-3 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center"
                 >
                   {sortConfig.direction === 'asc' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                 </button>
              </div>
            </div>
            
            {/* Grouped List */}
            <div className="space-y-2">
              {Object.entries(groupedProducts).map(([catName, subcats]) => (
                <div key={catName} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div 
                    onClick={() => toggleCategory(catName)}
                    className="p-3 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <h3 className="font-black text-primary text-sm uppercase flex items-center gap-2">
                      {expandedCategories.includes(catName) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                      {catName}
                      <span className="text-gray-400 text-xs font-normal lowercase">({Object.values(subcats).flat().length})</span>
                    </h3>
                  </div>

                  {expandedCategories.includes(catName) && (
                     <div className="p-2 space-y-4">
                        {Object.entries(subcats).map(([subName, items]) => (
                          <div key={subName}>
                             {subName !== 'Общее' && (
                               <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-2">{subName}</h4>
                             )}
                             <div className="grid gap-2">
                               {items.map(p => (
                                 <ProductListItem 
                                    key={p.id} 
                                    product={p} 
                                    onEdit={() => openEditModal(p)} 
                                    onDelete={() => deleteProduct(p.id)} 
                                 />
                               ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  )}
                </div>
              ))}
              
              {Object.keys(groupedProducts).length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                   Товары не найдены
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div>
            <form 
              onSubmit={(e: any) => {
                e.preventDefault();
                createCategory(e.target.catName.value);
                e.target.reset();
              }}
              className="flex gap-2 mb-6"
            >
              <input name="catName" placeholder="Новая категория..." className="flex-1 p-3 rounded-xl border border-slate-200" required />
              <button className="bg-primary text-white p-3 rounded-xl"><Plus /></button>
            </form>

            <div className="space-y-2">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                  <span className="font-bold">{c.name}</span>
                  <button onClick={() => deleteCategory(c.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KITCHEN TAB (KDS) */}
        {activeTab === 'kitchen' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-primary mb-2">Активные заказы</h2>
            {history.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
               <div className="text-center py-10 text-gray-400">Нет активных заказов</div>
            ) : (
              history
                .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
                .map(order => (
                <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-bold text-lg">#{order.id}</span>
                      <div className="text-xs text-gray-400">{order.date}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      order.status === 'ready' ? 'bg-green-100 text-green-600' : 
                      order.status === 'cooking' ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status || 'NEW'}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="font-medium">{item.name} {item.optionName && `(${item.optionName})`}</span>
                        <span className="font-bold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(!order.status || order.status === 'new') && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'cooking')}
                        className="col-span-2 bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                         <ChefHat size={18} /> Готовить
                      </button>
                    )}
                    {order.status === 'cooking' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="col-span-2 bg-yellow-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                         <Clock size={18} /> Готово к выдаче
                      </button>
                    )}
                    {order.status === 'ready' && (
                       <button 
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="col-span-2 bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                         <Check size={18} /> Завершить
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && mockStats && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
               {['day', 'week', 'month'].map((t) => (
                 <button
                   key={t}
                   onClick={() => setTimeRange(t as any)}
                   className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                     timeRange === t ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'
                   }`}
                 >
                   {t === 'day' ? 'Сутки' : t === 'week' ? 'Неделя' : 'Месяц'}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Выручка" value={`${mockStats.totalRevenue.toLocaleString()}₽`} subValue={`За ${timeRange}`} icon={<DollarSign size={20} />} trend="up" />
              <StatCard title="Заказы" value={`${mockStats.totalOrders}`} subValue="Всего за период" icon={<ShoppingBag size={20} />} trend="up" />
              <StatCard title="AOV" value={`${mockStats.aov}₽`} subValue="Ср. чек" icon={<BarChart3 size={20} />} />
              <StatCard title="LTV" value={`${mockStats.ltv.toLocaleString()}₽`} subValue="Ценность" icon={<Users size={20} />} trend="up" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <StatCard title="Конверсия" value={`${mockStats.cr}%`} subValue="CR" icon={<TrendingUp size={20} />} trend="down" />
               <StatCard title="Отток" value={`${mockStats.churn}%`} subValue="Churn" icon={<TrendingDown size={20} />} trend="down" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50">
                  <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                    <BarChart3 size={18} className="text-accent" /> Динамика
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockStats.revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               {/* Pie Chart Omitted for brevity, follows similar pattern */}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

// --- Sub Components ---

const ProductListItem = ({ product, onEdit, onDelete }: { product: Product, onEdit: () => void, onDelete: () => void }) => (
  <div className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <img src={product.image} className="w-12 h-12 rounded-lg object-cover bg-slate-200" />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-sm text-primary truncate">{product.name}</h4>
        <span className="font-bold text-xs text-accent whitespace-nowrap">{product.price}₽</span>
      </div>
      <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{product.description}</p>
    </div>
    <div className="flex gap-1 items-center">
      <button onClick={onEdit} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit2 size={14} /></button>
      <button onClick={onDelete} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
    </div>
  </div>
);

const StatCard = ({ title, value, subValue, icon, trend }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50 relative overflow-hidden">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-slate-50 rounded-xl text-primary">{icon}</div>
      {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {trend === 'up' ? '+12%' : '-4%'}
          </div>
      )}
    </div>
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-primary mt-1">{value}</h3>
      <p className="text-xs text-slate-400 mt-1">{subValue}</p>
    </div>
  </div>
);

const EditProductModal = ({ product, categories, onClose, onSave }: any) => {
  const [localProduct, setLocalProduct] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localProduct);
  };

  const handleUpdateOption = (optId: string, field: string, val: any) => {
    setLocalProduct((prev: any) => ({
      ...prev,
      options: prev.options.map((o: any) => o.id === optId ? { ...o, [field]: val } : o)
    }));
  };

  const handleAddOption = () => {
    setLocalProduct((prev: any) => ({
      ...prev,
      options: [...(prev.options || []), { id: Date.now().toString(), name: '', priceModifier: 0 }]
    }));
  };
  
  const toggleTag = (tag: string) => {
    const currentTags = localProduct.tags || [];
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    setLocalProduct({...localProduct, tags: newTags});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{localProduct.id ? 'Редактировать' : 'Новый товар'}</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Название</label>
            <input 
              value={localProduct.name} 
              onChange={e => setLocalProduct({...localProduct, name: e.target.value})}
              className="w-full p-3 bg-slate-50 rounded-xl mt-1 border border-slate-100" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Цена</label>
              <input type="number" value={localProduct.price} onChange={e => setLocalProduct({...localProduct, price: Number(e.target.value)})} className="w-full p-3 bg-slate-50 rounded-xl mt-1 border border-slate-100" required />
             </div>
             <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Старая цена</label>
              <input type="number" value={localProduct.oldPrice || ''} onChange={e => setLocalProduct({...localProduct, oldPrice: Number(e.target.value)})} className="w-full p-3 bg-slate-50 rounded-xl mt-1 border border-slate-100" />
             </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Категория</label>
            <select value={localProduct.category} onChange={e => setLocalProduct({...localProduct, category: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl mt-1 border border-slate-100">
              {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Опции</label>
              <button type="button" onClick={handleAddOption} className="text-xs font-bold text-accent">+ Добавить</button>
            </div>
            {localProduct.options?.map((opt: any) => (
              <div key={opt.id} className="flex gap-2 mb-2">
                 <input value={opt.name} onChange={(e) => handleUpdateOption(opt.id, 'name', e.target.value)} className="flex-1 p-2 text-sm rounded-lg border border-slate-200"/>
                 <input type="number" value={opt.priceModifier} onChange={(e) => handleUpdateOption(opt.id, 'priceModifier', Number(e.target.value))} className="w-20 p-2 text-sm rounded-lg border border-slate-200"/>
              </div>
            ))}
          </div>

          <div>
             <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Метки</label>
             <div className="flex gap-2">
               {['hit', 'spicy', 'vegan', 'new'].map(tag => (
                 <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-sm font-bold border ${localProduct.tags?.includes(tag) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`}>{tag}</button>
               ))}
             </div>
          </div>

          <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg mt-4">Сохранить</button>
        </form>
      </div>
    </div>
  );
};

export default AdminPanel;