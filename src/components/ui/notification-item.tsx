import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNotification } from '@/contexts/NotificationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Notification } from '@/contexts/NotificationContext';
import {
  Bell,
  ShoppingCart,
  Star,
  TrendingDown,
  MessageSquare,
  CreditCard,
  Truck,
  Info,
  ExternalLink,
  Check,
  X
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose
}) => {
  const { markAsRead, deleteNotification, loading } = useNotification();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return <ShoppingCart className="h-4 w-4" />;
      case 'new_offer':
        return <Bell className="h-4 w-4" />;
      case 'price_drop':
        return <TrendingDown className="h-4 w-4" />;
      case 'review_response':
        return <Star className="h-4 w-4" />;
      case 'payment_status':
        return <CreditCard className="h-4 w-4" />;
      case 'delivery_update':
        return <Truck className="h-4 w-4" />;
      case 'system':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order_update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'new_offer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'price_drop':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'review_response':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'payment_status':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'delivery_update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;

    return format(date, 'd MMM', { locale: fr });
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
    onClose?.();
  };

  return (
    <Card
      className={`
        relative cursor-pointer transition-all hover:shadow-md
        ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
      `}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Priority Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg">
          <div className={`w-full h-full rounded-l-lg ${getPriorityColor(notification.priority)}`} />
        </div>

        <div className="flex items-start space-x-3 ml-2">
          {/* Icon */}
          <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h4 className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimeAgo(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAsRead}
                    disabled={loading}
                    className="h-6 w-6 p-0"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <p className={`text-sm ${!notification.is_read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
              {notification.message}
            </p>

            {/* Type Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-xs ${getNotificationColor(notification.type)}`}>
                {getTypeLabel(notification.type)}
              </Badge>

              {notification.action_url && (
                <ExternalLink className="h-3 w-3 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const getTypeLabel = (type: Notification['type']) => {
  switch (type) {
    case 'order_update':
      return 'Commande';
    case 'new_offer':
      return 'Nouvelle offre';
    case 'price_drop':
      return 'Baisse de prix';
    case 'review_response':
      return 'Réponse avis';
    case 'payment_status':
      return 'Paiement';
    case 'delivery_update':
      return 'Livraison';
    case 'system':
      return 'Système';
    default:
      return 'Notification';
  }
};