import { Product } from '@/types';

export const mockProducts: Product[] = [
  // Fruits
  {
    id: '1',
    name: 'Mangues Alphonso',
    category: 'fruits',
    price: 1500,
    currency: 'FCFA',
    quantity: 50,
    unit: 'kg',
    producer: 'Kouadio Amani',
    location: 'Abidjan, Cocody',
    harvest_date: '2024-01-15',
    expiry_date: '2024-02-15',
    description: 'Mangues juteuses et sucrées, récoltées à maturité parfaite',
    status: 'available'
  },
  {
    id: '2',
    name: 'Ananas Victoria',
    category: 'fruits',
    price: 1200,
    currency: 'FCFA',
    quantity: 30,
    unit: 'pièce',
    producer: 'Kouadio Amani',
    location: 'Abidjan, Cocody',
    harvest_date: '2024-01-18',
    expiry_date: '2024-02-05',
    description: 'Ananas frais et juteux, parfait pour les jus et desserts',
    status: 'available'
  },
  {
    id: '3',
    name: 'Bananes Plantain',
    category: 'fruits',
    price: 800,
    currency: 'FCFA',
    quantity: 100,
    unit: 'kg',
    producer: 'Kouadio Amani',
    location: 'Abidjan, Cocody',
    harvest_date: '2024-01-20',
    expiry_date: '2024-02-10',
    description: 'Bananes plantain fermes, idéales pour la cuisson',
    status: 'available'
  },

  // Légumes
  {
    id: '4',
    name: 'Tomates Cerises',
    category: 'legumes',
    price: 1000,
    currency: 'FCFA',
    quantity: 25,
    unit: 'kg',
    producer: 'Amani Kouassi',
    location: 'Yamoussoukro',
    harvest_date: '2024-01-22',
    expiry_date: '2024-01-30',
    description: 'Tomates cerises fraîches et sucrées',
    status: 'available'
  },
  {
    id: '5',
    name: 'Carottes Fraîches',
    category: 'legumes',
    price: 600,
    currency: 'FCFA',
    quantity: 40,
    unit: 'kg',
    producer: 'Amani Kouassi',
    location: 'Yamoussoukro',
    harvest_date: '2024-01-21',
    expiry_date: '2024-02-10',
    description: 'Carottes croquantes et nutritives',
    status: 'available'
  },
  {
    id: '6',
    name: 'Poivrons Rouges',
    category: 'legumes',
    price: 900,
    currency: 'FCFA',
    quantity: 20,
    unit: 'kg',
    producer: 'Amani Kouassi',
    location: 'Yamoussoukro',
    harvest_date: '2024-01-19',
    expiry_date: '2024-02-01',
    description: 'Poivrons doux et colorés',
    status: 'available'
  },

  // Volaille
  {
    id: '7',
    name: 'Poulets de Chair',
    category: 'volaille',
    price: 3500,
    currency: 'FCFA',
    quantity: 15,
    unit: 'pièce',
    producer: 'Fatou Traoré',
    location: 'Bouaké',
    harvest_date: '2024-01-20',
    expiry_date: '2024-01-25',
    description: 'Poulets élevés en plein air, nourris naturellement',
    status: 'available'
  },
  {
    id: '8',
    name: 'Œufs Frais',
    category: 'volaille',
    price: 150,
    currency: 'FCFA',
    quantity: 200,
    unit: 'pièce',
    producer: 'Fatou Traoré',
    location: 'Bouaké',
    harvest_date: '2024-01-22',
    expiry_date: '2024-02-05',
    description: 'Œufs frais de poules élevées en liberté',
    status: 'available'
  },

  // Poissons
  {
    id: '9',
    name: 'Carpe Fraîche',
    category: 'poissons',
    price: 2500,
    currency: 'FCFA',
    quantity: 30,
    unit: 'kg',
    producer: 'Yao N\'Guessan',
    location: 'Korhogo',
    harvest_date: '2024-01-21',
    expiry_date: '2024-01-24',
    description: 'Carpe pêchée localement, très fraîche',
    status: 'available'
  },
  {
    id: '10',
    name: 'Tilapia',
    category: 'poissons',
    price: 2200,
    currency: 'FCFA',
    quantity: 25,
    unit: 'kg',
    producer: 'Yao N\'Guessan',
    location: 'Korhogo',
    harvest_date: '2024-01-22',
    expiry_date: '2024-01-25',
    description: 'Tilapia d\'élevage, chair ferme et savoureuse',
    status: 'available'
  },

  // Céréales
  {
    id: '11',
    name: 'Riz Local',
    category: 'cereales',
    price: 700,
    currency: 'FCFA',
    quantity: 500,
    unit: 'kg',
    producer: 'Yao N\'Guessan',
    location: 'Korhogo',
    harvest_date: '2023-12-01',
    expiry_date: '2024-12-01',
    description: 'Riz de qualité locale, récolté récemment',
    status: 'available'
  },
  {
    id: '12',
    name: 'Maïs Grains',
    category: 'cereales',
    price: 400,
    currency: 'FCFA',
    quantity: 300,
    unit: 'kg',
    producer: 'Yao N\'Guessan',
    location: 'Korhogo',
    harvest_date: '2023-11-15',
    expiry_date: '2024-11-15',
    description: 'Maïs grains de bonne qualité',
    status: 'available'
  }
];

export const getProductsByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category);
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description?.toLowerCase().includes(lowercaseQuery) ||
    product.producer.toLowerCase().includes(lowercaseQuery) ||
    product.location.toLowerCase().includes(lowercaseQuery)
  );
};