import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  subject: string;
  content: string;
  variables: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationQueue {
  id: string;
  template_id: string;
  recipient: string;
  data: Record<string, any>;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduled_at?: string;
  sent_at?: string;
  delivered_at?: string;
  failed_reason?: string;
  created_at: string;
}

export interface UserNotificationSettings {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  notification_types: string[];
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  delivery_rate: number;
  average_delivery_time: number;
  notifications_by_type: Record<string, number>;
  notifications_by_status: Record<string, number>;
  recent_notifications: NotificationQueue[];
}

export class AdminNotificationService extends BaseService<NotificationTemplate> {
  constructor() {
    super('/admin/notifications', 'admin_notification_templates');
  }

  async getTemplates(): Promise<ApiResponse<NotificationTemplate[]>> {
    return this.getAll();
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<NotificationTemplate>> {
    return this.create(template);
  }

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<ApiResponse<NotificationTemplate | undefined>> {
    return this.update(id, updates);
  }

  async deleteTemplate(id: string): Promise<ApiResponse<boolean>> {
    return this.delete(id);
  }

  async getNotificationQueue(filters?: {
    status?: string;
    type?: string;
    priority?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<NotificationQueue[]>> {
    const allQueue = await this.apiRequest<NotificationQueue[]>('/queue');
    if (!allQueue.success || !allQueue.data) {
      return allQueue;
    }

    let filteredQueue = allQueue.data;

    if (filters) {
      if (filters.status) {
        filteredQueue = filteredQueue.filter(item => item.status === filters.status);
      }
      if (filters.priority) {
        filteredQueue = filteredQueue.filter(item => item.priority === filters.priority);
      }
      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        filteredQueue = filteredQueue.filter(item => new Date(item.created_at) >= fromDate);
      }
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        filteredQueue = filteredQueue.filter(item => new Date(item.created_at) <= toDate);
      }
    }

    return { success: true, data: filteredQueue.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) };
  }

  async sendNotification(data: {
    template_id: string;
    recipient: string;
    variables?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    scheduled_at?: string;
  }): Promise<ApiResponse<NotificationQueue>> {
    return this.apiRequest<NotificationQueue>('/queue', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async sendBulkNotification(data: {
    template_id: string;
    recipients: string[];
    variables?: Record<string, any>;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    return this.apiRequest('/queue/bulk', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async cancelNotification(notificationId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/queue/${notificationId}/cancel`, {
      method: 'POST'
    });
  }

  async retryFailedNotifications(): Promise<ApiResponse<{ success: number; failed: number }>> {
    return this.apiRequest('/queue/retry-failed', {
      method: 'POST'
    });
  }

  async getUserNotificationSettings(userId: string): Promise<ApiResponse<UserNotificationSettings>> {
    return this.apiRequest<UserNotificationSettings>(`/settings/${userId}`);
  }

  async updateUserNotificationSettings(userId: string, settings: Partial<UserNotificationSettings>): Promise<ApiResponse<UserNotificationSettings>> {
    return this.apiRequest<UserNotificationSettings>(`/settings/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  async getNotificationStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<NotificationStats>> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.apiRequest<NotificationStats>(`/stats?${params.toString()}`);
  }

  async testTemplate(templateId: string, testData: Record<string, any>): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.apiRequest(`/templates/${templateId}/test`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  async getNotificationHistory(userId?: string, limit: number = 50): Promise<ApiResponse<NotificationQueue[]>> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit.toString());

    return this.apiRequest<NotificationQueue[]>(`/history?${params.toString()}`);
  }

  async exportNotificationData(format: 'csv' | 'json' = 'csv', dateRange?: { from: string; to: string }): Promise<ApiResponse<string>> {
    const params = new URLSearchParams();
    if (format) params.append('format', format);
    if (dateRange) {
      params.append('from', dateRange.from);
      params.append('to', dateRange.to);
    }

    return this.apiRequest<string>(`/export?${params.toString()}`);
  }
}

export const adminNotificationService = new AdminNotificationService();