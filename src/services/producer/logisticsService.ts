import { ProducerSale } from '@/types';

export interface Warehouse {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  capacity: number; // in kg
  currentStock: number;
  type: 'cooling' | 'dry' | 'cold' | 'ambient';
  availability: number; // percentage available
  facilities: string[];
  certification?: string;
}

export interface LogisticsStep {
  id: string;
  orderId: string;
  type: 'warehouse_checkin' | 'quality_control' | 'packaging' | 'loading' | 'in_transit' | 'delivery';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  location?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  assignedTo?: string;
  notes?: string;
  photos?: string[];
  documents?: string[];
}

export interface DeliveryVehicle {
  id: string;
  type: 'truck' | 'van' | 'motorcycle' | 'bicycle';
  licensePlate: string;
  capacity: number; // in kg
  currentLoad: number;
  driver: {
    name: string;
    phone: string;
    license: string;
    rating: number;
  };
  status: 'available' | 'loading' | 'in_transit' | 'unloading' | 'maintenance';
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  nextMaintenance?: string;
}

export interface RouteOptimization {
  orderId: string;
  waypoints: Array<{
    address: string;
    coordinates: { lat: number; lng: number };
    estimatedArrival: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  totalDistance: number; // in km
  estimatedTime: number; // in minutes
  fuelCost: number;
  trafficData?: {
    level: 'low' | 'medium' | 'high';
    delay: number; // in minutes
  };
  alternativeRoutes?: Array<{
    waypoints: typeof waypoints;
    distance: number;
    time: number;
    cost: number;
  }>;
}

export interface ShipmentTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  status: 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  checkpoints: Array<{
    location: string;
    timestamp: string;
    status: string;
    notes?: string;
  }>;
  delay?: {
    reason: string;
    estimatedDelay: number; // in minutes
    notified: boolean;
  };
}

export interface LoadingVerification {
  id: string;
  orderId: string;
  vehicleId: string;
  verifiedBy: string;
  verificationTime: string;
  itemsVerified: Array<{
    productId: string;
    quantity: number;
    quality: 'passed' | 'failed' | 'requires_attention';
    condition: string;
    photos?: string[];
  }>;
  documents: Array<{
    type: 'packing_list' | 'quality_certificate' | 'delivery_note';
    url: string;
    verified: boolean;
  }>;
  overallStatus: 'approved' | 'rejected' | 'requires_correction';
  notes?: string;
}

export class LogisticsService {
  private static instance: LogisticsService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  static getInstance(): LogisticsService {
    if (!LogisticsService.instance) {
      LogisticsService.instance = new LogisticsService();
    }
    return LogisticsService.instance;
  }

  // Warehouse Management
  async getAvailableWarehouses(region: string, capacityRequired: number): Promise<Warehouse[]> {
    try {
      const cacheKey = `warehouses-${region}-${capacityRequired}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Mock data - in real implementation, this would call an API
      const warehouses = this.generateMockWarehouses(region, capacityRequired);

      this.cache.set(cacheKey, { data: warehouses, timestamp: Date.now() });
      return warehouses;
    } catch (error) {
      console.error('Erreur lors de la récupération des entrepôts:', error);
      return [];
    }
  }

  async reserveWarehouse(warehouseId: string, orderId: string, duration: number): Promise<boolean> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      console.error('Erreur lors de la réservation de l\'entrepôt:', error);
      return false;
    }
  }

  async checkInWarehouse(orderId: string, warehouseId: string, quantity: number): Promise<LogisticsStep> {
    return {
      id: `wh-${Date.now()}`,
      orderId,
      type: 'warehouse_checkin',
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      location: {
        address: 'Entrepôt Principal',
        coordinates: { lat: 5.3364, lng: -4.0267 }
      },
      notes: `Réception de ${quantity}kg pour commande ${orderId}`
    };
  }

  // Vehicle Management
  async getAvailableVehicles(region: string, capacityRequired: number): Promise<DeliveryVehicle[]> {
    try {
      const vehicles = this.generateMockVehicles(region, capacityRequired);
      return vehicles.filter(v => v.status === 'available' && v.capacity >= capacityRequired);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      return [];
    }
  }

  async assignVehicle(orderId: string, vehicleId: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return Math.random() > 0.15; // 85% success rate
    } catch (error) {
      console.error('Erreur lors de l\'assignation du véhicule:', error);
      return false;
    }
  }

  async getVehicleLocation(vehicleId: string): Promise<{ lat: number; lng: number; timestamp: string } | null> {
    try {
      // Simulate real-time location tracking
      return {
        lat: 5.3364 + (Math.random() - 0.5) * 0.1,
        lng: -4.0267 + (Math.random() - 0.5) * 0.1,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la position du véhicule:', error);
      return null;
    }
  }

  // Route Optimization
  async optimizeRoute(orderId: string, pickupLocation: { lat: number; lng: number }, deliveryLocation: { lat: number; lng: number }): Promise<RouteOptimization> {
    try {
      // Simulate route optimization API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const distance = this.calculateDistance(pickupLocation, deliveryLocation);
      const estimatedTime = Math.round(distance * 2); // 2 minutes per km

      return {
        orderId,
        waypoints: [
          {
            address: 'Point de ramassage',
            coordinates: pickupLocation,
            estimatedArrival: new Date(Date.now() + 30 * 60000).toISOString(),
            priority: 'high'
          },
          {
            address: 'Point de livraison',
            coordinates: deliveryLocation,
            estimatedArrival: new Date(Date.now() + (30 + estimatedTime) * 60000).toISOString(),
            priority: 'high'
          }
        ],
        totalDistance: distance,
        estimatedTime,
        fuelCost: Math.round(distance * 150), // 150 FCFA per km
        trafficData: {
          level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          delay: Math.random() > 0.8 ? Math.round(Math.random() * 30) : 0
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'optimisation de la route:', error);
      throw error;
    }
  }

  // Shipment Tracking
  async createShipmentTracking(orderId: string): Promise<ShipmentTracking> {
    return {
      id: `track-${Date.now()}`,
      orderId,
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'preparing',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      checkpoints: []
    };
  }

  async updateShipmentStatus(trackingId: string, status: ShipmentTracking['status'], location?: { lat: number; lng: number; address: string }): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de livraison:', error);
      return false;
    }
  }

  // Loading Verification
  async verifyLoading(orderId: string, vehicleId: string, verifier: string, items: any[]): Promise<LoadingVerification> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        id: `verify-${Date.now()}`,
        orderId,
        vehicleId,
        verifiedBy: verifier,
        verificationTime: new Date().toISOString(),
        itemsVerified: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          quality: Math.random() > 0.1 ? 'passed' : 'requires_attention',
          condition: 'Bon état',
          photos: []
        })),
        documents: [
          {
            type: 'packing_list',
            url: '/documents/packing-list.pdf',
            verified: true
          },
          {
            type: 'delivery_note',
            url: '/documents/delivery-note.pdf',
            verified: true
          }
        ],
        overallStatus: 'approved',
        notes: 'Chargement vérifié et approuvé'
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du chargement:', error);
      throw error;
    }
  }

  // Logistics Steps Management
  async getLogisticsSteps(orderId: string): Promise<LogisticsStep[]> {
    try {
      return [
        {
          id: 'step1',
          orderId,
          type: 'warehouse_checkin',
          status: 'pending',
          estimatedDuration: 30
        },
        {
          id: 'step2',
          orderId,
          type: 'quality_control',
          status: 'pending',
          estimatedDuration: 45
        },
        {
          id: 'step3',
          orderId,
          type: 'packaging',
          status: 'pending',
          estimatedDuration: 60
        },
        {
          id: 'step4',
          orderId,
          type: 'loading',
          status: 'pending',
          estimatedDuration: 30
        },
        {
          id: 'step5',
          orderId,
          type: 'in_transit',
          status: 'pending',
          estimatedDuration: 120
        },
        {
          id: 'step6',
          orderId,
          type: 'delivery',
          status: 'pending',
          estimatedDuration: 30
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des étapes logistiques:', error);
      return [];
    }
  }

  async updateLogisticsStep(stepId: string, status: LogisticsStep['status'], notes?: string): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étape logistique:', error);
      return false;
    }
  }

  // Delay Management
  async reportDelay(orderId: string, reason: string, estimatedDelay: number): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, this would notify relevant parties
      console.log(`Retard signalé pour la commande ${orderId}: ${reason} (+${estimatedDelay} minutes)`);
    } catch (error) {
      console.error('Erreur lors du signalement du retard:', error);
      throw error;
    }
  }

  // Analytics
  async getLogisticsAnalytics(producerId: string, period: 'week' | 'month' | 'quarter'): Promise<{
    totalDeliveries: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    totalDistance: number;
    fuelCost: number;
    delays: Array<{ reason: string; count: number; averageDelay: number }>;
  }> {
    try {
      // Mock analytics data
      return {
        totalDeliveries: Math.floor(Math.random() * 50) + 20,
        averageDeliveryTime: Math.floor(Math.random() * 60) + 120, // minutes
        onTimeDeliveryRate: Math.random() * 0.3 + 0.7, // 70-100%
        totalDistance: Math.floor(Math.random() * 1000) + 500, // km
        fuelCost: Math.floor(Math.random() * 500000) + 200000, // FCFA
        delays: [
          { reason: 'Traffic', count: Math.floor(Math.random() * 5) + 1, averageDelay: 30 },
          { reason: 'Météo', count: Math.floor(Math.random() * 3), averageDelay: 45 },
          { reason: 'Véhicule', count: Math.floor(Math.random() * 2), averageDelay: 60 }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics logistiques:', error);
      throw error;
    }
  }

  private generateMockWarehouses(region: string, capacityRequired: number): Warehouse[] {
    return [
      {
        id: 'wh1',
        name: 'Entrepôt Central Abidjan',
        location: {
          address: 'Zone Industrielle, Abidjan',
          city: 'Abidjan',
          coordinates: { lat: 5.3364, lng: -4.0267 }
        },
        capacity: 10000,
        currentStock: 6500,
        type: 'ambient',
        availability: 35,
        facilities: ['Climatisation', 'Sécurité 24/7', 'Bascule', 'Chambre froide']
      },
      {
        id: 'wh2',
        name: 'Entrepôt Yamoussoukro',
        location: {
          address: 'Route de Bouaké, Yamoussoukro',
          city: 'Yamoussoukro',
          coordinates: { lat: 6.8277, lng: -5.2893 }
        },
        capacity: 5000,
        currentStock: 2200,
        availability: 56,
        type: 'dry',
        facilities: ['Ventilation', 'Sécurité', 'Bascule']
      }
    ];
  }

  private generateMockVehicles(region: string, capacityRequired: number): DeliveryVehicle[] {
    return [
      {
        id: 'v1',
        type: 'truck',
        licensePlate: 'CI-1234-ABJ',
        capacity: 2000,
        currentLoad: 0,
        driver: {
          name: 'Kouassi Jean',
          phone: '+225 07 98 76 54 32',
          license: 'CI-DL-123456',
          rating: 4.5
        },
        status: 'available',
        currentLocation: {
          lat: 5.3364,
          lng: -4.0267,
          timestamp: new Date().toISOString()
        },
        nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'v2',
        type: 'van',
        licensePlate: 'CI-5678-ABJ',
        capacity: 500,
        currentLoad: 0,
        driver: {
          name: 'Awa Marie',
          phone: '+225 07 12 34 56 78',
          license: 'CI-DL-789012',
          rating: 4.8
        },
        status: 'available',
        currentLocation: {
          lat: 5.3400,
          lng: -4.0300,
          timestamp: new Date().toISOString()
        },
        nextMaintenance: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): number {
    // Simplified distance calculation (Haversine formula would be more accurate)
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const logisticsService = LogisticsService.getInstance();