import { Product } from './types';

export const CATEGORIES = [
  "ЗАВТРАКИ", "САЛАТЫ", "СУПЫ", "ЗАКУСКИ", "ГОРЯЧЕЕ", "ДЕСЕРТЫ", "НАПИТКИ"
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    category: 'ЗАВТРАКИ',
    name: 'ОВСЯНАЯ КАША С МАЛИНОЙ И ЛЕПЕСТКАМИ МИНДАЛЯ',
    description: 'Нежная овсяная каша на молоке или воде с добавлением свежей малины и миндальных лепестков.',
    ingredients: [
      'Овсяная каша с маслом',
      'Безглютеновые сырники с сметаной (2 шт.)',
      'Чайник чая на выбор'
    ],
    price: 1250,
    oldPrice: 1550,
    image: 'https://picsum.photos/id/1080/600/600',
    options: [
      { id: 'opt1', name: 'На молоке', priceModifier: 0 },
      { id: 'opt2', name: 'На воде', priceModifier: 0 },
      { id: 'opt3', name: 'На кокосовом молоке', priceModifier: 150 },
    ]
  },
  {
    id: 'p2',
    category: 'ЗАВТРАКИ',
    name: 'ОМЛЕТ ПО-ФРАНЦУЗКИ',
    description: 'Классический французский омлет, подается с картофельным пюре и свежим салатом.',
    ingredients: [
      'Омлет из 3 яиц',
      'Картофельное пюре',
      'Свежие овощи',
      'Тосты'
    ],
    price: 1250,
    oldPrice: 1550,
    image: 'https://picsum.photos/id/292/600/800',
    options: [
      { id: 'opt1', name: 'С сыром', priceModifier: 50 },
      { id: 'opt2', name: 'С ветчиной', priceModifier: 100 },
    ]
  },
  {
    id: 'p3',
    category: 'ЗАКУСКИ',
    name: 'ПЕЛЬМЕНИ ЖАРЕНЫЕ',
    description: 'Хрустящие пельмени ручной лепки с соусом на выбор.',
    ingredients: [
      'Пельмени с говядиной',
      'Соус тар-тар',
      'Зелень'
    ],
    price: 1250,
    oldPrice: 1550,
    image: 'https://picsum.photos/id/1025/600/600',
  },
  {
    id: 'p4',
    category: 'СУПЫ',
    name: 'БОРЩ С ГОВЯДИНОЙ',
    description: 'Наваристый борщ с пампушками и салом.',
    ingredients: [
      'Говяжий бульон',
      'Свекла, капуста',
      'Сметана',
      'Пампушки'
    ],
    price: 1250,
    oldPrice: 1550,
    image: 'https://picsum.photos/id/493/600/600',
  },
   {
    id: 'p5',
    category: 'САЛАТЫ',
    name: 'ЦЕЗАРЬ С КУРИЦЕЙ',
    description: 'Классический салат Цезарь.',
    ingredients: [
      'Салат романо',
      'Куриное филе',
      'Соус цезарь',
      'Пармезан'
    ],
    price: 950,
    image: 'https://picsum.photos/id/225/600/600',
  }
];