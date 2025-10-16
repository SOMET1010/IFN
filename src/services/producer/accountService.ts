import { ProducerSale, ProducerOffer, ProducerHarvest } from '@/types';

export interface AccountStatus {
  status: 'active' | 'suspended' | 'deactivated' | 'pending_deletion';
  reason?: string;
  effectiveDate?: string;
  scheduledDeletionDate?: string;
  canReactivate: boolean;
  reactivationDeadline?: string;
}

export interface PendingTransaction {
  id: string;
  type: 'sale' | 'purchase' | 'payment' | 'delivery';
  status: 'pending' | 'in_progress' | 'disputed';
  amount: number;
  currency: string;
  description: string;
  createdAt: string;
  estimatedCompletion?: string;
  otherParty?: {
    id: string;
    name: string;
    type: 'buyer' | 'seller' | 'carrier';
  };
}

export interface AccountDeletionRequest {
  id: string;
  producerId: string;
  reason: string;
  additionalComments?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  estimatedDeletionDate?: string;
  dataExportUrl?: string;
  pendingTransactions: PendingTransaction[];
  dataBackupCreated: boolean;
  notificationsSent: boolean;
}

export interface DataExportRequest {
  id: string;
  producerId: string;
  format: 'json' | 'csv' | 'pdf';
  include: {
    personal_data: boolean;
    financial_data: boolean;
    transaction_history: boolean;
    communications: boolean;
    documents: boolean;
  };
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: number;
  error?: string;
}

export interface AccountActivity {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  details?: any;
}

export interface AccountSecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
  allowedIPs?: string[];
  dataRetention: {
    transactions: number; // in days
    communications: number; // in days
    documents: number; // in days
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'unlisted';
    showStatistics: boolean;
    allowContactRequests: boolean;
  };
}

export class AccountService {
  private static instance: AccountService;
  private cache = new Map<string, { data: any; timestamp: number }>();

  static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  // Account Status Management
  async getAccountStatus(producerId: string): Promise<AccountStatus> {
    try {
      // Mock implementation - in real app, this would check the database
      return {
        status: 'active',
        canReactivate: false
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut du compte:', error);
      throw error;
    }
  }

  async deactivateAccount(
    producerId: string,
    reason: string,
    temporary: boolean = true,
    duration?: number // in days
  ): Promise<AccountStatus> {
    try {
      // Check for pending transactions first
      const pendingTransactions = await this.getPendingTransactions(producerId);
      if (pendingTransactions.length > 0) {
        throw new Error(
          `Impossible de désactiver le compte. ${pendingTransactions.length} transactions en cours doivent être terminées.`
        );
      }

      // Simulate account deactivation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const effectiveDate = new Date().toISOString();
      const scheduledDeletionDate = temporary && duration
        ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      return {
        status: temporary ? 'deactivated' : 'pending_deletion',
        reason,
        effectiveDate,
        scheduledDeletionDate,
        canReactivate: temporary,
        reactivationDeadline: scheduledDeletionDate
      };
    } catch (error) {
      console.error('Erreur lors de la désactivation du compte:', error);
      throw error;
    }
  }

  async reactivateAccount(producerId: string): Promise<AccountStatus> {
    try {
      const currentStatus = await this.getAccountStatus(producerId);

      if (currentStatus.status === 'active') {
        throw new Error('Le compte est déjà actif');
      }

      if (currentStatus.reactivationDeadline) {
        const deadline = new Date(currentStatus.reactivationDeadline);
        if (new Date() > deadline) {
          throw new Error('Le délai de réactivation a expiré');
        }
      }

      // Simulate reactivation
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        status: 'active',
        canReactivate: false
      };
    } catch (error) {
      console.error('Erreur lors de la réactivation du compte:', error);
      throw error;
    }
  }

  // Account Deletion
  async requestAccountDeletion(
    producerId: string,
    reason: string,
    additionalComments?: string
  ): Promise<AccountDeletionRequest> {
    try {
      // Check for pending transactions
      const pendingTransactions = await this.getPendingTransactions(producerId);
      const hasPendingTransactions = pendingTransactions.length > 0;

      // Create deletion request
      const request: AccountDeletionRequest = {
        id: `del-${Date.now()}`,
        producerId,
        reason,
        additionalComments,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        pendingTransactions,
        dataBackupCreated: false,
        notificationsSent: false,
        estimatedDeletionDate: hasPendingTransactions
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days if pending transactions
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days otherwise
      };

      // Simulate request creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start data export process
      await this.createDataExport(producerId);

      return request;
    } catch (error) {
      console.error('Erreur lors de la demande de suppression:', error);
      throw error;
    }
  }

  async getDeletionRequestStatus(producerId: string): Promise<AccountDeletionRequest | null> {
    try {
      // Mock implementation
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de suppression:', error);
      throw error;
    }
  }

  async cancelDeletionRequest(producerId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la suppression:', error);
      return false;
    }
  }

  // Pending Transactions Check
  async getPendingTransactions(producerId: string): Promise<PendingTransaction[]> {
    try {
      // Mock implementation - check sales, offers, harvests, etc.
      const mockTransactions: PendingTransaction[] = [
        {
          id: 'sale1',
          type: 'sale',
          status: 'in_progress',
          amount: 600000,
          currency: 'FCFA',
          description: 'Vente de Cacao',
          createdAt: '2024-01-20T10:00:00Z',
          estimatedCompletion: '2024-01-25T18:00:00Z',
          otherParty: {
            id: 'buyer1',
            name: 'Société Chocolaterie CI',
            type: 'buyer'
          }
        }
      ];

      return mockTransactions;
    } catch (error) {
      console.error('Erreur lors de la vérification des transactions en cours:', error);
      return [];
    }
  }

  // Data Export
  async createDataExport(
    producerId: string,
    format: 'json' | 'csv' | 'pdf' = 'json',
    include: DataExportRequest['include'] = {
      personal_data: true,
      financial_data: true,
      transaction_history: true,
      communications: true,
      documents: true
    }
  ): Promise<DataExportRequest> {
    try {
      const request: DataExportRequest = {
        id: `export-${Date.now()}`,
        producerId,
        format,
        include,
        requestedAt: new Date().toISOString(),
        status: 'processing'
      };

      // Simulate export process
      setTimeout(async () => {
        try {
          // Simulate data gathering and file creation
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Update request status (in real implementation, this would update the database)
          request.status = 'completed';
          request.downloadUrl = `/exports/${producerId}/data-${Date.now()}.${format}`;
          request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
          request.fileSize = Math.floor(Math.random() * 10000000) + 1000000; // 1-10 MB
        } catch (error) {
          request.status = 'failed';
          request.error = 'Erreur lors de la génération du fichier';
        }
      }, 5000);

      return request;
    } catch (error) {
      console.error('Erreur lors de la création de l\'export:', error);
      throw error;
    }
  }

  async getExportStatus(producerId: string, exportId: string): Promise<DataExportRequest | null> {
    try {
      // Mock implementation
      return null;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'export:', error);
      return null;
    }
  }

  // Data Backup
  async createDataBackup(producerId: string): Promise<{
    backupId: string;
    createdAt: string;
    size: number;
    location: string;
    retentionUntil: string;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        backupId: `backup-${Date.now()}`,
        createdAt: new Date().toISOString(),
        size: Math.floor(Math.random() * 50000000) + 10000000, // 10-50 MB
        location: 'secure-backup-01.storage.ci',
        retentionUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      throw error;
    }
  }

  // Account Activity Log
  async getAccountActivity(producerId: string, limit: number = 50): Promise<AccountActivity[]> {
    try {
      // Mock implementation
      const activities: AccountActivity[] = [
        {
          id: 'act1',
          action: 'login',
          resource: 'account',
          resourceId: producerId,
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          location: 'Abidjan, Côte d\'Ivoire'
        },
        {
          id: 'act2',
          action: 'create_offer',
          resource: 'offer',
          resourceId: 'offer123',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          details: {
            product: 'Cacao',
            quantity: 500,
            price: 1200
          }
        }
      ];

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error);
      return [];
    }
  }

  // Security Settings
  async getSecuritySettings(producerId: string): Promise<AccountSecuritySettings> {
    try {
      return {
        twoFactorEnabled: false,
        loginNotifications: true,
        sessionTimeout: 1440, // 24 hours
        dataRetention: {
          transactions: 365,
          communications: 180,
          documents: 730
        },
        privacySettings: {
          profileVisibility: 'private',
          showStatistics: true,
          allowContactRequests: true
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de sécurité:', error);
      throw error;
    }
  }

  async updateSecuritySettings(
    producerId: string,
    settings: Partial<AccountSecuritySettings>
  ): Promise<AccountSecuritySettings> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const currentSettings = await this.getSecuritySettings(producerId);
      return { ...currentSettings, ...settings };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  // Legal Compliance
  async checkLegalCompliance(producerId: string): Promise<{
    compliant: boolean;
    issues: Array<{
      type: 'data_retention' | 'consent' | 'documentation' | 'other';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      requiredAction: string;
      deadline?: string;
    }>;
    nextReviewDate: string;
  }> {
    try {
      // Mock compliance check
      return {
        compliant: true,
        issues: [],
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      };
    } catch (error) {
      console.error('Erreur lors de la vérification de conformité:', error);
      throw error;
    }
  }

  // Account Transfer
  async initiateAccountTransfer(
    producerId: string,
    newOwnerEmail: string,
    transferReason: string
  ): Promise<{
    transferId: string;
    status: 'pending' | 'awaiting_confirmation' | 'completed' | 'cancelled';
    initiatedAt: string;
    confirmationCode: string;
    expiresAt: string;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        transferId: `transfer-${Date.now()}`,
        status: 'pending',
        initiatedAt: new Date().toISOString(),
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
    } catch (error) {
      console.error('Erreur lors de l\'initiation du transfert:', error);
      throw error;
    }
  }

  // Account Analytics
  async getAccountAnalytics(producerId: string): Promise<{
    accountAge: number; // in days
    totalLogins: number;
    lastLogin: string;
    activeSessions: number;
    dataUsage: {
      storageUsed: number; // in MB
      documents: number;
      transactions: number;
    };
    securityScore: number; // 0-100
  }> {
    try {
      // Mock analytics
      return {
        accountAge: Math.floor(Math.random() * 365) + 30, // 30-395 days
        totalLogins: Math.floor(Math.random() * 500) + 50,
        lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        activeSessions: Math.floor(Math.random() * 3),
        dataUsage: {
          storageUsed: Math.floor(Math.random() * 100) + 10, // 10-110 MB
          documents: Math.floor(Math.random() * 20) + 5,
          transactions: Math.floor(Math.random() * 100) + 10
        },
        securityScore: Math.floor(Math.random() * 30) + 70 // 70-100
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      throw error;
    }
  }

  // Helper methods
  async sendDeletionNotifications(producerId: string, deletionDate: string): Promise<void> {
    try {
      // Simulate sending notifications to various parties
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In real implementation, this would:
      // 1. Notify the producer
      // 2. Notify business partners
      // 3. Notify payment processors
      // 4. Create system notifications
      console.log(`Notifications de suppression envoyées pour le producteur ${producerId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      throw error;
    }
  }

  async verifyAccountEmpty(producerId: string): Promise<{
    isEmpty: boolean;
    hasData: {
      transactions: boolean;
      documents: boolean;
      communications: boolean;
      payments: boolean;
    };
  }> {
    try {
      // Mock verification
      return {
        isEmpty: false,
        hasData: {
          transactions: true,
          documents: true,
          communications: true,
          payments: true
        }
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du compte:', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const accountService = AccountService.getInstance();