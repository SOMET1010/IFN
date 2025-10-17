import { supabase } from './supabaseClient';

export interface Transaction {
  id: string;
  user_id: string;
  transaction_code: string;
  operator: 'orange' | 'mtn' | 'wave' | 'moov';
  phone_number: string;
  amount: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transaction_type: 'payment' | 'contribution' | 'transfer' | 'withdrawal';
  reference_id?: string;
  reference_type?: 'sale' | 'order' | 'contribution' | 'other';
  metadata?: Record<string, any>;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface MobileMoneyOperator {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
  ussd_code?: string;
  is_active: boolean;
  min_amount: number;
  max_amount: number;
  created_at: string;
}

class TransactionsService {
  private tableName = 'transactions';
  private operatorsTable = 'mobile_money_operators';

  generateTransactionCode(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    return `MMO-${year}${month}${day}-${random}`;
  }

  async getOperators(): Promise<MobileMoneyOperator[]> {
    try {
      const { data, error } = await supabase
        .from(this.operatorsTable)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async getTransactionByCode(code: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('transaction_code', code)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transaction by code:', error);
      throw error;
    }
  }

  async initiateTransaction(transaction: Omit<Transaction, 'id' | 'transaction_code' | 'status' | 'created_at' | 'updated_at' | 'completed_at'>): Promise<Transaction> {
    try {
      const transactionCode = this.generateTransactionCode();

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          ...transaction,
          transaction_code: transactionCode,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after insert');
      return data;
    } catch (error) {
      console.error('Error initiating transaction:', error);
      throw error;
    }
  }

  async simulatePayment(transactionId: string): Promise<Transaction> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      const successRate = 0.95;
      const isSuccess = Math.random() < successRate;

      const updates: Partial<Transaction> = {
        status: isSuccess ? 'success' : 'failed',
        completed_at: new Date().toISOString(),
      };

      if (!isSuccess) {
        const failureReasons = [
          'Solde insuffisant',
          'Numéro invalide',
          'Transaction expirée',
          'Erreur réseau',
        ];
        updates.failure_reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after update');
      return data;
    } catch (error) {
      console.error('Error simulating payment:', error);
      throw error;
    }
  }

  async processPayment(
    userId: string,
    operator: Transaction['operator'],
    phoneNumber: string,
    amount: number,
    transactionType: Transaction['transaction_type'] = 'payment',
    referenceId?: string,
    referenceType?: Transaction['reference_type'],
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const transaction = await this.initiateTransaction({
        user_id: userId,
        operator,
        phone_number: phoneNumber,
        amount,
        transaction_type: transactionType,
        reference_id: referenceId,
        reference_type: referenceType,
        metadata,
      });

      await supabase
        .from(this.tableName)
        .update({ status: 'processing' })
        .eq('id', transaction.id);

      const completedTransaction = await this.simulatePayment(transaction.id);

      return completedTransaction;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getTransactionStats(userId: string, startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from(this.tableName)
        .select('amount, status, operator, transaction_type')
        .eq('user_id', userId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transactions = data || [];
      const successfulTransactions = transactions.filter(t => t.status === 'success');

      const totalAmount = successfulTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const totalTransactions = transactions.length;
      const successfulCount = successfulTransactions.length;
      const failedCount = transactions.filter(t => t.status === 'failed').length;
      const pendingCount = transactions.filter(t => t.status === 'pending' || t.status === 'processing').length;

      const byOperator = {
        orange: successfulTransactions.filter(t => t.operator === 'orange').reduce((sum, t) => sum + Number(t.amount), 0),
        mtn: successfulTransactions.filter(t => t.operator === 'mtn').reduce((sum, t) => sum + Number(t.amount), 0),
        wave: successfulTransactions.filter(t => t.operator === 'wave').reduce((sum, t) => sum + Number(t.amount), 0),
        moov: successfulTransactions.filter(t => t.operator === 'moov').reduce((sum, t) => sum + Number(t.amount), 0),
      };

      const byType = {
        payment: successfulTransactions.filter(t => t.transaction_type === 'payment').length,
        contribution: successfulTransactions.filter(t => t.transaction_type === 'contribution').length,
        transfer: successfulTransactions.filter(t => t.transaction_type === 'transfer').length,
        withdrawal: successfulTransactions.filter(t => t.transaction_type === 'withdrawal').length,
      };

      return {
        totalAmount,
        totalTransactions,
        successfulCount,
        failedCount,
        pendingCount,
        successRate: totalTransactions > 0 ? (successfulCount / totalTransactions) * 100 : 0,
        averageAmount: successfulCount > 0 ? totalAmount / successfulCount : 0,
        byOperator,
        byType,
      };
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  async exportTransactionsCSV(userId: string, startDate?: string, endDate?: string): Promise<string> {
    try {
      const transactions = startDate && endDate
        ? await this.getTransactionsByDateRange(userId, startDate, endDate)
        : await this.getTransactions(userId);

      const headers = [
        'Code Transaction',
        'Date',
        'Opérateur',
        'Numéro',
        'Montant (FCFA)',
        'Type',
        'Statut',
        'Référence',
      ];

      const rows = transactions.map(t => [
        t.transaction_code,
        new Date(t.created_at).toLocaleDateString('fr-FR'),
        t.operator.toUpperCase(),
        t.phone_number,
        t.amount.toFixed(2),
        t.transaction_type,
        t.status,
        t.reference_id || '-',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      return csvContent;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
}

export const transactionsService = new TransactionsService();
