export interface ProducerDocument {
  id: string;
  producerId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  expiresAt?: string;
  status: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  categories?: string[];
  tags?: string[];
  description?: string;
}

export type DocumentType =
  | 'national_id'
  | 'passport'
  | 'business_license'
  | 'agricultural_permit'
  | 'land_ownership'
  | 'quality_certification'
  | 'organic_certification'
  | 'tax_id'
  | 'bank_statement'
  | 'proof_of_address'
  | 'insurance'
  | 'membership_card'
  | 'training_certificate'
  | 'other';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'verified'
  | 'rejected'
  | 'expired'
  | 'requires_resubmission';

export interface VerificationRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  documentTypes: DocumentType[];
  instructions?: string;
  helpText?: string;
  estimatedProcessingTime: number; // in days
  recurring?: boolean; // for annual renewals
}

export interface VerificationCase {
  id: string;
  producerId: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  estimatedResolution?: string;
  documents: ProducerDocument[];
  messages: VerificationMessage[];
  checklist: VerificationChecklist;
}

export interface VerificationMessage {
  id: string;
  caseId: string;
  sender: string;
  senderRole: 'producer' | 'verifier' | 'admin';
  content: string;
  timestamp: string;
  attachments?: string[];
}

export interface VerificationChecklist {
  items: VerificationCheckItem[];
  completedItems: string[];
  overallProgress: number;
}

export interface VerificationCheckItem {
  id: string;
  title: string;
  description: string;
  category: 'document' | 'interview' | 'site_visit' | 'training' | 'other';
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: 'basic' | 'safety' | 'quality' | 'business' | 'technical';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[];
  content: TrainingContent;
  quiz?: TrainingQuiz;
  certificate?: boolean;
}

export interface TrainingContent {
  sections: TrainingSection[];
  resources: TrainingResource[];
}

export interface TrainingSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  duration: number;
  completed?: boolean;
}

export interface TrainingResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'link' | 'tool';
  url: string;
  description?: string;
}

export interface TrainingQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface OnboardingProgress {
  producerId: string;
  steps: OnboardingStep[];
  completedSteps: string[];
  currentStep?: string;
  overallProgress: number;
  estimatedCompletion?: string;
  startedAt: string;
  completedAt?: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  type: 'document_upload' | 'training' | 'quiz' | 'interview' | 'site_visit' | 'agreement';
  order: number;
  required: boolean;
  estimatedDuration: number; // in minutes
  dependencies?: string[];
  resources?: string[];
  completed?: boolean;
  completedAt?: string;
  data?: any;
}

export class ProducerVerificationService {
  private static instance: ProducerVerificationService;
  private cache = new Map<string, { data: any; timestamp: number }>();

  static getInstance(): ProducerVerificationService {
    if (!ProducerVerificationService.instance) {
      ProducerVerificationService.instance = new ProducerVerificationService();
    }
    return ProducerVerificationService.instance;
  }

  // Document Management
  async uploadDocument(
    producerId: string,
    file: File,
    type: DocumentType,
    metadata?: DocumentMetadata
  ): Promise<ProducerDocument> {
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));

      const document: ProducerDocument = {
        id: `doc-${Date.now()}`,
        producerId,
        type,
        name: file.name,
        fileUrl: `/uploads/${producerId}/${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
        metadata
      };

      return document;
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error);
      throw error;
    }
  }

  async getDocuments(producerId: string): Promise<ProducerDocument[]> {
    try {
      // Mock data for demonstration
      return [
        {
          id: 'doc1',
          producerId,
          type: 'national_id',
          name: 'Carte Nationale d\'Identité',
          fileUrl: '/documents/cni.pdf',
          fileSize: 204800,
          mimeType: 'application/pdf',
          uploadedAt: '2024-01-15T10:00:00Z',
          status: 'verified',
          verifiedBy: 'Système',
          verifiedAt: '2024-01-15T10:05:00Z',
          metadata: {
            documentNumber: 'CI123456789',
            issuingAuthority: 'CNI',
            issueDate: '2020-01-01',
            expiryDate: '2030-01-01'
          }
        },
        {
          id: 'doc2',
          producerId,
          type: 'business_license',
          name: 'Registre de Commerce',
          fileUrl: '/documents/rc.pdf',
          fileSize: 307200,
          mimeType: 'application/pdf',
          uploadedAt: '2024-01-15T10:15:00Z',
          status: 'under_review'
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
  }

  async verifyDocument(documentId: string, status: VerificationStatus, notes?: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du document:', error);
      return false;
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      return false;
    }
  }

  // Verification Requirements
  async getVerificationRequirements(): Promise<VerificationRequirement[]> {
    return [
      {
        id: 'req1',
        name: 'Identification Personnelle',
        description: 'Documents d\'identité valides',
        required: true,
        documentTypes: ['national_id', 'passport'],
        instructions: 'Téléchargez une copie claire de votre pièce d\'identité',
        estimatedProcessingTime: 1
      },
      {
        id: 'req2',
        name: 'Autorisation d\'Exploitation',
        description: 'Permis ou autorisation agricole',
        required: true,
        documentTypes: ['agricultural_permit', 'business_license'],
        estimatedProcessingTime: 3
      },
      {
        id: 'req3',
        name: 'Certifications de Qualité',
        description: 'Certifications biologiques ou de qualité',
        required: false,
        documentTypes: ['organic_certification', 'quality_certification'],
        estimatedProcessingTime: 5
      },
      {
        id: 'req4',
        name: 'Formation Agricole',
        description: 'Certificats de formation agricole',
        required: false,
        documentTypes: ['training_certificate'],
        estimatedProcessingTime: 2
      }
    ];
  }

  // Verification Cases
  async createVerificationCase(producerId: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<VerificationCase> {
    try {
      const requirements = await this.getVerificationRequirements();
      const documents = await this.getDocuments(producerId);

      const checklist: VerificationChecklist = {
        items: requirements.map(req => ({
          id: req.id,
          title: req.name,
          description: req.description,
          category: 'document',
          required: req.required,
          completed: documents.some(doc => req.documentTypes.includes(doc.type) && doc.status === 'verified')
        })),
        completedItems: documents
          .filter(doc => doc.status === 'verified')
          .map(doc => doc.type),
        overallProgress: 0
      };

      checklist.overallProgress = Math.round(
        (checklist.completedItems.length / checklist.items.length) * 100
      );

      return {
        id: `case-${Date.now()}`,
        producerId,
        status: 'open',
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedResolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        documents,
        messages: [],
        checklist
      };
    } catch (error) {
      console.error('Erreur lors de la création du dossier de vérification:', error);
      throw error;
    }
  }

  async getVerificationCase(producerId: string): Promise<VerificationCase | null> {
    try {
      // Mock implementation
      return this.createVerificationCase(producerId);
    } catch (error) {
      console.error('Erreur lors de la récupération du dossier de vérification:', error);
      return null;
    }
  }

  async addVerificationMessage(caseId: string, message: Omit<VerificationMessage, 'id' | 'caseId' | 'timestamp'>): Promise<VerificationMessage> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        id: `msg-${Date.now()}`,
        caseId,
        timestamp: new Date().toISOString(),
        ...message
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      throw error;
    }
  }

  // Training Modules
  async getTrainingModules(): Promise<TrainingModule[]> {
    return [
      {
        id: 'training1',
        title: 'Introduction à l\'Agriculture Durable',
        description: 'Apprenez les bases de l\'agriculture durable et écoresponsable',
        category: 'basic',
        duration: 45,
        difficulty: 'beginner',
        content: {
          sections: [
            {
              id: 'section1',
              title: 'Qu\'est-ce que l\'agriculture durable ?',
              content: 'L\'agriculture durable est une méthode de production...',
              type: 'text',
              duration: 15
            },
            {
              id: 'section2',
              title: 'Pratiques de base',
              content: 'Les pratiques agricoles durables incluent...',
              type: 'text',
              duration: 20
            },
            {
              id: 'section3',
              title: 'Quiz de connaissances',
              content: 'Testez vos connaissances',
              type: 'quiz',
              duration: 10
            }
          ],
          resources: [
            {
              id: 'res1',
              name: 'Guide des bonnes pratiques',
              type: 'document',
              url: '/resources/guide-pratiques.pdf',
              description: 'Guide complet des bonnes pratiques agricoles'
            }
          ]
        },
        quiz: {
          id: 'quiz1',
          passingScore: 70,
          questions: [
            {
              id: 'q1',
              question: 'Quel est l\'objectif principal de l\'agriculture durable ?',
              type: 'multiple_choice',
              options: [
                'Maximiser les rendements',
                'Préserver l\'environnement et les ressources',
                'Utiliser le plus de pesticides possible',
                'Réduire la main d\'œuvre'
              ],
              correctAnswer: 'Préserver l\'environnement et les ressources',
              explanation: 'L\'agriculture durable vise à préserver les ressources naturelles pour les générations futures.',
              points: 1
            }
          ]
        },
        certificate: true
      },
      {
        id: 'training2',
        title: 'Gestion de la Qualité des Récoltes',
        description: 'Apprenez à maintenir et améliorer la qualité de vos produits',
        category: 'quality',
        duration: 60,
        difficulty: 'intermediate',
        prerequisites: ['training1'],
        content: {
          sections: [
            {
              id: 'section1',
              title: 'Standards de qualité',
              content: 'Les standards de qualité agricole...',
              type: 'text',
              duration: 20
            },
            {
              id: 'section2',
              title: 'Contrôles qualité',
              content: 'Méthodes de contrôle qualité...',
              type: 'video',
              duration: 25
            }
          ],
          resources: []
        }
      }
    ];
  }

  async completeTraining(producerId: string, moduleId: string, quizAnswers?: Record<string, any>): Promise<{
    success: boolean;
    score?: number;
    passed?: boolean;
    certificateId?: string;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock quiz evaluation
      const score = quizAnswers ? Math.floor(Math.random() * 30) + 70 : 100; // 70-100%
      const passed = score >= 70;

      return {
        success: true,
        score,
        passed,
        certificateId: passed ? `cert-${Date.now()}` : undefined
      };
    } catch (error) {
      console.error('Erreur lors de la completion de la formation:', error);
      return { success: false };
    }
  }

  // Onboarding Progress
  async getOnboardingProgress(producerId: string): Promise<OnboardingProgress> {
    try {
      const steps: OnboardingStep[] = [
        {
          id: 'step1',
          name: 'Téléchargement des documents',
          description: 'Uploadez vos documents d\'identité et autorisations',
          type: 'document_upload',
          order: 1,
          required: true,
          estimatedDuration: 30
        },
        {
          id: 'step2',
          name: 'Formation de base',
          description: 'Suivez la formation d\'introduction à la plateforme',
          type: 'training',
          order: 2,
          required: true,
          estimatedDuration: 45,
          resources: ['training1']
        },
        {
          id: 'step3',
          name: 'Quiz final',
          description: 'Passez le quiz de validation des connaissances',
          type: 'quiz',
          order: 3,
          required: true,
          estimatedDuration: 15,
          dependencies: ['step2']
        },
        {
          id: 'step4',
          name: 'Entretien de validation',
          description: 'Entretien avec un agent de validation',
          type: 'interview',
          order: 4,
          required: true,
          estimatedDuration: 30,
          dependencies: ['step1', 'step3']
        }
      ];

      return {
        producerId,
        steps,
        completedSteps: [],
        currentStep: 'step1',
        overallProgress: 0,
        estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        startedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression:', error);
      throw error;
    }
  }

  async updateOnboardingStep(producerId: string, stepId: string, completed: boolean, data?: any): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étape:', error);
      return false;
    }
  }

  // Analytics and Reporting
  async getVerificationAnalytics(producerId: string): Promise<{
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    verificationProgress: number;
    trainingProgress: number;
    estimatedCompletion: string;
  }> {
    try {
      const documents = await this.getDocuments(producerId);
      const trainingModules = await this.getTrainingModules();

      return {
        totalDocuments: documents.length,
        verifiedDocuments: documents.filter(d => d.status === 'verified').length,
        pendingDocuments: documents.filter(d => d.status === 'pending').length,
        verificationProgress: Math.round((documents.filter(d => d.status === 'verified').length / Math.max(documents.length, 1)) * 100),
        trainingProgress: 0, // Would be calculated from actual training progress
        estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      throw error;
    }
  }

  // Helper methods
  async checkDocumentExpiry(producerId: string): Promise<ProducerDocument[]> {
    const documents = await this.getDocuments(producerId);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return documents.filter(doc =>
      doc.expiresAt &&
      new Date(doc.expiresAt) < thirtyDaysFromNow
    );
  }

  async generateVerificationReport(producerId: string): Promise<{
    pdfUrl: string;
    generatedAt: string;
    summary: {
      status: string;
      completedItems: number;
      totalItems: number;
      issues: string[];
    };
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        pdfUrl: `/reports/verification-${producerId}-${Date.now()}.pdf`,
        generatedAt: new Date().toISOString(),
        summary: {
          status: 'in_progress',
          completedItems: 2,
          totalItems: 4,
          issues: ['Certificat biologique manquant', 'Formation non complétée']
        }
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const producerVerificationService = ProducerVerificationService.getInstance();