
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { BackButton } from '../components/ui/BackButton';
import { Clock, ChefHat, CheckCircle2 } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useStore();

  const getStatusInfo = (status: string = 'new') => {
    switch(status) {
      case 'cooking': return { color: 'bg-yellow-100 text-yellow-600', text: 'Готовится', icon: ChefHat };
      case 'ready': return { color: 'bg-green-100 text-green-600', text: 'Готово', icon: CheckCircle2 };
      case 'completed': return { color: 'bg-gray-100 text-gray-500', text: 'Завершен', icon: CheckCircle2 };
      default: return { color: 'bg-blue-100 text-blue-600', text: 'Принят', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <div className="sticky top-0 z-10 bg-[#F0F4F8]/90 backdrop-blur-sm p-4 flex items-center gap-4 border-b border-gray-200">
        <BackButton onClick={() => navigate('/')} />
        <h1 className="text-2xl font-black text-blue-900 uppercase">История</h1>
      </div>

      <div className="p-4 space-y-4">
        {history.length === 0 ? (
           <div className="text-center py-20 text-gray-400">
             История заказов пуста
           </div>
        ) : (
          history.map((order) => {
            const status = getStatusInfo(order.status);
            const StatusIcon = status.icon;

            return (
              <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock size={14} />
                    {order.date}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.text}
                  </div>
                </div>
                
                <div className="space-y-2 mb-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.quantity} x {item.name} {item.optionName ? `(${item.optionName})` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400 font-medium">#{order.id}</span>
                  <span className="font-black text-lg text-blue-900">{order.total}₽</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
