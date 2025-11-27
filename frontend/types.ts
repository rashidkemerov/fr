
export interface Option {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  ingredients: string[]; // "1 - ..., 2 - ..."
  price: number;
  oldPrice?: number;
  image: string;
  category: string; // Stored as Category Name or ID depending on backend, using Name for simplicity in frontend logic matching
  categoryId?: string;
  options?: Option[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedOptionId?: string;
}

export interface Order {
  id: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    optionName?: string;
  }[];
  total: number;
  status?: string;
}

export interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  popularItems: {name: string, count: number}[];
}

export enum PageRoute {
  CATALOG = '/',
  PRODUCT = '/product',
  CART = '/cart',
  HISTORY = '/history',
  ADMIN = '/admin',
}
