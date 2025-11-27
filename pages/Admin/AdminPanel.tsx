
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/StoreContext';
import { BackButton } from '../../components/ui/BackButton';
import { Plus, Trash2, Edit2, BarChart3, Package, Layers, X } from 'lucide-react';
import { Product, Option } from '../../types';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    products, categories, 
    createProduct, updateProduct, deleteProduct, 
    createCategory, deleteCategory, getStats 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'stats'>('products');
  const [stats, setStats] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    if (activeTab === 'stats') {
      getStats().then(setStats);
    }
  }, [activeTab, getStats]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      if (editingProduct.id) {
        await updateProduct(editingProduct.id, editingProduct);
      } else {
        await createProduct(editingProduct);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  };

  const openEditModal = (p?: Product) => {
    setEditingProduct(p || {
      name: '', description: '', price: 0, 
      category: categories[0]?.name || '', 
      ingredients: [], options: [], image: 'https://placehold.co/600x400'
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
      <div className="flex p-4 gap-2 overflow-x-auto">
        {[
          { id: 'products', icon: Package, label: 'Товары' },
          { id: 'categories', icon: Layers, label: 'Категории' },
          { id: 'stats', icon: BarChart3, label: 'Статистика' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
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
          <div>
            <button 
              onClick={() => openEditModal()}
              className="w-full mb-4 bg-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Plus size={20} /> Добавить товар
            </button>
            
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm flex gap-3">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-gray-400">{p.category} • {p.price}₽</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditModal(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
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

        {/* STATS TAB */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase">Всего заказов</p>
                <p className="text-2xl font-black text-primary">{stats.totalOrders}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <p className="text-gray-400 text-xs font-bold uppercase">Выручка</p>
                <p className="text-2xl font-black text-accent">{stats.totalRevenue}₽</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <h3 className="font-bold mb-3">Популярные товары</h3>
              {stats.popularItems?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm">{item.name}</span>
                  <span className="font-bold text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingProduct.id ? 'Редактировать' : 'Новый товар'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Название</label>
                <input 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Цена</label>
                  <input 
                    type="number"
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                    required 
                  />
                 </div>
                 <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Старая цена</label>
                  <input 
                    type="number"
                    value={editingProduct.oldPrice || ''} 
                    onChange={e => setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})}
                    className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                  />
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Категория</label>
                <select 
                   value={editingProduct.category}
                   onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                   className="w-full p-3 bg-slate-50 rounded-xl mt-1"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Описание</label>
                <textarea 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl mt-1 h-24" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">URL Изображения</label>
                <input 
                  value={editingProduct.image} 
                  onChange={e => setEditingProduct({...editingProduct, image: e.target.value})}
                  className="w-full p-3 bg-slate-50 rounded-xl mt-1" 
                />
              </div>

              <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg mt-4">
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
