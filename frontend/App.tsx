
import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store/StoreContext';

// Lazy load pages
const Catalog = lazy(() => import('./pages/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const History = lazy(() => import('./pages/History'));
const AdminPanel = lazy(() => import('./pages/Admin/AdminPanel'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
    <div className="space-y-4 w-full px-8 max-w-sm">
      <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4 mx-auto"></div>
      <div className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
        <div className="h-32 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>
    </div>
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
  const { theme, fontSize } = useStore();

  const getFontSizeClass = () => {
    if (fontSize === 'small') return 'text-sm';
    if (fontSize === 'large') return 'text-lg';
    return 'text-base';
  };

  const themeStyles = {
    backgroundColor: theme === 'dark' ? '#3b445b' : '#fffdeb',
    color: theme === 'dark' ? '#f8fafc' : '#0F172A',
    minHeight: '100vh',
    transition: 'background-color 0.3s, color 0.3s'
  };

  return (
    <div style={themeStyles} className={getFontSizeClass()}>
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
    </div>
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
