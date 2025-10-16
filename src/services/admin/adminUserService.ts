import { BaseService } from '../baseService';
import { ApiResponse } from '@/types';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'producer' | 'merchant' | 'cooperative' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  created_at: string;
  updated_at: string;
  last_login?: string;
  profile_complete: boolean;
  verified: boolean;
  phone?: string;
  address?: string;
  company?: string;
  permissions: string[];
}

export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  new_users_this_month: number;
  users_by_role: Record<string, number>;
  users_by_status: Record<string, number>;
}

export class AdminUserService extends BaseService<AdminUser> {
  constructor() {
    super('/admin/users', 'admin_users');
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const users = await this.getAll();
    if (!users.success || !users.data) {
      return { success: false, error: 'Impossible de récupérer les statistiques' };
    }

    const stats: UserStats = {
      total_users: users.data.length,
      active_users: users.data.filter(u => u.status === 'active').length,
      inactive_users: users.data.filter(u => u.status === 'inactive').length,
      new_users_this_month: users.data.filter(u => {
        const userDate = new Date(u.created_at);
        const now = new Date();
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
      }).length,
      users_by_role: {},
      users_by_status: {}
    };

    users.data.forEach(user => {
      stats.users_by_role[user.role] = (stats.users_by_role[user.role] || 0) + 1;
      stats.users_by_status[user.status] = (stats.users_by_status[user.status] || 0) + 1;
    });

    return { success: true, data: stats };
  }

  async searchUsers(query: string): Promise<ApiResponse<AdminUser[]>> {
    const allUsers = await this.getAll();
    if (!allUsers.success || !allUsers.data) {
      return allUsers;
    }

    const filteredUsers = allUsers.data.filter(user =>
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.first_name.toLowerCase().includes(query.toLowerCase()) ||
      user.last_name.toLowerCase().includes(query.toLowerCase()) ||
      user.company?.toLowerCase().includes(query.toLowerCase())
    );

    return { success: true, data: filteredUsers };
  }

  async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse<boolean>> {
    const results = await Promise.all(
      userIds.map(id => this.update(id, { status }))
    );

    const allSuccess = results.every(result => result.success);
    return { success: allSuccess, data: allSuccess };
  }

  async deleteUser(userIds: string[]): Promise<ApiResponse<boolean>> {
    const results = await Promise.all(
      userIds.map(id => this.delete(id))
    );

    const allSuccess = results.every(result => result.success);
    return { success: allSuccess, data: allSuccess };
  }

  async exportUsers(format: 'csv' | 'json' | 'excel'): Promise<ApiResponse<string>> {
    const users = await this.getAll();
    if (!users.success || !users.data) {
      return { success: false, error: 'Impossible d\'exporter les utilisateurs' };
    }

    try {
      let content: string;

      if (format === 'json') {
        content = JSON.stringify(users.data, null, 2);
      } else if (format === 'csv') {
        const headers = ['ID', 'Email', 'Prénom', 'Nom', 'Rôle', 'Statut', 'Date de création', 'Dernière connexion'];
        const rows = users.data.map(user => [
          user.id,
          user.email,
          user.first_name,
          user.last_name,
          user.role,
          user.status,
          user.created_at,
          user.last_login || 'N/A'
        ]);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
      } else {
        content = JSON.stringify(users.data, null, 2);
      }

      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: 'Erreur lors de l\'export' };
    }
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<ApiResponse<AdminUser | undefined>> {
    return this.update(userId, { permissions });
  }

  async getUserActivity(userId: string): Promise<ApiResponse<any[]>> {
    return this.apiRequest(`${this.endpoint}/${userId}/activity`);
  }
}

export const adminUserService = new AdminUserService();