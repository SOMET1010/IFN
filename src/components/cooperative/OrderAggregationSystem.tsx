import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/format';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Users,
  TrendingUp,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Share,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Truck,
  Calendar,
  MapPin
} from 'lucide-react';
import { marketService } from '@/services/market/marketService';
import { Link } from 'react-router-dom';

// Types pour le système d'agrégation
interface AggregatedOrder {
  id: string;
  product_name: string;
  category: string;
  total_quantity: number;
  unit: string;
  participants_count: number;
  average_target_price: number;
  price_range: {
    min: number;
    max: number;
  };
  urgency_distribution: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  status: 'collecting' | 'aggregating' | 'negotiating' | 'confirmed' | 'cancelled';
  deadline: string;
  created_at: string;
  updated_at: string;
  member_needs: MemberNeed[];
  negotiation_history?: NegotiationStep[];
  supplier_quotes?: SupplierQuote[];
  estimated_savings?: number;
  delivery_options?: DeliveryOption[];
  published_to_market?: boolean;
}

interface MemberNeed {
  id: string;
  member_id: string;
  member_name: string;
  quantity: number;
  preferred_price_range?: {
    min: number;
    max: number;
  };
  urgency_level: 'low' | 'medium' | 'high' | 'urgent';
  delivery_deadline?: string;
  special_requirements?: string;
  status: 'pending' | 'aggregated' | 'confirmed' | 'cancelled';
  created_at: string;
}

interface NegotiationStep {
  id: string;
  timestamp: string;
  type: 'price_proposal' | 'counter_offer' | 'acceptance' | 'rejection' | 'information_request';
  actor: 'cooperative' | 'supplier';
  message: string;
  price?: number;
  conditions?: string[];
}

interface SupplierQuote {
  id: string;
  supplier_name: string;
  supplier_contact: string;
  price_per_unit: number;
  total_price: number;
  delivery_time: string;
  conditions: string[];
  rating: number;
  submitted_at: string;
  valid_until: string;
}

interface DeliveryOption {
  id: string;
  type: 'pickup' | 'delivery';
  provider: string;
  cost: number;
  estimated_time: string;
  coverage: string[];
  requirements: string[];
}

interface AggregationConfig {
  auto_aggregation: boolean;
  aggregation_threshold: number; // Nombre minimum de besoins pour déclencher l'agrégation
  price_sensitivity: number; // Pourcentage de variation de prix acceptable
  deadline_extension: number; // Jours d'extension automatique
  supplier_selection: 'automatic' | 'manual' | 'hybrid';
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export function CooperativeOrderAggregationSystem() {
  // États principaux
  const [aggregatedOrders, setAggregatedOrders] = useState<AggregatedOrder[]>([]);
  const [pendingNeeds, setPendingNeeds] = useState<MemberNeed[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AggregatedOrder | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    urgency: 'all'
  });
  const [config, setConfig] = useState<AggregationConfig>({
    auto_aggregation: true,
    aggregation_threshold: 5,
    price_sensitivity: 15,
    deadline_extension: 3,
    supplier_selection: 'hybrid',
    notification_preferences: {
      email: true,
      sms: true,
      push: true
    }
  });

  // Simuler le chargement des données
  useEffect(() => {
    // Données de démonstration
    const mockPendingNeeds: MemberNeed[] = [
      {
        id: '1',
        member_id: 'm1',
        member_name: 'Kouadio Jean',
        quantity: 50,
        preferred_price_range: { min: 750, max: 850 },
        urgency_level: 'medium',
        delivery_deadline: '2024-04-15',
        status: 'pending',
        created_at: '2024-03-20T10:00:00Z'
      },
      {
        id: '2',
        member_id: 'm2',
        member_name: 'Amani Marie',
        quantity: 75,
        preferred_price_range: { min: 700, max: 900 },
        urgency_level: 'high',
        delivery_deadline: '2024-04-10',
        status: 'pending',
        created_at: '2024-03-20T11:30:00Z'
      },
      {
        id: '3',
        member_id: 'm3',
        member_name: 'Traoré Ibrahim',
        quantity: 100,
        preferred_price_range: { min: 800, max: 950 },
        urgency_level: 'urgent',
        delivery_deadline: '2024-04-05',
        special_requirements: 'Qualité premium certifiée',
        status: 'pending',
        created_at: '2024-03-20T14:15:00Z'
      }
    ];

    const mockAggregatedOrders: AggregatedOrder[] = [
      {
        id: 'ao1',
        product_name: 'Engrais NPK',
        category: 'engrais',
        total_quantity: 225,
        unit: 'kg',
        participants_count: 3,
        average_target_price: 817,
        price_range: { min: 700, max: 950 },
        urgency_distribution: { low: 0, medium: 1, high: 1, urgent: 1 },
        status: 'aggregating',
        deadline: '2024-03-30',
        created_at: '2024-03-20T10:00:00Z',
        updated_at: '2024-03-20T14:15:00Z',
        member_needs: mockPendingNeeds,
        estimated_savings: 67500
      }
    ];

    setPendingNeeds(mockPendingNeeds);
    setAggregatedOrders(mockAggregatedOrders);
  }, []);

  // Agréger les besoins automatiquement
  const aggregateNeeds = () => {
    // Grouper les besoins par produit et caractéristiques similaires
    const groupedNeeds = pendingNeeds.reduce((acc, need) => {
      const key = `${need.member_name.split(' ')[0]}-${Math.floor(need.preferred_price_range?.min || 0 / 100) * 100}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(need);
      return acc;
    }, {} as Record<string, MemberNeed[]>);

    // Créer des ordres agrégés pour les groupes suffisamment grands
    Object.entries(groupedNeeds).forEach(([key, needs]) => {
      if (needs.length >= config.aggregation_threshold) {
        const newAggregatedOrder: AggregatedOrder = {
          id: `ao_${Date.now()}`,
          product_name: 'Engrais NPK', // Simplifié pour la démo
          category: 'engrais',
          total_quantity: needs.reduce((sum, need) => sum + need.quantity, 0),
          unit: 'kg',
          participants_count: needs.length,
          average_target_price: Math.round(
            needs.reduce((sum, need) => sum + (need.preferred_price_range?.min || 0), 0) / needs.length
          ),
          price_range: {
            min: Math.min(...needs.map(n => n.preferred_price_range?.min || 0)),
            max: Math.max(...needs.map(n => n.preferred_price_range?.max || 0))
          },
          urgency_distribution: needs.reduce((acc, need) => {
            acc[need.urgency_level]++;
            return acc;
          }, { low: 0, medium: 0, high: 0, urgent: 0 }),
          status: 'aggregating',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          member_needs: needs,
          estimated_savings: needs.length * 22500 // Estimation
        };

        setAggregatedOrders(prev => [...prev, newAggregatedOrder]);
        setPendingNeeds(prev => prev.filter(need => !needs.includes(need)));
      }
    });
  };

  // Démarrer la négociation
  const startNegotiation = (orderId: string) => {
    setAggregatedOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'negotiating' as const, updated_at: new Date().toISOString() }
        : order
    ));
  };

  // Confirmer une commande
  const confirmOrder = (orderId: string) => {
    setAggregatedOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: 'confirmed' as const,
            updated_at: new Date().toISOString(),
            member_needs: order.member_needs.map(need => ({ ...need, status: 'confirmed' as const }))
          }
        : order
    ));
  };

  // Publier au marché
  const publishToMarket = (orderId: string) => {
    const order = aggregatedOrders.find(o => o.id === orderId);
    if (!order) return;
    marketService.publish({
      productName: order.product_name,
      category: order.category,
      quantity: order.total_quantity,
      unit: order.unit,
      priceTarget: order.average_target_price,
    });
    setAggregatedOrders(prev => prev.map(o => o.id === orderId ? { ...o, published_to_market: true } : o));
  };

  // Annuler une commande
  const cancelOrder = (orderId: string) => {
    setAggregatedOrders(prev => prev.map(order =>
      order.id === orderId
        ? {
            ...order,
            status: 'cancelled' as const,
            updated_at: new Date().toISOString(),
            member_needs: order.member_needs.map(need => ({ ...need, status: 'pending' as const }))
          }
        : order
    ));

    // Remettre les besoins en attente
    const cancelledOrder = aggregatedOrders.find(o => o.id === orderId);
    if (cancelledOrder) {
      setPendingNeeds(prev => [...prev, ...cancelledOrder.member_needs.map(need => ({ ...need, status: 'pending' as const }))]);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    const variants = {
      collecting: 'outline',
      aggregating: 'default',
      negotiating: 'secondary',
      confirmed: 'default',
      cancelled: 'destructive'
    } as const;

    const labels = {
      collecting: 'Collecte',
      aggregating: 'Agrégation',
      negotiating: 'Négociation',
      confirmed: 'Confirmée',
      cancelled: 'Annulée'
    };

    const colors = {
      collecting: 'bg-blue-100 text-blue-800 border-blue-200',
      aggregating: 'bg-orange-100 text-orange-800 border-orange-200',
      negotiating: 'bg-purple-100 text-purple-800 border-purple-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  // Obtenir l'icône d'urgence
  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Calculer le pourcentage de progression
  const calculateProgress = (order: AggregatedOrder) => {
    const progressMap = {
      collecting: 25,
      aggregating: 50,
      negotiating: 75,
      confirmed: 100,
      cancelled: 0
    };
    return progressMap[order.status] || 0;
  };

  // Filtrer les commandes
  const filteredOrders = aggregatedOrders.filter(order => {
    if (filters.status !== 'all' && order.status !== filters.status) return false;
    if (filters.category !== 'all' && order.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Besoins en attente</p>
                <p className="text-2xl font-bold">{pendingNeeds.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes agrégées</p>
                <p className="text-2xl font-bold">{aggregatedOrders.length}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Économies estimées</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(aggregatedOrders.reduce((sum, order) => sum + (order.estimated_savings || 0), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">
                  {aggregatedOrders.reduce((sum, order) => sum + order.participants_count, 0)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={aggregateNeeds} disabled={pendingNeeds.length < config.aggregation_threshold}>
            <Calculator className="h-4 w-4 mr-2" />
            Agréger les besoins
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConfig(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </Button>
          <Button asChild>
            <Link to="/cooperative/payments">Paiements collectifs</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/cooperative/market-offers">Offres marché</Link>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="collecting">Collecte</SelectItem>
                <SelectItem value="aggregating">Agrégation</SelectItem>
                <SelectItem value="negotiating">Négociation</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="engrais">Engrais</SelectItem>
                <SelectItem value="semences">Semences</SelectItem>
                <SelectItem value="outils">Outils</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes agrégées */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {order.product_name}
                    {getStatusBadge(order.status)}
                  </CardTitle>
                  <CardDescription>
                    {order.total_quantity} {order.unit} • {order.participants_count} participants
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(order.average_target_price)}/{order.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">Prix moyen cible</p>
                </div>
              </div>

              <Progress value={calculateProgress(order)} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground text-right">
                {calculateProgress(order)}% complété
              </p>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Détails de la commande */}
                <div className="space-y-3">
                  <h4 className="font-medium">Détails</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantité totale:</span>
                      <span>{order.total_quantity} {order.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Participants:</span>
                      <span>{order.participants_count} membres</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fourchette de prix:</span>
                      <span>
                        {formatCurrency(order.price_range.min)} - {formatCurrency(order.price_range.max)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date limite:</span>
                      <span>{new Date(order.deadline).toLocaleDateString('fr-FR')}</span>
                    </div>
                    {order.estimated_savings && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Économies estimées:</span>
                        <span className="text-green-600 font-medium">{formatCurrency(order.estimated_savings || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Distribution d'urgence */}
                <div className="space-y-3">
                  <h4 className="font-medium">Niveau d'urgence</h4>
                  <div className="space-y-2">
                    {Object.entries(order.urgency_distribution).map(([level, count]) => (
                      count > 0 && (
                        <div key={level} className="flex items-center gap-2">
                          {getUrgencyIcon(level)}
                          <span className="text-sm capitalize">{level}:</span>
                          <span className="text-sm font-medium">{count}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(count / order.participants_count) * 100}%` }}
                            />
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div className="space-y-3">
                  <h4 className="font-medium">Participants</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {order.member_needs.slice(0, 5).map((need) => (
                      <div key={need.id} className="flex justify-between items-center text-sm">
                        <span>{need.member_name}</span>
                        <div className="flex items-center gap-2">
                          <span>{need.quantity} {order.unit}</span>
                          {getUrgencyIcon(need.urgency_level)}
                        </div>
                      </div>
                    ))}
                    {order.member_needs.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.member_needs.length - 5} autres participants
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <Button variant="outline" size="sm">
                  <PieChart className="h-4 w-4 mr-2" />
                  Analyser
                </Button>
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Détails de la commande agrégée</DialogTitle>
                      <DialogDescription>
                        {order.product_name} - {order.total_quantity} {order.unit}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Contenu détaillé */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Informations générales</h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Statut:</strong> {order.status}</div>
                            <div><strong>Date de création:</strong> {new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
                            <div><strong>Date limite:</strong> {new Date(order.deadline).toLocaleDateString('fr-FR')}</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Informations financières</h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Prix moyen cible:</strong> {formatCurrency(order.average_target_price)} /{order.unit}</div>
                            <div><strong>Fourchette de prix:</strong> {formatCurrency(order.price_range.min)} - {formatCurrency(order.price_range.max)}</div>
                            <div><strong>Économies estimées:</strong> {formatCurrency(order.estimated_savings || 0)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Liste complète des participants */}
                      <div>
                        <h5 className="font-medium mb-2">Tous les participants ({order.member_needs.length})</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                          {order.member_needs.map((need) => (
                            <div key={need.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium">{need.member_name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {need.quantity} {order.unit} • {need.urgency_level}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs">
                                  {need.preferred_price_range ? `${formatCurrency(need.preferred_price_range.min)} - ${formatCurrency(need.preferred_price_range.max)}` : ''}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(need.delivery_deadline || '').toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={order.published_to_market ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => publishToMarket(order.id)}
                  disabled={!!order.published_to_market}
                >
                  {order.published_to_market ? 'Publié' : 'Publier au Marché'}
                </Button>

                {order.status === 'aggregating' && (
                  <Button
                    onClick={() => startNegotiation(order.id)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Commencer la négociation
                  </Button>
                )}
                {order.status === 'negotiating' && (
                  <Button onClick={() => confirmOrder(order.id)}>
                    Confirmer la commande
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelOrder(order.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configuration de l'agrégation</DialogTitle>
            <DialogDescription>
              Paramétrez le fonctionnement automatique du système d'agrégation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Agrégation automatique</Label>
              <Switch
                checked={config.auto_aggregation}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, auto_aggregation: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Seuil d'agrégation ({config.aggregation_threshold} membres minimum)</Label>
              <Input
                type="range"
                min="2"
                max="20"
                value={config.aggregation_threshold}
                onChange={(e) => setConfig(prev => ({ ...prev, aggregation_threshold: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Sensibilité au prix ({config.price_sensitivity}%)</Label>
              <Input
                type="range"
                min="5"
                max="50"
                value={config.price_sensitivity}
                onChange={(e) => setConfig(prev => ({ ...prev, price_sensitivity: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Sélection des fournisseurs</Label>
              <Select
                value={config.supplier_selection}
                onValueChange={(value) => setConfig(prev => ({ ...prev, supplier_selection: value as 'automatic' | 'manual' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatique</SelectItem>
                  <SelectItem value="manual">Manuelle</SelectItem>
                  <SelectItem value="hybrid">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Préférences de notification</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email</span>
                  <Switch
                    checked={config.notification_preferences.email}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, email: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">SMS</span>
                  <Switch
                    checked={config.notification_preferences.sms}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, sms: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Push</span>
                  <Switch
                    checked={config.notification_preferences.push}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      notification_preferences: { ...prev.notification_preferences, push: checked }
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
