import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  threshold?: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface SystemHealth {
  overall_status: 'healthy' | 'warning' | 'critical';
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  database_connections: number;
  active_users: number;
  response_time: number;
  uptime: string;
  last_check: string;
  services: {
    api: boolean;
    database: boolean;
    cache: boolean;
    storage: boolean;
    email: boolean;
  };
}

export interface SystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'database' | 'api' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export interface SystemBackup {
  id: string;
  name: string;
  size: number;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'running' | 'failed' | 'scheduled';
  created_at: string;
  completed_at?: string;
  file_path?: string;
  retention_days: number;
}

export class AdminSystemService extends BaseService<SystemMetric> {
  constructor() {
    super('/admin/system', 'admin_system_metrics');
  }

  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return this.apiRequest<SystemHealth>('/health');
  }

  async getSystemMetrics(type?: string, hours: number = 24): Promise<ApiResponse<SystemMetric[]>> {
    const allMetrics = await this.getAll();
    if (!allMetrics.success || !allMetrics.data) {
      return allMetrics;
    }

    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    let filteredMetrics = allMetrics.data.filter(metric =>
      new Date(metric.timestamp) >= cutoffTime
    );

    if (type) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === type);
    }

    return { success: true, data: filteredMetrics };
  }

  async getSystemAlerts(resolved: boolean = false): Promise<ApiResponse<SystemAlert[]>> {
    return this.apiRequest<SystemAlert[]>(`/alerts?resolved=${resolved}`);
  }

  async createSystemAlert(alert: Omit<SystemAlert, 'id' | 'timestamp'>): Promise<ApiResponse<SystemAlert>> {
    return this.apiRequest<SystemAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  }

  async resolveAlert(alertId: string, resolvedBy: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolved_by: resolvedBy })
    });
  }

  async getBackups(): Promise<ApiResponse<SystemBackup[]>> {
    return this.apiRequest<SystemBackup[]>('/backups');
  }

  async createBackup(type: 'full' | 'incremental' | 'differential' = 'full'): Promise<ApiResponse<SystemBackup>> {
    return this.apiRequest<SystemBackup>('/backups', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
  }

  async deleteBackup(backupId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/backups/${backupId}`, {
      method: 'DELETE'
    });
  }

  async restoreBackup(backupId: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/backups/${backupId}/restore`, {
      method: 'POST'
    });
  }

  async getSystemPerformance(): Promise<ApiResponse<{
    response_times: Array<{ timestamp: string; value: number }>;
    error_rates: Array<{ timestamp: string; value: number }>;
    throughput: Array<{ timestamp: string; value: number }>;
  }>> {
    return this.apiRequest('/performance');
  }

  async getSystemLogs(level?: 'error' | 'warn' | 'info' | 'debug', limit: number = 100): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    params.append('limit', limit.toString());

    return this.apiRequest(`/logs?${params.toString()}`);
  }

  async clearLogs(level?: string): Promise<ApiResponse<boolean>> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);

    return this.apiRequest<boolean>(`/logs/clear?${params.toString()}`, {
      method: 'DELETE'
    });
  }

  async getSystemInfo(): Promise<ApiResponse<{
    version: string;
    environment: string;
    node_version: string;
    database_version: string;
    uptime: string;
    last_deploy: string;
    features: string[];
  }>> {
    return this.apiRequest('/info');
  }

  async restartService(service: string): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>(`/services/${service}/restart`, {
      method: 'POST'
    });
  }

  async updateSystemSettings(settings: Record<string, any>): Promise<ApiResponse<boolean>> {
    return this.apiRequest<boolean>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }
}

export const adminSystemService = new AdminSystemService();