import { BaseService } from '../baseService';
import { 
  MerchantEnrollment, 
  MerchantEnrollmentFormData, 
  MerchantEnrollmentValidation, 
  MerchantEnrollmentStatus,
  MarketType,
  EnrollmentDocument,
  MerchantEnrollmentStats
} from '@/types/merchant';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class MerchantEnrollmentService extends BaseService<MerchantEnrollment> {
  constructor() {
    super('/merchant/enrollments', 'merchant_enrollments');
  }

  // Validation des données d'enrôlement
  validateEnrollment(data: MerchantEnrollmentFormData): MerchantEnrollmentValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des informations de base
    if (!data.firstName?.trim()) {
      errors.push('Le prénom est requis');
    }
    if (!data.lastName?.trim()) {
      errors.push('Le nom de famille est requis');
    }
    if (!data.dateOfBirth) {
      errors.push('La date de naissance est requise');
    } else {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.push('Le marchand doit avoir au moins 18 ans');
      }
    }
    if (!data.nationality?.trim()) {
      errors.push('La nationalité est requise');
    }

    // Validation des coordonnées
    if (!data.phone?.trim()) {
      errors.push('Le numéro de téléphone est requis');
    } else if (!/^\+?\d{8,15}$/.test(data.phone.replace(/\s/g, ''))) {
      errors.push('Format de numéro de téléphone invalide');
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Format d\'email invalide');
    }

    // Validation de l'adresse
    if (!data.address?.trim()) {
      errors.push('L\'adresse est requise');
    }
    if (!data.commune?.trim()) {
      errors.push('La commune est requise');
    }
    if (!data.market?.trim()) {
      errors.push('Le marché est requis');
    }

    // Validation des documents d'identité
    if (!data.cniNumber?.trim()) {
      errors.push('Le numéro de CNI est requis');
    }
    if (data.cniExpiryDate && new Date(data.cniExpiryDate) < new Date()) {
      errors.push('La date d\'expiration de la CNI est déjà passée');
    }

    // Validation des informations professionnelles
    if (!data.businessName?.trim()) {
      errors.push('Le nom de l\'entreprise est requis');
    }
    if (!data.businessType?.trim()) {
      errors.push('Le type d\'activité est requis');
    }

    // Validation des documents
    if (data.documents.length === 0) {
      errors.push('Au moins un document doit être téléchargé');
    } else {
      const requiredDocs = ['cni'];
      const uploadedTypes = data.documents.map(doc => doc.type);
      
      requiredDocs.forEach(type => {
        if (!uploadedTypes.includes(type)) {
          errors.push(`Le document ${type} est requis`);
        }
      });
    }

    // Vérification des doublons
    const existingEnrollments = this.getLocalStorageData();
    const duplicateCni = existingEnrollments.find(
      enrollment => enrollment.cniNumber === data.cniNumber
    );
    if (duplicateCni) {
      errors.push('Un marchand avec ce numéro de CNI existe déjà');
    }

    const duplicatePhone = existingEnrollments.find(
      enrollment => enrollment.phone === data.phone
    );
    if (duplicatePhone) {
      errors.push('Un marchand avec ce numéro de téléphone existe déjà');
    }

    // Vérification des avertissements
    if (!data.registrationDate) {
      warnings.push('La date d\'enregistrement de l\'entreprise n\'a pas été fournie');
    }
    if (!data.taxNumber) {
      warnings.push('Le numéro fiscal n\'a pas été fourni');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Créer une nouvelle demande d'enrôlement
  async createEnrollment(data: MerchantEnrollmentFormData): Promise<ApiResponse<MerchantEnrollment>> {
    const validation = this.validateEnrollment(data);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    // Générer un ID unique
    const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Préparer les documents
    const documents: EnrollmentDocument[] = data.documents.map(doc => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: doc.type as EnrollmentDocument['type'],
      filename: doc.filename,
      url: `/uploads/${doc.filename}`, // URL fictive pour le moment
      uploadedAt: new Date().toISOString(),
      verified: false,
      verifiedBy: '',
      verifiedAt: ''
    }));

    const enrollment: MerchantEnrollment = {
      id: enrollmentId,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      dateOfBirth: data.dateOfBirth,
      nationality: data.nationality.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      address: data.address.trim(),
      commune: data.commune.trim(),
      market: data.market.trim(),
      marketType: data.marketType,
      cniNumber: data.cniNumber.trim(),
      cniExpiryDate: data.cniExpiryDate,
      cmuNumber: data.cmuNumber?.trim(),
      rstiNumber: data.rstiNumber?.trim(),
      businessName: data.businessName.trim(),
      businessType: data.businessType.trim(),
      registrationDate: data.registrationDate,
      taxNumber: data.taxNumber?.trim(),
      status: MerchantEnrollmentStatus.SUBMITTED,
      submittedAt: new Date().toISOString(),
      documents,
      notes: ''
    };

    // Sauvegarder localement pour le moment
    const existingData = this.getLocalStorageData();
    const updatedData = [...existingData, enrollment];
    this.setLocalStorageData(updatedData);

    return { success: true, data: enrollment };
  }

  // Mettre à jour une demande d'enrôlement
  async updateEnrollment(id: string, updates: Partial<MerchantEnrollment>): Promise<ApiResponse<MerchantEnrollment | undefined>> {
    const existingData = this.getLocalStorageData();
    const enrollmentIndex = existingData.findIndex(enrollment => enrollment.id === id);
    
    if (enrollmentIndex === -1) {
      return { success: false, error: 'Demande d\'enrôlement non trouvée' };
    }

    const updatedEnrollment = { ...existingData[enrollmentIndex], ...updates };
    updatedEnrollment.updatedAt = new Date().toISOString();

    existingData[enrollmentIndex] = updatedEnrollment;
    this.setLocalStorageData(existingData);

    return { success: true, data: updatedEnrollment };
  }

  // Approuver une demande d'enrôlement
  async approveEnrollment(id: string, reviewedBy: string, notes?: string): Promise<ApiResponse<MerchantEnrollment | undefined>> {
    return this.updateEnrollment(id, {
      status: MerchantEnrollmentStatus.APPROVED,
      reviewedAt: new Date().toISOString(),
      notes: notes || '',
      rejectionReason: undefined
    });
  }

  // Rejeter une demande d'enrôlement
  async rejectEnrollment(id: string, reviewedBy: string, reason: string): Promise<ApiResponse<MerchantEnrollment | undefined>> {
    return this.updateEnrollment(id, {
      status: MerchantEnrollmentStatus.REJECTED,
      reviewedAt: new Date().toISOString(),
      rejectionReason: reason,
      notes: ''
    });
  }

  // Activer un marchand après paiement des frais
  async activateEnrollment(id: string, cooperativeId: string, cooperativeName: string): Promise<ApiResponse<MerchantEnrollment | undefined>> {
    return this.updateEnrollment(id, {
      status: MerchantEnrollmentStatus.ACTIVE,
      cooperativeId,
      cooperativeName,
      activatedAt: new Date().toISOString()
    });
  }

  // Suspendre un marchand
  async suspendEnrollment(id: string, reason: string): Promise<ApiResponse<MerchantEnrollment | undefined>> {
    return this.updateEnrollment(id, {
      status: MerchantEnrollmentStatus.SUSPENDED,
      notes: reason
    });
  }

  // Récupérer les demandes par statut
  getEnrollmentsByStatus(status: MerchantEnrollmentStatus): MerchantEnrollment[] {
    const allEnrollments = this.getLocalStorageData();
    return allEnrollments.filter(enrollment => enrollment.status === status);
  }

  // Récupérer les demandes par marché
  getEnrollmentsByMarket(market: string): MerchantEnrollment[] {
    const allEnrollments = this.getLocalStorageData();
    return allEnrollments.filter(enrollment => enrollment.market === market);
  }

  // Récupérer les demandes par commune
  getEnrollmentsByCommune(commune: string): MerchantEnrollment[] {
    const allEnrollments = this.getLocalStorageData();
    return allEnrollments.filter(enrollment => enrollment.commune === commune);
  }

  // Obtenir les statistiques d'enrôlement
  getEnrollmentStats(): MerchantEnrollmentStats {
    const allEnrollments = this.getLocalStorageData();
    const now = new Date();
    
    const stats: MerchantEnrollmentStats = {
      total: allEnrollments.length,
      pending: allEnrollments.filter(e => e.status === MerchantEnrollmentStatus.SUBMITTED).length,
      approved: allEnrollments.filter(e => e.status === MerchantEnrollmentStatus.APPROVED).length,
      rejected: allEnrollments.filter(e => e.status === MerchantEnrollmentStatus.REJECTED).length,
      active: allEnrollments.filter(e => e.status === MerchantEnrollmentStatus.ACTIVE).length,
      averageProcessingTime: 0
    };

    // Calculer le temps de traitement moyen
    const processedEnrollments = allEnrollments.filter(e => 
      e.reviewedAt && e.status !== MerchantEnrollmentStatus.SUBMITTED
    );
    
    if (processedEnrollments.length > 0) {
      const totalTime = processedEnrollments.reduce((sum, enrollment) => {
        const submitted = new Date(enrollment.submittedAt);
        const reviewed = new Date(enrollment.reviewedAt!);
        return sum + (reviewed.getTime() - submitted.getTime());
      }, 0);
      
      stats.averageProcessingTime = Math.round(totalTime / processedEnrollments.length / (1000 * 60 * 60 * 24)); // en jours
    }

    return stats;
  }

  // Vérifier si un marchand est actif
  isMerchantActive(market: string, commune: string): boolean {
    const activeEnrollments = this.getLocalStorageData().filter(
      e => e.status === MerchantEnrollmentStatus.ACTIVE && e.market === market && e.commune === commune
    );
    return activeEnrollments.length > 0;
  }

  // Initialiser avec des données de démonstration
  initializeDemoData(): void {
    const existingData = this.getLocalStorageData();
    if (existingData.length > 0) return;

    const demoEnrollments: MerchantEnrollment[] = [
      {
        id: 'enrollment_1',
        firstName: 'Kouassi',
        lastName: 'Ahoussi',
        dateOfBirth: '1985-03-15',
        nationality: 'Ivoirienne',
        phone: '+225 07 88 12 34 56',
        email: 'kouassi.ahoussi@example.com',
        address: 'Angré, Rue des Palmiers',
        commune: 'Cocody',
        market: 'Marché d\'Agban',
        marketType: MarketType.TRADITIONAL,
        cniNumber: 'CI-123456789',
        cniExpiryDate: '2026-03-15',
        cmuNumber: 'CMU-987654321',
        rstiNumber: 'RSTI-456789123',
        businessName: 'Epicerie Kouassi',
        businessType: 'Épicerie',
        registrationDate: '2020-01-10',
        taxNumber: 'TVA-123456789',
        status: MerchantEnrollmentStatus.ACTIVE,
        submittedAt: '2024-01-10T10:00:00Z',
        reviewedAt: '2024-01-12T10:00:00Z',
        approvedAt: '2024-01-12T10:00:00Z',
        activatedAt: '2024-01-15T10:00:00Z',
        cooperativeId: 'coop_1',
        cooperativeName: 'Coopérative Agban',
        documents: [
          {
            id: 'doc_1',
            type: 'cni',
            filename: 'cni_kouassi.pdf',
            url: '/uploads/cni_kouassi.pdf',
            uploadedAt: '2024-01-10T10:00:00Z',
            verified: true,
            verifiedBy: 'admin',
            verifiedAt: '2024-01-12T10:00:00Z'
          }
        ],
        notes: ''
      },
      {
        id: 'enrollment_2',
        firstName: 'N\'guessan',
        lastName: 'Béatrice',
        dateOfBirth: '1990-07-22',
        nationality: 'Ivoirienne',
        phone: '+225 07 89 45 67 89',
        email: 'nguessan.beatrice@example.com',
        address: 'Treichville, Avenue de la Paix',
        commune: 'Treichville',
        market: 'Marché de Treichville',
        marketType: MarketType.MODERN,
        cniNumber: 'CI-987654321',
        cniExpiryDate: '2027-07-22',
        businessName: 'Béatrice Fruits',
        businessType: 'Fruits et légumes',
        registrationDate: '2022-03-15',
        taxNumber: 'TVA-987654321',
        status: MerchantEnrollmentStatus.PENDING,
        submittedAt: '2024-03-01T14:30:00Z',
        documents: [
          {
            id: 'doc_2',
            type: 'cni',
            filename: 'cni_beatrice.pdf',
            url: '/uploads/cni_beatrice.pdf',
            uploadedAt: '2024-03-01T14:30:00Z',
            verified: false,
            verifiedBy: '',
            verifiedAt: ''
          }
        ],
        notes: ''
      }
    ];

    this.setLocalStorageData(demoEnrollments);
  }
}

export const merchantEnrollmentService = new MerchantEnrollmentService();
