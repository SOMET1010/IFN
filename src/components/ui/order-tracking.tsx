import React, { useState } from 'react';
import { useOrder } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Phone,
  User,
  CreditCard,
  Smartphone,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface OrderTrackingProps {
  orderId?: string;
  showButton?: boolean;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderId,
  showButton = true
}) => {
  const { user } = useAuth();
  const { getOrder, updateOrderStatus } = useOrder();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) return null;

  // For demo purposes, get the most recent order if no orderId is provided
  const order = orderId ? getOrder(orderId) : null;

  if (!order && !showButton) return null;

  const StatusIcon = ({ status }: { status: string }) => {
    const iconMap = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle
    };

    const Icon = iconMap[status as keyof typeof iconMap] || Clock;
    const colorMap = {
      pending: 'text-yellow-600',
      confirmed: 'text-blue-600',
      preparing: 'text-purple-600',
      shipped: 'text-orange-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };

    return (
      <Icon className={`h-5 w-5 ${colorMap[status as keyof typeof colorMap] || 'text-gray-600'}`} />
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variantMap = {
      pending: 'secondary',
      confirmed: 'default',
      preparing: 'secondary',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive'
    } as const;

    const labelMap = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };

    return (
      <Badge variant={variantMap[status as keyof typeof variantMap] || 'secondary'}>
        {labelMap[status as keyof typeof labelMap] || status}
      </Badge>
    );
  };

  const TimelineItem = ({ update, index }: { update: { status: string; timestamp: string; location?: string; description?: string }; index: number }) => (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          index === 0 ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          <StatusIcon status={update.status} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {update.message}
          </p>
          <span className="text-xs text-gray-500">
            {formatDate(update.timestamp)}
          </span>
        </div>
        {update.location && (
          <p className="text-xs text-gray-500 mt-1">
            {update.location}
          </p>
        )}
      </div>
    </div>
  );

  const OrderDetails = () => (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Commande #{order.id}</h3>
          <p className="text-sm text-gray-500">
            Passée le {formatDate(order.order_date)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Tracking Info */}
      {order.tracking_number && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Numéro de suivi</p>
                <p className="text-lg font-mono">{order.tracking_number}</p>
              </div>
              <Button variant="outline" size="sm">
                Suivre le colis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.updates.map((update, index) => (
              <TimelineItem key={index} update={update} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Articles ({order.products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.products.map((product, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                  {product.product_image ? (
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-sm text-gray-500">
                    {product.quantity} × {formatCurrency(product.price)}
                  </p>
                </div>
                <p className="font-medium">
                  {formatCurrency(product.price * product.quantity)}
                </p>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatCurrency(order.total_amount - order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatCurrency(order.delivery_fee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations de livraison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4 text-gray-500" />
            <span>{order.buyer_info.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{order.buyer_info.phone}</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{order.buyer_info.address}, {order.buyer_info.city}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Truck className="h-4 w-4 text-gray-500" />
            <span className="capitalize">
              {order.delivery_method === 'delivery' ? 'Livraison' : 'Retrait sur place'}
            </span>
          </div>
          {order.delivery_instructions && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Instructions:</strong> {order.delivery_instructions}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {order.payment_method.type === 'mobile_money' ? (
              <Smartphone className="h-4 w-4 text-blue-600" />
            ) : (
              <CreditCard className="h-4 w-4 text-green-600" />
            )}
            <div>
              <p className="font-medium">
                {order.payment_method.type === 'mobile_money'
                  ? `Mobile Money (${order.payment_method.provider})`
                  : `Carte bancaire (**** ${order.payment_method.last4})`
                }
              </p>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                {order.payment_status === 'paid' ? 'Payé' : 'En attente'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimated Delivery */}
      {order.estimated_delivery && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">Livraison estimée</p>
                <p className="text-sm text-gray-500">
                  {formatDate(order.estimated_delivery)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="flex space-x-2">
          {order.status === 'shipped' && (
            <Button
              onClick={() => updateOrderStatus(order.id, 'delivered', 'Commande livrée avec succès')}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer la livraison
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Fermer
          </Button>
        </div>
      )}
    </div>
  );

  if (!order) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {showButton && (
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Mes commandes
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mes commandes</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Vous n'avez aucune commande pour le moment.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {showButton && (
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Suivre ma commande
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suivi de commande</DialogTitle>
        </DialogHeader>
        <OrderDetails />
      </DialogContent>
    </Dialog>
  );
};