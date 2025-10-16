import { z } from 'zod';

// Types pour la gestion des assurances collectives
export interface InsurancePolicy {
  id: string;
  name: string;
  type: 'health' | 'crop' | 'equipment' | 'life' | 'liability';
  description: string;
  provider: string;
  coverage: {
    amount: number;
    currency: 'XOF' | 'USD' | 'EUR';
    deductible: number;
  };
  premium: {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    currency: 'XOF' | 'USD' | 'EUR';
  };
  terms: {
    duration: number; // en mois
    renewal: 'automatic' | 'manual';
    cancellationPeriod: number; // en jours
  };
  eligibility: string[];
  exclusions: string[];
  benefits: string[];
  requirements: string[];
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceSubscription {
  id: string;
  policyId: string;
  memberId: string;
  memberName: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'suspended';
  startDate: string;
  endDate: string;
  premiumAmount: number;
  premiumPaid: number;
  coverageAmount: number;
  beneficiaries: {
    name: string;
    relationship: string;
    percentage: number;
  }[];
  documents: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  riskFactors?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  id: string;
  subscriptionId: string;
  memberId: string;
  memberName: string;
  policyType: string;
  incidentDate: string;
  incidentType: string;
  description: string;
  location: string;
  estimatedAmount: number;
  approvedAmount?: number;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  assignedTo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  decisionDate?: string;
  paymentDate?: string;
  paymentReference?: string;
  documents: {
    type: string;
    url: string;
    description: string;
    uploadedAt: string;
  }[];
  witness?: {
    name: string;
    phone: string;
    statement?: string;
  };
  assessment: {
    damageLevel: 'minor' | 'moderate' | 'severe' | 'total';
    cause: string;
    preventable: boolean;
    recommendations?: string;
  };
  communication: {
    date: string;
    type: 'email' | 'phone' | 'meeting';
    from: string;
    to: string;
    subject: string;
    content: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InsurancePayment {
  id: string;
  subscriptionId: string;
  memberId: string;
  amount: number;
  currency: 'XOF' | 'USD' | 'EUR';
  paymentDate: string;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'check';
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  period: {
    start: string;
    end: string;
  };
  receiptUrl?: string;
  processedBy: string;
  processedAt: string;
  notes?: string;
  createdAt: string;
}

// Schémas de validation
export const insurancePolicySchema = z.object({
  name: z.string().min(1, 'Le nom de la police est requis'),
  type: z.enum(['health', 'crop', 'equipment', 'life', 'liability']),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  provider: z.string().min(1, 'Le fournisseur est requis'),
  coverage: z.object({
    amount: z.number().min(1, 'Le montant de couverture doit être positif'),
    currency: z.enum(['XOF', 'USD', 'EUR']),
    deductible: z.number().min(0, 'La franchise ne peut être négative')
  }),
  premium: z.object({
    amount: z.number().min(1, 'Le montant de la prime doit être positif'),
    frequency: z.enum(['monthly', 'quarterly', 'yearly']),
    currency: z.enum(['XOF', 'USD', 'EUR'])
  }),
  terms: z.object({
    duration: z.number().min(1, 'La durée doit être positive'),
    renewal: z.enum(['automatic', 'manual']),
    cancellationPeriod: z.number().min(0, 'La période d\'annulation ne peut être négative')
  }),
  eligibility: z.array(z.string()).min(1, 'Au moins un critère d\'éligibilité est requis'),
  exclusions: z.array(z.string()).default([]),
  benefits: z.array(z.string()).min(1, 'Au moins un bénéfice est requis'),
  requirements: z.array(z.string()).default([]),
  status: z.enum(['active', 'expired', 'cancelled', 'pending']).default('pending'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise')
});

export const insuranceSubscriptionSchema = z.object({
  policyId: z.string().min(1, 'L\'ID de la police est requis'),
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  memberName: z.string().min(1, 'Le nom du membre est requis'),
  status: z.enum(['pending', 'active', 'expired', 'cancelled', 'suspended']).default('pending'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  premiumAmount: z.number().min(1, 'Le montant de la prime doit être positif'),
  premiumPaid: z.number().min(0, 'Le montant payé ne peut être négatif'),
  coverageAmount: z.number().min(1, 'Le montant de couverture doit être positif'),
  beneficiaries: z.array(z.object({
    name: z.string().min(1, 'Le nom du bénéficiaire est requis'),
    relationship: z.string().min(1, 'La relation est requise'),
    percentage: z.number().min(1).max(100, 'Le pourcentage doit être entre 1 et 100')
  })).default([]),
  documents: z.array(z.object({
    type: z.string().min(1, 'Le type de document est requis'),
    url: z.string().min(1, 'L\'URL du document est requise'),
    uploadedAt: z.string().min(1, 'La date de téléchargement est requise')
  })).default([]),
  notes: z.string().optional()
}).refine(data => data.premiumPaid <= data.premiumAmount, {
  message: 'Le montant payé ne peut dépasser le montant de la prime',
  path: ['premiumPaid']
});

export const insuranceClaimSchema = z.object({
  subscriptionId: z.string().min(1, 'L\'ID de la souscription est requis'),
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  memberName: z.string().min(1, 'Le nom du membre est requis'),
  policyType: z.string().min(1, 'Le type de police est requis'),
  incidentDate: z.string().min(1, 'La date de l\'incident est requise'),
  incidentType: z.string().min(1, 'Le type d\'incident est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  location: z.string().min(1, 'La localisation est requise'),
  estimatedAmount: z.number().min(1, 'Le montant estimé doit être positif'),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'paid']).default('draft'),
  documents: z.array(z.object({
    type: z.string().min(1, 'Le type de document est requis'),
    url: z.string().min(1, 'L\'URL du document est requise'),
    description: z.string().min(1, 'La description est requise'),
    uploadedAt: z.string().min(1, 'La date de téléchargement est requise')
  })).default([]),
  assessment: z.object({
    damageLevel: z.enum(['minor', 'moderate', 'severe', 'total']),
    cause: z.string().min(1, 'La cause est requise'),
    preventable: z.boolean(),
    recommendations: z.string().optional()
  }).optional()
});

export const insurancePaymentSchema = z.object({
  subscriptionId: z.string().min(1, 'L\'ID de la souscription est requis'),
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  amount: z.number().min(1, 'Le montant doit être positif'),
  currency: z.enum(['XOF', 'USD', 'EUR']),
  paymentDate: z.string().min(1, 'La date de paiement est requise'),
  paymentMethod: z.enum(['cash', 'mobile_money', 'bank_transfer', 'check']),
  reference: z.string().min(1, 'La référence est requise'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  period: z.object({
    start: z.string().min(1, 'La date de début est requise'),
    end: z.string().min(1, 'La date de fin est requise')
  }),
  notes: z.string().optional()
});

export type InsurancePolicyFormData = z.infer<typeof insurancePolicySchema>;
export type InsuranceSubscriptionFormData = z.infer<typeof insuranceSubscriptionSchema>;
export type InsuranceClaimFormData = z.infer<typeof insuranceClaimSchema>;
export type InsurancePaymentFormData = z.infer<typeof insurancePaymentSchema>;

// Service
class InsuranceService {
  private readonly STORAGE_KEYS = {
    POLICIES: 'cooperative_insurance_policies',
    SUBSCRIPTIONS: 'cooperative_insurance_subscriptions',
    CLAIMS: 'cooperative_insurance_claims',
    PAYMENTS: 'cooperative_insurance_payments'
  };

  // Générer un ID unique
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Méthodes utilitaires
  private loadFromStorage<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage ${key}:`, error);
    }
  }

  // CRUD pour les polices d'assurance
  getAllPolicies(): InsurancePolicy[] {
    try {
      const stored = this.loadFromStorage<InsurancePolicy>(this.STORAGE_KEYS.POLICIES);
      if (!stored || stored.length === 0) {
        // Initialiser avec des données par défaut
        const defaultPolicies: InsurancePolicy[] = [
          {
            id: "POL-001",
            name: "Assurance Santé Collective",
            type: "health",
            description: "Couverture médicale complète pour les membres de la coopérative",
            provider: "NSIA Assurance",
            coverage: {
              amount: 1000000,
              currency: "XOF",
              deductible: 10000
            },
            premium: {
              amount: 5000,
              frequency: "monthly",
              currency: "XOF"
            },
            terms: {
              duration: 12,
              renewal: "automatic",
              cancellationPeriod: 30
            },
            eligibility: ["Membre actif de la coopérative", "Âge entre 18 et 65 ans"],
            exclusions: ["Maladies préexistantes", "Soins cosmétiques"],
            benefits: ["Consultations médicales", "Hospitalisation", "Médicaments", "Urgences"],
            requirements: ["Fiche d'adhésion", "Photo d'identité", "Certificat médical"],
            status: "active",
            startDate: "2024-01-01",
            endDate: "2024-12-31",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          }
        ];
        this.saveToStorage(this.STORAGE_KEYS.POLICIES, defaultPolicies);
        return defaultPolicies;
      }
      return stored;
    } catch (error) {
      console.error('Error loading insurance policies:', error);
      return [];
    }
  }

  createPolicy(data: Omit<InsurancePolicyFormData, 'id' | 'createdAt' | 'updatedAt'>): InsurancePolicy {
    try {
      const validatedData = insurancePolicySchema.parse(data);
      const policies = this.getAllPolicies();

      const newPolicy: InsurancePolicy = {
        ...validatedData,
        id: this.generateId('POL'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      policies.push(newPolicy);
      this.saveToStorage(this.STORAGE_KEYS.POLICIES, policies);
      return newPolicy;
    } catch (error) {
      console.error('Error creating insurance policy:', error);
      throw error;
    }
  }

  updatePolicy(id: string, updates: Partial<InsurancePolicyFormData>): InsurancePolicy | null {
    try {
      const policies = this.getAllPolicies();
      const index = policies.findIndex(p => p.id === id);

      if (index === -1) return null;

      policies[index] = { ...policies[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage(this.STORAGE_KEYS.POLICIES, policies);
      return policies[index];
    } catch (error) {
      console.error('Error updating insurance policy:', error);
      throw error;
    }
  }

  // CRUD pour les souscriptions
  getAllSubscriptions(): InsuranceSubscription[] {
    try {
      return this.loadFromStorage<InsuranceSubscription>(this.STORAGE_KEYS.SUBSCRIPTIONS);
    } catch (error) {
      console.error('Error loading insurance subscriptions:', error);
      return [];
    }
  }

  createSubscription(data: Omit<InsuranceSubscriptionFormData, 'id' | 'createdAt' | 'updatedAt'>): InsuranceSubscription {
    try {
      const validatedData = insuranceSubscriptionSchema.parse(data);
      const subscriptions = this.getAllSubscriptions();

      const newSubscription: InsuranceSubscription = {
        ...validatedData,
        id: this.generateId('SUB'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      subscriptions.push(newSubscription);
      this.saveToStorage(this.STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      return newSubscription;
    } catch (error) {
      console.error('Error creating insurance subscription:', error);
      throw error;
    }
  }

  updateSubscription(id: string, updates: Partial<InsuranceSubscriptionFormData>): InsuranceSubscription | null {
    try {
      const subscriptions = this.getAllSubscriptions();
      const index = subscriptions.findIndex(s => s.id === id);

      if (index === -1) return null;

      subscriptions[index] = { ...subscriptions[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage(this.STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
      return subscriptions[index];
    } catch (error) {
      console.error('Error updating insurance subscription:', error);
      throw error;
    }
  }

  // CRUD pour les réclamations
  getAllClaims(): InsuranceClaim[] {
    try {
      return this.loadFromStorage<InsuranceClaim>(this.STORAGE_KEYS.CLAIMS);
    } catch (error) {
      console.error('Error loading insurance claims:', error);
      return [];
    }
  }

  createClaim(data: Omit<InsuranceClaimFormData, 'id' | 'createdAt' | 'updatedAt'>): InsuranceClaim {
    try {
      const validatedData = insuranceClaimSchema.parse(data);
      const claims = this.getAllClaims();

      const newClaim: InsuranceClaim = {
        ...validatedData,
        id: this.generateId('CLM'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      claims.push(newClaim);
      this.saveToStorage(this.STORAGE_KEYS.CLAIMS, claims);
      return newClaim;
    } catch (error) {
      console.error('Error creating insurance claim:', error);
      throw error;
    }
  }

  updateClaimStatus(id: string, status: InsuranceClaim['status'], reviewedBy?: string, approvedAmount?: number): boolean {
    try {
      const claims = this.getAllClaims();
      const index = claims.findIndex(c => c.id === id);

      if (index === -1) return false;

      claims[index].status = status;
      claims[index].updatedAt = new Date().toISOString();

      if (reviewedBy) {
        claims[index].reviewedBy = reviewedBy;
        claims[index].reviewedAt = new Date().toISOString();
      }

      if (approvedAmount !== undefined) {
        claims[index].approvedAmount = approvedAmount;
      }

      this.saveToStorage(this.STORAGE_KEYS.CLAIMS, claims);
      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      return false;
    }
  }

  // CRUD pour les paiements
  getAllPayments(): InsurancePayment[] {
    try {
      return this.loadFromStorage<InsurancePayment>(this.STORAGE_KEYS.PAYMENTS);
    } catch (error) {
      console.error('Error loading insurance payments:', error);
      return [];
    }
  }

  createPayment(data: Omit<InsurancePaymentFormData, 'id' | 'processedBy' | 'processedAt' | 'createdAt'>): InsurancePayment {
    try {
      const validatedData = insurancePaymentSchema.parse(data);
      const payments = this.getAllPayments();

      const now = new Date().toISOString();
      const newPayment: InsurancePayment = {
        ...validatedData,
        id: this.generateId('PAY'),
        processedBy: 'system', // À remplacer par l'utilisateur connecté
        processedAt: now,
        createdAt: now
      };

      payments.push(newPayment);
      this.saveToStorage(this.STORAGE_KEYS.PAYMENTS, payments);

      // Mettre à jour le montant payé de la souscription
      this.updateSubscriptionPremiumPaid(data.subscriptionId, data.amount);

      return newPayment;
    } catch (error) {
      console.error('Error creating insurance payment:', error);
      throw error;
    }
  }

  private updateSubscriptionPremiumPaid(subscriptionId: string, amount: number): void {
    const subscriptions = this.getAllSubscriptions();
    const index = subscriptions.findIndex(s => s.id === subscriptionId);

    if (index !== -1) {
      subscriptions[index].premiumPaid += amount;
      subscriptions[index].updatedAt = new Date().toISOString();
      this.saveToStorage(this.STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    }
  }

  // Méthodes de recherche et filtrage
  filterSubscriptionsByMember(memberId: string): InsuranceSubscription[] {
    try {
      const subscriptions = this.getAllSubscriptions();
      return subscriptions.filter(s => s.memberId === memberId);
    } catch (error) {
      console.error('Error filtering subscriptions by member:', error);
      return [];
    }
  }

  filterSubscriptionsByPolicy(policyId: string): InsuranceSubscription[] {
    try {
      const subscriptions = this.getAllSubscriptions();
      return subscriptions.filter(s => s.policyId === policyId);
    } catch (error) {
      console.error('Error filtering subscriptions by policy:', error);
      return [];
    }
  }

  filterSubscriptionsByStatus(status: string): InsuranceSubscription[] {
    try {
      const subscriptions = this.getAllSubscriptions();
      if (status === 'all') return subscriptions;
      return subscriptions.filter(s => s.status === status);
    } catch (error) {
      console.error('Error filtering subscriptions by status:', error);
      return [];
    }
  }

  filterClaimsByStatus(status: string): InsuranceClaim[] {
    try {
      const claims = this.getAllClaims();
      if (status === 'all') return claims;
      return claims.filter(c => c.status === status);
    } catch (error) {
      console.error('Error filtering claims by status:', error);
      return [];
    }
  }

  // Statistiques
  getInsuranceStats() {
    try {
      const policies = this.getAllPolicies();
      const subscriptions = this.getAllSubscriptions();
      const claims = this.getAllClaims();
      const payments = this.getAllPayments();

      const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
      const pendingClaims = claims.filter(c => c.status === 'under_review');
      const approvedClaims = claims.filter(c => c.status === 'approved');

      const totalPremium = subscriptions.reduce((sum, s) => sum + s.premiumAmount, 0);
      const totalPaid = subscriptions.reduce((sum, s) => sum + s.premiumPaid, 0);
      const totalCoverage = subscriptions.reduce((sum, s) => sum + s.coverageAmount, 0);

      const claimsByType = claims.reduce((acc, claim) => {
        acc[claim.policyType] = (acc[claim.policyType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const paymentsByMethod = payments.reduce((acc, payment) => {
        acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + payment.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalPolicies: policies.length,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        totalPremium,
        totalPaid,
        totalCoverage,
        pendingClaims: pendingClaims.length,
        approvedClaims: approvedClaims.length,
        claimsByType,
        paymentsByMethod,
        collectionRate: totalPremium > 0 ? (totalPaid / totalPremium) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting insurance stats:', error);
      return {
        totalPolicies: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        totalPremium: 0,
        totalPaid: 0,
        totalCoverage: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        claimsByType: {},
        paymentsByMethod: {},
        collectionRate: 0
      };
    }
  }

  // Export CSV
  exportSubscriptionsToCSV(): string {
    try {
      const subscriptions = this.getAllSubscriptions();
      const headers = [
        'ID', 'ID Police', 'Membre', 'Statut', 'Date début', 'Date fin',
        'Prime totale', 'Prime payée', 'Montant couverture', 'Date création'
      ];

      const rows = subscriptions.map(s => [
        s.id,
        s.policyId,
        s.memberName,
        s.status,
        s.startDate,
        s.endDate,
        s.premiumAmount.toString(),
        s.premiumPaid.toString(),
        s.coverageAmount.toString(),
        s.createdAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      return '';
    }
  }

  exportClaimsToCSV(): string {
    try {
      const claims = this.getAllClaims();
      const headers = [
        'ID', 'ID Souscription', 'Membre', 'Type', 'Date incident',
        'Statut', 'Montant estimé', 'Montant approuvé', 'Date création'
      ];

      const rows = claims.map(c => [
        c.id,
        c.subscriptionId,
        c.memberName,
        c.policyType,
        c.incidentDate,
        c.status,
        c.estimatedAmount.toString(),
        (c.approvedAmount || 0).toString(),
        c.createdAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting claims:', error);
      return '';
    }
  }

  // Validation
  validateSubscription(subscription: Partial<InsuranceSubscriptionFormData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!subscription.policyId || subscription.policyId.trim().length < 1) {
      errors.push('L\'ID de la police est requis');
    }

    if (!subscription.memberId || subscription.memberId.trim().length < 1) {
      errors.push('L\'ID du membre est requis');
    }

    if (!subscription.premiumAmount || subscription.premiumAmount <= 0) {
      errors.push('Le montant de la prime doit être positif');
    }

    if (subscription.premiumPaid && subscription.premiumPaid < 0) {
      errors.push('Le montant payé ne peut être négatif');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const insuranceService = new InsuranceService();