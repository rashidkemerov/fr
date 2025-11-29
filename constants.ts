
import { Product } from './types';

export const CATEGORIES = [
  "ЗАВТРАКИ", "САЛАТЫ", "СУПЫ", "ЗАКУСКИ", "ГОРЯЧЕЕ", "ДЕСЕРТЫ", "НАПИТКИ"
];

const SUBCATEGORIES: Record<string, string[]> = {
  "ГОРЯЧЕЕ": ["Европейская", "Паназиатская", "Русская", "Восточная", "Итальянская"],
  "СУПЫ": ["Мясные", "Овощные", "Крем-супы"]
};

// Client-side generator to mimic the backend JSON file
export const generateMockProducts = (count: number = 1000): Product[] => {
  return Array.from({ length: count }, (_, i) => {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const subs = SUBCATEGORIES[category];
    const subcategory = subs ? subs[Math.floor(Math.random() * subs.length)] : undefined;
    
    const price = Math.floor(Math.random() * 2000) + 300;
    const hasOldPrice = Math.random() > 0.7;
    const name = `Блюдо №${i + 1}`;
    
    return {
      id: `gen-${i}`,
      name: name,
      description: 'Свежайшие ингредиенты, уникальный рецепт от нашего шеф-повара. Подается горячим.',
      ingredients: ['Основа', 'Соус фирменный', 'Зелень', 'Специи'],
      price: price,
      oldPrice: hasOldPrice ? Math.floor(price * 1.2) : undefined,
      category: category,
      subcategory: subcategory,
      // Using dummyimage with requested colors #09f background and #fff text
      image: `https://dummyimage.com/400x400/09f/fff.png&text=${encodeURIComponent(name)}`,
      tags: Math.random() > 0.9 ? ['hit'] : Math.random() > 0.9 ? ['new'] : [],
      options: Math.random() > 0.8 ? [{id: 'o1', name: 'Большая порция', priceModifier: 200}] : []
    };
  });
};

export const MOCK_PRODUCTS: Product[] = generateMockProducts(1000);
