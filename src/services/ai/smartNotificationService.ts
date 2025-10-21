/**
 * Smart Notification Service
 * Provides intelligent notification prioritization and delivery
 */

import { AIBaseService } from './aiBaseService';

export interface SmartNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  category: 'inventory' | 'sales' | 'orders' | 'payments' | 'system' | 'marketing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
  createdAt: Date;
  expiresAt?: Date;
  read: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: string;
  enabledChannels: Array<'push' | 'email' | 'sms' | 'inapp'>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categoryPreferences: Record<string, {
    enabled: boolean;
    minPriority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  frequency: 'realtime' | 'batched' | 'daily';
  language: 'fr' | 'en';
}

export interface NotificationSchedule {
  optimalTime: Date;
  reason: string;
  confidence: number;
}

export class SmartNotificationService extends AIBaseService {
  private static instance: SmartNotificationService;
  private notifications: Map<string, SmartNotification[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private userActivity: Map<string, number[]> = new Map();

  static getInstance(): SmartNotificationService {
    if (!SmartNotificationService.instance) {
      SmartNotificationService.instance = new SmartNotificationService({
        modelName: 'smart-notification',
        version: '2.0.0',
        threshold: 0.65
      });
    }
    return SmartNotificationService.instance;
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: SmartNotification['type'],
    category: SmartNotification['category'],
    metadata?: Record<string, unknown>
  ): Promise<SmartNotification> {
    await this.delay(100);

    const priority = this.calculatePriority(type, category, message, metadata);
    const actionable = this.determineActionability(category, metadata);

    const actions = actionable ? this.generateActions(category, metadata) : undefined;

    const notification: SmartNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      message,
      type,
      category,
      priority,
      actionable,
      actions,
      createdAt: new Date(),
      read: false,
      dismissed: false,
      metadata
    };

    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    this.notifications.get(userId)!.push(notification);

    await this.scheduleDelivery(notification);

    return notification;
  }

  async prioritizeNotifications(userId: string): Promise<SmartNotification[]> {
    await this.delay(200);

    const userNotifications = this.notifications.get(userId) || [];
    const unreadNotifications = userNotifications.filter(n => !n.read && !n.dismissed);

    const preferences = this.getPreferences(userId);
    const userActivityPattern = this.getUserActivityPattern(userId);

    const scoredNotifications = unreadNotifications.map(notification => {
      const urgencyScore = this.calculateUrgencyScore(notification);
      const relevanceScore = this.calculateRelevanceScore(notification, preferences);
      const timeliness Score = this.calculateTimelinessScore(notification, userActivityPattern);

      const finalScore = urgencyScore * 0.5 + relevanceScore * 0.3 + timelinessScore * 0.2;

      return {
        notification,
        score: finalScore
      };
    });

    scoredNotifications.sort((a, b) => b.score - a.score);

    return scoredNotifications.map(item => item.notification);
  }

  async groupNotifications(
    userId: string
  ): Promise<Array<{
    category: string;
    notifications: SmartNotification[];
    summary: string;
    totalCount: number;
  }>> {
    await this.delay(150);

    const userNotifications = this.notifications.get(userId) || [];
    const unreadNotifications = userNotifications.filter(n => !n.read && !n.dismissed);

    const grouped = new Map<string, SmartNotification[]>();

    for (const notification of unreadNotifications) {
      if (!grouped.has(notification.category)) {
        grouped.set(notification.category, []);
      }
      grouped.get(notification.category)!.push(notification);
    }

    const result: Array<{
      category: string;
      notifications: SmartNotification[];
      summary: string;
      totalCount: number;
    }> = [];

    for (const [category, notifications] of grouped.entries()) {
      const summary = this.generateCategorySummary(category, notifications);

      result.push({
        category,
        notifications: notifications.slice(0, 5),
        summary,
        totalCount: notifications.length
      });
    }

    result.sort((a, b) => b.totalCount - a.totalCount);

    return result;
  }

  async getOptimalDeliveryTime(
    userId: string,
    notification: Omit<SmartNotification, 'id' | 'createdAt' | 'read' | 'dismissed'>
  ): Promise<NotificationSchedule> {
    await this.delay(200);

    const preferences = this.getPreferences(userId);
    const activityPattern = this.getUserActivityPattern(userId);

    if (notification.priority === 'critical') {
      return {
        optimalTime: new Date(),
        reason: 'Notification critique - livraison immédiate',
        confidence: 1.0
      };
    }

    const currentHour = new Date().getHours();

    if (preferences.quietHours.enabled) {
      const quietStart = parseInt(preferences.quietHours.start.split(':')[0]);
      const quietEnd = parseInt(preferences.quietHours.end.split(':')[0]);

      if (currentHour >= quietStart || currentHour < quietEnd) {
        const optimalTime = new Date();
        optimalTime.setHours(quietEnd, 0, 0, 0);

        return {
          optimalTime,
          reason: 'Respecte vos heures de tranquillité',
          confidence: 0.9
        };
      }
    }

    const peakActivityHours = this.findPeakActivityHours(activityPattern);
    const nextPeakHour = peakActivityHours.find(h => h > currentHour) || peakActivityHours[0];

    const optimalTime = new Date();
    if (nextPeakHour < currentHour) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }
    optimalTime.setHours(nextPeakHour, 0, 0, 0);

    return {
      optimalTime,
      reason: 'Correspond à vos heures d\'activité habituelles',
      confidence: 0.75
    };
  }

  async suggestNotificationActions(
    notification: SmartNotification
  ): Promise<Array<{
    label: string;
    action: string;
    impact: string;
    confidence: number;
  }>> {
    await this.delay(150);

    const suggestions: Array<{
      label: string;
      action: string;
      impact: string;
      confidence: number;
    }> = [];

    switch (notification.category) {
      case 'inventory':
        if (notification.metadata?.stockLevel === 'low') {
          suggestions.push({
            label: 'Commander maintenant',
            action: 'reorder_product',
            impact: 'Évite une rupture de stock',
            confidence: 0.9
          });
          suggestions.push({
            label: 'Voir les alternatives',
            action: 'view_alternatives',
            impact: 'Trouve des produits similaires',
            confidence: 0.7
          });
        }
        break;

      case 'orders':
        suggestions.push({
          label: 'Voir la commande',
          action: 'view_order',
          impact: 'Accède aux détails',
          confidence: 1.0
        });
        suggestions.push({
          label: 'Contacter le client',
          action: 'contact_customer',
          impact: 'Communication directe',
          confidence: 0.8
        });
        break;

      case 'payments':
        suggestions.push({
          label: 'Vérifier le paiement',
          action: 'verify_payment',
          impact: 'Confirme la transaction',
          confidence: 0.95
        });
        break;
    }

    return suggestions;
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    await this.delay(100);

    const currentPreferences = this.getPreferences(userId);
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };

    this.preferences.set(userId, updatedPreferences);

    return updatedPreferences;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      userNotifications.forEach(n => {
        n.read = true;
      });
    }
  }

  async dismissNotification(userId: string, notificationId: string): Promise<void> {
    const userNotifications = this.notifications.get(userId);
    if (userNotifications) {
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.dismissed = true;
      }
    }
  }

  recordUserActivity(userId: string): void {
    const currentHour = new Date().getHours();

    if (!this.userActivity.has(userId)) {
      this.userActivity.set(userId, Array(24).fill(0));
    }

    const activity = this.userActivity.get(userId)!;
    activity[currentHour]++;
  }

  private calculatePriority(
    type: SmartNotification['type'],
    category: SmartNotification['category'],
    message: string,
    metadata?: Record<string, unknown>
  ): SmartNotification['priority'] {
    if (type === 'error' || type === 'urgent') {
      return 'critical';
    }

    if (type === 'warning') {
      return 'high';
    }

    if (category === 'payments' || category === 'orders') {
      return 'high';
    }

    if (category === 'inventory' && metadata?.stockLevel === 'critical') {
      return 'critical';
    }

    if (category === 'marketing') {
      return 'low';
    }

    return 'medium';
  }

  private determineActionability(
    category: SmartNotification['category'],
    metadata?: Record<string, unknown>
  ): boolean {
    const actionableCategories = ['inventory', 'orders', 'payments'];
    return actionableCategories.includes(category);
  }

  private generateActions(
    category: SmartNotification['category'],
    metadata?: Record<string, unknown>
  ): Array<{ label: string; action: string; primary?: boolean }> {
    const actions: Array<{ label: string; action: string; primary?: boolean }> = [];

    switch (category) {
      case 'inventory':
        actions.push(
          { label: 'Commander', action: 'reorder', primary: true },
          { label: 'Voir détails', action: 'view_details' }
        );
        break;

      case 'orders':
        actions.push(
          { label: 'Voir commande', action: 'view_order', primary: true },
          { label: 'Contacter', action: 'contact' }
        );
        break;

      case 'payments':
        actions.push(
          { label: 'Vérifier', action: 'verify_payment', primary: true }
        );
        break;
    }

    return actions;
  }

  private async scheduleDelivery(notification: SmartNotification): Promise<void> {
    await this.delay(50);
  }

  private calculateUrgencyScore(notification: SmartNotification): number {
    const priorityScores = {
      critical: 1.0,
      high: 0.75,
      medium: 0.5,
      low: 0.25
    };

    let score = priorityScores[notification.priority];

    const age = Date.now() - notification.createdAt.getTime();
    const ageHours = age / (1000 * 60 * 60);

    if (ageHours > 24) {
      score *= 0.5;
    } else if (ageHours > 12) {
      score *= 0.75;
    }

    return score;
  }

  private calculateRelevanceScore(
    notification: SmartNotification,
    preferences: NotificationPreferences
  ): number {
    const categoryPref = preferences.categoryPreferences[notification.category];

    if (!categoryPref || !categoryPref.enabled) {
      return 0.1;
    }

    const priorityLevels = ['low', 'medium', 'high', 'critical'];
    const notificationPriorityIndex = priorityLevels.indexOf(notification.priority);
    const minPriorityIndex = priorityLevels.indexOf(categoryPref.minPriority);

    if (notificationPriorityIndex < minPriorityIndex) {
      return 0.3;
    }

    return 1.0;
  }

  private calculateTimelinessScore(
    notification: SmartNotification,
    activityPattern: number[]
  ): number {
    const currentHour = new Date().getHours();
    const activityAtCurrentHour = activityPattern[currentHour];
    const maxActivity = Math.max(...activityPattern);

    if (maxActivity === 0) {
      return 0.5;
    }

    return activityAtCurrentHour / maxActivity;
  }

  private getPreferences(userId: string): NotificationPreferences {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, {
        userId,
        enabledChannels: ['push', 'inapp'],
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '07:00'
        },
        categoryPreferences: {
          inventory: { enabled: true, minPriority: 'medium' },
          sales: { enabled: true, minPriority: 'low' },
          orders: { enabled: true, minPriority: 'medium' },
          payments: { enabled: true, minPriority: 'high' },
          system: { enabled: true, minPriority: 'medium' },
          marketing: { enabled: false, minPriority: 'low' }
        },
        frequency: 'realtime',
        language: 'fr'
      });
    }

    return this.preferences.get(userId)!;
  }

  private getUserActivityPattern(userId: string): number[] {
    if (!this.userActivity.has(userId)) {
      const defaultPattern = Array(24).fill(0);

      for (let i = 8; i < 12; i++) defaultPattern[i] = 10;
      for (let i = 14; i < 18; i++) defaultPattern[i] = 12;
      for (let i = 19; i < 21; i++) defaultPattern[i] = 8;

      return defaultPattern;
    }

    return this.userActivity.get(userId)!;
  }

  private findPeakActivityHours(activityPattern: number[]): number[] {
    const maxActivity = Math.max(...activityPattern);
    const threshold = maxActivity * 0.8;

    return activityPattern
      .map((activity, hour) => ({ activity, hour }))
      .filter(item => item.activity >= threshold)
      .map(item => item.hour);
  }

  private generateCategorySummary(category: string, notifications: SmartNotification[]): string {
    const categoryNames: Record<string, string> = {
      inventory: 'Inventaire',
      sales: 'Ventes',
      orders: 'Commandes',
      payments: 'Paiements',
      system: 'Système',
      marketing: 'Marketing'
    };

    const categoryName = categoryNames[category] || category;
    const count = notifications.length;

    if (count === 1) {
      return notifications[0].title;
    }

    const criticalCount = notifications.filter(n => n.priority === 'critical').length;
    if (criticalCount > 0) {
      return `${criticalCount} notification(s) critique(s) dans ${categoryName}`;
    }

    return `${count} nouvelles notifications dans ${categoryName}`;
  }
}

export const smartNotificationService = SmartNotificationService.getInstance();
