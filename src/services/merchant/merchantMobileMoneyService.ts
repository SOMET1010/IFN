import { transactionsService, Transaction } from '../supabase/transactionsService';
import { supabase } from '../supabase/supabaseClient';

export interface MobileMoneyPaymentRequest {
  operator: 'orange' | 'mtn' | 'wave' | 'moov';
  phoneNumber: string;
  amount: number;
  referenceId?: string;
  referenceType?: 'sale' | 'order' | 'contribution' | 'other';
  metadata?: Record<string, any>;
}

export interface PaymentQRCodeData {
  merchantId: string;
  merchantName: string;
  amount: number;
  reference: string;
  timestamp: string;
}

class MerchantMobileMoneyService {
  async getOperators() {
    try {
      return await transactionsService.getOperators();
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  }

  async initiatePayment(request: MobileMoneyPaymentRequest): Promise<Transaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const transaction = await transactionsService.processPayment(
        user.id,
        request.operator,
        request.phoneNumber,
        request.amount,
        'payment',
        request.referenceId,
        request.referenceType,
        request.metadata
      );

      return transaction;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  async getTransactionHistory(startDate?: string, endDate?: string): Promise<Transaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (startDate && endDate) {
        return await transactionsService.getTransactionsByDateRange(user.id, startDate, endDate);
      } else {
        return await transactionsService.getTransactions(user.id);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      return await transactionsService.getTransactionById(id);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getTransactionByCode(code: string): Promise<Transaction | null> {
    try {
      return await transactionsService.getTransactionByCode(code);
    } catch (error) {
      console.error('Error fetching transaction by code:', error);
      throw error;
    }
  }

  async getPaymentStats(startDate?: string, endDate?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      return await transactionsService.getTransactionStats(user.id, startDate, endDate);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  }

  async exportTransactionsCSV(startDate?: string, endDate?: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      return await transactionsService.exportTransactionsCSV(user.id, startDate, endDate);
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }

  generateQRCodeData(amount: number, reference?: string): PaymentQRCodeData {
    const { data: { user } } = supabase.auth.getUser() as any;

    return {
      merchantId: user?.id || 'unknown',
      merchantName: user?.user_metadata?.name || 'Marchand',
      amount,
      reference: reference || `REF-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('225')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('+225')) {
      cleaned = cleaned.substring(4);
    }

    if (cleaned.length === 10) {
      return cleaned;
    }

    throw new Error('Numéro de téléphone invalide. Format attendu: 0XXXXXXXXX ou +225XXXXXXXXXX');
  }

  validateAmount(amount: number, operator: string): { isValid: boolean; error?: string } {
    const operatorLimits: Record<string, { min: number; max: number }> = {
      orange: { min: 100, max: 5000000 },
      mtn: { min: 100, max: 5000000 },
      wave: { min: 100, max: 2000000 },
      moov: { min: 100, max: 3000000 },
    };

    const limits = operatorLimits[operator.toLowerCase()];

    if (!limits) {
      return { isValid: false, error: 'Opérateur inconnu' };
    }

    if (amount < limits.min) {
      return {
        isValid: false,
        error: `Le montant minimum pour ${operator} est ${limits.min} FCFA`
      };
    }

    if (amount > limits.max) {
      return {
        isValid: false,
        error: `Le montant maximum pour ${operator} est ${limits.max} FCFA`
      };
    }

    return { isValid: true };
  }
}

export const merchantMobileMoneyService = new MerchantMobileMoneyService();
