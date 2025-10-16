import { BaseService } from '../baseService';
import { ProducerOffer, ApiResponse } from '@/types';

export class ProducerOfferService extends BaseService<ProducerOffer> {
  constructor() {
    super('/producer/offers', 'producer_offers');
  }

  async getOffersByProducer(producerId: string): Promise<ApiResponse<ProducerOffer[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des offres' };
    }

    const filteredOffers = allResponse.data.filter(offer => offer.producer_id === producerId);
    return { success: true, data: filteredOffers };
  }

  async getOffersByStatus(status: ProducerOffer['status']): Promise<ApiResponse<ProducerOffer[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des offres' };
    }

    const filteredOffers = allResponse.data.filter(offer => offer.status === status);
    return { success: true, data: filteredOffers };
  }

  async getExpiringOffers(days: number = 7): Promise<ApiResponse<ProducerOffer[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des offres' };
    }

    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    const expiringOffers = allResponse.data.filter(offer => {
      if (!offer.expiry_date) return false;
      const offerExpiryDate = new Date(offer.expiry_date);
      return offerExpiryDate <= expiryDate && offer.status === 'en_cours';
    });

    return { success: true, data: expiringOffers };
  }

  async updateOfferStatus(id: string, status: ProducerOffer['status']): Promise<ApiResponse<ProducerOffer | undefined>> {
    return this.update(id, { status });
  }

  async getOfferStats(producerId: string): Promise<ApiResponse<{
    total: number;
    en_cours: number;
    terminee: number;
    en_attente: number;
    annulee: number;
  }>> {
    const offersResponse = await this.getOffersByProducer(producerId);
    if (!offersResponse.success || !offersResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des statistiques' };
    }

    const stats = {
      total: offersResponse.data.length,
      en_cours: offersResponse.data.filter(o => o.status === 'en_cours').length,
      terminee: offersResponse.data.filter(o => o.status === 'terminee').length,
      en_attente: offersResponse.data.filter(o => o.status === 'en_attente').length,
      annulee: offersResponse.data.filter(o => o.status === 'annulee').length,
    };

    return { success: true, data: stats };
  }

  // Validation des données
  validateOffer(offer: Omit<ProducerOffer, 'id' | 'created_at' | 'updated_at'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!offer.product || offer.product.trim() === '') {
      errors.push('Le produit est requis');
    }

    if (!offer.quantity || offer.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (!offer.price || offer.price <= 0) {
      errors.push('Le prix doit être supérieur à 0');
    }

    if (!offer.producer_id || offer.producer_id.trim() === '') {
      errors.push('L\'ID du producteur est requis');
    }

    if (!offer.producer_name || offer.producer_name.trim() === '') {
      errors.push('Le nom du producteur est requis');
    }

    if (offer.expiry_date) {
      const expiryDate = new Date(offer.expiry_date);
      const currentDate = new Date();
      if (expiryDate <= currentDate) {
        errors.push('La date d\'expiration doit être dans le futur');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  async createOffer(offer: Omit<ProducerOffer, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ProducerOffer>> {
    const validation = this.validateOffer(offer);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    return this.create(offer);
  }

  async updateOffer(id: string, updates: Partial<ProducerOffer>): Promise<ApiResponse<ProducerOffer | undefined>> {
    if (updates.price !== undefined && updates.price <= 0) {
      return { success: false, error: 'Le prix doit être supérieur à 0' };
    }

    if (updates.quantity !== undefined && updates.quantity <= 0) {
      return { success: false, error: 'La quantité doit être supérieure à 0' };
    }

    return this.update(id, updates);
  }

  // Initialisation avec données de démonstration
  initializeDemoData(producerId: string, producerName: string): void {
    const existingData = this.getLocalStorageData();
    if (existingData.length > 0) return;

    const demoOffers: ProducerOffer[] = [
      {
        id: 'offer-1',
        product: 'Cacao',
        quantity: 500,
        unit: 'kg',
        price: 2000,
        price_unit: 'FCFA/kg',
        description: 'Cacao de qualité premium',
        status: 'en_cours',
        harvest_date: '2024-01-15',
        expiry_date: '2024-02-15',
        producer_id: producerId,
        producer_name: producerName,
        location: 'Abidjan, Cocody',
        quality: 'Premium',
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
      },
      {
        id: 'offer-2',
        product: 'Café',
        quantity: 300,
        unit: 'kg',
        price: 2500,
        price_unit: 'FCFA/kg',
        description: 'Café arabica des montagnes',
        status: 'terminee',
        harvest_date: '2024-02-01',
        expiry_date: '2024-03-01',
        producer_id: producerId,
        producer_name: producerName,
        location: 'Abidjan, Cocody',
        quality: 'Premium',
        created_at: '2024-01-28T10:00:00Z',
        updated_at: '2024-02-15T10:00:00Z',
      },
      {
        id: 'offer-3',
        product: 'Anacarde',
        quantity: 200,
        unit: 'kg',
        price: 1500,
        price_unit: 'FCFA/kg',
        description: 'Noix de cajou bio',
        status: 'en_attente',
        harvest_date: '2024-03-10',
        expiry_date: '2024-04-10',
        producer_id: producerId,
        producer_name: producerName,
        location: 'Abidjan, Cocody',
        quality: 'Bio',
        created_at: '2024-03-05T10:00:00Z',
        updated_at: '2024-03-05T10:00:00Z',
      },
    ];

    this.setLocalStorageData(demoOffers);
  }
}

export const producerOfferService = new ProducerOfferService();