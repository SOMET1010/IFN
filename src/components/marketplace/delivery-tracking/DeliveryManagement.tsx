import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Truck,
  Plus,
  MapPin,
  Clock,
  Phone,
  Users,
  BarChart3,
  Navigation,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Calendar,
  Route,
  Package
} from 'lucide-react';
import { formatCurrency as fc } from '@/lib/format';

interface Delivery {
  id: string;
  orderId: string;
  trackingNumber: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
  };
  route: {
    origin: string;
    destination: string;
    distance: number;
    estimatedDuration: number;
  };
  package: {
    weight: number;
    dimensions: string;
    value: number;
  };
  scheduledDate: Date;
  actualDeliveryDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customer: {
    name: string;
    phone: string;
    address: string;
  };
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  licensePlate: string;
  status: 'available' | 'on_delivery' | 'offline';
  currentLocation?: string;
  completedDeliveries: number;
  totalEarnings: number;
}

interface DeliveryManagementProps {
  deliveries?: Delivery[];
  drivers?: Driver[];
}

const DeliveryManagement = ({ deliveries = [], drivers = [] }: DeliveryManagementProps) => {
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>(deliveries);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>(deliveries);
  const [allDrivers, setAllDrivers] = useState<Driver[]>(drivers);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('scheduled');
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalDeliveries: 0,
    pendingDeliveries: 0,
    inProgressDeliveries: 0,
    completedDeliveries: 0,
    failedDeliveries: 0,
    averageDeliveryTime: 0,
    onTimeRate: 0
  });

  const statusOptions = [
    { id: 'all', name: 'Tous statuts' },
    { id: 'pending', name: 'En attente' },
    { id: 'assigned', name: 'Assigné' },
    { id: 'picked_up', name: 'Collecté' },
    { id: 'in_transit', name: 'En transit' },
    { id: 'delivered', name: 'Livré' },
    { id: 'failed', name: 'Échoué' }
  ];

  const priorityOptions = [
    { id: 'all', name: 'Toutes priorités' },
    { id: 'low', name: 'Basse' },
    { id: 'medium', name: 'Moyenne' },
    { id: 'high', name: 'Haute' },
    { id: 'urgent', name: 'Urgente' }
  ];

  useEffect(() => {
    // Generate mock data if none provided
    if (deliveries.length === 0) {
      generateMockData();
    } else {
      calculateAnalytics();
    }
  }, [deliveries, generateMockData, calculateAnalytics]);

  useEffect(() => {
    filterAndSortDeliveries();
  }, [filterAndSortDeliveries]);

  const generateMockData = useCallback(() => {
    const mockDeliveries: Delivery[] = Array.from({ length: 20 }, (_, i) => ({
      id: `DEL${i + 1}`,
      orderId: `ORD${1000 + i}`,
      trackingNumber: `TRK${2000 + i}`,
      status: ['pending', 'assigned', 'in_transit', 'delivered'][Math.floor(Math.random() * 4)] as Delivery['status'],
      driver: Math.random() > 0.3 ? {
        id: `DRV${Math.floor(Math.random() * 5) + 1}`,
        name: `Driver ${Math.floor(Math.random() * 5) + 1}`,
        phone: '+225 07 00 00 00 00',
        rating: 4 + Math.random(),
        vehicle: 'Toyota Hiace'
      } : undefined,
      route: {
        origin: ['Abidjan', 'Bouaké', 'Yamoussoukro'][Math.floor(Math.random() * 3)],
        destination: ['Abidjan', 'Bouaké', 'Yamoussoukro'][Math.floor(Math.random() * 3)],
        distance: Math.floor(Math.random() * 100) + 10,
        estimatedDuration: Math.floor(Math.random() * 120) + 30
      },
      package: {
        weight: Math.floor(Math.random() * 50) + 5,
        dimensions: '40x30x25 cm',
        value: Math.floor(Math.random() * 100000) + 10000
      },
      scheduledDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      actualDeliveryDate: Math.random() > 0.5 ? new Date() : undefined,
      priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)] as Delivery['priority'],
      customer: {
        name: `Customer ${i + 1}`,
        phone: '+225 01 00 00 00 00',
        address: '123 Main Street, City'
      }
    }));

    const mockDrivers: Driver[] = Array.from({ length: 5 }, (_, i) => ({
      id: `DRV${i + 1}`,
      name: `Driver ${i + 1}`,
      phone: '+225 07 00 00 00 00',
      rating: 4 + Math.random(),
      vehicle: 'Toyota Hiace',
      licensePlate: `CI-${1000 + i}-AB`,
      status: ['available', 'on_delivery', 'offline'][Math.floor(Math.random() * 3)] as Driver['status'],
      currentLocation: 'Abidjan, Plateau',
      completedDeliveries: Math.floor(Math.random() * 100) + 20,
      totalEarnings: Math.floor(Math.random() * 1000000) + 100000
    }));

    setAllDeliveries(mockDeliveries);
    setAllDrivers(mockDrivers);
  }, []);

  const calculateAnalytics = useCallback(() => {
    const totalDeliveries = allDeliveries.length;
    const pendingDeliveries = allDeliveries.filter(d => d.status === 'pending').length;
    const inProgressDeliveries = allDeliveries.filter(d => ['assigned', 'picked_up', 'in_transit'].includes(d.status)).length;
    const completedDeliveries = allDeliveries.filter(d => d.status === 'delivered').length;
    const failedDeliveries = allDeliveries.filter(d => d.status === 'failed').length;
    const onTimeRate = completedDeliveries > 0 ? 85 : 0; // Mock on-time rate
    const averageDeliveryTime = 45; // Mock average in minutes

    setAnalytics({
      totalDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      completedDeliveries,
      failedDeliveries,
      averageDeliveryTime,
      onTimeRate
    });
  }, [allDeliveries]);

  const filterAndSortDeliveries = useCallback(() => {
    let filtered = allDeliveries;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(delivery =>
        delivery.id.toLowerCase().includes(query) ||
        delivery.orderId.toLowerCase().includes(query) ||
        delivery.customer.name.toLowerCase().includes(query) ||
        delivery.trackingNumber.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.priority === priorityFilter);
    }

    // Apply driver filter
    if (driverFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.driver?.id === driverFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'scheduled':
        filtered.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        break;
      case 'priority': {
        const priorityOrder: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      }
      case 'distance':
        filtered.sort((a, b) => b.route.distance - a.route.distance);
        break;
      default:
        filtered.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
    }

    setFilteredDeliveries(filtered);
  }, [allDeliveries, searchQuery, statusFilter, priorityFilter, driverFilter, sortBy]);

  const getStatusBadge = (status: Delivery['status']) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800' },
      assigned: { label: 'Assigné', color: 'bg-blue-100 text-blue-800' },
      picked_up: { label: 'Collecté', color: 'bg-purple-100 text-purple-800' },
      in_transit: { label: 'En transit', color: 'bg-orange-100 text-orange-800' },
      delivered: { label: 'Livré', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Échoué', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: Delivery['priority']) => {
    const priorityConfig = {
      low: { label: 'Basse', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Haute', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
    };

    const config = priorityConfig[priority];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => fc(amount);

  const assignDriver = (deliveryId: string, driverId: string) => {
    const driver = allDrivers.find(d => d.id === driverId);
    if (!driver) return;

    setAllDeliveries(prev =>
      prev.map(delivery =>
        delivery.id === deliveryId
          ? {
              ...delivery,
              status: 'assigned',
              driver: {
                id: driver.id,
                name: driver.name,
                phone: driver.phone,
                rating: driver.rating,
                vehicle: driver.vehicle
              }
            }
          : delivery
      )
    );

    setShowAssignDriver(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des livraisons</h1>
              <p className="text-gray-600">Suivez et gérez toutes vos livraisons</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle livraison
            </Button>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.totalDeliveries}</div>
                  <div className="text-sm text-gray-600">Total livraisons</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.pendingDeliveries}</div>
                  <div className="text-sm text-gray-600">En attente</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.inProgressDeliveries}</div>
                  <div className="text-sm text-gray-600">En cours</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.completedDeliveries}</div>
                  <div className="text-sm text-gray-600">Livrées</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.averageDeliveryTime} min</div>
                  <div className="text-sm text-gray-600">Temps moyen</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.onTimeRate}%</div>
                  <div className="text-sm text-gray-600">À l'heure</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(option => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Livreur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les livreurs</SelectItem>
                {allDrivers.map(driver => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Date planifiée</SelectItem>
                <SelectItem value="priority">Priorité</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drivers Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Livreurs disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allDrivers
                    .filter(driver => driver.status === 'available')
                    .slice(0, 3)
                    .map(driver => (
                      <div key={driver.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{driver.name}</div>
                          <div className="text-xs text-gray-600">{driver.vehicle}</div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
              Performance des livreurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allDrivers
                    .sort((a, b) => b.completedDeliveries - a.completedDeliveries)
                    .slice(0, 3)
                    .map(driver => (
                      <div key={driver.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-gray-600">
                              {driver.completedDeliveries} livraisons • {formatCurrency(driver.totalEarnings)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{driver.rating.toFixed(1)}/5</div>
                          <div className="text-xs text-gray-600">
                            {driver.status === 'available' ? 'Disponible' : driver.status === 'on_delivery' ? 'En livraison' : 'Hors ligne'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deliveries List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Livraisons ({filteredDeliveries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune livraison trouvée
                </h3>
                <p className="text-gray-500">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{delivery.id}</h3>
                          {getStatusBadge(delivery.status)}
                          {getPriorityBadge(delivery.priority)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Commande:</span>
                            <span className="ml-1 font-medium">{delivery.orderId}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Client:</span>
                            <span className="ml-1 font-medium">{delivery.customer.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Distance:</span>
                            <span className="ml-1 font-medium">{delivery.route.distance} km</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{delivery.route.origin} → {delivery.route.destination}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            <span>{delivery.route.estimatedDuration} min</span>
                          </div>
                          {delivery.driver && (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{delivery.driver.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        {delivery.status === 'pending' && (
                          <Dialog open={showAssignDriver} onOpenChange={setShowAssignDriver}>
                            <DialogTrigger asChild>
                              <Button size="sm" onClick={() => setSelectedDelivery(delivery)}>
                                Assigner
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assigner un livreur</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium mb-2">Livraison {delivery.id}</h4>
                                  <p className="text-sm text-gray-600">
                                    {delivery.route.origin} → {delivery.route.destination}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {allDrivers
                                    .filter(driver => driver.status === 'available')
                                    .map(driver => (
                                      <div
                                        key={driver.id}
                                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                        onClick={() => assignDriver(delivery.id, driver.id)}
                                      >
                                        <div>
                                          <div className="font-medium">{driver.name}</div>
                                          <div className="text-sm text-gray-600">{driver.vehicle}</div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">{driver.rating.toFixed(1)}/5</div>
                                          <div className="text-xs text-green-600">Disponible</div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryManagement;
