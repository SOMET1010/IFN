// Service CRUD complet pour la gestion financière de la coopérative
import { paymentsService, Contribution, SupplierPayment } from './paymentsService';

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  memberId?: string;
  supplierId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  receipts?: string[];
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  description: string;
  allocatedAmount: number;
  spentAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'over_budget';
}

export interface Subsidy {
  id: string;
  name: string;
  description: string;
  amount: number;
  provider: string;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  status: 'applied' | 'approved' | 'disbursed' | 'rejected';
  requirements: string[];
  documents: string[];
  beneficiaries: string[]; // member IDs
  conditions?: string;
}

export interface Credit {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  interestRate: number;
  duration: number; // en mois
  purpose: string;
  applicationDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  dueDate: string;
  status: 'applied' | 'approved' | 'disbursed' | 'repaid' | 'defaulted';
  guarantors: string[];
  collateral?: string;
  repaymentSchedule: {
    dueDate: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
  }[];
}

const LS_TRANSACTIONS = 'cooperative_financial_transactions';
const LS_BUDGETS = 'cooperative_budgets';
const LS_SUBSIDIES = 'cooperative_subsidies';
const LS_CREDITS = 'cooperative_credits';

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore localStorage errors
  }
}

export const financeService = {
  // Transactions CRUD
  getAllTransactions(): FinancialTransaction[] {
    return loadFromStorage<FinancialTransaction>(LS_TRANSACTIONS);
  },

  createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>): FinancialTransaction {
    const transactions = loadFromStorage<FinancialTransaction>(LS_TRANSACTIONS);
    const now = new Date().toISOString();

    const newTransaction: FinancialTransaction = {
      id: `txn_${Date.now()}`,
      createdBy: 'current_user', // à remplacer par l'utilisateur connecté
      createdAt: now,
      updatedAt: now,
      ...transaction,
    };

    transactions.unshift(newTransaction);
    saveToStorage(LS_TRANSACTIONS, transactions);

    return newTransaction;
  },

  updateTransaction(id: string, updates: Partial<FinancialTransaction>): FinancialTransaction | null {
    const transactions = loadFromStorage<FinancialTransaction>(LS_TRANSACTIONS);
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) return null;

    transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(LS_TRANSACTIONS, transactions);

    return transactions[index];
  },

  deleteTransaction(id: string): boolean {
    const transactions = loadFromStorage<FinancialTransaction>(LS_TRANSACTIONS);
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) return false;

    transactions.splice(index, 1);
    saveToStorage(LS_TRANSACTIONS, transactions);

    return true;
  },

  // Budgets CRUD
  getAllBudgets(): Budget[] {
    return loadFromStorage<Budget>(LS_BUDGETS);
  },

  createBudget(budget: Omit<Budget, 'id' | 'spentAmount' | 'status'>): Budget {
    const budgets = loadFromStorage<Budget>(LS_BUDGETS);

    const newBudget: Budget = {
      id: `budget_${Date.now()}`,
      spentAmount: 0,
      status: 'active',
      ...budget,
    };

    budgets.push(newBudget);
    saveToStorage(LS_BUDGETS, budgets);

    return newBudget;
  },

  updateBudget(id: string, updates: Partial<Budget>): Budget | null {
    const budgets = loadFromStorage<Budget>(LS_BUDGETS);
    const index = budgets.findIndex(b => b.id === id);

    if (index === -1) return null;

    const updatedBudget = { ...budgets[index], ...updates };

    // Vérifier si le budget est dépassé
    if (updatedBudget.spentAmount > updatedBudget.allocatedAmount) {
      updatedBudget.status = 'over_budget';
    }

    saveToStorage(LS_BUDGETS, budgets);

    return updatedBudget;
  },

  // Subventions CRUD
  getAllSubsidies(): Subsidy[] {
    return loadFromStorage<Subsidy>(LS_SUBSIDIES);
  },

  createSubsidy(subsidy: Omit<Subsidy, 'id' | 'applicationDate' | 'status'>): Subsidy {
    const subsidies = loadFromStorage<Subsidy>(LS_SUBSIDIES);

    const newSubsidy: Subsidy = {
      id: `subsidy_${Date.now()}`,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      ...subsidy,
    };

    subsidies.push(newSubsidy);
    saveToStorage(LS_SUBSIDIES, subsidies);

    return newSubsidy;
  },

  updateSubsidyStatus(id: string, status: Subsidy['status'], date?: string): boolean {
    const subsidies = loadFromStorage<Subsidy>(LS_SUBSIDIES);
    const index = subsidies.findIndex(s => s.id === id);

    if (index === -1) return false;

    subsidies[index].status = status;

    if (status === 'approved' && date) {
      subsidies[index].approvalDate = date;
    } else if (status === 'disbursed' && date) {
      subsidies[index].disbursementDate = date;
    }

    saveToStorage(LS_SUBSIDIES, subsidies);

    return true;
  },

  // Crédits CRUD
  getAllCredits(): Credit[] {
    return loadFromStorage<Credit>(LS_CREDITS);
  },

  createCredit(credit: Omit<Credit, 'id' | 'applicationDate' | 'status' | 'repaymentSchedule'>): Credit {
    const credits = loadFromStorage<Credit>(LS_CREDITS);

    // Calculer la date d'échéance
    const applicationDate = new Date();
    const dueDate = new Date(applicationDate);
    dueDate.setMonth(dueDate.getMonth() + credit.duration);

    // Générer l'échéancier de remboursement
    const repaymentSchedule = this.generateRepaymentSchedule(
      credit.amount,
      credit.interestRate,
      credit.duration,
      applicationDate
    );

    const newCredit: Credit = {
      id: `credit_${Date.now()}`,
      applicationDate: applicationDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'applied',
      repaymentSchedule,
      ...credit,
    };

    credits.push(newCredit);
    saveToStorage(LS_CREDITS, credits);

    return newCredit;
  },

  generateRepaymentSchedule(
    principal: number,
    annualRate: number,
    durationMonths: number,
    startDate: Date
  ): Credit['repaymentSchedule'] {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, durationMonths)) /
                          (Math.pow(1 + monthlyRate, durationMonths) - 1);

    const schedule: Credit['repaymentSchedule'] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < durationMonths; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      schedule.push({
        dueDate: currentDate.toISOString().split('T')[0],
        amount: Math.round(monthlyPayment),
        status: 'pending'
      });
    }

    return schedule;
  },

  updateCreditStatus(id: string, status: Credit['status'], date?: string): boolean {
    const credits = loadFromStorage<Credit>(LS_CREDITS);
    const index = credits.findIndex(c => c.id === id);

    if (index === -1) return false;

    credits[index].status = status;

    if (status === 'approved' && date) {
      credits[index].approvalDate = date;
    } else if (status === 'disbursed' && date) {
      credits[index].disbursementDate = date;
    }

    saveToStorage(LS_CREDITS, credits);

    return true;
  },

  recordRepayment(creditId: string, installmentIndex: number): boolean {
    const credits = loadFromStorage<Credit>(LS_CREDITS);
    const credit = credits.find(c => c.id === creditId);

    if (!credit || installmentIndex >= credit.repaymentSchedule.length) return false;

    credit.repaymentSchedule[installmentIndex].status = 'paid';

    // Vérifier si toutes les échéances sont payées
    if (credit.repaymentSchedule.every(p => p.status === 'paid')) {
      credit.status = 'repaid';
    }

    saveToStorage(LS_CREDITS, credits);

    return true;
  },

  // Statistiques et rapports
  getFinancialSummary() {
    const transactions = this.getAllTransactions();
    const budgets = this.getAllBudgets();
    const subsidies = this.getAllSubsidies();
    const credits = this.getAllCredits();

    const income = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBudget = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
    const budgetUtilization = budgets.reduce((sum, b) => sum + b.spentAmount, 0);

    const approvedSubsidies = subsidies
      .filter(s => s.status === 'disbursed')
      .reduce((sum, s) => sum + s.amount, 0);

    const activeCredits = credits
      .filter(c => c.status === 'disbursed')
      .reduce((sum, c) => sum + c.amount, 0);

    return {
      income,
      expenses,
      net: income - expenses,
      totalBudget,
      budgetUtilization,
      budgetRemaining: totalBudget - budgetUtilization,
      approvedSubsidies,
      activeCredits,
      cashFlow: income - expenses
    };
  },

  getMonthlyReport(year: number, month: number) {
    const transactions = this.getAllTransactions();
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);

    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const byCategory = monthlyTransactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[t.category].income += t.amount;
      } else {
        acc[t.category].expense += t.amount;
      }
      return acc;
    }, {} as Record<string, { income: number; expense: number }>);

    return {
      period: `${year}-${month.toString().padStart(2, '0')}`,
      income,
      expenses,
      net: income - expenses,
      transactions: monthlyTransactions.length,
      byCategory
    };
  },

  // Export
  exportTransactionsToCSV(): string {
    const transactions = this.getAllTransactions();
    const headers = [
      'ID', 'Type', 'Catégorie', 'Description', 'Montant', 'Date',
      'Référence', 'Statut', 'Méthode de paiement', 'Créé par', 'Notes'
    ];

    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.category,
      t.description,
      t.amount.toString(),
      t.date,
      t.reference || '',
      t.status,
      t.paymentMethod,
      t.createdBy,
      t.notes || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  // Validation
  validateTransaction(transaction: Partial<FinancialTransaction>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }

    if (!transaction.category || transaction.category.trim().length < 2) {
      errors.push('La catégorie est requise');
    }

    if (!transaction.description || transaction.description.trim().length < 3) {
      errors.push('La description doit contenir au moins 3 caractères');
    }

    if (!transaction.date) {
      errors.push('La date est requise');
    }

    if (!['pending', 'completed', 'cancelled'].includes(transaction.status || '')) {
      errors.push('Statut invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};