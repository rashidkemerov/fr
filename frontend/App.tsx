import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/StoreContext';

// Lazy load pages
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const History = lazy(() => import('./pages/History'));
// Updated import path for AdminPanel in the Admin folder
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-orange-500"></div>
  </div>
);

const ToastContainer = () => {
  const { toasts, removeToast } = useStore();
  
  return (
    <div className="fixed bottom-24 left-0 w-full px-4 z-[60] pointer-events-none flex flex-col gap-2 items-center">
      {toasts.map(toast => (
        <div 
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className="pointer-events-auto bg-primary/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-xl animate-fade-in flex items-center gap-2 max-w-[90%]"
        >
          {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-green-400" />}
          {toast.type === 'info' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

const AppContent = () => {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/history" element={<History />} />
          {/* Admin Route */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </StoreProvider>
  );
};

export default App;