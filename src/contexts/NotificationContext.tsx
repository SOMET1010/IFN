import * as React from 'react';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order_update' | 'new_offer' | 'price_drop' | 'review_response' | 'payment_status' | 'delivery_update' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  created_at: string;
  read_at?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getUnreadNotifications: () => Notification[];
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);

  const generateMockNotifications = (): Notification[] => {
    const now = new Date();
    const approxDeliveryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: '1',
        user_id: 'default-user',
        title: 'Nouvelle offre disponible',
        message: 'Kouadio Amani vient de proposer de nouvelles mangues fraîches',
        type: 'new_offer',
        priority: 'medium',
        is_read: false,
        created_at: now.toISOString(),
        action_url: '/marketplace',
        metadata: {
          producer_id: 'producer1',
          product_id: 'product1',
          category: 'fruits'
        }
      },
      {
        id: '2',
        user_id: 'default-user',
        title: 'Mise à jour de commande',
        message: 'Votre commande #CMD-2024-001 est en préparation',
        type: 'order_update',
        priority: 'high',
        is_read: false,
        created_at: yesterday.toISOString(),
        action_url: '/user/orders/CMD-2024-001',
        metadata: {
          order_id: 'CMD-2024-001',
          status: 'preparing'
        }
      },
      {
        id: '3',
        user_id: 'default-user',
        title: 'Baisse de prix',
        message: 'Les tomates de Fatou Traoré sont maintenant à 1500 FCFA/kg',
        type: 'price_drop',
        priority: 'low',
        is_read: true,
        created_at: twoDaysAgo.toISOString(),
        read_at: twoDaysAgo.toISOString(),
        action_url: '/marketplace',
        metadata: {
          product_id: 'product4',
          old_price: 1800,
          new_price: 1500,
          percentage_drop: 16.7
        }
      },
      {
        id: '4',
        user_id: 'default-user',
        title: 'Réponse à votre avis',
        message: 'Kouadio Amani a répondu à votre avis sur les mangues',
        type: 'review_response',
        priority: 'medium',
        is_read: true,
        created_at: weekAgo.toISOString(),
        read_at: weekAgo.toISOString(),
        action_url: '/marketplace/product/1#reviews',
        metadata: {
          review_id: 'review1',
          product_id: '1',
          responder_name: 'Kouadio Amani'
        }
      },
      {
        id: '5',
        user_id: 'default-user',
        title: 'Paiement confirmé',
        message: 'Votre paiement pour la commande #CMD-2024-001 a été confirmé',
        type: 'payment_status',
        priority: 'high',
        is_read: false,
        created_at: now.toISOString(),
        action_url: '/user/orders/CMD-2024-001',
        metadata: {
          order_id: 'CMD-2024-001',
          payment_method: 'mobile_money',
          amount: 12500
        }
      },
      {
        id: '6',
        user_id: 'default-user',
        title: 'Mise à jour de livraison',
        message: 'Votre commande #CMD-2024-001 est en route pour Abidjan',
        type: 'delivery_update',
        priority: 'medium',
        is_read: false,
        created_at: yesterday.toISOString(),
        action_url: '/user/orders/CMD-2024-001',
        metadata: {
          order_id: 'CMD-2024-001',
          delivery_status: 'in_transit',
          estimated_delivery: approxDeliveryDate.toISOString()
        }
      }
    ];
  };

  // Load notifications from localStorage on mount
  React.useEffect(() => {
    const savedNotifications = localStorage.getItem('userNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(generateMockNotifications());
    }
  }, []);

  // Save to localStorage whenever notifications change
  React.useEffect(() => {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const markAsRead = async (notificationId: string) => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setNotifications(prev => prev.map(notification =>
      notification.id === notificationId
        ? { ...notification, is_read: true, read_at: new Date().toISOString() }
        : notification
    ));

    setLoading(false);
  };

  const markAllAsRead = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    setNotifications(prev => prev.map(notification =>
      !notification.is_read
        ? { ...notification, is_read: true, read_at: new Date().toISOString() }
        : notification
    ));

    setLoading(false);
  };

  const deleteNotification = async (notificationId: string) => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));

    setLoading(false);
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'created_at' | 'is_read'>) => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));

    const newNotification: Notification = {
      ...notificationData,
      id: 'notification-' + Date.now(),
      created_at: new Date().toISOString(),
      is_read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    setLoading(false);
  };

  const clearAllNotifications = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    setNotifications([]);

    setLoading(false);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.is_read);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      clearAllNotifications,
      getNotificationsByType,
      getUnreadNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
