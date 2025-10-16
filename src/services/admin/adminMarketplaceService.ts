import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  seller_id: string;
  seller_name: string;
  images: string[];
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
  stock_quantity: number;
  tags: string[];
  location: string;
  rating: number;
  reviews_count: number;
}

export interface MarketplaceOrder {
  id: string;
  buyer_id: string;
  buyer_name: string;
  seller_id: string;
  seller_name: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  shipping_address: {
    street: string;
    city: string;
    country: string;
    postal_code: string;
  };
  tracking_number?: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  raised_by_name: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at: string;
  evidence: string[];
}

export interface MarketplaceStats {
  total_products: number;
  active_products: number;
  pending_products: number;
  total_orders: number;
  orders_by_status: Record<string, number>;
  revenue_by_period: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  top_categories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  top_sellers: Array<{
    seller_id: string;
    seller_name: string;
    products_count: number;
    revenue: number;
  }>;
  recent_disputes: Dispute[];
}

export class AdminMarketplaceService extends BaseService<MarketplaceProduct> {
  constructor() {
    super('/admin/marketplace', 'admin_marketplace_products');
  }

  async getProducts(filters?: {
    status?: string;
    category?: string;
    seller_id?: string;
    search?: string;
  }): Promise<ApiResponse<MarketplaceProduct[]>> {
    const allProducts = await this.getAll();
    if (!allProducts.success || !allProducts.data) {
      return allProducts;
    }

    let filteredProducts = allProducts.data;

    if (filters) {
      if (filters.status) {
        filteredProducts = filteredProducts.filter(product => product.status === filters.status);
      }
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => product.category === filters.category);
      }
      if (filters.seller_id) {
        filteredProducts = filteredProducts.filter(product => product.seller_id === filters.seller_id);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.seller_name.toLowerCase().includes(searchLower)
        );
      }
    }

    return { success: true, data: filteredProducts };
  }

  async approveProduct(productId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/products/${productId}/approve`, {
      method: 'POST'
    });
  }

  async rejectProduct(productId: string, reason: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/products/${productId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async suspendProduct(productId: string, reason: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/products/${productId}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getOrders(filters?: {
    status?: string;
    buyer_id?: string;
    seller_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<MarketplaceOrder[]>> {
    return this.apiRequest<MarketplaceOrder[]>('/orders', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }

  async getDisputes(filters?: {
    status?: string;
    priority?: string;
    assigned_to?: string;
  }): Promise<ApiResponse<Dispute[]>> {
    return this.apiRequest<Dispute[]>('/disputes', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  async assignDispute(disputeId: string, assignedTo: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/disputes/${disputeId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigned_to: assignedTo })
    });
  }

  async resolveDispute(disputeId: string, resolution: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution })
    });
  }

  async getMarketplaceStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<MarketplaceStats>> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.apiRequest<MarketplaceStats>(`/stats?${params.toString()}`);
  }

  async getCategories(): Promise<ApiResponse<Array<{ id: string; name: string; count: number }>>> {
    return this.apiRequest('/categories');
  }

  async createCategory(category: { name: string; description?: string }): Promise<ApiResponse<any>> {
    return this.apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(category)
    });
  }

  async updateCategory(categoryId: string, updates: Partial<{ name: string; description?: string }>): Promise<ApiResponse<any>> {
    return this.apiRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<ApiResponse<{
    period: string;
    revenue: number;
    orders_count: number;
    average_order_value: number;
    growth_rate: number;
  }[]>> {
    return this.apiRequest(`/reports/revenue?period=${period}`);
  }

  async getTopProducts(limit: number = 10): Promise<ApiResponse<Array<{
    product_id: string;
    product_name: string;
    sales_count: number;
    revenue: number;
    rating: number;
  }>>> {
    return this.apiRequest(`/reports/top-products?limit=${limit}`);
  }

  async getSellerPerformance(sellerId?: string): Promise<ApiResponse<Array<{
    seller_id: string;
    seller_name: string;
    products_count: number;
    orders_count: number;
    revenue: number;
    average_rating: number;
    response_time: number;
  }>>> {
    const params = sellerId ? `?seller_id=${sellerId}` : '';
    return this.apiRequest(`/reports/seller-performance${params}`);
  }

  async exportMarketplaceData(type: 'products' | 'orders' | 'disputes' | 'all', format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<string>> {
    return this.apiRequest<string>(`/export/${type}?format=${format}`);
  }
}

export const adminMarketplaceService = new AdminMarketplaceService();