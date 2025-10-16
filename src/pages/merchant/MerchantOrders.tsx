import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, CheckCircle, AlertTriangle, Package, Tag } from 'lucide-react';
import { useMerchantOrders } from '@/services/merchant/merchantOrderService';
import { OrderStatusModal } from '@/components/merchant/OrderStatusModal';
import { MerchantOrder } from '@/services/merchant/merchantService';
import PromotionManager from '@/components/merchant/PromotionManager';
import { MerchantHeader } from '@/components/merchant/MerchantHeader';
import { StatsCard } from '@/components/merchant/StatsCard';
import { OrderStatus, OrderStatusLabels, OrderStatusVariants } from '@/types/merchant';
import FloatingVoiceNavigator from '@/components/merchant/FloatingVoiceNavigator';

const MerchantOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<MerchantOrder | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  const { orders, updateOrderStatus } = useMerchantOrders();

  const pendingOrders = useMemo(() =>
    orders.data?.filter(order => order.status === 'pending') || [],
    [orders.data]
  );

  const confirmedOrders = useMemo(() =>
    orders.data?.filter(order => order.status === 'confirmed') || [],
    [orders.data]
  );

  const deliveredOrders = useMemo(() =>
    orders.data?.filter(order => order.status === 'delivered') || [],
    [orders.data]
  );

  const getStatusBadge = useCallback((status: string) => {
    return (
      <Badge variant={OrderStatusVariants[status as OrderStatus] || 'default'}>
        {OrderStatusLabels[status as OrderStatus] || status}
      </Badge>
    );
  }, []);

  const handleOrderStatusClick = (order: MerchantOrder) => {
    setSelectedOrder(order);
    setStatusModalOpen(true);
  };

  const handleStatusUpdate = async (status: MerchantOrder['status']) => {
    if (selectedOrder) {
      try {
        await updateOrderStatus.mutateAsync({ id: selectedOrder.id, status });
        setStatusModalOpen(false);
        setSelectedOrder(null);
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MerchantHeader title="Gestion des Commandes" showBackButton={true} backTo="/merchant/dashboard" />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="promotions">Promotions</TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total commandes"
            value={orders.data?.length || 0}
            icon={Package}
          />
          <StatsCard
            title="En attente"
            value={pendingOrders.length}
            icon={AlertTriangle}
            borderColor="orange"
            trendColor="text-orange-600"
          />
          <StatsCard
            title="Confirmées"
            value={confirmedOrders.length}
            icon={Package}
            borderColor="blue"
            trendColor="text-blue-600"
          />
          <StatsCard
            title="Livrées"
            value={deliveredOrders.length}
            icon={CheckCircle}
            borderColor="green"
            trendColor="text-green-600"
          />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Liste des commandes</h2>
        </div>

        {/* Loading State */}
        {orders.isLoading && (
          <div className="text-center py-8">
            <p>Chargement des commandes...</p>
          </div>
        )}

        {/* Orders List */}
        <div className="grid gap-6">
          {orders.data?.map((order) => (
            <Card key={order.id} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {order.id}
                      {getStatusBadge(order.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.client}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOrderStatusClick(order)}
                      aria-label={`Voir la commande ${order.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {order.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOrderStatusClick(order)}
                        className="text-blue-600"
                        aria-label={`Modifier le statut de la commande ${order.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {order.status === 'confirmed' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOrderStatusClick(order)}
                        className="text-green-600"
                        aria-label={`Marquer la commande ${order.id} comme livrée`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium text-muted-foreground">Produits</span>
                    <div className="mt-1">
                      {order.products.map((product, index) => (
                        <p key={index} className="text-sm">
                          {product.name} ({product.quantity})
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Total</span>
                    <p className="text-lg font-bold text-green-600 mt-1">{order.total}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Date commande</span>
                    <p className="font-semibold mt-1">{order.date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Livraison prévue</span>
                    <p className="font-semibold mt-1">{order.deliveryDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!orders.isLoading && orders.data?.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
            <p className="text-muted-foreground">
              Vous n'avez aucune commande pour le moment.
            </p>
          </div>
        )}

        {/* Status Modal */}
        {selectedOrder && (
          <OrderStatusModal
            order={selectedOrder}
            isOpen={statusModalOpen}
            onClose={() => {
              setStatusModalOpen(false);
              setSelectedOrder(null);
            }}
            onUpdateStatus={handleStatusUpdate}
            isUpdating={updateOrderStatus.isPending}
          />
        )}
          </TabsContent>

          <TabsContent value="promotions">
            <PromotionManager />
          </TabsContent>
        </Tabs>
        </div>
      </main>
    </div>
  );
};

export default MerchantOrders;
