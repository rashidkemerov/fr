
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Order, Product, Category, Statistics } from '../types';
import { api } from '../api/client';

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
  
  // Admin Actions
  fetchData: () => Promise<void>;
  createProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getStats: () => Promise<Statistics | null>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        api.get<Product[]>('/products').catch(() => []),
        api.get<Category[]>('/categories').catch(() => [])
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error("Failed to load initial data", e);
      // Fallback for offline or dev if backend is down
      // setProducts(MOCK_PRODUCTS); // Optional: keep mock as fallback
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
      items: orderItems
    };
    
    setHistory(prev => [optimisticOrder, ...prev]);
    setCart([]);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: total,
          items: orderItems
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        showToast(`Заказ ${data.id} на кухне!`, 'success');
      } else {
        showToast('Заказ сохранен (Оффлайн)', 'info');
      }
    } catch (error) {
      console.warn('Backend unavailable, offline mode:', error);
      showToast('Нет связи. Заказ локально.', 'info');
    }
  };

  const clearCart = () => setCart([]);

  // --- Admin Functions ---

  const createProduct = async (product: Partial<Product>) => {
    await api.post('/products', product);
    await fetchData();
    showToast('Продукт создан');
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    await api.put(`/products/${id}`, product);
    await fetchData();
    showToast('Продукт обновлен');
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Удалить этот продукт?")) return;
    await api.delete(`/products/${id}`);
    await fetchData();
    showToast('Продукт удален', 'info');
  };

  const createCategory = async (name: string) => {
    await api.post('/categories', { name });
    await fetchData();
    showToast('Категория создана');
  };

  const deleteCategory = async (id: string) => {
    if (!window.confirm("Удалить категорию?")) return;
    await api.delete(`/categories/${id}`);
    await fetchData();
    showToast('Категория удалена');
  };

  const getStats = async () => {
    try {
      return await api.get<Statistics>('/stats');
    } catch {
      return null;
    }
  };

  return (
    <StoreContext.Provider value={{
      products, categories, isLoading,
      cart, favorites, history, toasts, 
      addToCart, removeFromCart, updateQuantity, toggleFavorite, 
      placeOrder, clearCart, getCartTotal, getProduct, 
      showToast, removeToast,
      fetchData, createProduct, updateProduct, deleteProduct,
      createCategory, deleteCategory, getStats
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
