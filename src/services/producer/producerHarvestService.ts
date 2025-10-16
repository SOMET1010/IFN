import { BaseService } from '../baseService';
import { ProducerHarvest, ApiResponse } from '@/types';

export class ProducerHarvestService extends BaseService<ProducerHarvest> {
  constructor() {
    super('/producer/harvests', 'producer_harvests');
  }

  async getHarvestsByProducer(producerId: string): Promise<ApiResponse<ProducerHarvest[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des récoltes' };
    }

    const filteredHarvests = allResponse.data.filter(harvest => harvest.producer_id === producerId);
    return { success: true, data: filteredHarvests };
  }

  async getHarvestsByProduct(product: string): Promise<ApiResponse<ProducerHarvest[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des récoltes' };
    }

    const filteredHarvests = allResponse.data.filter(harvest =>
      harvest.product.toLowerCase().includes(product.toLowerCase())
    );
    return { success: true, data: filteredHarvests };
  }

  async getHarvestsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<ProducerHarvest[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des récoltes' };
    }

    const filteredHarvests = allResponse.data.filter(harvest => {
      const harvestDate = new Date(harvest.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return harvestDate >= start && harvestDate <= end;
    });

    return { success: true, data: filteredHarvests };
  }

  async getHarvestsByQuality(quality: ProducerHarvest['quality']): Promise<ApiResponse<ProducerHarvest[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des récoltes' };
    }

    const filteredHarvests = allResponse.data.filter(harvest => harvest.quality === quality);
    return { success: true, data: filteredHarvests };
  }

  async getRecentHarvests(days: number = 30): Promise<ApiResponse<ProducerHarvest[]>> {
    const allResponse = await this.getAll();
    if (!allResponse.success || !allResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des récoltes' };
    }

    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

    const recentHarvests = allResponse.data.filter(harvest => {
      const harvestDate = new Date(harvest.date);
      return harvestDate >= cutoffDate;
    });

    return { success: true, data: recentHarvests.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ) };
  }

  async getHarvestStats(producerId: string): Promise<ApiResponse<{
    total: number;
    totalQuantity: number;
    byQuality: Record<ProducerHarvest['quality'], number>;
    byMonth: Record<string, number>;
    averageQuantity: number;
  }>> {
    const harvestsResponse = await this.getHarvestsByProducer(producerId);
    if (!harvestsResponse.success || !harvestsResponse.data) {
      return { success: false, error: 'Erreur lors de la récupération des statistiques' };
    }

    const harvests = harvestsResponse.data;
    const total = harvests.length;
    const totalQuantity = harvests.reduce((sum, h) => sum + h.quantity, 0);
    const averageQuantity = total > 0 ? totalQuantity / total : 0;

    const byQuality = harvests.reduce((acc, harvest) => {
      acc[harvest.quality] = (acc[harvest.quality] || 0) + 1;
      return acc;
    }, {} as Record<ProducerHarvest['quality'], number>);

    const byMonth = harvests.reduce((acc, harvest) => {
      const month = new Date(harvest.date).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + harvest.quantity;
      return acc;
    }, {} as Record<string, number>);

    return { success: true, data: { total, totalQuantity, byQuality, byMonth, averageQuantity } };
  }

  // Validation des données
  validateHarvest(harvest: Omit<ProducerHarvest, 'id' | 'created_at' | 'updated_at'>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!harvest.product || harvest.product.trim() === '') {
      errors.push('Le produit est requis');
    }

    if (!harvest.quantity || harvest.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    if (!harvest.date || harvest.date.trim() === '') {
      errors.push('La date de récolte est requise');
    } else {
      const harvestDate = new Date(harvest.date);
      const currentDate = new Date();
      if (harvestDate > currentDate) {
        errors.push('La date de récolte ne peut pas être dans le futur');
      }
    }

    if (!harvest.producer_id || harvest.producer_id.trim() === '') {
      errors.push('L\'ID du producteur est requis');
    }

    if (!['Standard', 'Premium', 'Bio'].includes(harvest.quality)) {
      errors.push('La qualité doit être Standard, Premium ou Bio');
    }

    return { isValid: errors.length === 0, errors };
  }

  async createHarvest(harvest: Omit<ProducerHarvest, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<ProducerHarvest>> {
    const validation = this.validateHarvest(harvest);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }

    return this.create(harvest);
  }

  async updateHarvest(id: string, updates: Partial<ProducerHarvest>): Promise<ApiResponse<ProducerHarvest | undefined>> {
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      return { success: false, error: 'La quantité doit être supérieure à 0' };
    }

    if (updates.date) {
      const harvestDate = new Date(updates.date);
      const currentDate = new Date();
      if (harvestDate > currentDate) {
        return { success: false, error: 'La date de récolte ne peut pas être dans le futur' };
      }
    }

    if (updates.quality && !['Standard', 'Premium', 'Bio'].includes(updates.quality)) {
      return { success: false, error: 'La qualité doit être Standard, Premium ou Bio' };
    }

    return this.update(id, updates);
  }

  // Initialisation avec données de démonstration
  initializeDemoData(producerId: string): void {
    const existingData = this.getLocalStorageData();
    if (existingData.length > 0) return;

    const demoHarvests: ProducerHarvest[] = [
      {
        id: 'harvest-1',
        product: 'Cacao',
        quantity: 450,
        unit: 'kg',
        date: '2024-01-15',
        location: 'Parcelle A',
        quality: 'Premium',
        weather_conditions: 'Sec',
        producer_id: producerId,
        notes: 'Récolte de bonne qualité, grains bien formés',
        created_at: '2024-01-15T14:00:00Z',
        updated_at: '2024-01-15T14:00:00Z',
      },
      {
        id: 'harvest-2',
        product: 'Café',
        quantity: 280,
        unit: 'kg',
        date: '2024-02-20',
        location: 'Parcelle B',
        quality: 'Standard',
        weather_conditions: 'Humide',
        producer_id: producerId,
        notes: 'Récolte légèrement affectée par les pluies',
        created_at: '2024-02-20T10:00:00Z',
        updated_at: '2024-02-20T10:00:00Z',
      },
      {
        id: 'harvest-3',
        product: 'Anacarde',
        quantity: 180,
        unit: 'kg',
        date: '2024-03-10',
        location: 'Parcelle C',
        quality: 'Premium',
        weather_conditions: 'Sec',
        producer_id: producerId,
        notes: 'Excellente récolte, calibrage parfait',
        created_at: '2024-03-10T16:00:00Z',
        updated_at: '2024-03-10T16:00:00Z',
      },
    ];

    this.setLocalStorageData(demoHarvests);
  }
}

export const producerHarvestService = new ProducerHarvestService();