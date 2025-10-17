import { supabase } from './supabaseClient';

export interface InventoryItem {
  id: string;
  merchant_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  max_stock: number;
  unit: string;
  location: string;
  expiry_date: string | null;
  price: number;
  status: 'ok' | 'low' | 'critical';
  low_threshold_percent: number;
  critical_threshold_percent: number;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'sale' | 'return' | 'loss';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reason?: string;
  reference_id?: string;
  reference_type?: 'sale' | 'order' | 'manual' | 'system';
  created_by?: string;
  created_at: string;
}

class InventoryService {
  private tableName = 'inventory';
  private movementsTable = 'stock_movements';

  async getInventory(merchantId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('merchant_id', merchantId)
        .order('product_name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  }

  async getInventoryById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  async addInventoryItem(item: Omit<InventoryItem, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after insert');
      return data;
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  }

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after update');
      return data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  async getLowStockItems(merchantId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('merchant_id', merchantId)
        .in('status', ['low', 'critical'])
        .order('status', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  async getCriticalStockItems(merchantId: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('status', 'critical')
        .order('current_stock');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching critical stock items:', error);
      throw error;
    }
  }

  async updateStockLevel(inventoryId: string, newStock: number, reason?: string, referenceId?: string): Promise<InventoryItem> {
    try {
      const item = await this.getInventoryById(inventoryId);
      if (!item) throw new Error('Inventory item not found');

      const { data, error } = await supabase
        .from(this.tableName)
        .update({ current_stock: newStock })
        .eq('id', inventoryId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after update');
      return data;
    } catch (error) {
      console.error('Error updating stock level:', error);
      throw error;
    }
  }

  async recordStockMovement(movement: Omit<StockMovement, 'id' | 'created_at'>): Promise<StockMovement> {
    try {
      const { data, error } = await supabase
        .from(this.movementsTable)
        .insert([movement])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after insert');
      return data;
    } catch (error) {
      console.error('Error recording stock movement:', error);
      throw error;
    }
  }

  async getStockHistory(inventoryId: string, limit: number = 50): Promise<StockMovement[]> {
    try {
      const { data, error } = await supabase
        .from(this.movementsTable)
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw error;
    }
  }

  async adjustStock(inventoryId: string, newQuantity: number, reason: string, userId?: string): Promise<InventoryItem> {
    try {
      const item = await this.getInventoryById(inventoryId);
      if (!item) throw new Error('Inventory item not found');

      const previousStock = item.current_stock;

      await this.recordStockMovement({
        inventory_id: inventoryId,
        movement_type: 'adjustment',
        quantity: Math.abs(newQuantity - previousStock),
        previous_stock: previousStock,
        new_stock: newQuantity,
        reason,
        reference_type: 'manual',
        created_by: userId,
      });

      return await this.updateStockLevel(inventoryId, newQuantity, reason);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  async getInventoryStats(merchantId: string) {
    try {
      const inventory = await this.getInventory(merchantId);

      const totalItems = inventory.length;
      const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.price), 0);
      const lowStockCount = inventory.filter(item => item.status === 'low').length;
      const criticalStockCount = inventory.filter(item => item.status === 'critical').length;
      const okStockCount = inventory.filter(item => item.status === 'ok').length;

      const expiringItems = inventory.filter(item => {
        if (!item.expiry_date) return false;
        const today = new Date();
        const expiryDate = new Date(item.expiry_date);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      });

      return {
        totalItems,
        totalValue,
        stockStatus: {
          ok: okStockCount,
          low: lowStockCount,
          critical: criticalStockCount,
        },
        expiringItemsCount: expiringItems.length,
        expiringItems: expiringItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          expiry_date: item.expiry_date,
        })),
      };
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
