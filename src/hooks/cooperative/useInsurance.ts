import { useState, useEffect } from 'react';
import {
  insuranceService,
  InsurancePolicy,
  InsuranceSubscription,
  InsuranceClaim,
  InsurancePayment
} from '@/services/cooperative/insuranceService';

export function useInsurance() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [subscriptions, setSubscriptions] = useState<InsuranceSubscription[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [payments, setPayments] = useState<InsurancePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    try {
      const policiesData = insuranceService.getAllPolicies();
      const subscriptionsData = insuranceService.getAllSubscriptions();
      const claimsData = insuranceService.getAllClaims();
      const paymentsData = insuranceService.getAllPayments();

      setPolicies(policiesData);
      setSubscriptions(subscriptionsData);
      setClaims(claimsData);
      setPayments(paymentsData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données d\'assurance');
      console.error('Error loading insurance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Polices d'assurance
  const createPolicy = (policyData: Omit<InsurancePolicy, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPolicy = insuranceService.createPolicy(policyData);
      setPolicies(prev => [...prev, newPolicy]);
      return newPolicy;
    } catch (err) {
      setError('Erreur lors de la création de la police d\'assurance');
      console.error('Error creating insurance policy:', err);
      throw err;
    }
  };

  const updatePolicy = (id: string, updates: Partial<InsurancePolicy>) => {
    try {
      const updatedPolicy = insuranceService.updatePolicy(id, updates);
      if (updatedPolicy) {
        setPolicies(prev => prev.map(p => p.id === id ? updatedPolicy : p));
        return updatedPolicy;
      }
      throw new Error('Police d\'assurance non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la police d\'assurance');
      console.error('Error updating insurance policy:', err);
      throw err;
    }
  };

  const deletePolicy = (id: string) => {
    try {
      const success = insuranceService.deletePolicy(id);
      if (success) {
        setPolicies(prev => prev.filter(p => p.id !== id));
        return true;
      }
      throw new Error('Police d\'assurance non trouvée');
    } catch (err) {
      setError('Erreur lors de la suppression de la police d\'assurance');
      console.error('Error deleting insurance policy:', err);
      throw err;
    }
  };

  // CRUD Souscriptions
  const createSubscription = (subscriptionData: Omit<InsuranceSubscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSubscription = insuranceService.createSubscription(subscriptionData);
      setSubscriptions(prev => [...prev, newSubscription]);
      return newSubscription;
    } catch (err) {
      setError('Erreur lors de la création de la souscription');
      console.error('Error creating insurance subscription:', err);
      throw err;
    }
  };

  const updateSubscription = (id: string, updates: Partial<InsuranceSubscription>) => {
    try {
      const updatedSubscription = insuranceService.updateSubscription(id, updates);
      if (updatedSubscription) {
        setSubscriptions(prev => prev.map(s => s.id === id ? updatedSubscription : s));
        return updatedSubscription;
      }
      throw new Error('Souscription non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la souscription');
      console.error('Error updating insurance subscription:', err);
      throw err;
    }
  };

  const cancelSubscription = (id: string, reason: string) => {
    try {
      const success = insuranceService.cancelSubscription(id, reason);
      if (success) {
        setSubscriptions(prev => prev.map(s =>
          s.id === id ? { ...s, status: 'cancelled' as const } : s
        ));
        return true;
      }
      throw new Error('Souscription non trouvée');
    } catch (err) {
      setError('Erreur lors de l\'annulation de la souscription');
      console.error('Error cancelling insurance subscription:', err);
      throw err;
    }
  };

  // CRUD Réclamations
  const createClaim = (claimData: Omit<InsuranceClaim, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newClaim = insuranceService.createClaim(claimData);
      setClaims(prev => [newClaim, ...prev]);
      return newClaim;
    } catch (err) {
      setError('Erreur lors de la création de la réclamation');
      console.error('Error creating insurance claim:', err);
      throw err;
    }
  };

  const updateClaim = (id: string, updates: Partial<InsuranceClaim>) => {
    try {
      const updatedClaim = insuranceService.updateClaim(id, updates);
      if (updatedClaim) {
        setClaims(prev => prev.map(c => c.id === id ? updatedClaim : c));
        return updatedClaim;
      }
      throw new Error('Réclamation non trouvée');
    } catch (err) {
      setError('Erreur lors de la mise à jour de la réclamation');
      console.error('Error updating insurance claim:', err);
      throw err;
    }
  };

  const processClaim = (id: string, decision: 'approved' | 'rejected', amount?: number, reason?: string) => {
    try {
      const success = insuranceService.processClaim(id, decision, amount, reason);
      if (success) {
        setClaims(prev => prev.map(c => {
          if (c.id === id) {
            return {
              ...c,
              status: decision === 'approved' ? 'approved' : 'rejected',
              processedAt: new Date().toISOString(),
              processedBy: 'current_user', // À remplacer par l'utilisateur actuel
              ...(amount !== undefined && { approvedAmount: amount }),
              ...(reason && { rejectionReason: reason })
            };
          }
          return c;
        }));
        return true;
      }
      throw new Error('Réclamation non trouvée');
    } catch (err) {
      setError('Erreur lors du traitement de la réclamation');
      console.error('Error processing insurance claim:', err);
      throw err;
    }
  };

  // CRUD Paiements
  const recordPayment = (paymentData: Omit<InsurancePayment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPayment = insuranceService.recordPayment(paymentData);
      setPayments(prev => [newPayment, ...prev]);

      // Mettre à jour le statut de la souscription si nécessaire
      const subscription = subscriptions.find(s => s.id === paymentData.subscriptionId);
      if (subscription) {
        const updatedPremiumPaid = subscription.premiumPaid + paymentData.amount;
        const isFullyPaid = updatedPremiumPaid >= subscription.premiumAmount;

        setSubscriptions(prev => prev.map(s =>
          s.id === paymentData.subscriptionId
            ? {
                ...s,
                premiumPaid: updatedPremiumPaid,
                status: isFullyPaid ? 'active' : s.status
              }
            : s
        ));
      }

      return newPayment;
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du paiement');
      console.error('Error recording insurance payment:', err);
      throw err;
    }
  };

  const updatePayment = (id: string, updates: Partial<InsurancePayment>) => {
    try {
      const updatedPayment = insuranceService.updatePayment(id, updates);
      if (updatedPayment) {
        setPayments(prev => prev.map(p => p.id === id ? updatedPayment : p));
        return updatedPayment;
      }
      throw new Error('Paiement non trouvé');
    } catch (err) {
      setError('Erreur lors de la mise à jour du paiement');
      console.error('Error updating insurance payment:', err);
      throw err;
    }
  };

  // Gestion des documents
  const uploadClaimDocument = (claimId: string, document: { type: string; url: string; name: string }) => {
    try {
      const success = insuranceService.uploadClaimDocument(claimId, document);
      if (success) {
        setClaims(prev => prev.map(c => {
          if (c.id === claimId) {
            return {
              ...c,
              documents: [...c.documents, document]
            };
          }
          return c;
        }));
        return true;
      }
      throw new Error('Réclamation non trouvée');
    } catch (err) {
      setError('Erreur lors du téléchargement du document');
      console.error('Error uploading claim document:', err);
      throw err;
    }
  };

  // Statistiques
  const getInsuranceStats = () => {
    try {
      return insuranceService.getInsuranceStats();
    } catch (err) {
      setError('Erreur lors du calcul des statistiques d\'assurance');
      console.error('Error getting insurance stats:', err);
      return {
        totalPolicies: 0,
        activePolicies: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        totalRevenue: 0,
        totalClaimsAmount: 0,
        averageProcessingTime: 0
      };
    }
  };

  const getPolicyUtilization = () => {
    try {
      return insuranceService.getPolicyUtilization();
    } catch (err) {
      setError('Erreur lors du calcul de l\'utilisation des polices');
      console.error('Error getting policy utilization:', err);
      return [];
    }
  };

  // Export
  const exportPoliciesToCSV = () => {
    try {
      return insuranceService.exportPoliciesToCSV();
    } catch (err) {
      setError('Erreur lors de l\'export des polices');
      console.error('Error exporting policies:', err);
      return '';
    }
  };

  const exportClaimsToCSV = () => {
    try {
      return insuranceService.exportClaimsToCSV();
    } catch (err) {
      setError('Erreur lors de l\'export des réclamations');
      console.error('Error exporting claims:', err);
      return '';
    }
  };

  // Validation
  const validatePolicy = (policy: Partial<InsurancePolicy>) => {
    try {
      return insuranceService.validatePolicy(policy);
    } catch (err) {
      setError('Erreur lors de la validation de la police');
      console.error('Error validating policy:', err);
      return { isValid: false, errors: ['Erreur de validation'] };
    }
  };

  const validateClaim = (claim: Partial<InsuranceClaim>) => {
    try {
      return insuranceService.validateClaim(claim);
    } catch (err) {
      setError('Erreur lors de la validation de la réclamation');
      console.error('Error validating claim:', err);
      return { isValid: false, errors: ['Erreur de validation'] };
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    // Données
    policies,
    subscriptions,
    claims,
    payments,
    loading,
    error,

    // CRUD Polices
    createPolicy,
    updatePolicy,
    deletePolicy,

    // CRUD Souscriptions
    createSubscription,
    updateSubscription,
    cancelSubscription,

    // CRUD Réclamations
    createClaim,
    updateClaim,
    processClaim,

    // CRUD Paiements
    recordPayment,
    updatePayment,

    // Gestion des documents
    uploadClaimDocument,

    // Statistiques
    getInsuranceStats,
    getPolicyUtilization,

    // Export
    exportPoliciesToCSV,
    exportClaimsToCSV,

    // Validation
    validatePolicy,
    validateClaim,

    // Utilitaires
    refresh: loadData
  };
}