import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { BackButton } from '../components/ui/BackButton';
import { Clock } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { history } = useStore();

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
          history.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock size={16} />
                  {order.date}
                </div>
                <div className="font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded text-xs">
                  #{order.id}
                </div>
              </div>
              
              <div className="space-y-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.quantity} x {item.name} {item.optionName ? `(${item.optionName})` : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-2 border-t border-dashed border-gray-200 flex justify-end">
                <span className="font-black text-lg text-blue-900">{order.total}₽</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;