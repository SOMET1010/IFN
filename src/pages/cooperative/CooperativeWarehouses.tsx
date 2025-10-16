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
  Warehouse,
  Package,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Thermometer,
  Droplets,
  Activity,
  Clock
} from 'lucide-react';
import { WarehouseForm } from '@/components/cooperative/WarehouseForm';
import { useWarehouses } from '@/hooks/cooperative/useWarehouses';
import { warehouseService } from '@/services/cooperative/warehouseService';

interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  totalCapacity: string;
  occupancyRate: string;
  newThisMonth: number;
}

const CooperativeWarehouses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [stats, setStats] = useState<WarehouseStats>({
    totalWarehouses: 0,
    activeWarehouses: 0,
    totalCapacity: '0 t',
    occupancyRate: '0%',
    newThisMonth: 0
  });

  const {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    searchWarehouses,
    filterWarehousesByStatus,
    filterWarehousesByType,
    getStats,
    refresh
  } = useWarehouses();

  useEffect(() => {
    const warehouseStats = getStats();
    setStats(warehouseStats);
  }, [warehouses]);

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
    const matchesType = typeFilter === 'all' || warehouse.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      maintenance: 'secondary',
      full: 'outline',
      inactive: 'destructive'
    } as const;

    const labels = {
      active: 'Actif',
      maintenance: 'Maintenance',
      full: 'Plein',
      inactive: 'Inactif'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      cold_storage: 'default',
      dry_storage: 'secondary',
      refrigerated: 'outline',
      general: 'default'
    } as const;

    const labels = {
      cold_storage: 'Froid',
      dry_storage: 'Sec',
      refrigerated: 'Réfrigéré',
      general: 'Général'
    };

    return (
      <Badge variant={variants[type as keyof typeof variants]}>
        {labels[type as keyof typeof labels]}
      </Badge>
    );
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleCreateWarehouse = (data) => {
    createWarehouse(data);
    setIsDialogOpen(false);
  };

  const handleUpdateWarehouse = (data) => {
    updateWarehouse(data.id, data);
    setIsDialogOpen(false);
    setEditingWarehouse(null);
  };

  const handleDeleteWarehouse = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
      deleteWarehouse(id);
    }
  };

  const warehouseStats = [
    {
      title: "Entrepôts actifs",
      value: stats?.totalWarehouses?.toString() || "0",
      icon: Warehouse,
      change: "+2 ce mois"
    },
    {
      title: "Capacité totale",
      value: stats?.totalCapacity || "0T",
      icon: Package,
      change: "100% utilisée"
    },
    {
      title: "Taux d'occupation",
      value: stats?.occupancyRate || "0%",
      icon: TrendingUp,
      change: "Bon"
    },
    {
      title: "Alertes",
      value: stats?.newThisMonth?.toString() || "0",
      icon: AlertTriangle,
      change: "À vérifier"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Entrepôts" subtitle="Gérez les entrepôts de stockage de la coopérative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Chargement des entrepôts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Entrepôts" subtitle="Gérez les entrepôts de stockage de la coopérative">
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={refresh} className="mt-4">Réessayer</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Entrepôts" subtitle="Gérez les entrepôts de stockage de la coopérative">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {warehouseStats.map((stat, index) => (
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

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, localisation..."
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
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="full">Pleins</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="cold_storage">Stockage froid</SelectItem>
                    <SelectItem value="dry_storage">Stockage sec</SelectItem>
                    <SelectItem value="refrigerated">Réfrigéré</SelectItem>
                    <SelectItem value="general">Général</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingWarehouse(null)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvel entrepôt
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingWarehouse ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
                      </DialogTitle>
                    </DialogHeader>
                    <WarehouseForm
                      warehouse={editingWarehouse}
                      onSuccess={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Entrepôts ({filteredWarehouses.length})</h2>
        </div>

        {/* Warehouse Grid */}
        <div className="grid gap-6">
          {filteredWarehouses.map((warehouse) => {
            const occupancyPercentage = Math.round((warehouse.usedCapacity / warehouse.totalCapacity) * 100);

            return (
              <Card key={warehouse.id} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {warehouse.name}
                        {getStatusBadge(warehouse.status)}
                        {getTypeBadge(warehouse.type)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        #{warehouse.id} • Géré par {warehouse.manager}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getOccupancyColor(occupancyPercentage)}`}>
                        {occupancyPercentage}%
                      </p>
                      <p className="text-sm text-muted-foreground">Occupation</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Localisation</span>
                      </div>
                      <p className="font-semibold">{warehouse.location}</p>
                      <p className="text-sm text-muted-foreground">{warehouse.location}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Capacité</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Utilisée:</span>
                          <span>{warehouse.usedCapacity} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Totale:</span>
                          <span>{warehouse.totalCapacity} kg</span>
                        </div>
                        <Progress value={occupancyPercentage} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Conditions</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Température:</span>
                          <span>{warehouse.temperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Humidité:</span>
                          <span>{warehouse.humidity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernier contrôle:</span>
                          <span>{new Date(warehouse.lastInspection).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Environmental Conditions */}
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Thermometer className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-sm font-medium">{warehouse.temperature}°C</p>
                      <p className="text-xs text-muted-foreground">Température</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Droplets className="h-6 w-6 mx-auto mb-1 text-cyan-600" />
                      <p className="text-sm font-medium">{warehouse.humidity}%</p>
                      <p className="text-xs text-muted-foreground">Humidité</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Activity className="h-6 w-6 mx-auto mb-1 text-green-600" />
                      <p className="text-sm font-medium">{warehouse.ventilation}</p>
                      <p className="text-xs text-muted-foreground">Ventilation</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Clock className="h-6 w-6 mx-auto mb-1 text-orange-600" />
                      <p className="text-sm font-medium">{warehouse.nextMaintenance}</p>
                      <p className="text-xs text-muted-foreground">Prochaine maintenance</p>
                    </div>
                  </div>

                  {/* Current Stock */}
                  {warehouse.zones && warehouse.zones.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Zones de stockage</h4>
                      <div className="flex flex-wrap gap-2">
                        {warehouse.zones.slice(0, 5).map((zone, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {zone.name} ({zone.used}/{zone.capacity} {warehouse.capacityUnit})
                          </Badge>
                        ))}
                        {warehouse.zones.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{warehouse.zones.length - 5} autre(s)
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Voir détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingWarehouse(warehouse);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    {warehouse.status === 'operational' && (
                      <Button variant="default" size="sm">
                        Réceptionner marchandises
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWarehouse(warehouse.id)}
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
        {filteredWarehouses.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun entrepôt trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Essayez de modifier vos filtres de recherche.'
                  : 'Commencez par créer votre premier entrepôt.'}
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un entrepôt
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CooperativeWarehouses;
