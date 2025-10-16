import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface FinancialTransaction {
  id: string;
  type: 'payment' | 'refund' | 'transfer' | 'fee' | 'commission';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  from_user_id?: string;
  to_user_id?: string;
  order_id?: string;
  description: string;
  payment_method: string;
  reference: string;
  created_at: string;
  completed_at?: string;
  fees: number;
  net_amount: number;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'profit_loss' | 'cash_flow' | 'balance_sheet';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  generated_at: string;
  data: any;
  file_url?: string;
}

export interface PayoutRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  bank_account: {
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
  };
  requested_at: string;
  processed_at?: string;
  approved_by?: string;
  rejected_reason?: string;
  fees: number;
  net_amount: number;
}

export interface FeeStructure {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'tiered';
  value: number;
  applies_to: string;
  min_amount?: number;
  max_amount?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialStats {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_transactions: number;
  average_transaction_value: number;
  pending_payouts: number;
  pending_payouts_amount: number;
  monthly_revenue: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  revenue_by_source: Record<string, number>;
  expense_categories: Record<string, number>;
  top_merchants: Array<{
    merchant_id: string;
    merchant_name: string;
    revenue: number;
    transactions: number;
  }>;
}

export class AdminFinancialService extends BaseService<FinancialTransaction> {
  constructor() {
    super('/admin/financial', 'admin_financial_transactions');
  }

  async getTransactions(filters?: {
    type?: string;
    status?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
    payment_method?: string;
    min_amount?: number;
    max_amount?: number;
  }): Promise<ApiResponse<FinancialTransaction[]>> {
    const allTransactions = await this.getAll();
    if (!allTransactions.success || !allTransactions.data) {
      return allTransactions;
    }

    let filteredTransactions = allTransactions.data;

    if (filters) {
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      if (filters.user_id) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.from_user_id === filters.user_id || t.to_user_id === filters.user_id
        );
      }
      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.created_at) >= fromDate);
      }
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        filteredTransactions = filteredTransactions.filter(t => new Date(t.created_at) <= toDate);
      }
      if (filters.payment_method) {
        filteredTransactions = filteredTransactions.filter(t => t.payment_method === filters.payment_method);
      }
      if (filters.min_amount) {
        filteredTransactions = filteredTransactions.filter(t => t.amount >= filters.min_amount!);
      }
      if (filters.max_amount) {
        filteredTransactions = filteredTransactions.filter(t => t.amount <= filters.max_amount!);
      }
    }

    return { success: true, data: filteredTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) };
  }

  async getFinancialStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<FinancialStats>> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.apiRequest<FinancialStats>(`/stats?${params.toString()}`);
  }

  async getPayoutRequests(filters?: {
    status?: string;
    user_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PayoutRequest[]>> {
    return this.apiRequest<PayoutRequest[]>('/payouts', {
      method: 'POST',
      body: JSON.stringify({ filters })
    });
  }

  async approvePayout(payoutId: string, approvedBy: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/payouts/${payoutId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approved_by: approvedBy })
    });
  }

  async rejectPayout(payoutId: string, reason: string, rejectedBy: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/payouts/${payoutId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, rejected_by: rejectedBy })
    });
  }

  async processPayout(payoutId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/payouts/${payoutId}/process`, {
      method: 'POST'
    });
  }

  async getFeeStructures(): Promise<ApiResponse<FeeStructure[]>> {
    return this.apiRequest<FeeStructure[]>('/fees');
  }

  async createFeeStructure(fee: Omit<FeeStructure, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<FeeStructure>> {
    return this.apiRequest<FeeStructure>('/fees', {
      method: 'POST',
      body: JSON.stringify(fee)
    });
  }

  async updateFeeStructure(feeId: string, updates: Partial<FeeStructure>): Promise<ApiResponse<FeeStructure>> {
    return this.apiRequest<FeeStructure>(`/fees/${feeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteFeeStructure(feeId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/fees/${feeId}`, {
      method: 'DELETE'
    });
  }

  async generateReport(report: {
    type: 'income' | 'expense' | 'profit_loss' | 'cash_flow' | 'balance_sheet';
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<FinancialReport>> {
    return this.apiRequest<FinancialReport>('/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  }

  async getReports(): Promise<ApiResponse<FinancialReport[]>> {
    return this.apiRequest<FinancialReport[]>('/reports');
  }

  async downloadReport(reportId: string): Promise<ApiResponse<string>> {
    return this.apiRequest<string>(`/reports/${reportId}/download`);
  }

  async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' = 'monthly', months: number = 12): Promise<ApiResponse<Array<{
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    transactions: number;
  }>>> {
    return this.apiRequest(`/revenue/${period}?months=${months}`);
  }

  async getTopMerchants(limit: number = 10, period: string = 'monthly'): Promise<ApiResponse<Array<{
    merchant_id: string;
    merchant_name: string;
    revenue: number;
    transactions: number;
    growth_rate: number;
  }>>> {
    return this.apiRequest(`/merchants/top?limit=${limit}&period=${period}`);
  }

  async getExpensesByCategory(dateRange?: { from: string; to: string }): Promise<ApiResponse<Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>>> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.apiRequest(`/expenses/categories?${params.toString()}`);
  }

  async reconcileTransactions(date: string): Promise<ApiResponse<{
    processed: number;
    matched: number;
    unmatched: number;
    errors: string[];
  }>> {
    return this.apiRequest('/reconcile', {
      method: 'POST',
      body: JSON.stringify({ date })
    });
  }

  async exportFinancialData(type: 'transactions' | 'payouts' | 'reports' | 'all', format: 'csv' | 'json' | 'excel' = 'csv'): Promise<ApiResponse<string>> {
    return this.apiRequest<string>(`/export/${type}?format=${format}`);
  }
}

export const adminFinancialService = new AdminFinancialService();