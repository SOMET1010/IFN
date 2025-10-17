import { BaseService } from '../baseService';
import { merchantMockService } from './merchantMockService';
import { salesService, Sale } from '../supabase/salesService';
import { inventoryService, InventoryItem } from '../supabase/inventoryService';
import { supabase } from '../supabase/supabaseClient';

export interface MerchantInventory {
  id: string;
  product: string;
  currentStock: number;
  maxStock: number;
  unit: string;
  location: string;
  expiryDate: string;
  status: 'ok' | 'low' | 'critical';
  category: string;
  price: number;
  lowThresholdPercent?: number; // 0-100
  criticalThresholdPercent?: number; // 0-100
}

export interface MerchantOrder {
  id: string;
  client: string;
  products: Array<{
    name: string;
    quantity: string;
    price: number;
  }>;
  total: string;
  date: string;
  deliveryDate: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  clientInfo: {
    phone: string;
    address: string;
  };
}

export interface MerchantSale {
  id: string;
  client: string;
  products: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
  paymentMethod: string;
}

export interface MerchantPayment {
  id: string;
  client: string;
  amount: string;
  method: 'mobile_money' | 'bank_transfer' | 'cash';
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference: string;
  orderId?: string;
}

export interface MerchantStats {
  totalSales: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockItems: number;
  criticalStockItems: number;
  monthlyGrowth: number;
  activeClients: number;
}

class MerchantService extends BaseService<MerchantInventory> {
  private readonly baseUrl = '/api/merchant';
  private useMock = false; // Using Supabase now

  constructor() {
    super('/merchant/inventory', 'merchant_inventory');
  }

  async getInventory(): Promise<MerchantInventory[]> {
    if (this.useMock) return merchantMockService.getInventory();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const items = await inventoryService.getInventory(user.id);
      return items.map(item => this.mapInventoryItemToMerchantInventory(item));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  }

  async addInventoryItem(item: Omit<MerchantInventory, 'id'>): Promise<MerchantInventory> {
    if (this.useMock) return merchantMockService.addInventoryItem(item);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newItem = await inventoryService.addInventoryItem({
        merchant_id: user.id,
        product_name: item.product,
        category: item.category,
        current_stock: item.currentStock,
        max_stock: item.maxStock,
        unit: item.unit,
        location: item.location,
        expiry_date: item.expiryDate || null,
        price: item.price,
        low_threshold_percent: item.lowThresholdPercent || 20,
        critical_threshold_percent: item.criticalThresholdPercent || 10,
      });

      return this.mapInventoryItemToMerchantInventory(newItem);
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }

  async updateInventoryItem(id: string, item: Partial<MerchantInventory>): Promise<MerchantInventory> {
    if (this.useMock) return merchantMockService.updateInventoryItem(id, item);
    try {
      const updates: any = {};
      if (item.product !== undefined) updates.product_name = item.product;
      if (item.category !== undefined) updates.category = item.category;
      if (item.currentStock !== undefined) updates.current_stock = item.currentStock;
      if (item.maxStock !== undefined) updates.max_stock = item.maxStock;
      if (item.unit !== undefined) updates.unit = item.unit;
      if (item.location !== undefined) updates.location = item.location;
      if (item.expiryDate !== undefined) updates.expiry_date = item.expiryDate || null;
      if (item.price !== undefined) updates.price = item.price;
      if (item.lowThresholdPercent !== undefined) updates.low_threshold_percent = item.lowThresholdPercent;
      if (item.criticalThresholdPercent !== undefined) updates.critical_threshold_percent = item.criticalThresholdPercent;

      const updatedItem = await inventoryService.updateInventoryItem(id, updates);
      return this.mapInventoryItemToMerchantInventory(updatedItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    if (this.useMock) return merchantMockService.deleteInventoryItem(id);
    try {
      await inventoryService.deleteInventoryItem(id);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  async getOrders(): Promise<MerchantOrder[]> {
    if (this.useMock) return merchantMockService.getOrders();
    // Pour les commandes, on utiliserait un autre service ou endpoint
    return [];
  }

  async getOrder(id: string): Promise<MerchantOrder> {
    if (this.useMock) {
      const orders = await merchantMockService.getOrders();
      const order = orders.find(o => o.id === id);
      if (!order) throw new Error('Order not found');
      return order;
    }
    throw new Error('Not implemented');
  }

  async updateOrderStatus(id: string, status: MerchantOrder['status']): Promise<MerchantOrder> {
    if (this.useMock) return merchantMockService.updateOrderStatus(id, status);
    throw new Error('Not implemented');
  }

  async getSales(): Promise<MerchantSale[]> {
    if (this.useMock) return merchantMockService.getSales();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const sales = await salesService.getSales(user.id);
      return sales.map(sale => this.mapSaleToMerchantSale(sale));
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }

  async createSale(sale: Omit<MerchantSale, 'id'>): Promise<MerchantSale> {
    if (this.useMock) return merchantMockService.createSale(sale);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const newSale = await salesService.createSale({
        merchant_id: user.id,
        client_name: sale.client,
        products: sale.products,
        amount: Number(String(sale.amount).replace(/[^0-9.]/g, '')),
        payment_method: sale.paymentMethod as 'mobile_money' | 'bank_transfer' | 'cash',
        status: sale.status,
        sale_date: sale.date,
      });

      return this.mapSaleToMerchantSale(newSale);
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  async getPayments(): Promise<MerchantPayment[]> {
    if (this.useMock) return merchantMockService.getPayments();
    return [];
  }

  async processPayment(payment: Omit<MerchantPayment, 'id' | 'status'>): Promise<MerchantPayment> {
    if (this.useMock) return merchantMockService.processPayment(payment);
    throw new Error('Not implemented');
  }

  async getStats(): Promise<MerchantStats> {
    if (this.useMock) return merchantMockService.getStats();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const salesStats = await salesService.getSalesStats(user.id);
      const inventoryStats = await inventoryService.getInventoryStats(user.id);

      return {
        totalSales: salesStats.totalSales,
        totalRevenue: salesStats.totalRevenue,
        pendingOrders: salesStats.salesByStatus.pending,
        lowStockItems: inventoryStats.stockStatus.low,
        criticalStockItems: inventoryStats.stockStatus.critical,
        monthlyGrowth: 0,
        activeClients: 0,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalSales: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockItems: 0,
        criticalStockItems: 0,
        monthlyGrowth: 0,
        activeClients: 0,
      };
    }
  }

  async getLowStockItems(): Promise<MerchantInventory[]> {
    if (this.useMock) return merchantMockService.getLowStockItems();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const items = await inventoryService.getLowStockItems(user.id);
      return items.map(item => this.mapInventoryItemToMerchantInventory(item));
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return [];
    }
  }

  async getCriticalStockItems(): Promise<MerchantInventory[]> {
    if (this.useMock) return merchantMockService.getCriticalStockItems();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const items = await inventoryService.getCriticalStockItems(user.id);
      return items.map(item => this.mapInventoryItemToMerchantInventory(item));
    } catch (error) {
      console.error('Error fetching critical stock items:', error);
      return [];
    }
  }

  async updateStockLevels(items: Array<{ id: string; quantity: number }>): Promise<void> {
    if (this.useMock) {
      // Mock implementation
      for (const item of items) {
        await merchantMockService.updateInventoryItem(item.id, { currentStock: item.quantity });
      }
      return;
    }
    for (const item of items) {
      await this.update(item.id, { currentStock: item.quantity });
    }
  }

  async bulkOrderUpdate(orders: Array<{ id: string; status: MerchantOrder['status'] }>): Promise<void> {
    if (this.useMock) {
      // Mock implementation
      for (const order of orders) {
        await merchantMockService.updateOrderStatus(order.id, order.status);
      }
      return;
    }
    throw new Error('Not implemented');
  }

  async generateSalesReport(startDate: string, endDate: string): Promise<{totalSales: number; totalRevenue: number; period: string; transactions: number}> {
    if (this.useMock) {
      // Mock implementation
      return {
        totalSales: 245000,
        totalRevenue: 1200000,
        period: `${startDate} to ${endDate}`,
        transactions: 150
      };
    }
    throw new Error('Not implemented');
  }

  async exportInventory(): Promise<Blob> {
    if (this.useMock) return merchantMockService.exportInventory();
    throw new Error('Not implemented');
  }

  private mapInventoryItemToMerchantInventory(item: InventoryItem): MerchantInventory {
    return {
      id: item.id,
      product: item.product_name,
      currentStock: item.current_stock,
      maxStock: item.max_stock,
      unit: item.unit,
      location: item.location,
      expiryDate: item.expiry_date || '',
      status: item.status,
      category: item.category,
      price: item.price,
      lowThresholdPercent: item.low_threshold_percent,
      criticalThresholdPercent: item.critical_threshold_percent,
    };
  }

  private mapSaleToMerchantSale(sale: Sale): MerchantSale {
    return {
      id: sale.id,
      client: sale.client_name,
      products: sale.products,
      amount: sale.amount.toString(),
      date: sale.sale_date,
      status: sale.status,
      paymentMethod: sale.payment_method,
    };
  }
}

export const merchantService = new MerchantService();
