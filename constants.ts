
import { Product } from './types';

export const CATEGORIES = [
  "ЗАВТРАКИ", "САЛАТЫ", "СУПЫ", "ЗАКУСКИ", "ГОРЯЧЕЕ", "ДЕСЕРТЫ", "НАПИТКИ"
];

const SUBCATEGORIES: Record<string, string[]> = {
  "ГОРЯЧЕЕ": ["Европейская", "Паназиатская", "Русская", "Восточная", "Итальянская"],
  "СУПЫ": ["Мясные", "Овощные", "Крем-супы"]
};

// Optimization: Use a small pool of static images. 
// Browsers will cache these 12 images, making the rendering of 1000 items instant 
// and drastically reducing memory usage compared to 1000 unique images.
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
];

// Client-side generator to mimic the backend JSON file
export const generateMockProducts = (count: number = 1000): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const subs = SUBCATEGORIES[category];
    const subcategory = subs ? subs[Math.floor(Math.random() * subs.length)] : undefined;
    
    const price = Math.floor(Math.random() * 2000) + 300;
    const hasOldPrice = Math.random() > 0.7;
    
    return {
      id: `gen-${i}`,
      name: `Блюдо №${i + 1}`,
      description: 'Свежайшие ингредиенты, уникальный рецепт от нашего шеф-повара. Подается горячим.',
      ingredients: ['Основа', 'Соус фирменный', 'Зелень', 'Специи'],
      price: price,
      oldPrice: hasOldPrice ? Math.floor(price * 1.2) : undefined,
      category: category,
      subcategory: subcategory,
      // Pick from the pool using modulo to cycle through cached images
      image: IMAGE_POOL[i % IMAGE_POOL.length],
      tags: Math.random() > 0.9 ? ['hit'] : Math.random() > 0.9 ? ['new'] : [],
      options: Math.random() > 0.8 ? [{id: 'o1', name: 'Большая порция', priceModifier: 200}] : []
    };
  });
};

export const MOCK_PRODUCTS: Product[] = generateMockProducts(1000);
