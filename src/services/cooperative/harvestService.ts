import { z } from 'zod';

// Types pour la gestion des récoltes
export interface HarvestRecord {
  id: string;
  memberId: string;
  memberName: string;
  product: string;
  variety?: string;
  quantity: number;
  unit: 'kg' | 'tonnes' | 'sacs' | 'caisses';
  quality: 'A' | 'B' | 'C' | 'premium' | 'standard';
  harvestDate: string;
  location: string;
  farmSize: number; // en hectares
  yieldPerHectare: number;
  estimatedValue: number;
  status: 'planned' | 'in_progress' | 'harvested' | 'processed' | 'sold';
  weatherConditions: {
    temperature: number;
    rainfall: number;
    humidity: number;
    notes?: string;
  };
  labor: {
    workers: number;
    days: number;
    cost: number;
  };
  equipment: string[];
  certifications?: string[];
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HarvestForecast {
  id: string;
  memberId: string;
  memberName: string;
  product: string;
  variety?: string;
  area: number; // en hectares
  expectedDate: string;
  estimatedQuantity: number;
  unit: 'kg' | 'tonnes' | 'sacs' | 'caisses';
  confidence: 'low' | 'medium' | 'high';
  factors: {
    weather: string;
    soil: string;
    previousYield: number;
    marketConditions?: string;
  };
  status: 'active' | 'achieved' | 'missed' | 'updated';
  actualQuantity?: number;
  actualDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HarvestQuality {
  id: string;
  harvestId: string;
  inspectionDate: string;
  inspector: string;
  criteria: {
    appearance: number; // 1-5
    size: number; // 1-5
    color: number; // 1-5
    freshness: number; // 1-5
    defects: number; // 1-5 (inverse)
  };
  overallScore: number; // 1-5
  grade: 'A' | 'B' | 'C' | 'rejected';
  issues: string[];
  recommendations: string[];
  photos?: string[];
  approved: boolean;
  nextInspection?: string;
  createdAt: string;
}

export interface HarvestProcessing {
  id: string;
  harvestId: string;
  processType: 'drying' | 'cleaning' | 'sorting' | 'packaging' | 'fermentation';
  startDate: string;
  endDate?: string;
  inputQuantity: number;
  outputQuantity: number;
  waste: number;
  qualityBefore: string;
  qualityAfter: string;
  equipment: string[];
  labor: {
    workers: number;
    hours: number;
    cost: number;
  };
  cost: number;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Schémas de validation
export const harvestRecordSchema = z.object({
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  memberName: z.string().min(1, 'Le nom du membre est requis'),
  product: z.string().min(1, 'Le produit est requis'),
  variety: z.string().optional(),
  quantity: z.number().min(0.1, 'La quantité doit être positive'),
  unit: z.enum(['kg', 'tonnes', 'sacs', 'caisses']),
  quality: z.enum(['A', 'B', 'C', 'premium', 'standard']),
  harvestDate: z.string().min(1, 'La date de récolte est requise'),
  location: z.string().min(1, 'La localisation est requise'),
  farmSize: z.number().min(0.1, 'La taille de la ferme doit être positive'),
  yieldPerHectare: z.number().min(0, 'Le rendement ne peut être négatif'),
  estimatedValue: z.number().min(0, 'La valeur estimée ne peut être négative'),
  status: z.enum(['planned', 'in_progress', 'harvested', 'processed', 'sold']).default('planned'),
  weatherConditions: z.object({
    temperature: z.number(),
    rainfall: z.number(),
    humidity: z.number(),
    notes: z.string().optional()
  }),
  labor: z.object({
    workers: z.number().min(1),
    days: z.number().min(1),
    cost: z.number().min(0)
  }),
  equipment: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  notes: z.string().optional()
});

export const harvestForecastSchema = z.object({
  memberId: z.string().min(1, 'L\'ID du membre est requis'),
  memberName: z.string().min(1, 'Le nom du membre est requis'),
  product: z.string().min(1, 'Le produit est requis'),
  variety: z.string().optional(),
  area: z.number().min(0.1, 'La surface doit être positive'),
  expectedDate: z.string().min(1, 'La date prévue est requise'),
  estimatedQuantity: z.number().min(0.1, 'La quantité estimée doit être positive'),
  unit: z.enum(['kg', 'tonnes', 'sacs', 'caisses']),
  confidence: z.enum(['low', 'medium', 'high']),
  factors: z.object({
    weather: z.string().min(1),
    soil: z.string().min(1),
    previousYield: z.number().min(0),
    marketConditions: z.string().optional()
  }),
  status: z.enum(['active', 'achieved', 'missed', 'updated']).default('active'),
  notes: z.string().optional()
});

export const harvestQualitySchema = z.object({
  harvestId: z.string().min(1, 'L\'ID de la récolte est requis'),
  inspectionDate: z.string().min(1, 'La date d\'inspection est requise'),
  inspector: z.string().min(1, 'L\'inspecteur est requis'),
  criteria: z.object({
    appearance: z.number().min(1).max(5),
    size: z.number().min(1).max(5),
    color: z.number().min(1).max(5),
    freshness: z.number().min(1).max(5),
    defects: z.number().min(1).max(5)
  }),
  issues: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  approved: z.boolean().default(false),
  nextInspection: z.string().optional()
});

export const harvestProcessingSchema = z.object({
  harvestId: z.string().min(1, 'L\'ID de la récolte est requis'),
  processType: z.enum(['drying', 'cleaning', 'sorting', 'packaging', 'fermentation']),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().optional(),
  inputQuantity: z.number().min(0.1, 'La quantité d\'entrée doit être positive'),
  outputQuantity: z.number().min(0, 'La quantité de sortie ne peut être négative'),
  waste: z.number().min(0, 'Le déchet ne peut être négatif'),
  qualityBefore: z.string().min(1, 'La qualité avant est requise'),
  qualityAfter: z.string().min(1, 'La qualité après est requise'),
  equipment: z.array(z.string()).default([]),
  labor: z.object({
    workers: z.number().min(1),
    hours: z.number().min(1),
    cost: z.number().min(0)
  }),
  cost: z.number().min(0, 'Le coût ne peut être négatif'),
  status: z.enum(['planned', 'in_progress', 'completed', 'failed']).default('planned'),
  notes: z.string().optional()
});

export type HarvestRecordFormData = z.infer<typeof harvestRecordSchema>;
export type HarvestForecastFormData = z.infer<typeof harvestForecastSchema>;
export type HarvestQualityFormData = z.infer<typeof harvestQualitySchema>;
export type HarvestProcessingFormData = z.infer<typeof harvestProcessingSchema>;

// Service
class HarvestService {
  private readonly STORAGE_KEYS = {
    RECORDS: 'cooperative_harvest_records',
    FORECASTS: 'cooperative_harvest_forecasts',
    QUALITY: 'cooperative_harvest_quality',
    PROCESSING: 'cooperative_harvest_processing'
  };

  // Générer un ID unique
  private generateId(): string {
    return `HARV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateForecastId(): string {
    return `FOR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateQualityId(): string {
    return `QUAL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateProcessingId(): string {
    return `PROC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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

  // CRUD pour les enregistrements de récolte
  getAllRecords(): HarvestRecord[] {
    try {
      const stored = this.loadFromStorage<HarvestRecord>(this.STORAGE_KEYS.RECORDS);
      if (!stored || stored.length === 0) {
        // Initialiser avec des données par défaut
        const defaultRecords: HarvestRecord[] = [
          {
            id: "HARV-001",
            memberId: "MEM-001",
            memberName: "Kouadio Amani",
            product: "Cacao",
            variety: "Forastero",
            quantity: 2500,
            unit: "kg",
            quality: "A",
            harvestDate: "2024-03-15",
            location: "San Pedro, Zone A",
            farmSize: 5,
            yieldPerHectare: 500,
            estimatedValue: 2500000,
            status: "harvested",
            weatherConditions: {
              temperature: 28,
              rainfall: 120,
              humidity: 75,
              notes: "Conditions idéales"
            },
            labor: {
              workers: 8,
              days: 5,
              cost: 200000
            },
            equipment: ["Machettes", "Sacs", "Brouettes"],
            certifications: ["Bio", "Fair Trade"],
            notes: "Récolte de bonne qualité",
            createdAt: "2024-03-15T00:00:00.000Z",
            updatedAt: "2024-03-15T00:00:00.000Z"
          }
        ];
        this.saveToStorage(this.STORAGE_KEYS.RECORDS, defaultRecords);
        return defaultRecords;
      }
      return stored;
    } catch (error) {
      console.error('Error loading harvest records:', error);
      return [];
    }
  }

  createRecord(data: Omit<HarvestRecordFormData, 'id' | 'createdAt' | 'updatedAt'>): HarvestRecord {
    try {
      const validatedData = harvestRecordSchema.parse(data);
      const records = this.getAllRecords();

      const newRecord: HarvestRecord = {
        ...validatedData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      records.unshift(newRecord);
      this.saveToStorage(this.STORAGE_KEYS.RECORDS, records);
      return newRecord;
    } catch (error) {
      console.error('Error creating harvest record:', error);
      throw error;
    }
  }

  updateRecord(id: string, updates: Partial<HarvestRecordFormData>): HarvestRecord | null {
    try {
      const records = this.getAllRecords();
      const index = records.findIndex(r => r.id === id);

      if (index === -1) return null;

      records[index] = { ...records[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage(this.STORAGE_KEYS.RECORDS, records);
      return records[index];
    } catch (error) {
      console.error('Error updating harvest record:', error);
      throw error;
    }
  }

  deleteRecord(id: string): boolean {
    try {
      const records = this.getAllRecords();
      const index = records.findIndex(r => r.id === id);

      if (index === -1) return false;

      records.splice(index, 1);
      this.saveToStorage(this.STORAGE_KEYS.RECORDS, records);
      return true;
    } catch (error) {
      console.error('Error deleting harvest record:', error);
      return false;
    }
  }

  // CRUD pour les prévisions de récolte
  getAllForecasts(): HarvestForecast[] {
    try {
      return this.loadFromStorage<HarvestForecast>(this.STORAGE_KEYS.FORECASTS);
    } catch (error) {
      console.error('Error loading harvest forecasts:', error);
      return [];
    }
  }

  createForecast(data: Omit<HarvestForecastFormData, 'id' | 'createdAt' | 'updatedAt'>): HarvestForecast {
    try {
      const validatedData = harvestForecastSchema.parse(data);
      const forecasts = this.getAllForecasts();

      const newForecast: HarvestForecast = {
        ...validatedData,
        id: this.generateForecastId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      forecasts.push(newForecast);
      this.saveToStorage(this.STORAGE_KEYS.FORECASTS, forecasts);
      return newForecast;
    } catch (error) {
      console.error('Error creating harvest forecast:', error);
      throw error;
    }
  }

  updateForecast(id: string, updates: Partial<HarvestForecastFormData>): HarvestForecast | null {
    try {
      const forecasts = this.getAllForecasts();
      const index = forecasts.findIndex(f => f.id === id);

      if (index === -1) return null;

      forecasts[index] = { ...forecasts[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveToStorage(this.STORAGE_KEYS.FORECASTS, forecasts);
      return forecasts[index];
    } catch (error) {
      console.error('Error updating harvest forecast:', error);
      throw error;
    }
  }

  // CRUD pour les contrôles qualité
  getAllQualityChecks(): HarvestQuality[] {
    try {
      return this.loadFromStorage<HarvestQuality>(this.STORAGE_KEYS.QUALITY);
    } catch (error) {
      console.error('Error loading quality checks:', error);
      return [];
    }
  }

  createQualityCheck(data: Omit<HarvestQualityFormData, 'id' | 'createdAt'>): HarvestQuality {
    try {
      const validatedData = harvestQualitySchema.parse(data);
      const qualityChecks = this.getAllQualityChecks();

      // Calculer le score global
      const criteria = validatedData.criteria;
      const overallScore = (criteria.appearance + criteria.size + criteria.color + criteria.freshness + (6 - criteria.defects)) / 5;

      let grade: 'A' | 'B' | 'C' | 'rejected';
      if (overallScore >= 4.5) grade = 'A';
      else if (overallScore >= 3.5) grade = 'B';
      else if (overallScore >= 2.5) grade = 'C';
      else grade = 'rejected';

      const newQualityCheck: HarvestQuality = {
        ...validatedData,
        id: this.generateQualityId(),
        overallScore,
        grade,
        createdAt: new Date().toISOString()
      };

      qualityChecks.push(newQualityCheck);
      this.saveToStorage(this.STORAGE_KEYS.QUALITY, qualityChecks);
      return newQualityCheck;
    } catch (error) {
      console.error('Error creating quality check:', error);
      throw error;
    }
  }

  // CRUD pour le traitement des récoltes
  getAllProcessing(): HarvestProcessing[] {
    try {
      return this.loadFromStorage<HarvestProcessing>(this.STORAGE_KEYS.PROCESSING);
    } catch (error) {
      console.error('Error loading processing records:', error);
      return [];
    }
  }

  createProcessing(data: Omit<HarvestProcessingFormData, 'id' | 'createdAt' | 'updatedAt'>): HarvestProcessing {
    try {
      const validatedData = harvestProcessingSchema.parse(data);
      const processing = this.getAllProcessing();

      const newProcessing: HarvestProcessing = {
        ...validatedData,
        id: this.generateProcessingId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      processing.push(newProcessing);
      this.saveToStorage(this.STORAGE_KEYS.PROCESSING, processing);
      return newProcessing;
    } catch (error) {
      console.error('Error creating processing record:', error);
      throw error;
    }
  }

  // Méthodes de recherche et filtrage
  searchRecords(query: string): HarvestRecord[] {
    try {
      const records = this.getAllRecords();
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) return records;

      return records.filter(record =>
        record.product.toLowerCase().includes(normalizedQuery) ||
        record.memberName.toLowerCase().includes(normalizedQuery) ||
        record.location.toLowerCase().includes(normalizedQuery) ||
        record.variety?.toLowerCase().includes(normalizedQuery)
      );
    } catch (error) {
      console.error('Error searching harvest records:', error);
      return [];
    }
  }

  filterRecordsByStatus(status: string): HarvestRecord[] {
    try {
      const records = this.getAllRecords();
      if (status === 'all') return records;
      return records.filter(r => r.status === status);
    } catch (error) {
      console.error('Error filtering harvest records by status:', error);
      return [];
    }
  }

  filterRecordsByProduct(product: string): HarvestRecord[] {
    try {
      const records = this.getAllRecords();
      if (product === 'all') return records;
      return records.filter(r => r.product === product);
    } catch (error) {
      console.error('Error filtering harvest records by product:', error);
      return [];
    }
  }

  filterRecordsByMember(memberId: string): HarvestRecord[] {
    try {
      const records = this.getAllRecords();
      return records.filter(r => r.memberId === memberId);
    } catch (error) {
      console.error('Error filtering harvest records by member:', error);
      return [];
    }
  }

  // Statistiques
  getHarvestStats() {
    try {
      const records = this.getAllRecords();
      const forecasts = this.getAllForecasts();
      const qualityChecks = this.getAllQualityChecks();

      const activeRecords = records.filter(r => r.status === 'in_progress' || r.status === 'planned').length;
      const totalArea = records.reduce((sum, r) => sum + r.farmSize, 0);
      const totalEstimatedYield = records.reduce((sum, r) => sum + (r.quantity * (r.unit === 'kg' ? 0.001 : r.unit === 'tonnes' ? 1 : r.unit === 'sacs' ? 0.05 : 0.02)), 0);
      
      // Calculer le score de qualité moyen
      const averageQualityScore = qualityChecks.length > 0
        ? qualityChecks.reduce((sum, check) => sum + check.overallScore, 0) / qualityChecks.length
        : 0;

      // Calculer le taux de croissance (basé sur les prévisions vs réalisations)
      const growthRate = forecasts.length > 0
        ? Math.round((forecasts.filter(f => f.status === 'achieved').length / forecasts.length) * 100)
        : 0;

      return {
        activeRecords,
        growthRate,
        totalArea,
        totalEstimatedYield,
        averageQualityScore: Math.round(averageQualityScore * 10) / 10, // Arrondi à 1 décimale
        totalRecords: records.length,
        totalHarvested: records.filter(r => r.status === 'harvested').reduce((sum, r) => sum + r.quantity, 0),
        totalValue: records.filter(r => r.status === 'harvested').reduce((sum, r) => sum + r.estimatedValue, 0),
        averageYield: records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.yieldPerHectare, 0) / records.length) : 0,
        activeForecasts: forecasts.filter(f => f.status === 'active').length,
        qualityChecks: qualityChecks.length,
        qualityDistribution: qualityChecks.reduce((acc, check) => {
          acc[check.grade] = (acc[check.grade] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byProduct: records.reduce((acc, record) => {
          if (!acc[record.product]) {
            acc[record.product] = { quantity: 0, value: 0, count: 0 };
          }
          acc[record.product].quantity += record.quantity;
          acc[record.product].value += record.estimatedValue;
          acc[record.product].count += 1;
          return acc;
        }, {} as Record<string, { quantity: number; value: number; count: number }>),
        thisMonth: records.filter(r => {
          const recordDate = new Date(r.harvestDate);
          const now = new Date();
          return recordDate.getMonth() === now.getMonth() &&
                 recordDate.getFullYear() === now.getFullYear();
        }).length
      };
    } catch (error) {
      console.error('Error getting harvest stats:', error);
      return {
        activeRecords: 0,
        growthRate: 0,
        totalArea: 0,
        totalEstimatedYield: 0,
        averageQualityScore: 0,
        totalRecords: 0,
        totalHarvested: 0,
        totalValue: 0,
        averageYield: 0,
        activeForecasts: 0,
        qualityChecks: 0,
        qualityDistribution: {},
        byProduct: {},
        thisMonth: 0
      };
    }
  }

  // Export CSV
  exportRecordsToCSV(): string {
    try {
      const records = this.getAllRecords();
      const headers = [
        'ID', 'Membre', 'Produit', 'Variété', 'Quantité', 'Unité', 'Qualité',
        'Date récolte', 'Localisation', 'Surface (ha)', 'Rendement (kg/ha)',
        'Valeur estimée', 'Statut', 'Date création'
      ];

      const rows = records.map(r => [
        r.id,
        r.memberName,
        r.product,
        r.variety || '',
        r.quantity.toString(),
        r.unit,
        r.quality,
        r.harvestDate,
        r.location,
        r.farmSize.toString(),
        r.yieldPerHectare.toString(),
        r.estimatedValue.toString(),
        r.status,
        r.createdAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting harvest records:', error);
      return '';
    }
  }

  // Validation
  validateRecord(record: Partial<HarvestRecordFormData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!record.memberId || record.memberId.trim().length < 1) {
      errors.push('L\'ID du membre est requis');
    }

    if (!record.product || record.product.trim().length < 2) {
      errors.push('Le produit est requis');
    }

    if (!record.quantity || record.quantity <= 0) {
      errors.push('La quantité doit être positive');
    }

    if (!record.harvestDate) {
      errors.push('La date de récolte est requise');
    }

    if (!record.location || record.location.trim().length < 2) {
      errors.push('La localisation est requise');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const harvestService = new HarvestService();

// Ajout des méthodes manquantes pour la compatibilité
const extendedHarvestService = {
  ...harvestService,
  
  getAll(): HarvestRecord[] {
    return harvestService.getAllRecords();
  },

  create(data: Omit<HarvestRecordFormData, 'id' | 'createdAt' | 'updatedAt'>): HarvestRecord {
    return harvestService.createRecord(data);
  },

  update(id: string, data: Partial<HarvestRecordFormData>): HarvestRecord | null {
    return harvestService.updateRecord(id, data);
  },

  delete(id: string): boolean {
    return harvestService.deleteRecord(id);
  },

  markAsHarvested(id: string): void {
    harvestService.updateRecord(id, { status: 'harvested' as const });
  },

  getStats() {
    return harvestService.getHarvestStats();
  }
};

export default extendedHarvestService;
