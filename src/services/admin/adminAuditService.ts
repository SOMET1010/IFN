import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  status: 'success' | 'failed' | 'warning';
  details?: string;
}

export interface AuditFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  status?: 'success' | 'failed' | 'warning';
  date_from?: string;
  date_to?: string;
  ip_address?: string;
}

export interface AuditStats {
  total_events: number;
  success_events: number;
  failed_events: number;
  warning_events: number;
  events_by_action: Record<string, number>;
  events_by_user: Record<string, number>;
  events_by_resource: Record<string, number>;
  recent_events: AuditLog[];
}

export class AdminAuditService extends BaseService<AuditLog> {
  constructor() {
    super('/admin/audit', 'admin_audit_logs');
  }

  async getAuditLogs(filters?: AuditFilters): Promise<ApiResponse<AuditLog[]>> {
    const allLogs = await this.getAll();
    if (!allLogs.success || !allLogs.data) {
      return allLogs;
    }

    let filteredLogs = allLogs.data;

    if (filters) {
      if (filters.user_id) {
        filteredLogs = filteredLogs.filter(log => log.user_id === filters.user_id);
      }
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action.toLowerCase().includes(filters.action!.toLowerCase()));
      }
      if (filters.resource_type) {
        filteredLogs = filteredLogs.filter(log => log.resource_type === filters.resource_type);
      }
      if (filters.status) {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status);
      }
      if (filters.date_from) {
        const fromDate = new Date(filters.date_from);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
      }
      if (filters.date_to) {
        const toDate = new Date(filters.date_to);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
      }
      if (filters.ip_address) {
        filteredLogs = filteredLogs.filter(log => log.ip_address.includes(filters.ip_address!));
      }
    }

    return { success: true, data: filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
  }

  async getAuditStats(dateRange?: { from: string; to: string }): Promise<ApiResponse<AuditStats>> {
    const logsResponse = await this.getAuditLogs(dateRange);
    if (!logsResponse.success || !logsResponse.data) {
      return { success: false, error: 'Impossible de récupérer les statistiques d\'audit' };
    }

    const logs = logsResponse.data;
    const stats: AuditStats = {
      total_events: logs.length,
      success_events: logs.filter(log => log.status === 'success').length,
      failed_events: logs.filter(log => log.status === 'failed').length,
      warning_events: logs.filter(log => log.status === 'warning').length,
      events_by_action: {},
      events_by_user: {},
      events_by_resource: {},
      recent_events: logs.slice(0, 10)
    };

    logs.forEach(log => {
      stats.events_by_action[log.action] = (stats.events_by_action[log.action] || 0) + 1;
      stats.events_by_user[log.user_email] = (stats.events_by_user[log.user_email] || 0) + 1;
      stats.events_by_resource[log.resource_type] = (stats.events_by_resource[log.resource_type] || 0) + 1;
    });

    return { success: true, data: stats };
  }

  async logAction(action: {
    user_id: string;
    user_email: string;
    user_role: string;
    action: string;
    resource_type: string;
    resource_id: string;
    old_values?: Record<string, any>;
    new_values?: Record<string, any>;
    status: 'success' | 'failed' | 'warning';
    details?: string;
  }): Promise<ApiResponse<AuditLog>> {
    const auditLog: Omit<AuditLog, 'id' | 'timestamp'> = {
      ...action,
      ip_address: this.getClientIP(),
      user_agent: navigator.userAgent
    };

    return this.create(auditLog);
  }

  async exportAuditLogs(filters?: AuditFilters, format: 'csv' | 'json' | 'excel' = 'csv'): Promise<ApiResponse<string>> {
    const logsResponse = await this.getAuditLogs(filters);
    if (!logsResponse.success || !logsResponse.data) {
      return { success: false, error: 'Impossible d\'exporter les logs d\'audit' };
    }

    try {
      let content: string;

      if (format === 'json') {
        content = JSON.stringify(logsResponse.data, null, 2);
      } else if (format === 'csv') {
        const headers = ['ID', 'Utilisateur', 'Action', 'Ressource', 'Statut', 'Date', 'IP'];
        const rows = logsResponse.data.map(log => [
          log.id,
          log.user_email,
          log.action,
          `${log.resource_type}:${log.resource_id}`,
          log.status,
          log.timestamp,
          log.ip_address
        ]);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
      } else {
        content = JSON.stringify(logsResponse.data, null, 2);
      }

      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'export' };
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<ApiResponse<AuditLog[]>> {
    const logsResponse = await this.getAuditLogs({ user_id: userId });
    if (!logsResponse.success || !logsResponse.data) {
      return logsResponse;
    }

    return { success: true, data: logsResponse.data.slice(0, limit) };
  }

  async getSecurityEvents(severity?: 'high' | 'medium' | 'low'): Promise<ApiResponse<AuditLog[]>> {
    const allLogs = await this.getAll();
    if (!allLogs.success || !allLogs.data) {
      return allLogs;
    }

    const securityActions = [
      'login_failed', 'login_success', 'password_change', 'permission_change',
      'user_deleted', 'user_suspended', 'api_key_generated', 'security_settings_changed'
    ];

    let securityLogs = allLogs.data.filter(log =>
      securityActions.includes(log.action) && log.status !== 'success'
    );

    if (severity) {
      securityLogs = securityLogs.filter(log => {
        if (severity === 'high') return ['user_deleted', 'permission_change', 'api_key_generated'].includes(log.action);
        if (severity === 'medium') return ['user_suspended', 'password_change'].includes(log.action);
        return true;
      });
    }

    return { success: true, data: securityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) };
  }

  private getClientIP(): string {
    return localStorage.getItem('client_ip') || '127.0.0.1';
  }
}

export const adminAuditService = new AdminAuditService();