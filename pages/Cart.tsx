import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { BackButton } from '../components/ui/BackButton';
import { Trash2, CreditCard, Bell, ShoppingBag } from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, getProduct, removeFromCart, updateQuantity, getCartTotal, placeOrder, showToast } = useStore();

  const total = getCartTotal();

  const handleOrder = () => {
    if (cart.length === 0) return;
    placeOrder();
    showToast('Заказ успешно отправлен!', 'success');
    navigate('/history');
  };

  const handleCallWaiter = () => {
    showToast('Официант уведомлен', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-40">
       {/* Header */}
       <div className="sticky top-0 z-20 bg-[#F8FAFC]/95 backdrop-blur-md p-4 flex items-center gap-4 shadow-sm">
         <BackButton onClick={() => navigate('/')} />
         <h1 className="text-xl font-black text-primary uppercase">Корзина</h1>
       </div>

       {/* Items List */}
       <div className="p-4 space-y-4">
         {cart.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
               <ShoppingBag size={48} />
             </div>
             <h2 className="text-xl font-bold text-primary mb-2">Корзина пуста</h2>
             <p className="text-gray-400 text-center max-w-[200px] mb-8">
               Добавьте вкусные блюда из меню, чтобы сделать заказ
             </p>
             <button 
               onClick={() => navigate('/')} 
               className="bg-accent text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-transform"
             >
               Перейти в меню
             </button>
           </div>
         ) : (
           cart.map((item, idx) => {
             const product = getProduct(item.productId);
             if (!product) return null;
             
             const option = item.selectedOptionId 
               ? product.options?.find(o => o.id === item.selectedOptionId) 
               : null;
             
             const unitPrice = (product.price + (option?.priceModifier || 0));
             const lineTotal = unitPrice * item.quantity;

             return (
               <div key={`${item.productId}-${item.selectedOptionId}`} className="bg-white rounded-3xl p-3 shadow-sm border border-slate-100 flex gap-4 items-center animate-fade-in">
                 <img src={product.image} className="w-24 h-24 rounded-2xl object-cover bg-slate-100" alt={product.name} />
                 
                 <div className="flex-1 min-w-0 py-1">
                   <div className="flex justify-between items-start mb-1">
                     <h3 className="font-bold text-primary text-sm leading-tight truncate pr-2">
                       {product.name}
                     </h3>
                     <button 
                       onClick={() => removeFromCart(item.productId, item.selectedOptionId)}
                       className="text-gray-300 hover:text-red-500 p-1 -mt-1 -mr-1 transition-colors"
                     >
                       <Trash2 size={18} />
                     </button>
                   </div>
                   
                   {option && (
                     <div className="inline-block bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5 mb-2">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{option.name}</p>
                     </div>
                   )}
                   
                   <div className="flex justify-between items-end mt-1">
                      <span className="font-black text-accent">{lineTotal}₽</span>
                      
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-2 py-1 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item.productId, -1, item.selectedOptionId)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 hover:text-primary active:scale-75 transition-transform"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-primary min-w-[16px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, 1, item.selectedOptionId)}
                          className="w-6 h-6 flex items-center justify-center font-bold text-slate-400 hover:text-primary active:scale-75 transition-transform"
                        >
                          +
                        </button>
                      </div>
                   </div>
                 </div>
               </div>
             );
           })
         )}
       </div>

       {/* Bottom Controls */}
       {cart.length > 0 && (
         <div className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-6 z-30 animate-slide-up">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">Итого к оплате</span>
              <span className="text-4xl font-black text-primary">{total}₽</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button 
                onClick={handleCallWaiter}
                className="bg-slate-50 text-slate-600 rounded-2xl py-4 font-bold flex flex-col items-center justify-center text-xs gap-2 active:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-400" />
                Вызвать официанта
              </button>
              <button 
                className="bg-slate-50 text-slate-600 rounded-2xl py-4 font-bold flex flex-col items-center justify-center text-xs gap-2 active:bg-slate-100 transition-colors"
              >
                <CreditCard size={20} className="text-slate-400" />
                Оставить чаевые
              </button>
            </div>

            <button 
              onClick={handleOrder}
              className="w-full bg-primary text-white rounded-2xl py-5 font-bold text-lg uppercase tracking-wider shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform relative overflow-hidden group"
            >
              <span className="relative z-10">Оформить заказ</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
         </div>
       )}
    </div>
  );
};

export default Cart;