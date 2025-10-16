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
  Sprout,
  TrendingUp,
  Calendar,
  MapPin,
  Users,
  Package,
  Scale,
  DollarSign,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { HarvestForm } from '@/components/cooperative/HarvestForm';
import harvestService from '@/services/cooperative/harvestService';
import { membershipService } from '@/services/cooperative/membershipService';
import { HarvestRecord } from '@/services/cooperative/harvestService';

interface Harvest {
  id: string;
  reference: string;
  productName: string;
  variety: string;
  producer: string;
  farmLocation: string;
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  status: 'planned' | 'growing' | 'ready' | 'harvested' | 'processed';
  area: number; // en hectares
  expectedYield: number; // en tonnes
  actualYield?: number; // en tonnes
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  weatherConditions: {
    temperature: number;
    rainfall: number;
    humidity: number;
    sunshine: number;
  };
  challenges: string[];
  notes: string;
  marketPrice: number; // FCFA par kg
  estimatedRevenue: number;
  actualRevenue?: number;
}

interface HarvestStats {
  totalHarvests: number;
  activeGrowing: number;
  readyForHarvest: number;
  totalYield: number;
  averageQuality: number;
  estimatedRevenue: number;
  totalArea: number;
}

const CooperativeHarvests = () => {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [producers, setProducers] = useState<{ id: string; name: string; role?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [activeTab, setActiveTab] = useState('harvests');
  const [stats, setStats] = useState<HarvestStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const harvestsData = harvestService.getAll();
      const producersData = membershipService.getActiveMembers().filter(m => {
        const member = m as { id: string; name: string; role?: string };
        return member.role === 'Producteur';
      });

      // Transformer les données HarvestRecord en Harvest
      const transformedHarvests: Harvest[] = harvestsData.map(h => ({
        id: h.id,
        reference: h.id,
        productName: h.product,
        variety: h.variety || '',
        producer: h.memberName,
        farmLocation: h.location,
        plantingDate: h.harvestDate,
        expectedHarvestDate: h.harvestDate,
        actualHarvestDate: h.status === 'harvested' ? h.harvestDate : undefined,
        status: h.status === 'in_progress' ? 'growing' : h.status === 'planned' ? 'planned' : h.status === 'harvested' ? 'harvested' : 'processed',
        area: h.farmSize,
        expectedYield: h.yieldPerHectare * h.farmSize,
        actualYield: h.status === 'harvested' ? h.yieldPerHectare * h.farmSize : undefined,
        quality: h.quality === 'A' ? 'excellent' : h.quality === 'B' ? 'good' : h.quality === 'C' ? 'fair' : 'poor',
        weatherConditions: {
          temperature: h.weatherConditions.temperature,
          rainfall: h.weatherConditions.rainfall,
          humidity: h.weatherConditions.humidity,
          sunshine: 8
        },
        challenges: [],
        notes: h.notes || '',
        marketPrice: h.estimatedValue / h.quantity,
        estimatedRevenue: h.estimatedValue,
        actualRevenue: h.status === 'harvested' ? h.estimatedValue : undefined
      }));

      setHarvests(transformedHarvests);
      setProducers(producersData);

      const activeGrowing = transformedHarvests.filter(h => h.status === 'growing').length;
      const readyForHarvest = transformedHarvests.filter(h => h.status === 'ready').length;
      const totalYield = transformedHarvests.reduce((sum, h) => sum + (h.actualYield || 0), 0);
      const totalArea = transformedHarvests.reduce((sum, h) => sum + h.area, 0);
      const estimatedRevenue = transformedHarvests.reduce((sum, h) => sum + h.estimatedRevenue, 0);

      const qualityScores = {
        excellent: 4,
        good: 3,
        fair: 2,
        poor: 1
      };

      const averageQuality = harvestsData.length > 0
        ? harvestsData.reduce((sum, h) => sum + (qualityScores[h.quality] || 0), 0) / harvestsData.length
        : 0;

      setStats({
        totalHarvests: harvestsData.length,
        activeGrowing,
        readyForHarvest,
        totalYield,
        averageQuality: Math.round((averageQuality / 4) * 100),
        estimatedRevenue,
        totalArea
      });
    } catch (err) {
      console.error('Error loading harvests data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHarvests = harvests.filter(harvest => {
    const matchesSearch = harvest.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         harvest.producer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         harvest.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         harvest.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || harvest.status === statusFilter;
    const matchesQuality = qualityFilter === 'all' || harvest.quality === qualityFilter;

    return matchesSearch && matchesStatus && matchesQuality;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      planned: 'outline',
      growing: 'default',
      ready: 'secondary',
      harvested: 'default',
      processed: 'secondary'
    } as const;

    const labels = {
      planned: 'Planifié',
      growing: 'En croissance',
      ready: 'Prêt à récolter',
      harvested: 'Récolté',
      processed: 'Traitement'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getQualityBadge = (quality: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive'
    } as const;

    const labels = {
      excellent: 'Excellente',
      good: 'Bonne',
      fair: 'Moyenne',
      poor: 'Faible'
    };

    return (
      <Badge variant={variants[quality as keyof typeof variants]}>
        {labels[quality as keyof typeof labels]}
      </Badge>
    );
  };

  const getGrowthProgress = (harvest: Harvest) => {
    if (harvest.status === 'planned') return 0;
    if (harvest.status === 'processed') return 100;

    const planting = new Date(harvest.plantingDate);
    const expected = new Date(harvest.expectedHarvestDate);
    const now = new Date();

    if (now <= planting) return 0;
    if (now >= expected) return 100;

    const total = expected.getTime() - planting.getTime();
    const elapsed = now.getTime() - planting.getTime();

    return Math.round((elapsed / total) * 100);
  };

  const getDaysUntilHarvest = (harvest: Harvest) => {
    if (harvest.status === 'harvested' || harvest.status === 'processed') return 0;

    const now = new Date();
    const harvestDate = new Date(harvest.expectedHarvestDate);
    const diffTime = harvestDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleCreateHarvest = (data) => {
    harvestService.create(data);
    setIsDialogOpen(false);
    loadData();
  };

  const handleUpdateHarvest = (data) => {
    harvestService.update(data.id, data);
    setIsDialogOpen(false);
    setEditingHarvest(null);
    loadData();
  };

  const handleDeleteHarvest = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette récolte ?')) {
      harvestService.delete(id);
      loadData();
    }
  };

  const markAsHarvested = (id: string) => {
    harvestService.markAsHarvested(id);
    loadData();
  };

  const harvestStats = [
    {
      title: "Récoltes actives",
      value: stats?.activeGrowing.toString() || "0",
      icon: Sprout,
      change: "En croissance"
    },
    {
      title: "Prêtes à récolter",
      value: stats?.readyForHarvest.toString() || "0",
      icon: AlertTriangle,
      change: "Action requise"
    },
    {
      title: "Surface totale",
      value: stats ? `${stats.totalArea} ha` : "0 ha",
      icon: MapPin,
      change: "Cultivée"
    },
    {
      title: "Rendement estimé",
      value: stats ? `${stats.totalYield} tonnes` : "0 tonnes",
      icon: Scale,
      change: "Cette saison"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Récoltes" subtitle="Gérez le suivi des récoltes et la production agricole">
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
    <DashboardLayout title="Récoltes" subtitle="Gérez le suivi des récoltes et la production agricole">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {harvestStats.map((stat, index) => (
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="harvests">Récoltes</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="analytics">Analytiques</TabsTrigger>
            <TabsTrigger value="planning">Planification</TabsTrigger>
          </TabsList>

          <TabsContent value="harvests" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par produit, producteur, variété..."
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
                        <SelectItem value="growing">En croissance</SelectItem>
                        <SelectItem value="ready">Prêtes</SelectItem>
                        <SelectItem value="harvested">Récoltées</SelectItem>
                        <SelectItem value="processed">Traitement</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={qualityFilter} onValueChange={setQualityFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Qualité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes qualités</SelectItem>
                        <SelectItem value="excellent">Excellente</SelectItem>
                        <SelectItem value="good">Bonne</SelectItem>
                        <SelectItem value="fair">Moyenne</SelectItem>
                        <SelectItem value="poor">Faible</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingHarvest(null)} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Nouvelle récolte
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingHarvest ? 'Modifier la récolte' : 'Nouvelle récolte'}
                          </DialogTitle>
                        </DialogHeader>
                        <HarvestForm
                          item={editingHarvest}
                          onSubmit={editingHarvest ? handleUpdateHarvest : handleCreateHarvest}
                          onCancel={() => {
                            setIsDialogOpen(false);
                            setEditingHarvest(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Harvests Grid */}
            <div className="grid gap-6">
              {filteredHarvests.map((harvest) => {
                const progress = getGrowthProgress(harvest);
                const daysUntilHarvest = getDaysUntilHarvest(harvest);

                return (
                  <Card key={harvest.id} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {harvest.productName} - {harvest.variety}
                            {getStatusBadge(harvest.status)}
                            {getQualityBadge(harvest.quality)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Producteur: {harvest.producer} • {harvest.reference}
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
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Localisation</span>
                          </div>
                          <p className="font-semibold">{harvest.farmLocation}</p>
                          <p className="text-sm text-muted-foreground">{harvest.area} ha</p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Dates</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Plantation:</span>
                              <span>{new Date(harvest.plantingDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Récolte prévue:</span>
                              <span>{new Date(harvest.expectedHarvestDate).toLocaleDateString()}</span>
                            </div>
                            {harvest.actualHarvestDate && (
                              <div className="flex justify-between">
                                <span>Récolte réelle:</span>
                                <span>{new Date(harvest.actualHarvestDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Rendement</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Attendu:</span>
                              <span>{harvest.expectedYield} tonnes</span>
                            </div>
                            {harvest.actualYield && (
                              <div className="flex justify-between">
                                <span>Actuel:</span>
                                <span>{harvest.actualYield} tonnes</span>
                              </div>
                            )}
                            {harvest.actualYield && (
                              <div className="flex justify-between">
                                <span>Efficacité:</span>
                                <span>{Math.round((harvest.actualYield / harvest.expectedYield) * 100)}%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Revenus</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span>Prix marché:</span>
                              <span>{harvest.marketPrice.toLocaleString()} FCFA/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Estimation:</span>
                              <span>{harvest.estimatedRevenue.toLocaleString()} FCFA</span>
                            </div>
                            {harvest.actualRevenue && (
                              <div className="flex justify-between">
                                <span>Réel:</span>
                                <span>{harvest.actualRevenue.toLocaleString()} FCFA</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span>Croissance</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {harvest.status === 'growing' && daysUntilHarvest > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {daysUntilHarvest} jours avant la récolte
                          </p>
                        )}
                      </div>

                      {/* Weather Conditions */}
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Conditions météo</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 border rounded-lg">
                            <Thermometer className="h-6 w-6 mx-auto mb-1 text-red-600" />
                            <p className="text-sm font-medium">{harvest.weatherConditions.temperature}°C</p>
                            <p className="text-xs text-muted-foreground">Température</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Droplets className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                            <p className="text-sm font-medium">{harvest.weatherConditions.rainfall} mm</p>
                            <p className="text-xs text-muted-foreground">Pluie</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Cloud className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                            <p className="text-sm font-medium">{harvest.weatherConditions.humidity}%</p>
                            <p className="text-xs text-muted-foreground">Humidité</p>
                          </div>
                          <div className="text-center p-3 border rounded-lg">
                            <Sun className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                            <p className="text-sm font-medium">{harvest.weatherConditions.sunshine}h</p>
                            <p className="text-xs text-muted-foreground">Ensoleillement</p>
                          </div>
                        </div>
                      </div>

                      {/* Challenges */}
                      {harvest.challenges && harvest.challenges.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-medium mb-3">Défis rencontrés</h4>
                          <div className="flex flex-wrap gap-2">
                            {harvest.challenges.map((challenge, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {challenge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                        {harvest.status === 'ready' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => markAsHarvested(harvest.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marquer comme récolté
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingHarvest(harvest);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHarvest(harvest.id)}
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
            {filteredHarvests.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune récolte trouvée</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || qualityFilter !== 'all'
                      ? 'Essayez de modifier vos filtres de recherche.'
                      : 'Commencez par enregistrer votre première récolte.'}
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouvelle récolte
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendrier des récoltes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Vue calendrier</h3>
                  <p className="text-muted-foreground mb-4">
                    Visualisez et planifiez vos récoltes sur un calendrier.
                  </p>
                  <Button>Voir le calendrier complet</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance des récoltes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Taux de réussite</span>
                      <span className="font-bold text-green-600">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>Qualité moyenne</span>
                      <span className="font-bold">{stats?.averageQuality || 0}%</span>
                    </div>
                    <Progress value={stats?.averageQuality || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenus estimés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {stats?.estimatedRevenue.toLocaleString() || 0} FCFA
                    </p>
                    <p className="text-sm text-muted-foreground">Pour cette saison</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planification des récoltes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Planification stratégique</h3>
                  <p className="text-muted-foreground mb-4">
                    Planifiez vos récoltes futures en fonction des conditions du marché et des prévisions.
                  </p>
                  <Button>Planifier la prochaine saison</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeHarvests;
