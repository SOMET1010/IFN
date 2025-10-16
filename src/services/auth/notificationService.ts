export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'auth' | 'security' | 'system' | 'user' | 'business';
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

export interface NotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
  callback?: () => void;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    types: ('auth' | 'security' | 'system' | 'user' | 'business')[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  push: {
    enabled: boolean;
    types: ('auth' | 'security' | 'system' | 'user' | 'business')[];
    quietHours: {
      enabled: boolean;
      start: string; // HH:mm format
      end: string;   // HH:mm format
    };
  };
  sms: {
    enabled: boolean;
    types: ('auth' | 'security')[];
  };
  inApp: {
    enabled: boolean;
    maxUnread: number;
  };
}

export class NotificationService {
  private static readonly NOTIFICATIONS_KEY = 'user_notifications';
  private static readonly PREFERENCES_KEY = 'notification_preferences';
  private static readonly MAX_NOTIFICATIONS = 1000;
  private static listeners: Map<string, (notifications: NotificationData[]) => void> = new Map();

  // Get user notifications
  static getUserNotifications(userId: string, limit = 50): NotificationData[] {
    try {
      const stored = localStorage.getItem(`${this.NOTIFICATIONS_KEY}_${userId}`);
      const notifications = stored ? JSON.parse(stored) : [];

      // Sort by timestamp (newest first)
      const sorted = notifications.sort((a: NotificationData, b: NotificationData) => b.timestamp - a.timestamp);

      return sorted.slice(0, limit);
    } catch {
      return [];
    }
  }

  // Get unread notifications
  static getUnreadNotifications(userId: string): NotificationData[] {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.isRead);
  }

  // Add notification
  static addNotification(
    userId: string,
    notification: Omit<NotificationData, 'id' | 'timestamp' | 'isRead'>
  ): NotificationData {
    const newNotification: NotificationData = {
      ...notification,
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      isRead: false
    };

    const notifications = this.getUserNotifications(userId, this.MAX_NOTIFICATIONS);
    notifications.unshift(newNotification);

    // Limit total notifications
    if (notifications.length > this.MAX_NOTIFICATIONS) {
      notifications.splice(this.MAX_NOTIFICATIONS);
    }

    localStorage.setItem(`${this.NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));

    // Trigger listeners
    this.notifyListeners(userId);

    return newNotification;
  }

  // Mark notification as read
  static markAsRead(userId: string, notificationId: string): boolean {
    const notifications = this.getUserNotifications(userId);
    const notification = notifications.find(n => n.id === notificationId);

    if (notification && !notification.isRead) {
      notification.isRead = true;
      localStorage.setItem(`${this.NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
      this.notifyListeners(userId);
      return true;
    }

    return false;
  }

  // Mark all notifications as read
  static markAllAsRead(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    let markedCount = 0;

    notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        markedCount++;
      }
    });

    if (markedCount > 0) {
      localStorage.setItem(`${this.NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
      this.notifyListeners(userId);
    }

    return markedCount;
  }

  // Delete notification
  static deleteNotification(userId: string, notificationId: string): boolean {
    const notifications = this.getUserNotifications(userId);
    const index = notifications.findIndex(n => n.id === notificationId);

    if (index > -1) {
      notifications.splice(index, 1);
      localStorage.setItem(`${this.NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(notifications));
      this.notifyListeners(userId);
      return true;
    }

    return false;
  }

  // Clear all notifications
  static clearAllNotifications(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    const count = notifications.length;

    if (count > 0) {
      localStorage.removeItem(`${this.NOTIFICATIONS_KEY}_${userId}`);
      this.notifyListeners(userId);
    }

    return count;
  }

  // Get notification preferences
  static getNotificationPreferences(userId: string): NotificationPreferences {
    try {
      const stored = localStorage.getItem(`${this.PREFERENCES_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : this.getDefaultPreferences();
    } catch {
      return this.getDefaultPreferences();
    }
  }

  // Update notification preferences
  static updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): NotificationPreferences {
    const current = this.getNotificationPreferences(userId);
    const updated = { ...current, ...preferences };

    localStorage.setItem(`${this.PREFERENCES_KEY}_${userId}`, JSON.stringify(updated));
    return updated;
  }

  // Auth-related notifications
  static notifyLoginSuccess(userId: string, deviceInfo?: string): void {
    this.addNotification(userId, {
      type: 'success',
      title: 'Connexion réussie',
      message: deviceInfo
        ? `Vous vous êtes connecté depuis ${deviceInfo}`
        : 'Vous vous êtes connecté avec succès',
      priority: 'medium',
      category: 'auth'
    });
  }

  static notifyLoginFailed(userId: string, reason: string): void {
    this.addNotification(userId, {
      type: 'warning',
      title: 'Échec de connexion',
      message: `Une tentative de connexion a échoué: ${reason}`,
      priority: 'high',
      category: 'security'
    });
  }

  static notifyNewDeviceLogin(userId: string, deviceInfo: string, location?: string): void {
    this.addNotification(userId, {
      type: 'warning',
      title: 'Nouvel appareil détecté',
      message: `Connexion depuis un nouvel appareil: ${deviceInfo}${location ? ` à ${location}` : ''}`,
      priority: 'high',
      category: 'security',
      actions: [
        {
          label: 'Ce n\'est pas moi',
          action: 'secure_account',
          style: 'danger'
        },
        {
          label: 'Reconnaître',
          action: 'recognize_device',
          style: 'primary'
        }
      ]
    });
  }

  static notifyPasswordChanged(userId: string): void {
    this.addNotification(userId, {
      type: 'info',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe a été changé avec succès',
      priority: 'medium',
      category: 'security'
    });
  }

  static notifyAccountLocked(userId: string): void {
    this.addNotification(userId, {
      type: 'error',
      title: 'Compte verrouillé',
      message: 'Votre compte a été temporairement verrouillé pour des raisons de sécurité',
      priority: 'urgent',
      category: 'security',
      actions: [
        {
          label: 'Déverrouiller',
          action: 'unlock_account',
          style: 'primary'
        }
      ]
    });
  }

  static notifyEmailVerified(userId: string): void {
    this.addNotification(userId, {
      type: 'success',
      title: 'Email vérifié',
      message: 'Votre adresse email a été vérifiée avec succès',
      priority: 'medium',
      category: 'auth'
    });
  }

  static notifySessionExpiring(userId: string, minutesLeft: number): void {
    this.addNotification(userId, {
      type: 'warning',
      title: 'Session expirant bientôt',
      message: `Votre session expirera dans ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
      priority: 'medium',
      category: 'auth',
      actions: [
        {
          label: 'Prolonger',
          action: 'extend_session',
          style: 'primary'
        }
      ]
    });
  }

  // Security-related notifications
  static notifySuspiciousActivity(userId: string, activity: string): void {
    this.addNotification(userId, {
      type: 'error',
      title: 'Activité suspecte détectée',
      message: `Activité suspecte détectée: ${activity}`,
      priority: 'urgent',
      category: 'security',
      actions: [
        {
          label: 'Vérifier',
          action: 'check_activity',
          style: 'primary'
        },
        {
          label: 'Sécuriser',
          action: 'secure_account',
          style: 'danger'
        }
      ]
    });
  }

  // Business-related notifications
  static notifyNewOrder(userId: string, orderInfo: string): void {
    this.addNotification(userId, {
      type: 'success',
      title: 'Nouvelle commande',
      message: `Vous avez reçu une nouvelle commande: ${orderInfo}`,
      priority: 'high',
      category: 'business',
      actions: [
        {
          label: 'Voir détails',
          action: 'view_order',
          style: 'primary'
        }
      ]
    });
  }

  static notifyPaymentReceived(userId: string, amount: string): void {
    this.addNotification(userId, {
      type: 'success',
      title: 'Paiement reçu',
      message: `Vous avez reçu un paiement de ${amount}`,
      priority: 'medium',
      category: 'business'
    });
  }

  // System notifications
  static notifySystemUpdate(userId: string, updateInfo: string): void {
    this.addNotification(userId, {
      type: 'info',
      title: 'Mise à jour système',
      message: `Le système sera mis à jour: ${updateInfo}`,
      priority: 'low',
      category: 'system'
    });
  }

  static notifyMaintenance(userId: string, maintenanceInfo: string): void {
    this.addNotification(userId, {
      type: 'warning',
      title: 'Maintenance prévue',
      message: `Maintenance système prévue: ${maintenanceInfo}`,
      priority: 'medium',
      category: 'system'
    });
  }

  // Listener management
  static addNotificationListener(
    userId: string,
    callback: (notifications: NotificationData[]) => void
  ): () => void {
    const listenerId = this.generateListenerId();
    this.listeners.set(`${userId}_${listenerId}`, callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(`${userId}_${listenerId}`);
    };
  }

  private static notifyListeners(userId: string): void {
    const notifications = this.getUserNotifications(userId);

    for (const [key, callback] of this.listeners) {
      if (key.startsWith(`${userId}_`)) {
        callback(notifications);
      }
    }
  }

  // Helper methods
  private static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateListenerId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private static getDefaultPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: true,
        types: ['security', 'business'],
        frequency: 'immediate'
      },
      push: {
        enabled: true,
        types: ['security', 'business'],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      },
      sms: {
        enabled: false,
        types: ['security']
      },
      inApp: {
        enabled: true,
        maxUnread: 50
      }
    };
  }

  // Notification filtering
  static getNotificationsByCategory(userId: string, category: NotificationData['category']): NotificationData[] {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => n.category === category);
  }

  static getNotificationsByPriority(userId: string, priority: NotificationData['priority']): NotificationData[] {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => n.priority === priority);
  }

  static getUnreadCount(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    return notifications.filter(n => !n.isRead).length;
  }

  // Cleanup old notifications
  static cleanupOldNotifications(userId: string, daysToKeep = 30): number {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const notifications = this.getUserNotifications(userId);

    const initialCount = notifications.length;
    const filtered = notifications.filter(n => n.timestamp > cutoffDate);

    if (filtered.length < initialCount) {
      localStorage.setItem(`${this.NOTIFICATIONS_KEY}_${userId}`, JSON.stringify(filtered));
      this.notifyListeners(userId);
    }

    return initialCount - filtered.length;
  }

  // Export notifications
  static exportNotifications(userId: string): string {
    const notifications = this.getUserNotifications(userId);
    return JSON.stringify(notifications, null, 2);
  }
}