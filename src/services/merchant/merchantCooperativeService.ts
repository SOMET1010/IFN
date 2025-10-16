import { orderService, type GroupOrder, type OrderParticipant } from '@/services/cooperative/orderService';

export interface MerchantNeed {
  id: string;
  merchantId: string;
  merchantName: string;
  productName: string;
  description?: string;
  quantity: number;
  unit: string;
  category: string;
  targetPrice?: number;
  deadline: string;
  status: 'pending' | 'active' | 'fulfilled' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  cooperativeOffer?: CooperativeOffer;
}

export interface CooperativeOffer {
  id: string;
  needId: string;
  groupId: string;
  productName: string;
  unitPrice: number;
  totalQuantity: number;
  minQuantity: number;
  deliveryDate: string;
  savings: number; // Économies réalisées par rapport au prix normal
  status: 'pending' | 'active' | 'expired';
  createdAt: string;
}

export interface GroupOrderParticipation {
  orderId: string;
  merchantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'paid' | 'delivered';
  joinDate: string;
}

class MerchantCooperativeService {
  private readonly STORAGE_KEYS = {
    MERCHANT_NEEDS: 'merchant_cooperative_needs',
    MERCHANT_PARTICIPATIONS: 'merchant_cooperative_participations',
  };

  private generateId(): string {
    return `NEED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateOfferId(): string {
    return `OFFER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Gestion des besoins d'approvisionnement
  createNeed(data: Omit<MerchantNeed, 'id' | 'createdAt' | 'updatedAt' | 'status'>): MerchantNeed {
    try {
      const needs = this.getAllNeeds();
      
      const newNeed: MerchantNeed = {
        ...data,
        id: this.generateId(),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      needs.push(newNeed);
      this.saveNeeds(needs);
      
      return newNeed;
    } catch (error) {
      console.error('Error creating need:', error);
      throw error;
    }
  }

  getAllNeeds(): MerchantNeed[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MERCHANT_NEEDS);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading needs:', error);
      return [];
    }
  }

  getMerchantNeeds(merchantId: string): MerchantNeed[] {
    return this.getAllNeeds().filter(need => need.merchantId === merchantId);
  }

  updateNeed(id: string, updates: Partial<MerchantNeed>): MerchantNeed | null {
    try {
      const needs = this.getAllNeeds();
      const index = needs.findIndex(need => need.id === id);

      if (index === -1) return null;

      needs[index] = {
        ...needs[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.saveNeeds(needs);
      return needs[index];
    } catch (error) {
      console.error('Error updating need:', error);
      throw error;
    }
  }

  deleteNeed(id: string): boolean {
    try {
      const needs = this.getAllNeeds();
      const index = needs.findIndex(need => need.id === id);

      if (index === -1) return false;

      needs.splice(index, 1);
      this.saveNeeds(needs);
      return true;
    } catch (error) {
      console.error('Error deleting need:', error);
      return false;
    }
  }

  // Obtenir les besoins actifs qui pourraient matcher des commandes groupées
  getActiveNeeds(): MerchantNeed[] {
    return this.getAllNeeds().filter(need => need.status === 'active');
  }

  // Gestion des offres coopératives
  createOffer(needId: string, groupOrder: GroupOrder): CooperativeOffer {
    try {
      const needs = this.getAllNeeds();
      const need = needs.find(n => n.id === needId);
      
      if (!need) {
        throw new Error('Need not found');
      }

      // Calculer les économies (simplifié - en réalité ce serait basé sur les prix du marché)
      const normalPrice = need.targetPrice || 1000; // Prix par défaut
      const savings = normalPrice - groupOrder.unitPrice;

      const newOffer: CooperativeOffer = {
        id: this.generateOfferId(),
        needId,
        groupId: groupOrder.id,
        productName: groupOrder.product,
        unitPrice: groupOrder.unitPrice,
        totalQuantity: groupOrder.totalQuantity,
        minQuantity: groupOrder.minQuantityPerParticipant,
        deliveryDate: groupOrder.deliveryDate || '',
        savings,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      // Associer l'offre au besoin
      need.cooperativeOffer = newOffer;
      need.status = 'fulfilled';
      this.saveNeeds(needs);

      return newOffer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  getOffersForNeed(needId: string): CooperativeOffer[] {
    const needs = this.getAllNeeds();
    const need = needs.find(n => n.id === needId);
    return need?.cooperativeOffer ? [need.cooperativeOffer] : [];
  }

  // Gestion des participations aux commandes groupées
  participateInGroupOrder(merchantId: string, orderId: string, quantity: number, unitPrice: number): GroupOrderParticipation {
    try {
      const participations = this.getAllParticipations();
      
      // Vérifier si le marchand participe déjà
      const existingParticipation = participations.find(p => p.merchantId === merchantId && p.orderId === orderId);
      if (existingParticipation) {
        throw new Error('Vous participez déjà à cette commande groupée');
      }

      const newParticipation: GroupOrderParticipation = {
        orderId,
        merchantId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        status: 'pending',
        joinDate: new Date().toISOString(),
      };

      participations.push(newParticipation);
      this.saveParticipations(participations);

      return newParticipation;
    } catch (error) {
      console.error('Error participating in group order:', error);
      throw error;
    }
  }

  getMerchantParticipations(merchantId: string): GroupOrderParticipation[] {
    return this.getAllParticipations().filter(p => p.merchantId === merchantId);
  }

  updateParticipationStatus(merchantId: string, orderId: string, status: GroupOrderParticipation['status']): boolean {
    try {
      const participations = this.getAllParticipations();
      const participation = participations.find(p => p.merchantId === merchantId && p.orderId === orderId);

      if (!participation) return false;

      participation.status = status;
      this.saveParticipations(participations);

      return true;
    } catch (error) {
      console.error('Error updating participation status:', error);
      return false;
    }
  }

  // Méthodes utilitaires
  private saveNeeds(needs: MerchantNeed[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MERCHANT_NEEDS, JSON.stringify(needs));
    } catch (error) {
      console.error('Error saving needs:', error);
    }
  }

  private saveParticipations(participations: GroupOrderParticipation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MERCHANT_PARTICIPATIONS, JSON.stringify(participations));
    } catch (error) {
      console.error('Error saving participations:', error);
    }
  }

  private getAllParticipations(): GroupOrderParticipation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MERCHANT_PARTICIPATIONS);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading participations:', error);
      return [];
    }
  }

  // Méthode pour matcher les besoins avec les commandes groupées existantes
  matchNeedsWithGroupOrders(): Array<{ need: MerchantNeed; groupOrder: GroupOrder; matchScore: number }> {
    const activeNeeds = this.getActiveNeeds();
    const allGroupOrders = orderService.getAll();
    
    const matches: Array<{ need: MerchantNeed; groupOrder: GroupOrder; matchScore: number }> = [];

    activeNeeds.forEach(need => {
      allGroupOrders.forEach(order => {
        // Calculer un score de correspondance basé sur:
        // 1. Correspondance de catégorie (40%)
        // 2. Correspondance de produit (30%)
        // 3. Proximité de la quantité (20%)
        // 4. Date limite raisonnable (10%)
        
        let matchScore = 0;
        
        // Correspondance de catégorie
        if (need.category === order.category) {
          matchScore += 40;
        }
        
        // Correspondance de produit
        if (need.productName.toLowerCase().includes(order.product.toLowerCase()) ||
            order.product.toLowerCase().includes(need.productName.toLowerCase())) {
          matchScore += 30;
        }
        
        // Proximité de la quantité
        const quantityDiff = Math.abs(need.quantity - order.totalQuantity);
        const maxQuantity = Math.max(need.quantity, order.totalQuantity);
        const quantityMatch = maxQuantity > 0 ? (1 - quantityDiff / maxQuantity) * 20 : 0;
        matchScore += quantityMatch;
        
        // Date limite raisonnable
        const needDeadline = new Date(need.deadline);
        const orderDeadline = new Date(order.deadline);
        const daysDiff = Math.abs(needDeadline.getTime() - orderDeadline.getTime()) / (1000 * 3600 * 24);
        const dateMatch = daysDiff <= 30 ? 10 : Math.max(0, 10 - daysDiff / 30);
        matchScore += dateMatch;
        
        if (matchScore > 50) { // Seuil de correspondance minimum
          matches.push({ need, groupOrder: order, matchScore });
        }
      });
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // Statistiques
  getStats(merchantId: string) {
    try {
      const needs = this.getMerchantNeeds(merchantId);
      const participations = this.getMerchantParticipations(merchantId);
      const matches = this.matchNeedsWithGroupOrders();
      
      const totalNeeds = needs.length;
      const activeNeeds = needs.filter(n => n.status === 'active').length;
      const fulfilledNeeds = needs.filter(n => n.status === 'fulfilled').length;
      
      const totalParticipations = participations.length;
      const confirmedParticipations = participations.filter(p => p.status === 'confirmed').length;
      const deliveredParticipations = participations.filter(p => p.status === 'delivered').length;
      
      const totalSavings = participations.reduce((sum, p) => {
        // Estimation des économies basée sur une moyenne de 15%
        return sum + (p.totalPrice * 0.15);
      }, 0);

      return {
        totalNeeds,
        activeNeeds,
        fulfilledNeeds,
        totalParticipations,
        confirmedParticipations,
        deliveredParticipations,
        totalSavings,
        potentialMatches: matches.length,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalNeeds: 0,
        activeNeeds: 0,
        fulfilledNeeds: 0,
        totalParticipations: 0,
        confirmedParticipations: 0,
        deliveredParticipations: 0,
        totalSavings: 0,
        potentialMatches: 0,
      };
    }
  }

  // Export des données
  exportNeedsData(merchantId: string): string {
    try {
      const needs = this.getMerchantNeeds(merchantId);
      const participations = this.getMerchantParticipations(merchantId);
      
      const headers = [
        'ID', 'Produit', 'Quantité', 'Unité', 'Catégorie', 'Statut', 'Date Création', 'Date Limite'
      ];
      
      const needRows = needs.map(need => [
        need.id,
        need.productName,
        need.quantity.toString(),
        need.unit,
        need.category,
        need.status,
        need.createdAt,
        need.deadline
      ]);
      
      const participationHeaders = [
        'ID Commande', 'Quantité', 'Prix Unitaire', 'Total', 'Statut', 'Date Participation'
      ];
      
      const participationRows = participations.map(p => [
        p.orderId,
        p.quantity.toString(),
        p.unitPrice.toString(),
        p.totalPrice.toString(),
        p.status,
        p.joinDate
      ]);
      
      return [
        'Besoins d\'approvisionnement',
        headers.join(','),
        ...needRows.map(row => row.join(',')),
        '',
        'Participations aux commandes groupées',
        participationHeaders.join(','),
        ...participationRows.map(row => row.join(','))
      ].join('\n');
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }
}

export const merchantCooperativeService = new MerchantCooperativeService();
