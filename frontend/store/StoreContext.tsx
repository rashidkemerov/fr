
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Order, Product, Category, Statistics, Theme, FontSize } from '../types';
import { api } from '../api/client';
import { MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from '../constants';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  favorites: string[];
  history: Order[];
  toasts: Toast[];
  isLoading: boolean;
  theme: Theme;
  fontSize: FontSize;
  
  // Cart Actions
  addToCart: (productId: string, quantity: number, optionId?: string) => void;
  removeFromCart: (productId: string, optionId?: string) => void;
  updateQuantity: (productId: string, delta: number, optionId?: string) => void;
  toggleFavorite: (productId: string) => void;
  placeOrder: () => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getProduct: (id: string) => Product | undefined;
  
  // UI Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  
  // Admin Actions
  fetchData: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getStats: () => Promise<Statistics | null>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Appearance State
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem('fontSize') as FontSize) || 'medium');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [history, setHistory] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Initial Fetch
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.get<Product[]>('/products').catch(() => MOCK_PRODUCTS),
        api.get<Category[]>('/categories').catch(() => MOCK_CATEGORIES.map((name, i) => ({ id: `cat-${i}`, name })))
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error("Failed to load initial data", e);
      // Fallback to offline logic
      try {
        const res = await fetch('/transit.json'); // Try loading transit.json first
        if (!res.ok) throw new Error("No transit JSON");
        const jsonProds = await res.json();
        setProducts(jsonProds);
        setCategories(MOCK_CATEGORIES.map((name, i) => ({ id: `cat-${i}`, name })));
      } catch (jsonError) {
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES.map((name, i) => ({ id: `cat-${i}`, name })));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getProduct = (id: string) => products.find(p => p.id === id);

  const addToCart = (productId: string, quantity: number, optionId?: string) => {
    vibrate(15);
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.productId === productId && item.selectedOptionId === optionId);
      if (existingIndex >= 0) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      return [...prev, { productId, quantity, selectedOptionId: optionId }];
    });
    showToast('Товар добавлен в корзину');
  };

  const removeFromCart = (productId: string, optionId?: string) => {
    vibrate(10);
    setCart(prev => prev.filter(item => !(item.productId === productId && item.selectedOptionId === optionId)));
  };

  const updateQuantity = (productId: string, delta: number, optionId?: string) => {
    vibrate(5);
    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId && item.selectedOptionId === optionId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const toggleFavorite = (productId: string) => {
    vibrate(10);
    const isAdding = !favorites.includes(productId);
    setFavorites(prev => 
      isAdding ? [...prev, productId] : prev.filter(id => id !== productId)
    );
    if (isAdding) showToast('Добавлено в избранное');
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const product = getProduct(item.productId);
      if (!product) return sum;
      let price = product.price;
      if (item.selectedOptionId) {
        const opt = product.options?.find(o => o.id === item.selectedOptionId);
        if (opt) price += opt.priceModifier;
      }
      return sum + (price * item.quantity);
    }, 0);
  };

  const placeOrder = async () => {
    vibrate([50, 50, 50]);
    const total = getCartTotal();
    
    const orderItems = cart.map(item => {
      const product = getProduct(item.productId);
      const option = product?.options?.find(o => o.id === item.selectedOptionId);
      return {
        name: product?.name || 'Unknown',
        quantity: item.quantity,
        optionName: option?.name
      };
    });

    const optimisticOrder: Order = {
      id: "loc-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: new Date().toLocaleString('ru-RU'),
      total,
      items: orderItems,
      status: 'new'
    };
    
    setHistory(prev => [optimisticOrder, ...prev]);
    setCart([]);

    try {
      const response = await api.post<Order>('/orders', {
        total: total,
        items: orderItems
      });
      showToast(`Заказ ${response.id || 'отправлен'} на кухне!`, 'success');
    } catch (error) {
      console.warn('Backend unavailable, offline mode:', error);
      showToast('Нет связи. Заказ локально.', 'info');
    }
  };

  const clearCart = () => setCart([]);

  // --- Admin Functions ---

  const createProduct = async (product: Partial<Product>) => {
    const enrichedProduct = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    try {
      await api.post('/products', enrichedProduct);
      await fetchData();
      showToast('Продукт создан');
    } catch (e) {
      console.warn("Offline: Product create mocked");
      // Optimistic update for offline mode
      const newProd = {
        id: `offline-${Date.now()}`,
        ...enrichedProduct
      } as Product;
      setProducts(prev => [...prev, newProd]);
      showToast('Offline: Продукт создан локально', 'info');
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    const enrichedProduct = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    try {
      await api.put(`/products/${id}`, enrichedProduct);
      await fetchData();
      showToast('Продукт обновлен');
    } catch (e) {
      console.warn("Offline: Product update mocked");
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...enrichedProduct } : p));
      showToast('Offline: Продукт обновлен локально', 'info');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Удалить этот продукт?")) return;
    try {
      await api.delete(`/products/${id}`);
      await fetchData();
      showToast('Продукт удален', 'info');
    } catch (e) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Offline: Продукт удален локально', 'info');
    }
  };

  const createCategory = async (name: string) => {
    try {
      await api.post('/categories', { name });
      await fetchData();
      showToast('Категория создана');
    } catch (e) {
      setCategories(prev => [...prev, { id: `cat-${Date.now()}`, name }]);
      showToast('Offline: Категория создана локально', 'info');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Удалить категорию?")) return;
    try {
      await api.delete(`/categories/${id}`);
      await fetchData();
      showToast('Категория удалена');
    } catch (e) {
      setCategories(prev => prev.filter(c => c.id !== id));
      showToast('Offline: Категория удалена локально', 'info');
    }
  };

  const getStats = async () => {
    try {
      return await api.get<Statistics>('/stats');
    } catch {
      return null;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      setHistory(prev => prev.map(o => o.id === id ? { ...o, status: status as any } : o));
      showToast(`Статус заказа изменен на ${status}`);
    } catch (e) {
      showToast('Ошибка обновления статуса', 'error');
    }
  };

  return (
    <StoreContext.Provider value={{
      products, categories, isLoading,
      cart, favorites, history, toasts, 
      theme, fontSize,
      addToCart, removeFromCart, updateQuantity, toggleFavorite, 
      placeOrder, clearCart, getCartTotal, getProduct, 
      showToast, removeToast,
      setTheme, setFontSize,
      fetchData, createProduct, updateProduct, deleteProduct,
      createCategory, deleteCategory, getStats, updateOrderStatus
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};