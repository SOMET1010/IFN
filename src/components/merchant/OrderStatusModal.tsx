import { MerchantOrder } from '@/services/merchant/merchantService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface OrderStatusModalProps {
  order: MerchantOrder;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (status: MerchantOrder['status']) => void;
  isUpdating?: boolean;
}

export const OrderStatusModal = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdating = false,
}: OrderStatusModalProps) => {
  const getStatusInfo = (status: MerchantOrder['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5" />,
          label: 'En attente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Commande en attente de confirmation',
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Confirmée',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'Commande confirmée, en préparation',
        };
      case 'delivered':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Livrée',
          color: 'bg-green-100 text-green-800 border-green-200',
          description: 'Commande livrée avec succès',
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-5 w-5" />,
          label: 'Annulée',
          color: 'bg-red-100 text-red-800 border-red-200',
          description: 'Commande annulée',
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'Inconnu',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          description: 'Statut inconnu',
        };
    }
  };

  const availableStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'] as const;
  const currentStatusInfo = getStatusInfo(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStatusInfo.icon}
            Gérer la commande {order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${currentStatusInfo.color}`}>
            <div className="flex items-center gap-2 mb-2">
              {currentStatusInfo.icon}
              <span className="font-medium">{currentStatusInfo.label}</span>
            </div>
            <p className="text-sm opacity-80">{currentStatusInfo.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Changer le statut</h4>
            <div className="grid grid-cols-2 gap-2">
              {availableStatuses.map((status) => {
                const statusInfo = getStatusInfo(status);
                const isCurrent = status === order.status;
                const isDisabled = status === order.status || isUpdating;

                return (
                  <Button
                    key={status}
                    variant={isCurrent ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateStatus(status)}
                    disabled={isDisabled}
                    className="justify-start gap-2"
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Client</span>
                <p className="font-medium">{order.client}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Total</span>
                <p className="font-medium text-green-600">{order.total}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Date</span>
                <p>{order.date}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Livraison</span>
                <p>{order.deliveryDate}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};