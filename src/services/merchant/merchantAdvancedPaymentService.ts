import { DigitalReceipt, PaymentMethod, PaymentTransaction } from '@/types/merchant';

export interface PaymentProcessingResult {
  success: boolean;
  transaction?: PaymentTransaction;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationCode?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_transfer' | 'cash' | 'credit';
  provider?: string;
  icon: string;
  isActive: boolean;
  fees: number;
  currency: string;
  minAmount: number;
  maxAmount: number;
  processingTime: number;
  isAvailable: boolean;
  requiresConfirmation: boolean;
  supportedCountries: string[];
}

export class MerchantAdvancedPaymentService {
  private static instance: MerchantAdvancedPaymentService;
  private paymentMethods: PaymentMethodConfig[] = [];
  private transactions: PaymentTransaction[] = [];
  private pendingConfirmations: Map<string, string> = new Map();
  private readonly STORAGE_TX = 'merchant_transactions_encrypted';

  static getInstance(): MerchantAdvancedPaymentService {
    if (!MerchantAdvancedPaymentService.instance) {
      MerchantAdvancedPaymentService.instance = new MerchantAdvancedPaymentService();
      MerchantAdvancedPaymentService.instance.initializePaymentMethods();
      MerchantAdvancedPaymentService.instance.loadPersisted().catch(() => {});
    }
    return MerchantAdvancedPaymentService.instance;
  }

  private initializePaymentMethods() {
    this.paymentMethods = [
      {
        id: 'orange_money',
        name: 'Orange Money',
        type: 'mobile_money',
        provider: 'Orange CI',
        icon: '📱',
        isActive: true,
        fees: 0.5,
        currency: 'XOF',
        minAmount: 100,
        maxAmount: 1000000,
        processingTime: 30000,
        isAvailable: true,
        requiresConfirmation: true,
        supportedCountries: ['CI', 'SN', 'ML', 'BF', 'NE', 'GN']
      },
      {
        id: 'mtn_money',
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        provider: 'MTN CI',
        icon: '📱',
        isActive: true,
        fees: 0.5,
        currency: 'XOF',
        minAmount: 100,
        maxAmount: 1000000,
        processingTime: 30000,
        isAvailable: true,
        requiresConfirmation: true,
        supportedCountries: ['CI', 'CM', 'GH', 'UG', 'RW', 'ZA']
      },
      {
        id: 'wave',
        name: 'Wave',
        type: 'mobile_money',
        provider: 'Wave',
        icon: '🌊',
        isActive: true,
        fees: 0,
        currency: 'XOF',
        minAmount: 100,
        maxAmount: 2000000,
        processingTime: 15000,
        isAvailable: true,
        requiresConfirmation: false,
        supportedCountries: ['CI', 'SN', 'ML', 'BF']
      },
      {
        id: 'moov_money',
        name: 'Moov Money',
        type: 'mobile_money',
        provider: 'Moov Africa',
        icon: '📱',
        isActive: true,
        fees: 0.5,
        currency: 'XOF',
        minAmount: 100,
        maxAmount: 500000,
        processingTime: 30000,
        isAvailable: true,
        requiresConfirmation: true,
        supportedCountries: ['CI', 'BJ', 'TG', 'GA', 'CD']
      },
      {
        id: 'cash',
        name: 'Espèces',
        type: 'cash',
        icon: '💵',
        isActive: true,
        fees: 0,
        currency: 'XOF',
        minAmount: 0,
        maxAmount: 10000000,
        processingTime: 0,
        isAvailable: true,
        requiresConfirmation: false,
        supportedCountries: ['*']
      },
      {
        id: 'bank_transfer',
        name: 'Virement Bancaire',
        type: 'bank_transfer',
        icon: '🏦',
        isActive: true,
        fees: 1.0,
        currency: 'XOF',
        minAmount: 1000,
        maxAmount: 50000000,
        processingTime: 86400000,
        isAvailable: true,
        requiresConfirmation: false,
        supportedCountries: ['CI']
      },
      {
        id: 'credit',
        name: 'Crédit Client',
        type: 'credit',
        icon: '📝',
        isActive: true,
        fees: 0,
        currency: 'XOF',
        minAmount: 0,
        maxAmount: 1000000,
        processingTime: 0,
        isAvailable: true,
        requiresConfirmation: false,
        supportedCountries: ['*']
      }
    ];
  }

  private async loadPersisted() {
    try {
      const { secureStorage } = await import('@/lib/secureStorage');
      const raw = await secureStorage.getJSON<PaymentTransaction[]>(this.STORAGE_TX);
      if (raw && Array.isArray(raw)) {
        // revive Date
        this.transactions = raw.map(t => ({ ...t, timestamp: new Date(t.timestamp) }));
      }
    } catch {
      // Silently ignore secureStorage errors during initialization
      // This allows the service to function with in-memory data only
    }
  }

  private async persist() {
    try {
      const { secureStorage } = await import('@/lib/secureStorage');
      await secureStorage.setJSON(this.STORAGE_TX, this.transactions);
    } catch {
      // Silently ignore secureStorage errors during persistence
      // Transactions remain in memory but won't persist across sessions
    }
  }

  async getAvailablePaymentMethods(): Promise<PaymentMethodConfig[]> {
    await this.delay(200);
    return this.paymentMethods.filter(method => method.isActive && method.isAvailable);
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethodConfig | null> {
    await this.delay(100);
    return this.paymentMethods.find(method => method.id === id) || null;
  }

  async validatePaymentMethod(methodId: string, amount: number, customerCountry: string = 'CI'): Promise<{valid: boolean, error?: string}> {
    await this.delay(300);

    const method = await this.getPaymentMethodById(methodId);
    if (!method) {
      return { valid: false, error: 'Méthode de paiement non trouvée' };
    }

    if (!method.isActive || !method.isAvailable) {
      return { valid: false, error: 'Méthode de paiement non disponible' };
    }

    if (amount < method.minAmount) {
      return { valid: false, error: `Montant minimum: ${method.minAmount.toLocaleString()} ${method.currency}` };
    }

    if (amount > method.maxAmount) {
      return { valid: false, error: `Montant maximum: ${method.maxAmount.toLocaleString()} ${method.currency}` };
    }

    if (!method.supportedCountries.includes('*') && !method.supportedCountries.includes(customerCountry)) {
      return { valid: false, error: 'Méthode de paiement non disponible dans votre pays' };
    }

    return { valid: true };
  }

  async processPayment(
    methodId: string,
    amount: number,
    customerInfo: { name: string; phone: string; email?: string },
    metadata?: Record<string, any>
  ): Promise<PaymentProcessingResult> {
    await this.delay(1500);

    const validation = await this.validatePaymentMethod(methodId, amount);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const method = await this.getPaymentMethodById(methodId);
    if (!method) {
      return {
        success: false,
        error: 'Méthode de paiement non trouvée'
      };
    }

    const fees = (amount * method.fees) / 100;
    const totalAmount = amount + fees;

    const transaction: PaymentTransaction = {
      id: this.generateTransactionId(),
      reference: this.generateReference(),
      amount: totalAmount,
      currency: method.currency,
      methodId: methodId,
      methodName: method.name,
      status: method.requiresConfirmation ? 'pending' : 'completed',
      timestamp: new Date(),
      customerInfo,
      fees,
      totalAmount,
      metadata: {
        ...metadata,
        fees,
        baseAmount: amount,
        processingTime: method.processingTime
      }
    };

    if (method.type === 'mobile_money') {
      transaction.reference = this.generateMobileMoneyReference();
    }

    this.transactions.push(transaction);
    await this.persist();

    if (method.requiresConfirmation) {
      const confirmationCode = this.generateConfirmationCode();
      this.pendingConfirmations.set(transaction.id, confirmationCode);

      return {
        success: true,
        transaction,
        requiresConfirmation: true,
        confirmationCode
      };
    }

    return {
      success: true,
      transaction
    };
  }

  async validateMobileMoneyPayment(phone: string, amount: number, provider: string): Promise<boolean> {
    await this.delay(1000);

    const mockSuccessRate = 0.95;
    return Math.random() < mockSuccessRate;
  }

  async requestMobileMoneyPayment(phone: string, amount: number, provider: string): Promise<{success: boolean, message?: string}> {
    await this.delay(2000);

    const isValid = await this.validateMobileMoneyPayment(phone, amount, provider);
    if (!isValid) {
      return {
        success: false,
        message: 'Le paiement mobile money a échoué. Veuillez vérifier votre solde ou réessayer.'
      };
    }

    return {
      success: true,
      message: 'Demande de paiement envoyée. Veuillez confirmer sur votre téléphone.'
    };
  }

  async checkTransactionStatus(transactionId: string): Promise<PaymentTransaction> {
    await this.delay(500);

    const mockTransaction: PaymentTransaction = {
      id: transactionId,
      methodId: 'orange_money',
      amount: 5000,
      reference: 'OM' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      status: 'completed',
      timestamp: new Date(),
      customerInfo: {
        name: 'Client Test',
        phone: '+225 XX XX XX XX XX'
      }
    };

    return mockTransaction;
  }

  async generateDigitalReceipt(transaction: PaymentTransaction): Promise<DigitalReceipt> {
    await this.delay(800);

    const receipt: DigitalReceipt = {
      id: this.generateId(),
      saleId: transaction.id,
      receiptNumber: 'REC' + Date.now().toString().slice(-8),
      clientInfo: {
        name: transaction.customerInfo.name,
        phone: transaction.customerInfo.phone,
        email: transaction.customerInfo.email
      },
      items: transaction.metadata?.items || [],
      subtotal: transaction.metadata?.baseAmount || transaction.amount,
      tax: 0,
      discount: transaction.metadata?.discount || 0,
      total: transaction.amount,
      paymentMethod: transaction.methodId,
      transactionDate: transaction.timestamp,
      status: 'generated'
    };

    return receipt;
  }

  async sendReceiptByEmail(receipt: DigitalReceipt, email: string): Promise<boolean> {
    await this.delay(1000);

    const mockSuccessRate = 0.9;
    const success = Math.random() < mockSuccessRate;

    if (success) {
      console.log(`Reçu envoyé à ${email}:`, receipt);
    }

    return success;
  }

  async sendReceiptBySMS(receipt: DigitalReceipt, phone: string): Promise<boolean> {
    await this.delay(1500);

    const mockSuccessRate = 0.85;
    const success = Math.random() < mockSuccessRate;

    if (success) {
      const message = `Votre reçu ${receipt.receiptNumber}: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(receipt.total)}. Merci pour votre achat!`;
      console.log(`SMS envoyé à ${phone}:`, message);
    }

    return success;
  }

  async confirmPayment(transactionId: string, confirmationCode: string): Promise<PaymentProcessingResult> {
    await this.delay(1000);

    const storedCode = this.pendingConfirmations.get(transactionId);
    if (!storedCode || storedCode !== confirmationCode) {
      return {
        success: false,
        error: 'Code de confirmation invalide'
      };
    }

    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction non trouvée'
      };
    }

    transaction.status = 'completed';
    this.pendingConfirmations.delete(transactionId);
    await this.persist();

    return {
      success: true,
      transaction
    };
  }

  async cancelPayment(transactionId: string): Promise<PaymentProcessingResult> {
    await this.delay(800);

    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return {
        success: false,
        error: 'Transaction non trouvée'
      };
    }

    if (transaction.status === 'completed') {
      return {
        success: false,
        error: 'Impossible d\'annuler une transaction terminée'
      };
    }

    transaction.status = 'cancelled';
    this.pendingConfirmations.delete(transactionId);
    await this.persist();

    return {
      success: true,
      transaction
    };
  }

  async getTransactionHistory(limit: number = 50): Promise<PaymentTransaction[]> {
    await this.delay(300);
    return this.transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getTransactionById(transactionId: string): Promise<PaymentTransaction | null> {
    await this.delay(200);
    return this.transactions.find(t => t.id === transactionId) || null;
  }

  async getPaymentStats(): Promise<{
    totalTransactions: number;
    totalRevenue: number;
    averageTransactionValue: number;
    methodBreakdown: Record<string, {count: number, amount: number}>;
    successRate: number;
  }> {
    await this.delay(500);

    const completedTransactions = this.transactions.filter(t => t.status === 'completed');
    const totalTransactions = this.transactions.length;
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const methodBreakdown: Record<string, {count: number, amount: number}> = {};
    completedTransactions.forEach(t => {
      if (!methodBreakdown[t.methodId]) {
        methodBreakdown[t.methodId] = { count: 0, amount: 0 };
      }
      methodBreakdown[t.methodId].count++;
      methodBreakdown[t.methodId].amount += t.totalAmount;
    });

    const successRate = totalTransactions > 0 ? (completedTransactions.length / totalTransactions) * 100 : 0;

    return {
      totalTransactions,
      totalRevenue,
      averageTransactionValue,
      methodBreakdown,
      successRate
    };
  }

  private generateTransactionId(): string {
    return 'TXN' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  private generateReference(): string {
    return 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private generateMobileMoneyReference(): string {
    const providers = ['OM', 'MTN', 'WV', 'MV'];
    const randomProvider = providers[Math.floor(Math.random() * providers.length)];
    return randomProvider + Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private generateConfirmationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
