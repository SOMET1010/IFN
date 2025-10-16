import { z } from 'zod';

// Types
export interface WarehouseZone {
  id: string;
  name: string;
  capacity: number;
  used: number;
  products: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  type: 'Entrepôt général' | 'Stockage frigorifique' | 'Silo de stockage' | 'Magasin' | 'Dépôt';
  totalCapacity: number;
  usedCapacity: number;
  capacityUnit: 'm²' | 'm³' | 'tonnes' | 'unités';
  temperature: string;
  humidity: string;
  ventilation: 'Contrôlée' | 'Forcée' | 'Naturelle' | 'Climatisée';
  securityLevel: 'Élevée' | 'Moyenne' | 'Faible';
  accessControl: string;
  status: 'operational' | 'maintenance' | 'closed' | 'planning';
  manager: string;
  contact: string;
  operatingHours: string;
  lastInspection: string;
  nextMaintenance: string;
  certifications: string[];
  zones: WarehouseZone[];
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseAlert {
  id: string;
  warehouseId: string;
  warehouse: string;
  issue: string;
  level: 'info' | 'warning' | 'critical';
  date: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

// Schémas de validation
export const warehouseZoneSchema = z.object({
  name: z.string().min(1, 'Le nom de la zone est requis'),
  capacity: z.number().min(1, 'La capacité doit être positive'),
  used: z.number().min(0, 'L\'utilisé ne peut être négatif'),
  products: z.array(z.string()).default([]),
});

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entrepôt est requis'),
  location: z.string().min(1, 'La localisation est requise'),
  type: z.enum(['Entrepôt général', 'Stockage frigorifique', 'Silo de stockage', 'Magasin', 'Dépôt']),
  totalCapacity: z.number().min(1, 'La capacité totale doit être positive'),
  usedCapacity: z.number().min(0, 'La capacité utilisée ne peut être négative'),
  capacityUnit: z.enum(['m²', 'm³', 'tonnes', 'unités']),
  temperature: z.string().min(1, 'La température est requise'),
  humidity: z.string().min(1, 'L\'humidité est requise'),
  ventilation: z.enum(['Contrôlée', 'Forcée', 'Naturelle', 'Climatisée']),
  securityLevel: z.enum(['Élevée', 'Moyenne', 'Faible']),
  accessControl: z.string().min(1, 'Le contrôle d\'accès est requis'),
  status: z.enum(['operational', 'maintenance', 'closed', 'planning']).default('operational'),
  manager: z.string().min(1, 'Le responsable est requis'),
  contact: z.string().min(1, 'Le contact est requis'),
  operatingHours: z.string().min(1, 'Les horaires sont requis'),
  lastInspection: z.string().min(1, 'La date de dernière inspection est requise'),
  nextMaintenance: z.string().min(1, 'La date de prochaine maintenance est requise'),
  certifications: z.array(z.string()).default([]),
  zones: z.array(warehouseZoneSchema).default([]),
}).refine(data => data.usedCapacity <= data.totalCapacity, {
  message: 'La capacité utilisée ne peut dépasser la capacité totale',
  path: ['usedCapacity'],
});

export const warehouseAlertSchema = z.object({
  warehouseId: z.string().min(1, 'L\'ID de l\'entrepôt est requis'),
  issue: z.string().min(1, 'Le problème est requis'),
  level: z.enum(['info', 'warning', 'critical']),
  date: z.string().min(1, 'La date est requise'),
  resolved: z.boolean().default(false),
  resolvedAt: z.string().optional(),
  resolvedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type WarehouseFormData = z.infer<typeof warehouseSchema>;
export type WarehouseZoneFormData = z.infer<typeof warehouseZoneSchema>;
export type WarehouseAlertFormData = z.infer<typeof warehouseAlertSchema>;

// Service
class WarehouseService {
  private readonly STORAGE_KEYS = {
    WAREHOUSES: 'cooperative_warehouses',
    ALERTS: 'cooperative_warehouse_alerts',
  };

  // Générer un ID unique
  private generateId(): string {
    return `WH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  private generateAlertId(): string {
    return `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  // Récupérer tous les entrepôts
  getAll(): Warehouse[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.WAREHOUSES);
      if (!stored) {
        // Initialiser avec des données par défaut
        const defaultWarehouses: Warehouse[] = [
          {
            id: "WH-001",
            name: "Entrepôt Principal - Zone Est",
            location: "Abidjan, Port-Bouët",
            type: "Entrepôt général",
            totalCapacity: 2000,
            usedCapacity: 1650,
            capacityUnit: "m²",
            temperature: "18-22°C",
            humidity: "60-65%",
            ventilation: "Contrôlée",
            securityLevel: "Élevée",
            accessControl: "Badge + Biométrie",
            status: "operational",
            manager: "Kouadio Amani",
            contact: "+225 01 02 03 04",
            operatingHours: "24h/24",
            lastInspection: "2024-03-15",
            nextMaintenance: "2024-06-15",
            certifications: ["ISO 22000", "HACCP", "Certification Bio"],
            zones: [
              { id: "zone-1", name: "Zone A - Cacao", capacity: 800, used: 650, products: ["Fèves de cacao"] },
              { id: "zone-2", name: "Zone B - Intrants", capacity: 500, used: 420, products: ["Engrais", "Pesticides"] },
              { id: "zone-3", name: "Zone C - Équipements", capacity: 400, used: 300, products: ["Outils", "Machines"] },
              { id: "zone-4", name: "Zone D - Divers", capacity: 300, used: 280, products: ["Semences", "Emballages"] }
            ],
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          },
          {
            id: "WH-002",
            name: "Chambre Froide - Zone Nord",
            location: "Korhogo, Industrie",
            type: "Stockage frigorifique",
            totalCapacity: 200,
            usedCapacity: 180,
            capacityUnit: "m³",
            temperature: "2-4°C",
            humidity: "85-90%",
            ventilation: "Forcée",
            securityLevel: "Élevée",
            accessControl: "Code + Badge",
            status: "operational",
            manager: "Fatou Traoré",
            contact: "+225 05 06 07 08",
            operatingHours: "24h/24",
            lastInspection: "2024-03-10",
            nextMaintenance: "2024-05-10",
            certifications: ["HACCP"],
            zones: [
              { id: "zone-5", name: "Zone Frigo 1", capacity: 100, used: 90, products: ["Produits frais", "Légumes"] },
              { id: "zone-6", name: "Zone Frigo 2", capacity: 100, used: 90, products: ["Semences sensibles", "Médicaments"] }
            ],
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          }
        ];
        this.saveAll(defaultWarehouses);
        return defaultWarehouses;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      return [];
    }
  }

  // Sauvegarder tous les entrepôts
  private saveAll(warehouses: Warehouse[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
    } catch (error) {
      console.error('Error saving warehouses:', error);
    }
  }

  // Créer un nouvel entrepôt
  create(data: Omit<WarehouseFormData, 'id' | 'createdAt' | 'updatedAt'>): Warehouse {
    try {
      const validatedData = warehouseSchema.parse(data);
      const warehouses = this.getAll();

      const newWarehouse: Warehouse = {
        ...validatedData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        zones: validatedData.zones.map(zone => ({
          ...zone,
          id: this.generateId(),
        })),
      };

      warehouses.push(newWarehouse);
      this.saveAll(warehouses);
      return newWarehouse;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  // Mettre à jour un entrepôt
  update(id: string, updates: Partial<WarehouseFormData>): Warehouse | null {
    try {
      const warehouses = this.getAll();
      const index = warehouses.findIndex(w => w.id === id);

      if (index === -1) return null;

      const updatedWarehouse = {
        ...warehouses[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Validation
      warehouseSchema.partial().parse(updatedWarehouse);

      warehouses[index] = updatedWarehouse;
      this.saveAll(warehouses);
      return updatedWarehouse;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  // Supprimer un entrepôt
  delete(id: string): boolean {
    try {
      const warehouses = this.getAll();
      const index = warehouses.findIndex(w => w.id === id);

      if (index === -1) return false;

      warehouses.splice(index, 1);
      this.saveAll(warehouses);
      return true;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      return false;
    }
  }

  // Rechercher des entrepôts
  search(query: string): Warehouse[] {
    try {
      const warehouses = this.getAll();
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) return warehouses;

      return warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(normalizedQuery) ||
        warehouse.location.toLowerCase().includes(normalizedQuery) ||
        warehouse.type.toLowerCase().includes(normalizedQuery) ||
        warehouse.manager.toLowerCase().includes(normalizedQuery) ||
        warehouse.zones.some(zone =>
          zone.name.toLowerCase().includes(normalizedQuery) ||
          zone.products.some(product =>
            product.toLowerCase().includes(normalizedQuery)
          )
        )
      );
    } catch (error) {
      console.error('Error searching warehouses:', error);
      return [];
    }
  }

  // Filtrer par statut
  filterByStatus(status: string): Warehouse[] {
    try {
      const warehouses = this.getAll();
      if (status === 'all') return warehouses;
      return warehouses.filter(w => w.status === status);
    } catch (error) {
      console.error('Error filtering warehouses by status:', error);
      return [];
    }
  }

  // Filtrer par type
  filterByType(type: string): Warehouse[] {
    try {
      const warehouses = this.getAll();
      if (type === 'all') return warehouses;
      return warehouses.filter(w => w.type === type);
    } catch (error) {
      console.error('Error filtering warehouses by type:', error);
      return [];
    }
  }

  // Obtenir les statistiques
  getStats() {
    try {
      const warehouses = this.getAll();
      const activeWarehouses = warehouses.filter(w => w.status === 'operational');

      const totalCapacity = warehouses.reduce((sum, w) => {
        if (w.capacityUnit === 'tonnes') return sum + w.totalCapacity;
        return sum; // Simplification pour l'exemple
      }, 0);

      const usedCapacity = warehouses.reduce((sum, w) => {
        if (w.capacityUnit === 'tonnes') return sum + w.usedCapacity;
        return sum; // Simplification pour l'exemple
      }, 0);

      const occupancyRate = totalCapacity > 0 ? Math.round((usedCapacity / totalCapacity) * 100) : 0;

      return {
        totalWarehouses: warehouses.length,
        activeWarehouses: activeWarehouses.length,
        totalCapacity: `${totalCapacity.toLocaleString()} t`,
        occupancyRate: `${occupancyRate}%`,
        newThisMonth: 1, // Simulé
      };
    } catch (error) {
      console.error('Error getting warehouse stats:', error);
      return {
        totalWarehouses: 0,
        activeWarehouses: 0,
        totalCapacity: '0 t',
        occupancyRate: '0%',
        newThisMonth: 0,
      };
    }
  }

  // Gestion des zones
  addZone(warehouseId: string, zoneData: Omit<WarehouseZoneFormData, 'id'>): WarehouseZone | null {
    try {
      const warehouses = this.getAll();
      const warehouse = warehouses.find(w => w.id === warehouseId);

      if (!warehouse) return null;

      const newZone: WarehouseZone = {
        ...zoneData,
        id: this.generateId(),
      };

      warehouse.zones.push(newZone);
      warehouse.updatedAt = new Date().toISOString();
      this.saveAll(warehouses);
      return newZone;
    } catch (error) {
      console.error('Error adding zone:', error);
      return null;
    }
  }

  updateZone(warehouseId: string, zoneId: string, updates: Partial<WarehouseZoneFormData>): WarehouseZone | null {
    try {
      const warehouses = this.getAll();
      const warehouse = warehouses.find(w => w.id === warehouseId);

      if (!warehouse) return null;

      const zoneIndex = warehouse.zones.findIndex(z => z.id === zoneId);
      if (zoneIndex === -1) return null;

      warehouse.zones[zoneIndex] = {
        ...warehouse.zones[zoneIndex],
        ...updates,
      };

      warehouse.updatedAt = new Date().toISOString();
      this.saveAll(warehouses);
      return warehouse.zones[zoneIndex];
    } catch (error) {
      console.error('Error updating zone:', error);
      return null;
    }
  }

  removeZone(warehouseId: string, zoneId: string): boolean {
    try {
      const warehouses = this.getAll();
      const warehouse = warehouses.find(w => w.id === warehouseId);

      if (!warehouse) return false;

      const zoneIndex = warehouse.zones.findIndex(z => z.id === zoneId);
      if (zoneIndex === -1) return false;

      warehouse.zones.splice(zoneIndex, 1);
      warehouse.updatedAt = new Date().toISOString();
      this.saveAll(warehouses);
      return true;
    } catch (error) {
      console.error('Error removing zone:', error);
      return false;
    }
  }

  // Gestion des alertes
  getAlerts(): WarehouseAlert[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ALERTS);
      if (!stored) {
        // Initialiser avec des alertes par défaut
        const defaultAlerts: WarehouseAlert[] = [
          {
            id: "ALERT-001",
            warehouseId: "WH-001",
            warehouse: "Entrepôt Principal",
            issue: "Humidité élevée Zone B",
            level: "warning",
            date: "2024-03-20",
            resolved: false
          },
          {
            id: "ALERT-002",
            warehouseId: "WH-002",
            warehouse: "Chambre Froide",
            issue: "Température en hausse",
            level: "warning",
            date: "2024-03-19",
            resolved: false
          }
        ];
        this.saveAlerts(defaultAlerts);
        return defaultAlerts;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading alerts:', error);
      return [];
    }
  }

  private saveAlerts(alerts: WarehouseAlert[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (error) {
      console.error('Error saving alerts:', error);
    }
  }

  createAlert(data: Omit<WarehouseAlertFormData, 'id'>): WarehouseAlert {
    try {
      const validatedData = warehouseAlertSchema.parse(data);
      const alerts = this.getAlerts();

      const warehouse = this.getAll().find(w => w.id === validatedData.warehouseId);
      const warehouseName = warehouse?.name || 'Entrepôt inconnu';

      const newAlert: WarehouseAlert = {
        ...validatedData,
        id: this.generateAlertId(),
        warehouse: warehouseName,
      };

      alerts.push(newAlert);
      this.saveAlerts(alerts);
      return newAlert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  resolveAlert(id: string, resolvedBy: string, notes?: string): boolean {
    try {
      const alerts = this.getAlerts();
      const alert = alerts.find(a => a.id === id);

      if (!alert) return false;

      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;
      if (notes) alert.notes = notes;

      this.saveAlerts(alerts);
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  }

  getActiveAlerts(): WarehouseAlert[] {
    try {
      const alerts = this.getAlerts();
      return alerts.filter(a => !a.resolved);
    } catch (error) {
      console.error('Error getting active alerts:', error);
      return [];
    }
  }

  // Export CSV
  exportToCSV(): string {
    try {
      const warehouses = this.getAll();
      const headers = [
        'ID', 'Nom', 'Localisation', 'Type', 'Capacité Totale', 'Capacité Utilisée',
        'Unité', 'Température', 'Humidité', 'Statut', 'Responsable', 'Contact',
        'Date Création', 'Dernière Mise à Jour'
      ];

      const rows = warehouses.map(w => [
        w.id,
        w.name,
        w.location,
        w.type,
        w.totalCapacity,
        w.usedCapacity,
        w.capacityUnit,
        w.temperature,
        w.humidity,
        w.status,
        w.manager,
        w.contact,
        w.createdAt,
        w.updatedAt
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } catch (error) {
      console.error('Error exporting warehouses:', error);
      return '';
    }
  }
}

export const warehouseService = new WarehouseService();