import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Phone,
  MessageSquare,
  Camera,
  Signature,
  Navigation,
  Star,
  TrendingUp
} from 'lucide-react';
import { ProducerOffer, ProducerSale } from '@/types';
import { producerSaleService } from '@/services/producer/producerSaleService';
import { producerOfferService } from '@/services/producer/producerOfferService';
import { LogisticsTracking } from '@/components/producer/LogisticsTracking';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatDate } from '@/lib/format';

interface Order extends ProducerSale {
  // Étend les statuts pour la gestion de commandes (UI)
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  buyerLocation?: {
    address: string;
    city: string;
    coordinates?: { lat: number; lng: number };
  };
  deliveryInstructions?: string;
  deliveryPerson?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  trackingInfo?: {
    trackingNumber: string;
    currentLocation?: string;
    estimatedDelivery?: string;
    status: 'preparing' | 'in_transit' | 'delivered' | 'delayed';
  };
  qualityCheck?: {
    passed: boolean;
    notes?: string;
    photos?: string[];
    inspector?: string;
  };
  paymentDetails?: {
    method: 'mobile_money' | 'bank_transfer' | 'cash';
    provider?: string;
    reference?: string;
    status: 'pending' | 'completed' | 'failed';
  };
}

interface DeliveryStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  timestamp?: string;
  completedBy?: string;
  notes?: string;
}

interface DeliveryRoute {
  id: string;
  orders: string[];
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    licensePlate: string;
  };
  estimatedDuration: number;
  distance: number;
  status: 'planned' | 'in_progress' | 'completed';
  stops: {
    order: string;
    address: string;
    estimatedTime: string;
    actualTime?: string;
    status: 'pending' | 'visited' | 'skipped';
  }[];
}

const mockOrders: Order[] = [
  {
    id: '1',
    product: 'Cacao',
    quantity: 500,
    unit: 'kg',
    price: 1200,
    total_price: 600000,
    currency: 'FCFA',
    buyer: 'Société Chocolaterie CI',
    buyer_type: 'cooperative',
    buyer_contact: '+225 07 12 34 56 78',
    date: '2024-01-15',
    status: 'confirmed',
    payment_method: 'mobile_money',
    payment_status: 'pending',
    producer_id: 'producer1',
    offer_id: 'offer1',
    delivery_method: 'delivery',
    delivery_address: 'Abidjan, Plateau, Rue Commerce 123',
    deliveryInstructions: 'Livraison entre 9h et 12h, appeler 15min avant arrivée',
    buyerLocation: {
      address: 'Rue Commerce 123',
      city: 'Abidjan',
      coordinates: { lat: 5.3364, lng: -4.0267 }
    },
    deliveryPerson: {
      name: 'Kouassi Jean',
      phone: '+225 07 98 76 54 32',
      vehicle: 'Camionnette Isuzu'
    },
    trackingInfo: {
      trackingNumber: 'TRK20240115001',
      currentLocation: 'Yamoussoukro',
      estimatedDelivery: '2024-01-15T14:00:00Z',
      status: 'in_transit'
    },
    paymentDetails: {
      method: 'mobile_money',
      provider: 'Orange Money',
      reference: 'OM2024011500123',
      status: 'pending'
    }
  },
  {
    id: '2',
    product: 'Café',
    quantity: 200,
    unit: 'kg',
    price: 2800,
    total_price: 560000,
    currency: 'FCFA',
    buyer: 'Café Select',
    buyer_type: 'merchant',
    buyer_contact: '+225 07 23 45 67 89',
    date: '2024-01-14',
    status: 'preparing',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    producer_id: 'producer1',
    offer_id: 'offer2',
    delivery_method: 'pickup',
    notes: 'Client viendra chercher demain matin'
  }
];

const mockDeliveryRoutes: DeliveryRoute[] = [
  {
    id: 'route1',
    orders: ['1', '3', '5'],
    driver: {
      name: 'Kouassi Jean',
      phone: '+225 07 98 76 54 32',
      vehicle: 'Camionnette Isuzu',
      licensePlate: 'CI-1234-ABJ'
    },
    estimatedDuration: 240, // minutes
    distance: 45, // km
    status: 'in_progress',
    stops: [
      {
        order: '1',
        address: 'Abidjan, Plateau, Rue Commerce 123',
        estimatedTime: '14:00',
        status: 'pending'
      },
      {
        order: '3',
        address: 'Abidjan, Cocody, Rue des Palmiers',
        estimatedTime: '16:30',
        status: 'pending'
      }
    ]
  }
];

export function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>(mockDeliveryRoutes);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showQualityCheckDialog, setShowQualityCheckDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('orders');
  const [newDeliveryNote, setNewDeliveryNote] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      const response = await producerSaleService.getSalesByProducer(user.id);
      if (response.success && response.data) {
        // Combine with mock data for demonstration
        setOrders([...mockOrders, ...response.data]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    }
  };

  

  const getStatusBadge = (status: Order['status']) => {
    const variants = {
      pending: "outline",
      confirmed: "default",
      preparing: "secondary",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
      failed: "destructive"
    } as const;

    const labels = {
      pending: "En attente",
      confirmed: "Confirmée",
      preparing: "En préparation",
      shipped: "Expédiée",
      delivered: "Livrée",
      cancelled: "Annulée",
      failed: "Échouée"
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return null;

    const variants = {
      pending: "outline",
      paid: "default",
      failed: "destructive"
    } as const;

    const labels = {
      pending: "En attente",
      paid: "Payée",
      failed: "Échouée"
    };

    return <Badge variant={variants[status as keyof typeof variants]}>{labels[status as keyof typeof labels]}</Badge>;
  };

  const getDeliverySteps = (order: Order): DeliveryStep[] => {
    return [
      {
        id: '1',
        title: 'Confirmation commande',
        description: 'Commande confirmée par l\'acheteur',
        status: order.status === 'pending' ? 'in_progress' : 'completed',
        timestamp: order.date
      },
      {
        id: '2',
        title: 'Préparation colis',
        description: 'Préparation et emballage des produits',
        status: order.status === 'preparing' ? 'in_progress' :
               ['confirmed', 'preparing'].includes(order.status) ? 'pending' :
               ['shipped', 'delivered'].includes(order.status) ? 'completed' : 'skipped'
      },
      {
        id: '3',
        title: 'Contrôle qualité',
        description: 'Vérification de la qualité des produits',
        status: order.qualityCheck ? 'completed' :
               ['confirmed', 'preparing'].includes(order.status) ? 'pending' :
               ['shipped', 'delivered'].includes(order.status) ? 'completed' : 'skipped'
      },
      {
        id: '4',
        title: 'Envoi en livraison',
        description: 'Remise au transporteur',
        status: order.status === 'shipped' ? 'in_progress' :
               order.status === 'delivered' ? 'completed' : 'pending'
      },
      {
        id: '5',
        title: 'Livraison effectuée',
        description: 'Produits livrés au client',
        status: order.status === 'delivered' ? 'completed' : 'pending'
      },
      {
        id: '6',
        title: 'Paiement reçu',
        description: 'Paiement confirmé',
        status: order.payment_status === 'paid' ? 'completed' : 'pending'
      }
    ];
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const confirmQualityCheck = async (orderId: string, passed: boolean, notes?: string) => {
    try {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? {
          ...order,
          qualityCheck: {
            passed,
            notes,
            photos: [],
            inspector: user?.name || 'Producteur'
          }
        } : order
      ));
      setShowQualityCheckDialog(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du contrôle qualité:', error);
    }
  };

  const filteredOrders = orders.filter(order =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const totalRevenue = orders
    .filter(order => order.payment_status === 'paid')
    .reduce((sum, order) => sum + order.total_price, 0);

  const pendingOrders = orders.filter(order =>
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  ).length;

  const inTransitOrders = orders.filter(order =>
    order.status === 'shipped'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
          <p className="text-muted-foreground">Suivez et gérez vos commandes et livraisons</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes en attente</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En livraison</p>
                <p className="text-2xl font-bold">{inTransitOrders}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 ${activeTab === 'orders' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Commandes
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'routes' ? 'border-b-2 border-primary' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          Tournées de livraison
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filtrer par statut:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les commandes</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmées</SelectItem>
            <SelectItem value="preparing">En préparation</SelectItem>
            <SelectItem value="shipped">Expédiées</SelectItem>
            <SelectItem value="delivered">Livrées</SelectItem>
            <SelectItem value="cancelled">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
                <p className="text-muted-foreground text-center">
                  Aucune commande trouvée pour les filtres sélectionnés.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">Commande #{order.id.slice(-6)}</h3>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Produit</p>
                          <p className="font-medium">{order.product}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantité</p>
                          <p className="font-medium">{order.quantity} {order.unit}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prix unitaire</p>
                          <p className="font-medium">{formatCurrency(order.price)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">{formatCurrency(order.total_price)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Détails
                      </Button>
                      {order.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQualityCheckDialog(true)}
                        >
                          Contrôle qualité
                        </Button>
                      )}
                      {order.status === 'preparing' && order.delivery_method === 'delivery' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeliveryDialog(true)}
                        >
                          Expédier
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progression de la commande</span>
                      <span>
                        {getDeliverySteps(order).filter(step => step.status === 'completed').length} / {getDeliverySteps(order).length}
                      </span>
                    </div>
                    <Progress
                      value={(getDeliverySteps(order).filter(step => step.status === 'completed').length / getDeliverySteps(order).length) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{order.delivery_method === 'pickup' ? 'Retrait client' : 'Livraison'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{order.buyer_contact}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(order.date, { month: 'long' })}</span>
                    </div>
                  </div>

                  {/* Delivery Tracking */}
                  {order.trackingInfo && (
                    <Alert className="mt-4">
                      <Navigation className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>
                            <strong>Tracking:</strong> {order.trackingInfo.trackingNumber} •
                            Position: {order.trackingInfo.currentLocation}
                          </span>
                          <Badge variant="outline">{order.trackingInfo.status}</Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delivery Routes - Integrated Logistics Tracking */}
      {activeTab === 'routes' && (
        <LogisticsTracking
          producerId={user?.id || ''}
          onRouteUpdate={(routeId, updates) => {
            console.log('Route updated:', routeId, updates);
          }}
          onShipmentUpdate={(shipmentId, updates) => {
            console.log('Shipment updated:', shipmentId, updates);
          }}
        />
      )}
  
      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande #{selectedOrder?.id?.slice(-6)}</DialogTitle>
            <DialogDescription>Informations complètes sur la commande</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informations commande</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Produit:</span>
                      <span>{selectedOrder.product}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantité:</span>
                      <span>{selectedOrder.quantity} {selectedOrder.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix unitaire:</span>
                      <span>{formatCurrency(selectedOrder.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total:</span>
                      <span className="font-semibold">{formatCurrency(selectedOrder.total_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date commande:</span>
                      <span>{formatDate(selectedOrder.date, { month: 'long' })}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Informations acheteur</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nom:</span>
                      <span>{selectedOrder.buyer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{selectedOrder.buyer_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact:</span>
                      <span>{selectedOrder.buyer_contact}</span>
                    </div>
                    {selectedOrder.delivery_address && (
                      <>
                        <div className="flex justify-between">
                          <span>Adresse livraison:</span>
                          <span>{selectedOrder.delivery_address}</span>
                        </div>
                        {selectedOrder.deliveryInstructions && (
                          <div>
                            <span className="block">Instructions:</span>
                            <span className="text-muted-foreground">{selectedOrder.deliveryInstructions}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div>
                <h4 className="font-semibold mb-3">Progression de la commande</h4>
                <div className="space-y-3">
                  {getDeliverySteps(selectedOrder).map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                        'bg-gray-300'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {step.timestamp && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(step.timestamp).toLocaleString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contacter acheteur
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Envoyer message
                </Button>
                {selectedOrder.status === 'preparing' && (
                  <Button onClick={() => setShowDeliveryDialog(true)}>
                    <Truck className="h-4 w-4 mr-2" />
                    Envoyer en livraison
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
