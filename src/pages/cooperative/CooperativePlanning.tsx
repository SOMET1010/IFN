import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Route,
  MapPin,
  Calendar,
  Clock,
  Truck,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Navigation,
  Fuel,
  Wrench,
  Phone,
  CheckCircle
} from 'lucide-react';
import { RouteForm } from '@/components/cooperative/RouteForm';
import { PlanningForm } from '@/components/cooperative/PlanningForm';
import { routesService } from '@/services/cooperative/routesService';
import { logisticsService } from '@/services/cooperative/logisticsService';
import { warehouseService } from '@/services/cooperative/warehouseService';

interface DeliveryRoute {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  driver: string;
  vehicle: string;
  capacity: number;
  estimatedDistance: number;
  estimatedDuration: number;
  stops: DeliveryStop[];
  scheduledDate: string;
  actualStartDate?: string;
  completionDate?: string;
  cost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface DeliveryStop {
  id: string;
  order: string;
  memberName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  products: { name: string; quantity: number; unit: string }[];
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  estimatedArrival: string;
  actualArrival?: string;
  notes?: string;
  signature?: string;
  photos?: string[];
}

interface PlanningStats {
  totalRoutes: number;
  activeRoutes: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  onTimeRate: number;
  averageDistance: number;
  totalCost: number;
}

const CooperativePlanning = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanningDialogOpen, setIsPlanningDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<DeliveryRoute | null>(null);
  const [activeTab, setActiveTab] = useState('routes');
  const [stats, setStats] = useState<PlanningStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const routesData = routesService.getAllRoutes();
      setRoutes(routesData);

      const activeRoutes = routesData.filter(r => r.status === 'active').length;
      const completedDeliveries = routesData.reduce((sum, route) =>
        sum + route.stops.filter(s => s.status === 'delivered').length, 0
      );
      const pendingDeliveries = routesData.reduce((sum, route) =>
        sum + route.stops.filter(s => s.status === 'pending').length, 0
      );
      const totalDeliveries = routesData.reduce((sum, route) => sum + route.stops.length, 0);
      const onTimeRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;
      const averageDistance = routesData.length > 0
        ? routesData.reduce((sum, route) => sum + route.estimatedDistance, 0) / routesData.length
        : 0;
      const totalCost = routesData.reduce((sum, route) => sum + route.cost, 0);

      setStats({
        totalRoutes: routesData.length,
        activeRoutes,
        completedDeliveries,
        pendingDeliveries,
        onTimeRate: Math.round(onTimeRate),
        averageDistance: Math.round(averageDistance),
        totalCost
      });
    } catch (error) {
      console.error('Error loading planning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || route.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      planned: 'outline',
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive'
    } as const;

    const labels = {
      planned: 'Planifié',
      active: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive'
    } as const;

    const labels = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Élevée',
      urgent: 'Urgente'
    };

    return (
      <Badge variant={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getStopStatusBadge = (status: string) => {
    const variants = {
      pending: 'outline',
      in_transit: 'default',
      delivered: 'secondary',
      failed: 'destructive'
    } as const;

    const labels = {
      pending: 'En attente',
      in_transit: 'En transit',
      delivered: 'Livré',
      failed: 'Échoué'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]} className="text-xs">
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getRouteProgress = (route: DeliveryRoute) => {
    if (route.stops.length === 0) return 0;
    const completedStops = route.stops.filter(stop => stop.status === 'delivered').length;
    return Math.round((completedStops / route.stops.length) * 100);
  };

  const handleCreateRoute = (data) => {
    routesService.createRoute(data);
    setIsDialogOpen(false);
    loadData();
  };

  const handleUpdateRoute = (data) => {
    routesService.updateRoute(data.id, data);
    setIsDialogOpen(false);
    setEditingRoute(null);
    loadData();
  };

  const handleDeleteRoute = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette route ?')) {
      routesService.deleteRoute(id);
      loadData();
    }
  };

  const startRoute = (routeId: string) => {
    routesService.startRoute(routeId);
    loadData();
  };

  const completeRoute = (routeId: string) => {
    routesService.completeRoute(routeId);
    loadData();
  };

  const planningStats = [
    {
      title: "Routes actives",
      value: stats?.activeRoutes.toString() || "0",
      icon: Route,
      change: "En cours de livraison"
    },
    {
      title: "Livraisons terminées",
      value: stats?.completedDeliveries.toString() || "0",
      icon: CheckCircle,
      change: `${stats?.onTimeRate || 0}% à l'heure`
    },
    {
      title: "Distance moyenne",
      value: stats ? `${stats.averageDistance} km` : "0 km",
      icon: MapPin,
      change: "Par route"
    },
    {
      title: "Coût total",
      value: stats ? `${stats.totalCost.toLocaleString()} FCFA` : "0 FCFA",
      icon: TrendingUp,
      change: "Ce mois"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Planification" subtitle="Gérez la planification des livraisons et les routes">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des données...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Planification" subtitle="Gérez la planification des livraisons et les routes">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {planningStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="planning">Planification</TabsTrigger>
            <TabsTrigger value="tracking">Suivi</TabsTrigger>
          </TabsList>

          <TabsContent value="routes" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom, chauffeur, véhicule..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous statuts</SelectItem>
                        <SelectItem value="planned">Planifiées</SelectItem>
                        <SelectItem value="active">Actives</SelectItem>
                        <SelectItem value="completed">Terminées</SelectItem>
                        <SelectItem value="cancelled">Annulées</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes priorités</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Élevée</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingRoute(null)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Nouvelle route
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingRoute ? 'Modifier la route' : 'Nouvelle route de livraison'}
                          </DialogTitle>
                        </DialogHeader>
                        <RouteForm
                          item={editingRoute}
                          onSubmit={editingRoute ? handleUpdateRoute : handleCreateRoute}
                          onCancel={() => {
                            setIsDialogOpen(false);
                            setEditingRoute(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Routes Grid */}
            <div className="grid gap-6">
              {filteredRoutes.map((route) => {
                const progress = getRouteProgress(route);

                return (
                  <Card key={route.id} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {route.name}
                            {getStatusBadge(route.status)}
                            {getPriorityBadge(route.priority)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Chauffeur: {route.driver} • Véhicule: {route.vehicle}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {progress}%
                          </p>
                          <p className="text-sm text-muted-foreground">Progression</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Date prévue</span>
                          </div>
                          <p className="font-semibold">{new Date(route.scheduledDate).toLocaleDateString()}</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Durée estimée</span>
                          </div>
                          <p className="font-semibold">{route.estimatedDuration} min</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Distance</span>
                          </div>
                          <p className="font-semibold">{route.estimatedDistance} km</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Coût</span>
                          </div>
                          <p className="font-semibold">{route.cost.toLocaleString()} FCFA</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span>Progression de la route</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Delivery Stops */}
                      <div className="space-y-3">
                        <h4 className="font-medium">Arrêts ({route.stops.length})</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {route.stops.slice(0, 6).map((stop) => (
                            <div key={stop.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium text-sm">{stop.memberName}</p>
                                  <p className="text-xs text-muted-foreground">{stop.location}</p>
                                </div>
                                {getStopStatusBadge(stop.status)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                <p>{stop.products.length} produit(s)</p>
                                <p>Arrivée estimée: {new Date(stop.estimatedArrival).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          ))}
                          {route.stops.length > 6 && (
                            <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground">
                              +{route.stops.length - 6} autre(s) arrêt(s)
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                        {route.status === 'planned' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => startRoute(route.id)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Démarrer
                          </Button>
                        )}
                        {route.status === 'active' && (
                          <Button
                            variant="ivoire"
                            size="sm"
                            onClick={() => completeRoute(route.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminer
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingRoute(route);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredRoutes.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune route trouvée</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Essayez de modifier vos filtres de recherche.'
                      : 'Commencez par créer votre première route de livraison.'}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer une route
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planification des livraisons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Optimisation des routes</h3>
                  <p className="text-muted-foreground mb-4">
                    Planifiez et optimisez vos routes de livraison pour une efficacité maximale.
                  </p>
                  <Button onClick={() => setIsPlanningDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Planifier les livraisons
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="grid gap-6">
              {filteredRoutes.filter(r => r.status === 'active').map((route) => (
                <Card key={route.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {route.name}
                          <Badge variant="default">En cours</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {route.driver} • {route.vehicle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 border rounded-lg">
                          <Clock className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                          <p className="text-sm font-medium">
                            {route.actualStartDate ? new Date(route.actualStartDate).toLocaleTimeString() : 'Non démarré'}
                          </p>
                          <p className="text-xs text-muted-foreground">Heure de départ</p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <MapPin className="h-6 w-6 mx-auto mb-1 text-green-600" />
                          <p className="text-sm font-medium">
                            {route.stops.filter(s => s.status === 'delivered').length}/{route.stops.length}
                          </p>
                          <p className="text-xs text-muted-foreground">Arrêts complétés</p>
                        </div>
                        <div className="text-center p-3 border rounded-lg">
                          <Fuel className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                          <p className="text-sm font-medium">{route.estimatedDistance} km</p>
                          <p className="text-xs text-muted-foreground">Distance totale</p>
                        </div>
                      </div>

                      {/* Current Status */}
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          <strong>Statut actuel:</strong> En route vers le prochain arrêt
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Planning Dialog */}
        <Dialog open={isPlanningDialogOpen} onOpenChange={setIsPlanningDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Planification des livraisons</DialogTitle>
            </DialogHeader>
            <PlanningForm
              onSubmit={(data) => {
                // Handle planning logic
                setIsPlanningDialogOpen(false);
              }}
              onCancel={() => setIsPlanningDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CooperativePlanning;