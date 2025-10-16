import { useState, useEffect } from 'react';
import {
  financeService,
  FinancialTransaction,
  Budget,
  Subsidy,
  Credit,
} from '@/services/cooperative/financeService';

export function useFinance() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subsidies, setSubsidies] = useState<Subsidy[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      const transactionsData = financeService.getAllTransactions();
      const budgetsData = financeService.getAllBudgets();
      const subsidiesData = financeService.getAllSubsidies();
      const creditsData = financeService.getAllCredits();

      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setSubsidies(subsidiesData);
      setCredits(creditsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données financières');
      console.error('Error loading financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = (transactionData: Omit<FinancialTransaction, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = financeService.createTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError('Erreur lors de la création de la transaction');
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  const updateTransaction = (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      const updatedTransaction = financeService.updateTransaction(id, updates);
      if (updatedTransaction) {
        setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
        return updatedTransaction;
      }
      throw new Error('Transaction non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la transaction');
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = (id: string) => {
    try {
      const success = financeService.deleteTransaction(id);
      if (success) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        return true;
      }
      throw new Error('Transaction non trouvée');
    } catch (err) {
      setError('Erreur lors de la suppression de la transaction');
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  const getFinancialSummary = () => {
    try {
      return financeService.getFinancialSummary();
    } catch (err) {
      setError('Erreur lors du calcul du résumé financier');
      console.error('Error getting financial summary:', err);
      return {
        income: 0,
        expenses: 0,
        net: 0,
        totalBudget: 0,
        budgetUtilization: 0,
        budgetRemaining: 0,
        approvedSubsidies: 0,
        activeCredits: 0,
        cashFlow: 0
      };
    }
  };

  const getMonthlyReport = (year: number, month: number) => {
    try {
      return financeService.getMonthlyReport(year, month);
    } catch (err) {
      setError('Erreur lors de la génération du rapport mensuel');
      console.error('Error getting monthly report:', err);
      return {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        income: 0,
        expenses: 0,
        net: 0,
        transactions: 0,
        byCategory: {}
      };
    }
  };

  const exportTransactions = () => {
    try {
      return financeService.exportTransactionsToCSV();
    } catch (err) {
      setError('Erreur lors de l\'export des transactions');
      console.error('Error exporting transactions:', err);
      return '';
    }
  };

  // CRUD Budgets
  const createBudget = (budgetData: Omit<Budget, 'id' | 'spentAmount' | 'status'>) => {
    try {
      const newBudget = financeService.createBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError('Erreur lors de la création du budget');
      console.error('Error creating budget:', err);
      throw err;
    }
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    try {
      const updatedBudget = financeService.updateBudget(id, updates);
      if (updatedBudget) {
        setBudgets(prev => prev.map(b => b.id === id ? updatedBudget : b));
        return updatedBudget;
      }
      throw new Error('Budget non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour du budget');
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = (id: string) => {
    try {
      const success = financeService.deleteBudget(id);
      if (success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        return true;
      }
      throw new Error('Budget non trouvé');
    } catch (err) {
      setError('Erreur lors de la suppression du budget');
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  // CRUD Subventions
  const createSubsidy = (subsidyData: Omit<Subsidy, 'id' | 'applicationDate' | 'status'>) => {
    try {
      const newSubsidy = financeService.createSubsidy(subsidyData);
      setSubsidies(prev => [...prev, newSubsidy]);
      return newSubsidy;
    } catch (err) {
      setError('Erreur lors de la création de la subvention');
      console.error('Error creating subsidy:', err);
      throw err;
    }
  };

  const updateSubsidyStatus = (id: string, status: Subsidy['status'], date?: string) => {
    try {
      const success = financeService.updateSubsidyStatus(id, status, date);
      if (success) {
        setSubsidies(prev => prev.map(s => s.id === id ? { ...s, status } : s));
        return true;
      }
      throw new Error('Subvention non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut de la subvention');
      console.error('Error updating subsidy status:', err);
      throw err;
    }
  };

  const deleteSubsidy = (id: string) => {
    try {
      const success = financeService.deleteSubsidy(id);
      if (success) {
        setSubsidies(prev => prev.filter(s => s.id !== id));
        return true;
      }
      throw new Error('Subvention non trouvée');
    } catch (err) {
      setError('Erreur lors de la suppression de la subvention');
      console.error('Error deleting subsidy:', err);
      throw err;
    }
  };

  // CRUD Crédits
  const createCredit = (creditData: Omit<Credit, 'id' | 'applicationDate' | 'status' | 'repaymentSchedule'>) => {
    try {
      const newCredit = financeService.createCredit(creditData);
      setCredits(prev => [...prev, newCredit]);
      return newCredit;
    } catch (err) {
      setError('Erreur lors de la création du crédit');
      console.error('Error creating credit:', err);
      throw err;
    }
  };

  const updateCreditStatus = (id: string, status: Credit['status'], date?: string) => {
    try {
      const success = financeService.updateCreditStatus(id, status, date);
      if (success) {
        setCredits(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        return true;
      }
      throw new Error('Crédit non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut du crédit');
      console.error('Error updating credit status:', err);
      throw err;
    }
  };

  const recordRepayment = (creditId: string, installmentIndex: number) => {
    try {
      const success = financeService.recordRepayment(creditId, installmentIndex);
      if (success) {
        setCredits(prev => prev.map(credit => {
          if (credit.id === creditId) {
            const updatedSchedule = [...credit.repaymentSchedule];
            updatedSchedule[installmentIndex] = {
              ...updatedSchedule[installmentIndex],
              status: 'paid'
            };

            // Vérifier si toutes les échéances sont payées
            const allPaid = updatedSchedule.every(p => p.status === 'paid');

            return {
              ...credit,
              repaymentSchedule: updatedSchedule,
              status: allPaid ? 'repaid' : credit.status
            };
          }
          return credit;
        }));
        return true;
      }
      throw new Error('Crédit ou échéance non trouvé');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du remboursement');
      console.error('Error recording repayment:', err);
      throw err;
    }
  };

  const deleteCredit = (id: string) => {
    try {
      const success = financeService.deleteCredit(id);
      if (success) {
        setCredits(prev => prev.filter(c => c.id !== id));
        return true;
      }
      throw new Error('Crédit non trouvé');
    } catch (err) {
      setError('Erreur lors de la suppression du crédit');
      console.error('Error deleting credit:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    transactions,
    budgets,
    subsidies,
    credits,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getFinancialSummary,
    getMonthlyReport,
    exportTransactions,
    createBudget,
    updateBudget,
    deleteBudget,
    createSubsidy,
    updateSubsidyStatus,
    deleteSubsidy,
    createCredit,
    updateCreditStatus,
    recordRepayment,
    deleteCredit,
    refresh: loadData
  };
}