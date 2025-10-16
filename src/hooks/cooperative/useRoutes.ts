import { useState, useEffect } from 'react';

interface Stop {
  order: number;
  location: string;
  address: string;
  type: 'départ' | 'arrivée' | 'livraison' | 'collecte' | 'maintenance' | 'pause';
  arrivalTime: string | null;
  departureTime: string | null;
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
}

interface Route {
  id: string;
  name: string;
  description?: string;
  type: 'approvisionnement' | 'collecte' | 'livraison' | 'maintenance' | 'surveillance';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'delayed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  driver: string;
  driverContact: string;
  vehicle: string;
  vehicleId: string;
  phone: string;
  startDate: string;
  estimatedDuration: string;
  actualDuration?: string;
  totalDistance: string;
  actualDistance?: string;
  fuelConsumption: string;
  actualFuelConsumption?: string;
  estimatedCost: number;
  actualCost?: number;
  currency: string;
  stops: Stop[];
  weather: string;
  traffic: string;
  notes?: string;
  safetyChecks: {
    preDeparture: boolean;
    vehicleInspection: boolean;
    documentsCheck: boolean;
    emergencyKit: boolean;
  };
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    time: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    resolved: boolean;
    resolution?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Vehicle {
  id: string;
  type: string;
  plate: string;
  driver: string;
  driverContact: string;
  status: 'available' | 'in_transit' | 'maintenance' | 'unavailable' | 'reserved';
  location: string;
  fuel: string;
  lastMaintenance: string;
  nextMaintenance: string;
  capacity: string;
  currentLoad: string;
}

interface UseRoutesReturn {
  routes: Route[];
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  createRoute: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;
  
  // Vehicle Management
  createVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  // Utility Functions
  searchRoutes: (query: string) => Route[];
  filterRoutesByStatus: (status: string) => Route[];
  filterRoutesByType: (type: string) => Route[];
  filterRoutesByDriver: (driver: string) => Route[];
  getRoutesByVehicle: (vehicleId: string) => Route[];
  getAvailableVehicles: () => Vehicle[];
  
  // Stats
  getStats: () => {
    totalRoutes: number;
    activeRoutes: number;
    completedRoutes: number;
    totalDistance: number;
    totalFuel: number;
    totalCost: number;
    averageRouteDuration: number;
    vehicleUtilization: number;
    onTimePerformance: number;
  };
  
  // Export
  exportRoutes: () => string;
  exportVehicles: () => string;
  
  // Route Optimization
  optimizeRoute: (routeId: string) => Promise<Route>;
  calculateRouteDistance: (stops: Stop[]) => number;
  estimateRouteDuration: (distance: number, traffic: string) => string;
  
  // Refresh
  refresh: () => void;
}

const mockRoutes: Route[] = [
  {
    id: "ROUTE-001",
    name: "Tournée Nord - Approvisionnement intrants",
    description: "Livraison d'engrais et pesticides aux fermes collectives de la région Nord",
    type: "approvisionnement",
    status: "scheduled",
    priority: "high",
    driver: "Koné Ibrahim",
    driverContact: "+225 07 08 09 10",
    vehicle: "Camion benne - ABJ 1234",
    vehicleId: "VH-001",
    phone: "+225 07 08 09 10",
    startDate: "2024-03-25",
    estimatedDuration: "8h",
    totalDistance: "245 km",
    fuelConsumption: "35 L",
    estimatedCost: 125000,
    currency: "FCFA",
    stops: [
      {
        order: 1,
        location: "Dépôt Central",
        address: "Abidjan, Plateau",
        type: "départ",
        arrivalTime: "06:00",
        departureTime: "06:30",
        load: ["Engrais NPK: 50 sacs", "Pesticides: 10 bidons"],
        contact: "Kouadio Amani",
        phone: "+225 01 02 03 04",
        status: "pending",
        coordinates: { lat: 5.3604, lng: -4.0083 }
      },
      {
        order: 2,
        location: "Ferme Collective A",
        address: "Yamoussoukro, Zone Agricole",
        type: "livraison",
        arrivalTime: "09:00",
        departureTime: "09:45",
        unload: ["Engrais NPK: 20 sacs", "Pesticides: 3 bidons"],
        contact: "Yao N'Guessan",
        phone: "+225 09 10 11 12",
        status: "pending",
        notes: "Vérifier le bon de livraison",
        coordinates: { lat: 6.8277, lng: -5.2893 }
      },
      {
        order: 3,
        location: "Ferme Collective B",
        address: "Bouaké, Nord",
        type: "livraison",
        arrivalTime: "12:00",
        departureTime: "13:00",
        unload: ["Engrais NPK: 30 sacs", "Pesticides: 7 bidons"],
        contact: "Fatou Traoré",
        phone: "+225 05 06 07 08",
        status: "pending",
        notes: "Pause déjeuner prévue",
        coordinates: { lat: 7.6939, lng: -5.0304 }
      },
      {
        order: 4,
        location: "Retour Dépôt",
        address: "Abidjan, Plateau",
        type: "arrivée",
        arrivalTime: "16:00",
        departureTime: null,
        load: [],
        contact: "Koné Ibrahim",
        phone: "+225 07 08 09 10",
        status: "pending",
        coordinates: { lat: 5.3604, lng: -4.0083 }
      }
    ],
    weather: "Ensoleillé",
    traffic: "Modéré",
    notes: "Vérifier les documents avant départ",
    safetyChecks: {
      preDeparture: false,
      vehicleInspection: false,
      documentsCheck: false,
      emergencyKit: false
    },
    incidents: [],
    createdAt: "2024-03-20T10:00:00Z",
    updatedAt: "2024-03-20T10:00:00Z",
    createdBy: "admin"
  },
  {
    id: "ROUTE-002",
    name: "Collecte Cacao - Zone Est",
    description: "Collecte des fèves de cacao auprès des producteurs de la zone Est",
    type: "collecte",
    status: "active",
    priority: "medium",
    driver: "Amani Koffi",
    driverContact: "+225 11 12 13 14",
    vehicle: "Pick-up - ABJ 5678",
    vehicleId: "VH-002",
    phone: "+225 11 12 13 14",
    startDate: "2024-03-24",
    estimatedDuration: "6h",
    actualDuration: "5h30m",
    totalDistance: "180 km",
    actualDistance: "175 km",
    fuelConsumption: "25 L",
    actualFuelConsumption: "23 L",
    estimatedCost: 95000,
    actualCost: 92000,
    currency: "FCFA",
    stops: [
      {
        order: 1,
        location: "Dépôt Principal",
        address: "San Pedro, Port",
        type: "départ",
        arrivalTime: "07:00",
        departureTime: "07:15",
        load: ["Sacs vides: 100"],
        contact: "Amani Koffi",
        phone: "+225 11 12 13 14",
        status: "completed",
        coordinates: { lat: 4.7371, lng: -6.6385 }
      },
      {
        order: 2,
        location: "Plantation Cacao A",
        address: "San Pedro, Route de Tabou",
        type: "collecte",
        arrivalTime: "08:00",
        departureTime: "09:30",
        load: ["Fèves de cacao: 25 sacs"],
        contact: "Bamba Sekou",
        phone: "+225 17 18 19 20",
        status: "completed",
        coordinates: { lat: 4.7489, lng: -6.6234 }
      },
      {
        order: 3,
        location: "Plantation Cacao B",
        address: "San Pedro, Zone Forestière",
        type: "collecte",
        arrivalTime: "10:30",
        departureTime: "12:00",
        load: ["Fèves de cacao: 35 sacs"],
        contact: "Aminata Koné",
        phone: "+225 13 14 15 16",
        status: "in_progress",
        coordinates: { lat: 4.7523, lng: -6.6345 }
      }
    ],
    weather: "Pluie légère",
    traffic: "Faible",
    notes: "Attention aux routes boueuses après la pluie",
    safetyChecks: {
      preDeparture: true,
      vehicleInspection: true,
      documentsCheck: true,
      emergencyKit: true
    },
    incidents: [],
    createdAt: "2024-03-22T14:00:00Z",
    updatedAt: "2024-03-24T10:30:00Z",
    createdBy: "admin"
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: "VH-001",
    type: "Camion benne",
    plate: "ABJ 1234",
    driver: "Koné Ibrahim",
    driverContact: "+225 07 08 09 10",
    status: "available",
    location: "Dépôt Central",
    fuel: "85%",
    lastMaintenance: "2024-02-15",
    nextMaintenance: "2024-05-15",
    capacity: "10 tonnes",
    currentLoad: "0 tonnes"
  },
  {
    id: "VH-002",
    type: "Pick-up",
    plate: "ABJ 5678",
    driver: "Amani Koffi",
    driverContact: "+225 11 12 13 14",
    status: "in_transit",
    location: "San Pedro",
    fuel: "45%",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    capacity: "1.5 tonnes",
    currentLoad: "0.8 tonnes"
  },
  {
    id: "VH-003",
    type: "Fourgon",
    plate: "ABJ 9012",
    driver: "Traoré Fatou",
    driverContact: "+225 05 06 07 08",
    status: "maintenance",
    location: "Atelier",
    fuel: "100%",
    lastMaintenance: "2024-03-10",
    nextMaintenance: "2024-06-10",
    capacity: "3 tonnes",
    currentLoad: "0 tonnes"
  }
];

export const useRoutes = (): UseRoutesReturn => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRoutes(mockRoutes);
        setVehicles(mockVehicles);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des tournées');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // CRUD Operations for Routes
  const createRoute = (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRoute: Route = {
      ...routeData,
      id: `ROUTE-${String(routes.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoutes([...routes, newRoute]);
  };

  const updateRoute = (id: string, routeData: Partial<Route>) => {
    setRoutes(routes.map(route => 
      route.id === id 
        ? { ...route, ...routeData, updatedAt: new Date().toISOString() }
        : route
    ));
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(route => route.id !== id));
  };

  // CRUD Operations for Vehicles
  const createVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `VH-${String(vehicles.length + 1).padStart(3, '0')}`,
    };
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, vehicleData: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id 
        ? { ...vehicle, ...vehicleData }
        : vehicle
    ));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  // Utility Functions
  const searchRoutes = (query: string): Route[] => {
    const lowercaseQuery = query.toLowerCase();
    return routes.filter(route =>
      route.name.toLowerCase().includes(lowercaseQuery) ||
      route.description?.toLowerCase().includes(lowercaseQuery) ||
      route.driver.toLowerCase().includes(lowercaseQuery) ||
      route.vehicle.toLowerCase().includes(lowercaseQuery) ||
      route.stops.some(stop => 
        stop.location.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  const filterRoutesByStatus = (status: string): Route[] => {
    return routes.filter(route => route.status === status);
  };

  const filterRoutesByType = (type: string): Route[] => {
    return routes.filter(route => route.type === type);
  };

  const filterRoutesByDriver = (driver: string): Route[] => {
    return routes.filter(route => route.driver === driver);
  };

  const getRoutesByVehicle = (vehicleId: string): Route[] => {
    return routes.filter(route => route.vehicleId === vehicleId);
  };

  const getAvailableVehicles = (): Vehicle[] => {
    return vehicles.filter(vehicle => vehicle.status === 'available');
  };

  // Stats
  const getStats = () => {
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const completedRoutes = routes.filter(r => r.status === 'completed').length;
    
    const totalDistance = routes.reduce((sum, route) => {
      const distance = parseFloat(route.totalDistance);
      return sum + (isNaN(distance) ? 0 : distance);
    }, 0);
    
    const totalFuel = routes.reduce((sum, route) => {
      const fuel = parseFloat(route.fuelConsumption);
      return sum + (isNaN(fuel) ? 0 : fuel);
    }, 0);
    
    const totalCost = routes.reduce((sum, route) => sum + route.estimatedCost, 0);
    
    const totalDuration = routes.reduce((sum, route) => {
      const duration = parseFloat(route.estimatedDuration);
      return sum + (isNaN(duration) ? 0 : duration);
    }, 0);
    const averageRouteDuration = totalRoutes > 0 ? totalDuration / totalRoutes : 0;
    
    const availableVehicles = vehicles.filter(v => v.status === 'available').length;
    const vehicleUtilization = vehicles.length > 0 ? ((vehicles.length - availableVehicles) / vehicles.length) * 100 : 0;
    
    const onTimeRoutes = routes.filter(r => r.status === 'completed' && !r.actualDuration).length;
    const onTimePerformance = completedRoutes > 0 ? (onTimeRoutes / completedRoutes) * 100 : 0;

    return {
      totalRoutes,
      activeRoutes,
      completedRoutes,
      totalDistance: Math.round(totalDistance),
      totalFuel: Math.round(totalFuel),
      totalCost,
      averageRouteDuration: Math.round(averageRouteDuration),
      vehicleUtilization: Math.round(vehicleUtilization),
      onTimePerformance: Math.round(onTimePerformance)
    };
  };

  // Export
  const exportRoutes = (): string => {
    const headers = [
      'ID',
      'Nom',
      'Type',
      'Statut',
      'Chauffeur',
      'Véhicule',
      'Distance',
      'Durée',
      'Coût',
      'Date de début'
    ];

    const rows = routes.map(route => [
      route.id,
      route.name,
      route.type,
      route.status,
      route.driver,
      route.vehicle,
      route.totalDistance,
      route.estimatedDuration,
      route.estimatedCost.toString(),
      new Date(route.startDate).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  const exportVehicles = (): string => {
    const headers = [
      'ID',
      'Type',
      'Immatriculation',
      'Chauffeur',
      'Statut',
      'Localisation',
      'Carburant',
      'Capacité',
      'Charge actuelle'
    ];

    const rows = vehicles.map(vehicle => [
      vehicle.id,
      vehicle.type,
      vehicle.plate,
      vehicle.driver,
      vehicle.status,
      vehicle.location,
      vehicle.fuel,
      vehicle.capacity,
      vehicle.currentLoad
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  };

  // Route Optimization (Mock Implementation)
  const optimizeRoute = async (routeId: string): Promise<Route> => {
    // Simulate API call for route optimization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const route = routes.find(r => r.id === routeId);
    if (!route) {
      throw new Error('Route non trouvée');
    }

    // Mock optimized route (in real implementation, this would call a routing API)
    const optimizedRoute = {
      ...route,
      estimatedDuration: `${Math.round(parseFloat(route.estimatedDuration) * 0.9)}h`,
      estimatedCost: Math.round(route.estimatedCost * 0.95),
      updatedAt: new Date().toISOString()
    };

    updateRoute(routeId, optimizedRoute);
    return optimizedRoute;
  };

  const calculateRouteDistance = (stops: Stop[]): number => {
    // Mock distance calculation (in real implementation, this would use a mapping API)
    let totalDistance = 0;
    for (let i = 1; i < stops.length; i++) {
      // Simple mock calculation based on stop order
      totalDistance += Math.random() * 50 + 10; // Random distance between 10-60 km
    }
    return Math.round(totalDistance);
  };

  const estimateRouteDuration = (distance: number, traffic: string): string => {
    // Mock duration estimation
    const baseSpeed = 60; // km/h
    let speedMultiplier = 1;
    
    switch (traffic) {
      case 'Faible':
        speedMultiplier = 1.1;
        break;
      case 'Modéré':
        speedMultiplier = 1;
        break;
      case 'Élevé':
        speedMultiplier = 0.8;
        break;
      case 'Très élevé':
        speedMultiplier = 0.6;
        break;
    }
    
    const averageSpeed = baseSpeed * speedMultiplier;
    const durationHours = distance / averageSpeed;
    const hours = Math.floor(durationHours);
    const minutes = Math.round((durationHours - hours) * 60);
    
    return `${hours}h${minutes > 0 ? `${minutes}m` : ''}`;
  };

  // Refresh
  const refresh = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoutes(mockRoutes);
      setVehicles(mockVehicles);
      setError(null);
    } catch (err) {
      setError('Erreur lors du rafraîchissement des tournées');
    } finally {
      setLoading(false);
    }
  };

  return {
    routes,
    vehicles,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    searchRoutes,
    filterRoutesByStatus,
    filterRoutesByType,
    filterRoutesByDriver,
    getRoutesByVehicle,
    getAvailableVehicles,
    getStats,
    exportRoutes,
    exportVehicles,
    optimizeRoute,
    calculateRouteDistance,
    estimateRouteDuration,
    refresh
  };
};
