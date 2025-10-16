import { BaseService } from '../baseService';
import { ProducerSale, ApiResponse } from '@/types';

export class ProducerSaleService extends BaseService<ProducerSale> {
  constructor() {
    super('/producer/sales', 'producer_sales');
  }

  async getSalesByProducer(producerId: string): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const filteredSales = allResponse.data.filter(sale => sale.producer_id === producerId);
    return { success: true, data: filteredSales };
  }

  async getSalesByStatus(status: ProducerSale['status']): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const filteredSales = allResponse.data.filter(sale => sale.status === status);
    return { success: true, data: filteredSales };
  }

  async getSalesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const filteredSales = allResponse.data.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return saleDate >= start && saleDate <= end;
    });

    return { success: true, data: filteredSales };
  }

  async getSalesByProduct(product: string): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const filteredSales = allResponse.data.filter(sale =>
      sale.product.toLowerCase().includes(product.toLowerCase())
    );
    return { success: true, data: filteredSales };
  }

  async getRecentSales(days: number = 30): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

    const recentSales = allResponse.data.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= cutoffDate;
    });

    return { success: true, data: recentSales.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) };
  }

  async getSalesByBuyerType(buyerType: ProducerSale['buyer_type']): Promise<ApiResponse<ProducerSale[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des ventes' };
    }

    const filteredSales = allResponse.data.filter(sale => sale.buyer_type === buyerType);
    return { success: true, data: filteredSales };
  }

  async getSaleStats(producerId: string): Promise<ApiResponse<{
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    failed: number;
    totalRevenue: number;
    totalQuantity: number;
    averageSaleValue: number;
    byMonth: Record<string, { revenue: number; quantity: number }>;
    byProduct: Record<string, { revenue: number; quantity: number }>;
    byBuyerType: Record<ProducerSale['buyer_type'], { count: number; revenue: number }>;
  }>> {
    const salesResponse = await this.getSalesByProducer(producerId);
    if (!salesResponse.success || !salesResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des statistiques' };
    }

    const sales = salesResponse.data;
    const total = sales.length;
    const completed = sales.filter(s => s.status === 'completed').length;
    const pending = sales.filter(s => s.status === 'pending').length;
    const cancelled = sales.filter(s => s.status === 'cancelled').length;
    const failed = sales.filter(s => s.status === 'failed').length;

    const totalRevenue = sales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.total_price, 0);

    const totalQuantity = sales
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + s.quantity, 0);

    const averageSaleValue = completed > 0 ? totalRevenue / completed : 0;

    const byMonth = sales.reduce((acc, sale) => {
      if (sale.status === 'completed') {
        const month = new Date(sale.date).toISOString().substring(0, 7);
        if (!acc[month]) {
          acc[month] = { revenue: 0, quantity: 0 };
        }
        acc[month].revenue += sale.total_price;
        acc[month].quantity += sale.quantity;
      }
      return acc;
    }, {} as Record<string, { revenue: number; quantity: number }>);

    const byProduct = sales.reduce((acc, sale) => {
      if (sale.status === 'completed') {
        if (!acc[sale.product]) {
          acc[sale.product] = { revenue: 0, quantity: 0 };
        }
        acc[sale.product].revenue += sale.total_price;
        acc[sale.product].quantity += sale.quantity;
      }
      return acc;
    }, {} as Record<string, { revenue: number; quantity: number }>);

    const byBuyerType = sales.reduce((acc, sale) => {
      if (sale.status === 'completed') {
        if (!acc[sale.buyer_type]) {
          acc[sale.buyer_type] = { count: 0, revenue: 0 };
        }
        acc[sale.buyer_type].count += 1;
        acc[sale.buyer_type].revenue += sale.total_price;
      }
      return acc;
    }, {} as Record<ProducerSale['buyer_type'], { count: number; revenue: number }>);

    return {
      success: true,
      data: {
        total,
        completed,
        pending,
        cancelled,
        failed,
        totalRevenue,
        totalQuantity,
        averageSaleValue,
        byMonth,
        byProduct,
        byBuyerType,
      },
    };
  }

  async getMonthlyRevenue(producerId: string, year?: number): Promise<ApiResponse<Array<{ month: string; revenue: number }>>> {
    const salesResponse = await this.getSalesByProducer(producerId);
    if (!salesResponse.success || !salesResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des revenus' };
    }

    const currentYear = year || new Date().getFullYear();
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i).toLocaleString('fr-FR', { month: 'long' }),
      revenue: 0,
    }));

    salesResponse.data
      .filter(sale => {
        const saleYear = new Date(sale.date).getFullYear();
        return saleYear === currentYear && sale.status === 'completed';
      })
      .forEach(sale => {
        const monthIndex = new Date(sale.date).getMonth();
        monthlyRevenue[monthIndex].revenue += sale.total_price;
      });

    return { success: true, data: monthlyRevenue };
  }

  // Validation des données
  validateSale(sale: Omit<ProducerSale, 'id' | 'created_at' | 'updated_at'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!sale.product || sale.product.trim() === '') {
      errors.push('Le produit est requis');
    }

    if (!sale.quantity || sale.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (!sale.price || sale.price <= 0) {
      errors.push('Le prix unitaire doit être supérieur à 0');
    }

    if (!sale.total_price || sale.total_price <= 0) {
      errors.push('Le prix total doit être supérieur à 0');
    }

    if (!sale.buyer || sale.buyer.trim() === '') {
      errors.push('L\'acheteur est requis');
    }

    if (!['cooperative', 'merchant', 'individual'].includes(sale.buyer_type)) {
      errors.push('Le type d\'acheteur doit être cooperative, merchant ou individual');
    }

    if (!sale.date || sale.date.trim() === '') {
      errors.push('La date de vente est requise');
    } else {
      const saleDate = new Date(sale.date);
      const currentDate = new Date();
      if (saleDate > currentDate) {
        errors.push('La date de vente ne peut pas être dans le futur');
      }
    }

    if (!sale.producer_id || sale.producer_id.trim() === '') {
      errors.push('L\'ID du producteur est requis');
    }

    return { isValid: errors.length === 0, errors };
  }

  async createSale(sale: Omit<ProducerSale, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ProducerSale>> {
    const validation = this.validateSale(sale);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    return this.create(sale);
  }

  async updateSale(id: string, updates: Partial<ProducerSale>): Promise<ApiResponse<ProducerSale | undefined>> {
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      return { success: false, error: 'La quantité doit être supérieure à 0' };
    }

    if (updates.price !== undefined && updates.price <= 0) {
      return { success: false, error: 'Le prix unitaire doit être supérieur à 0' };
    }

    if (updates.total_price !== undefined && updates.total_price <= 0) {
      return { success: false, error: 'Le prix total doit être supérieur à 0' };
    }

    if (updates.date) {
      const saleDate = new Date(updates.date);
      const currentDate = new Date();
      if (saleDate > currentDate) {
        return { success: false, error: 'La date de vente ne peut pas être dans le futur' };
      }
    }

    return this.update(id, updates);
  }

  async updateSaleStatus(id: string, status: ProducerSale['status']): Promise<ApiResponse<ProducerSale | undefined>> {
    return this.update(id, { status });
  }

  // Initialisation avec données de démonstration
  initializeDemoData(producerId: string): void {
    const existingData = this.getLocalStorageData();
    if (existingData.length > 0) return;

    const demoSales: ProducerSale[] = [
      {
        id: 'sale-1',
        product: 'Cacao',
        quantity: 400,
        unit: 'kg',
        price: 2000,
        total_price: 800000,
        currency: 'FCFA',
        buyer: 'Coopérative Abidjan',
        buyer_type: 'cooperative',
        buyer_contact: '+225 01 23 45 67 89',
        date: '2024-01-20',
        status: 'completed',
        payment_method: 'bank_transfer',
        payment_status: 'paid',
        producer_id: producerId,
        offer_id: 'offer-1',
        delivery_method: 'pickup',
        notes: 'Vente satisfaisante, paiement reçu',
        created_at: '2024-01-20T14:00:00Z',
        updated_at: '2024-01-25T10:00:00Z',
      },
      {
        id: 'sale-2',
        product: 'Café',
        quantity: 250,
        unit: 'kg',
        price: 2500,
        total_price: 625000,
        currency: 'FCFA',
        buyer: 'MarketCI',
        buyer_type: 'merchant',
        buyer_contact: '+225 09 87 65 43 21',
        date: '2024-02-25',
        status: 'pending',
        payment_method: 'mobile_money',
        payment_status: 'pending',
        producer_id: producerId,
        offer_id: 'offer-2',
        delivery_method: 'delivery',
        delivery_address: 'Abidjan, Plateau',
        notes: 'En attente de confirmation',
        created_at: '2024-02-25T16:00:00Z',
        updated_at: '2024-02-25T16:00:00Z',
      },
      {
        id: 'sale-3',
        product: 'Anacarde',
        quantity: 150,
        unit: 'kg',
        price: 1500,
        total_price: 225000,
        currency: 'FCFA',
        buyer: 'Export Ivoire',
        buyer_type: 'merchant',
        buyer_contact: '+225 07 89 01 23 45',
        date: '2024-03-15',
        status: 'completed',
        payment_method: 'bank_transfer',
        payment_status: 'paid',
        producer_id: producerId,
        offer_id: 'offer-3',
        delivery_method: 'delivery',
        delivery_address: 'Port d\'Abidjan',
        notes: 'Exportation réussie',
        created_at: '2024-03-15T11:00:00Z',
        updated_at: '2024-03-18T14:00:00Z',
      },
    ];

    this.setLocalStorageData(demoSales);
  }
}

export const producerSaleService = new ProducerSaleService();