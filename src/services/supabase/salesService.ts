import { supabase } from './supabaseClient';

export interface Sale {
  id: string;
  merchant_id: string;
  client_name: string;
  products: string;
  amount: number;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash';
  status: 'completed' | 'pending' | 'cancelled';
  sale_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesByMethod: {
    mobile_money: number;
    bank_transfer: number;
    cash: number;
  };
  salesByStatus: {
    completed: number;
    pending: number;
    cancelled: number;
  };
}

class SalesService {
  private tableName = 'sales';

  async getSales(merchantId: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('merchant_id', merchantId)
        .order('sale_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  async createSale(sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'>): Promise<Sale> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([sale])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after insert');
      return data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
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
      console.error('Error updating sale:', error);
      throw error;
    }
  }

  async deleteSale(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  }

  async getSalesStats(merchantId: string, startDate?: string, endDate?: string): Promise<SaleStats> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('amount, payment_method, status')
        .eq('merchant_id', merchantId);

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const sales = data || [];
      const completedSales = sales.filter(s => s.status === 'completed');

      const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.amount), 0);
      const totalSales = completedSales.length;
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      const salesByMethod = {
        mobile_money: completedSales.filter(s => s.payment_method === 'mobile_money').length,
        bank_transfer: completedSales.filter(s => s.payment_method === 'bank_transfer').length,
        cash: completedSales.filter(s => s.payment_method === 'cash').length,
      };

      const salesByStatus = {
        completed: sales.filter(s => s.status === 'completed').length,
        pending: sales.filter(s => s.status === 'pending').length,
        cancelled: sales.filter(s => s.status === 'cancelled').length,
      };

      return {
        totalSales,
        totalRevenue,
        averageOrderValue,
        salesByMethod,
        salesByStatus,
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      throw error;
    }
  }

  async getSalesByDateRange(merchantId: string, startDate: string, endDate: string): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('merchant_id', merchantId)
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      throw error;
    }
  }

  async generateSalesReport(merchantId: string, startDate: string, endDate: string) {
    try {
      const sales = await this.getSalesByDateRange(merchantId, startDate, endDate);
      const stats = await this.getSalesStats(merchantId, startDate, endDate);

      return {
        period: { startDate, endDate },
        sales,
        stats,
        summary: {
          totalTransactions: sales.length,
          totalRevenue: stats.totalRevenue,
          averageOrderValue: stats.averageOrderValue,
          completedOrders: stats.salesByStatus.completed,
          pendingOrders: stats.salesByStatus.pending,
          cancelledOrders: stats.salesByStatus.cancelled,
        }
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }
}

export const salesService = new SalesService();
