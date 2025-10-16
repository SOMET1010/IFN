// Service CRUD complet pour la gestion des tournées logistiques
import { DistributionSignature, logisticsService } from './logisticsService';

export interface RouteStop {
  id: string;
  order: number;
  location: string;
  address: string;
  type: 'departure' | 'delivery' | 'collection' | 'arrival' | 'maintenance';
  arrivalTime?: string;
  departureTime?: string;
  estimatedDuration?: number; // en minutes
  load?: string[];
  unload?: string[];
  contact: string;
  phone: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'delayed';
  notes?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  photos?: string[];
  signature?: DistributionSignature;
}

export interface Vehicle {
  id: string;
  type: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  capacity: number; // en kg
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  fuelCapacity: number; // en litres
  currentFuel: number; // en litres ou % pour électrique
  status: 'available' | 'in_transit' | 'maintenance' | 'unavailable';
  location: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  driverId?: string;
  insurance: {
    policyNumber: string;
    expiryDate: string;
    provider: string;
  };
  documents: {
    registration: string;
    insurance: string;
    technicalInspection?: string;
  };
  mileage: number;
  photoUrl?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number; // en années
  status: 'active' | 'inactive' | 'suspended';
  assignedVehicleId?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: string[];
  lastMedicalCheck?: string;
  photoUrl?: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  type: 'delivery' | 'collection' | 'mixed' | 'maintenance';
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  driverId: string;
  vehicleId: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedDistance: number; // en km
  actualDistance?: number; // en km
  estimatedDuration: number; // en minutes
  actualDuration?: number; // en minutes
  estimatedCost: number;
  actualCost?: number;
  stops: RouteStop[];
  weather: {
    condition: string;
    temperature: number;
    visibility: 'good' | 'moderate' | 'poor';
  };
  traffic: 'light' | 'moderate' | 'heavy';
  fuelConsumption: number; // en litres
  instructions?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedBy?: string;
  rating?: number; // 1-5 stars
  feedback?: string;
}

const LS_ROUTES = 'cooperative_routes';
const LS_VEHICLES = 'cooperative_vehicles';
const LS_DRIVERS = 'cooperative_drivers';

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore localStorage errors
  }
}

export const routesService = {
  // Routes CRUD
  getAllRoutes(): Route[] {
    return loadFromStorage<Route>(LS_ROUTES);
  },

  createRoute(route: Omit<Route, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Route {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const now = new Date().toISOString();

    const newRoute: Route = {
      id: `route_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      status: 'planned',
      ...route,
    };

    routes.push(newRoute);
    saveToStorage(LS_ROUTES, routes);

    return newRoute;
  },

  updateRoute(id: string, updates: Partial<Route>): Route | null {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const index = routes.findIndex(r => r.id === id);

    if (index === -1) return null;

    routes[index] = { ...routes[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(LS_ROUTES, routes);

    return routes[index];
  },

  deleteRoute(id: string): boolean {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const index = routes.findIndex(r => r.id === id);

    if (index === -1) return false;

    routes.splice(index, 1);
    saveToStorage(LS_ROUTES, routes);

    return true;
  },

  startRoute(id: string): boolean {
    return !!this.updateRoute(id, {
      status: 'active',
      actualStartDate: new Date().toISOString()
    });
  },

  completeRoute(id: string, finalData?: { distance: number; duration: number; cost: number; rating?: number; feedback?: string }): boolean {
    const updates: Partial<Route> = {
      status: 'completed',
      actualEndDate: new Date().toISOString()
    };

    if (finalData) {
      updates.actualDistance = finalData.distance;
      updates.actualDuration = finalData.duration;
      updates.actualCost = finalData.cost;
      updates.rating = finalData.rating;
      updates.feedback = finalData.feedback;
    }

    return !!this.updateRoute(id, updates);
  },

  // Gestion des arrêts
  updateStopStatus(routeId: string, stopId: string, status: RouteStop['status'], notes?: string): boolean {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const route = routes.find(r => r.id === routeId);

    if (!route) return false;

    const stop = route.stops.find(s => s.id === stopId);
    if (!stop) return false;

    stop.status = status;
    if (notes) stop.notes = notes;

    // Mettre à jour les timestamps
    const now = new Date();
    if (status === 'in_progress') {
      stop.arrivalTime = now.toTimeString().slice(0, 5);
    } else if (status === 'completed') {
      stop.departureTime = now.toTimeString().slice(0, 5);
    }

    saveToStorage(LS_ROUTES, routes);

    return true;
  },

  addStopToRoute(routeId: string, stop: Omit<RouteStop, 'id' | 'status'>): RouteStop | null {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const route = routes.find(r => r.id === routeId);

    if (!route) return null;

    const newStop: RouteStop = {
      id: `stop_${Date.now()}`,
      status: 'pending',
      ...stop,
    };

    route.stops.push(newStop);
    saveToStorage(LS_ROUTES, routes);

    return newStop;
  },

  removeStopFromRoute(routeId: string, stopId: string): boolean {
    const routes = loadFromStorage<Route>(LS_ROUTES);
    const route = routes.find(r => r.id === routeId);

    if (!route) return false;

    const index = route.stops.findIndex(s => s.id === stopId);
    if (index === -1) return false;

    route.stops.splice(index, 1);
    saveToStorage(LS_ROUTES, routes);

    return true;
  },

  // Véhicules CRUD
  getAllVehicles(): Vehicle[] {
    return loadFromStorage<Vehicle>(LS_VEHICLES);
  },

  createVehicle(vehicle: Omit<Vehicle, 'id'>): Vehicle {
    const vehicles = loadFromStorage<Vehicle>(LS_VEHICLES);

    const newVehicle: Vehicle = {
      id: `vehicle_${Date.now()}`,
      ...vehicle,
    };

    vehicles.push(newVehicle);
    saveToStorage(LS_VEHICLES, vehicles);

    return newVehicle;
  },

  updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle | null {
    const vehicles = loadFromStorage<Vehicle>(LS_VEHICLES);
    const index = vehicles.findIndex(v => v.id === id);

    if (index === -1) return null;

    vehicles[index] = { ...vehicles[index], ...updates };
    saveToStorage(LS_VEHICLES, vehicles);

    return vehicles[index];
  },

  // Chauffeurs CRUD
  getAllDrivers(): Driver[] {
    return loadFromStorage<Driver>(LS_DRIVERS);
  },

  createDriver(driver: Omit<Driver, 'id'>): Driver {
    const drivers = loadFromStorage<Driver>(LS_DRIVERS);

    const newDriver: Driver = {
      id: `driver_${Date.now()}`,
      ...driver,
    };

    drivers.push(newDriver);
    saveToStorage(LS_DRIVERS, drivers);

    return newDriver;
  },

  updateDriver(id: string, updates: Partial<Driver>): Driver | null {
    const drivers = loadFromStorage<Driver>(LS_DRIVERS);
    const index = drivers.findIndex(d => d.id === id);

    if (index === -1) return null;

    drivers[index] = { ...drivers[index], ...updates };
    saveToStorage(LS_DRIVERS, drivers);

    return drivers[index];
  },

  assignDriverToVehicle(driverId: string, vehicleId: string): boolean {
    const drivers = loadFromStorage<Driver>(LS_DRIVERS);
    const vehicles = loadFromStorage<Vehicle>(LS_VEHICLES);

    const driver = drivers.find(d => d.id === driverId);
    const vehicle = vehicles.find(v => v.id === vehicleId);

    if (!driver || !vehicle) return false;

    driver.assignedVehicleId = vehicleId;
    vehicle.driverId = driverId;

    saveToStorage(LS_DRIVERS, drivers);
    saveToStorage(LS_VEHICLES, vehicles);

    return true;
  },

  // Optimisation des tournées
  optimizeRoute(routeId: string): Route | null {
    const route = this.getAllRoutes().find(r => r.id === routeId);
    if (!route) return null;

    // Algorithme simple d'optimisation (à remplacer par un vrai algorithme)
    const optimizedStops = [...route.stops].sort((a, b) => a.order - b.order);

    // Recalculer la distance et durée estimées
    const totalDuration = optimizedStops.reduce((total, stop) => total + (stop.estimatedDuration || 30), 0);
    const distance = route.estimatedDistance * 0.9; // 10% d'économie estimée

    const updatedRoute = this.updateRoute(routeId, {
      stops: optimizedStops,
      estimatedDuration: totalDuration,
      estimatedDistance: distance
    });

    return updatedRoute;
  },

  // Statistiques
  getRouteStats() {
    const routes = this.getAllRoutes();
    const vehicles = this.getAllVehicles();
    const drivers = this.getAllDrivers();

    const activeRoutes = routes.filter(r => r.status === 'active');
    const completedRoutes = routes.filter(r => r.status === 'completed');

    const totalDistance = routes.reduce((sum, r) => sum + (r.actualDistance || r.estimatedDistance), 0);
    const averageEfficiency = completedRoutes.length > 0
      ? completedRoutes.reduce((sum, r) => sum + ((r.estimatedDistance || 0) / (r.actualDistance || r.estimatedDistance)), 0) / completedRoutes.length
      : 0;

    return {
      totalRoutes: routes.length,
      activeRoutes: activeRoutes.length,
      completedRoutes: completedRoutes.length,
      plannedRoutes: routes.filter(r => r.status === 'planned').length,
      totalDistance,
      averageEfficiency: Math.round(averageEfficiency * 100),
      availableVehicles: vehicles.filter(v => v.status === 'available').length,
      activeDrivers: drivers.filter(d => d.status === 'active').length,
      vehiclesInTransit: vehicles.filter(v => v.status === 'in_transit').length
    };
  },

  getVehicleUtilization() {
    const vehicles = this.getAllVehicles();
    const routes = this.getAllRoutes();

    return vehicles.map(vehicle => {
      const vehicleRoutes = routes.filter(r => r.vehicleId === vehicle.id);
      const totalDistance = vehicleRoutes.reduce((sum, r) => sum + (r.actualDistance || r.estimatedDistance), 0);
      const activeRoutes = vehicleRoutes.filter(r => r.status === 'active').length;

      return {
        vehicle,
        totalDistance,
        activeRoutes,
        utilization: activeRoutes > 0 ? 'high' : totalDistance > 100 ? 'medium' : 'low'
      };
    });
  },

  // Export
  exportRoutesToCSV(): string {
    const routes = this.getAllRoutes();
    const headers = [
      'ID', 'Nom', 'Type', 'Statut', 'Priorité', 'Distance estimée', 'Durée estimée',
      'Coût estimé', 'Date début planifiée', 'Chauffeur', 'Véhicule'
    ];

    const rows = routes.map(r => [
      r.id,
      r.name,
      r.type,
      r.status,
      r.priority,
      r.estimatedDistance.toString(),
      r.estimatedDuration.toString(),
      r.estimatedCost.toString(),
      r.plannedStartDate,
      r.driverId,
      r.vehicleId
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  },

  // Validation
  validateRoute(route: Partial<Route>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!route.name || route.name.trim().length < 3) {
      errors.push('Le nom doit contenir au moins 3 caractères');
    }

    if (!route.driverId) {
      errors.push('Un chauffeur doit être assigné');
    }

    if (!route.vehicleId) {
      errors.push('Un véhicule doit être assigné');
    }

    if (!route.stops || route.stops.length < 2) {
      errors.push('Une tournée doit avoir au moins 2 arrêts');
    }

    if (route.estimatedDistance <= 0) {
      errors.push('La distance estimée doit être supérieure à 0');
    }

    if (route.estimatedCost <= 0) {
      errors.push('Le coût estimé doit être supérieur à 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};