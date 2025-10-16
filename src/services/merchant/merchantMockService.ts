import {
  MerchantInventory,
  MerchantOrder,
  MerchantSale,
  MerchantPayment,
  MerchantStats
} from './merchantService';

// Mock data storage
let mockInventory: MerchantInventory[] = [
  {
    id: '1',
    product: 'Bananes',
    currentStock: 45,
    maxStock: 100,
    unit: 'kg',
    location: 'Entrepôt A',
    expiryDate: '2024-03-20',
    status: 'ok',
    category: 'fruits',
    price: 500
  },
  {
    id: '2',
    product: 'Mangues',
    currentStock: 15,
    maxStock: 80,
    unit: 'kg',
    location: 'Entrepôt A',
    expiryDate: '2024-03-18',
    status: 'low',
    category: 'fruits',
    price: 1000
  },
  {
    id: '3',
    product: 'Oranges',
    currentStock: 5,
    maxStock: 60,
    unit: 'kg',
    location: 'Entrepôt B',
    expiryDate: '2024-03-16',
    status: 'critical',
    category: 'fruits',
    price: 250
  },
  {
    id: '4',
    product: 'Ananas',
    currentStock: 32,
    maxStock: 40,
    unit: 'pièces',
    location: 'Entrepôt B',
    expiryDate: '2024-03-25',
    status: 'ok',
    category: 'fruits',
    price: 1500
  }
];

const mockOrders: MerchantOrder[] = [
  {
    id: 'CMD-001',
    client: 'Restaurant Le Baobab',
    products: [
      { name: 'Bananes', quantity: '10 kg', price: 5000 },
      { name: 'Mangues', quantity: '5 kg', price: 5000 }
    ],
    total: '50,000 FCFA',
    date: '2024-03-15',
    deliveryDate: '2024-03-16',
    status: 'pending',
    clientInfo: {
      phone: '+225 01 23 45 67 89',
      address: 'Abidjan, Cocody'
    }
  },
  {
    id: 'CMD-002',
    client: 'Supermarché Central',
    products: [
      { name: 'Oranges', quantity: '20 kg', price: 5000 },
      { name: 'Ananas', quantity: '8 pièces', price: 12000 }
    ],
    total: '120,000 FCFA',
    date: '2024-03-14',
    deliveryDate: '2024-03-15',
    status: 'confirmed',
    clientInfo: {
      phone: '+225 01 98 76 54 32',
      address: 'Abidjan, Plateau'
    }
  },
  {
    id: 'CMD-003',
    client: 'Marché de Treichville',
    products: [
      { name: 'Avocats', quantity: '15 kg', price: 75000 }
    ],
    total: '75,000 FCFA',
    date: '2024-03-13',
    deliveryDate: '2024-03-14',
    status: 'delivered',
    clientInfo: {
      phone: '+225 07 65 43 21 09',
      address: 'Abidjan, Treichville'
    }
  }
];

const mockSales: MerchantSale[] = [
  {
    id: '1',
    client: 'Restaurant Le Baobab',
    products: 'Bananes, Mangues',
    amount: '50,000 FCFA',
    date: '2024-03-15',
    status: 'completed',
    paymentMethod: 'mobile_money'
  },
  {
    id: '2',
    client: 'Supermarché Central',
    products: 'Oranges, Ananas',
    amount: '120,000 FCFA',
    date: '2024-03-14',
    status: 'pending',
    paymentMethod: 'bank_transfer'
  },
  {
    id: '3',
    client: 'Marché de Treichville',
    products: 'Avocats, Bananes',
    amount: '75,000 FCFA',
    date: '2024-03-13',
    status: 'completed',
    paymentMethod: 'cash'
  }
];

const mockPayments: MerchantPayment[] = [
  {
    id: 'PAY-001',
    client: 'Restaurant Le Baobab',
    amount: '50,000 FCFA',
    method: 'mobile_money',
    date: '2024-03-15',
    status: 'completed',
    reference: 'MM240315001',
    orderId: 'CMD-001'
  },
  {
    id: 'PAY-002',
    client: 'Supermarché Central',
    amount: '120,000 FCFA',
    method: 'bank_transfer',
    date: '2024-03-14',
    status: 'pending',
    reference: 'BT240314002',
    orderId: 'CMD-002'
  },
  {
    id: 'PAY-003',
    client: 'Marché de Treichville',
    amount: '75,000 FCFA',
    method: 'cash',
    date: '2024-03-13',
    status: 'completed',
    reference: 'CSH240313003',
    orderId: 'CMD-003'
  }
];

const mockStats: MerchantStats = {
  totalSales: 245000,
  totalRevenue: 1200000,
  pendingOrders: 1,
  lowStockItems: 1,
  criticalStockItems: 1,
  monthlyGrowth: 15,
  activeClients: 156
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const merchantMockService = {
  async getInventory(): Promise<MerchantInventory[]> {
    await delay(500);
    return [...mockInventory];
  },

  async addInventoryItem(item: Omit<MerchantInventory, 'id'>): Promise<MerchantInventory> {
    await delay(300);
    const newItem: MerchantInventory = {
      ...item,
      id: Date.now().toString(),
      status: (() => {
        const pct = (item.currentStock / item.maxStock) * 100;
        const crit = item.criticalThresholdPercent ?? 20;
        const low = item.lowThresholdPercent ?? 50;
        return pct < crit ? 'critical' : pct < low ? 'low' : 'ok';
      })()
    };
    (mockInventory as any).push(newItem);
    return newItem;
  },

  async updateInventoryItem(id: string, item: Partial<MerchantInventory>): Promise<MerchantInventory> {
    await delay(300);
    const index = mockInventory.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Item not found');

    mockInventory[index] = {
      ...mockInventory[index],
      ...item,
      status: item.currentStock !== undefined ?
        (() => {
          const lowP = item.lowThresholdPercent ?? mockInventory[index].lowThresholdPercent ?? 50;
          const critP = item.criticalThresholdPercent ?? mockInventory[index].criticalThresholdPercent ?? 20;
          const pct = (item.currentStock! / mockInventory[index].maxStock) * 100;
          return pct < critP ? 'critical' : pct < lowP ? 'low' : 'ok';
        })() : mockInventory[index].status
    };
    return mockInventory[index];
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await delay(300);
    (mockInventory as any) = mockInventory.filter(i => i.id !== id);
  },

  async getOrders(): Promise<MerchantOrder[]> {
    await delay(500);
    return [...mockOrders];
  },

  async updateOrderStatus(id: string, status: MerchantOrder['status']): Promise<MerchantOrder> {
    await delay(300);
    const index = mockOrders.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Order not found');

    mockOrders[index].status = status;
    return mockOrders[index];
  },

  async getSales(): Promise<MerchantSale[]> {
    await delay(500);
    return [...mockSales];
  },

  async createSale(sale: Omit<MerchantSale, 'id'>): Promise<MerchantSale> {
    await delay(300);
    const newSale: MerchantSale = {
      ...sale,
      id: Date.now().toString()
    };
    (mockSales as any).push(newSale);
    return newSale;
  },

  async getPayments(): Promise<MerchantPayment[]> {
    await delay(500);
    return [...mockPayments];
  },

  async createOrder(order: MerchantOrder): Promise<MerchantOrder> {
    await delay(200);
    (mockOrders as any).push(order);
    return order;
  },

  async processPayment(payment: Omit<MerchantPayment, 'id' | 'status'>): Promise<MerchantPayment> {
    await delay(300);
    const newPayment: MerchantPayment = {
      ...payment,
      id: Date.now().toString(),
      status: 'completed'
    };
    (mockPayments as any).push(newPayment);
    return newPayment;
  },

  async getStats(): Promise<MerchantStats> {
    await delay(300);
    return { ...mockStats };
  },

  async getLowStockItems(): Promise<MerchantInventory[]> {
    await delay(300);
    return mockInventory.filter(item => item.status === 'low');
  },

  async getCriticalStockItems(): Promise<MerchantInventory[]> {
    await delay(300);
    return mockInventory.filter(item => item.status === 'critical');
  },

  async exportInventory(): Promise<Blob> {
    await delay(1000);
    // Mock Excel file
    const csvContent = mockInventory.map(item =>
      `${item.product},${item.currentStock},${item.maxStock},${item.unit},${item.location},${item.expiryDate},${item.price}`
    ).join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }
};
