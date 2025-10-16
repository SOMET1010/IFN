import { User } from '@/types';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'general' | 'producer' | 'merchant' | 'cooperative' | 'admin';
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface ResourceAccess {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
  conditions?: Record<string, any>;
}

export class PermissionsService {
  // Define all available permissions
  private static readonly PERMISSIONS: Permission[] = [
    // General permissions
    {
      id: 'auth.login',
      name: 'Connexion',
      description: 'Permet de se connecter à l\'application',
      category: 'general',
      resource: 'auth',
      action: 'read'
    },
    {
      id: 'auth.register',
      name: 'Inscription',
      description: 'Permet de créer un compte',
      category: 'general',
      resource: 'auth',
      action: 'create'
    },
    {
      id: 'profile.view',
      name: 'Voir profil',
      description: 'Permet de voir son propre profil',
      category: 'general',
      resource: 'profile',
      action: 'read'
    },
    {
      id: 'profile.edit',
      name: 'Modifier profil',
      description: 'Permet de modifier son propre profil',
      category: 'general',
      resource: 'profile',
      action: 'update'
    },
    {
      id: 'notifications.read',
      name: 'Voir notifications',
      description: 'Permet de voir ses notifications',
      category: 'general',
      resource: 'notifications',
      action: 'read'
    },

    // Producer permissions
    {
      id: 'producer.dashboard',
      name: 'Tableau de bord producteur',
      description: 'Accès au tableau de bord producteur',
      category: 'producer',
      resource: 'dashboard',
      action: 'read'
    },
    {
      id: 'producer.offers.create',
      name: 'Créer offre',
      description: 'Permet de créer de nouvelles offres',
      category: 'producer',
      resource: 'offers',
      action: 'create'
    },
    {
      id: 'producer.offers.read',
      name: 'Voir offres',
      description: 'Permet de voir ses offres',
      category: 'producer',
      resource: 'offers',
      action: 'read'
    },
    {
      id: 'producer.offers.update',
      name: 'Modifier offre',
      description: 'Permet de modifier ses offres',
      category: 'producer',
      resource: 'offers',
      action: 'update'
    },
    {
      id: 'producer.offers.delete',
      name: 'Supprimer offre',
      description: 'Permet de supprimer ses offres',
      category: 'producer',
      resource: 'offers',
      action: 'delete'
    },
    {
      id: 'producer.harvests.create',
      name: 'Créer récolte',
      description: 'Permet d\'enregistrer des récoltes',
      category: 'producer',
      resource: 'harvests',
      action: 'create'
    },
    {
      id: 'producer.harvests.read',
      name: 'Voir récoltes',
      description: 'Permet de voir ses récoltes',
      category: 'producer',
      resource: 'harvests',
      action: 'read'
    },
    {
      id: 'producer.sales.read',
      name: 'Voir ventes',
      description: 'Permet de voir ses ventes',
      category: 'producer',
      resource: 'sales',
      action: 'read'
    },

    // Merchant permissions
    {
      id: 'merchant.dashboard',
      name: 'Tableau de bord marchand',
      description: 'Accès au tableau de bord marchand',
      category: 'merchant',
      resource: 'dashboard',
      action: 'read'
    },
    {
      id: 'merchant.inventory.read',
      name: 'Voir inventaire',
      description: 'Permet de voir son inventaire',
      category: 'merchant',
      resource: 'inventory',
      action: 'read'
    },
    {
      id: 'merchant.inventory.update',
      name: 'Gérer inventaire',
      description: 'Permet de gérer son inventaire',
      category: 'merchant',
      resource: 'inventory',
      action: 'update'
    },
    {
      id: 'merchant.orders.read',
      name: 'Voir commandes',
      description: 'Permet de voir ses commandes',
      category: 'merchant',
      resource: 'orders',
      action: 'read'
    },
    {
      id: 'merchant.orders.update',
      name: 'Gérer commandes',
      description: 'Permet de gérer ses commandes',
      category: 'merchant',
      resource: 'orders',
      action: 'update'
    },
    {
      id: 'merchant.sales.read',
      name: 'Voir ventes',
      description: 'Permet de voir ses ventes',
      category: 'merchant',
      resource: 'sales',
      action: 'read'
    },

    // Cooperative permissions
    {
      id: 'cooperative.dashboard',
      name: 'Tableau de bord coopérative',
      description: 'Accès au tableau de bord coopérative',
      category: 'cooperative',
      resource: 'dashboard',
      action: 'read'
    },
    {
      id: 'cooperative.members.read',
      name: 'Voir membres',
      description: 'Permet de voir les membres de la coopérative',
      category: 'cooperative',
      resource: 'members',
      action: 'read'
    },
    {
      id: 'cooperative.members.manage',
      name: 'Gérer membres',
      description: 'Permet de gérer les membres de la coopérative',
      category: 'cooperative',
      resource: 'members',
      action: 'manage'
    },
    {
      id: 'cooperative.orders.read',
      name: 'Voir commandes',
      description: 'Permet de voir les commandes de la coopérative',
      category: 'cooperative',
      resource: 'orders',
      action: 'read'
    },
    {
      id: 'cooperative.orders.update',
      name: 'Gérer commandes',
      description: 'Permet de gérer les commandes de la coopérative',
      category: 'cooperative',
      resource: 'orders',
      action: 'update'
    },
    {
      id: 'cooperative.distribution.read',
      name: 'Voir distribution',
      description: 'Permet de voir la distribution',
      category: 'cooperative',
      resource: 'distribution',
      action: 'read'
    },
    {
      id: 'cooperative.distribution.update',
      name: 'Gérer distribution',
      description: 'Permet de gérer la distribution',
      category: 'cooperative',
      resource: 'distribution',
      action: 'update'
    },

    // Admin permissions
    {
      id: 'admin.dashboard',
      name: 'Tableau de bord admin',
      description: 'Accès au tableau de bord administrateur',
      category: 'admin',
      resource: 'dashboard',
      action: 'read'
    },
    {
      id: 'admin.users.read',
      name: 'Voir utilisateurs',
      description: 'Permet de voir tous les utilisateurs',
      category: 'admin',
      resource: 'users',
      action: 'read'
    },
    {
      id: 'admin.users.create',
      name: 'Créer utilisateur',
      description: 'Permet de créer des utilisateurs',
      category: 'admin',
      resource: 'users',
      action: 'create'
    },
    {
      id: 'admin.users.update',
      name: 'Modifier utilisateur',
      description: 'Permet de modifier des utilisateurs',
      category: 'admin',
      resource: 'users',
      action: 'update'
    },
    {
      id: 'admin.users.delete',
      name: 'Supprimer utilisateur',
      description: 'Permet de supprimer des utilisateurs',
      category: 'admin',
      resource: 'users',
      action: 'delete'
    },
    {
      id: 'admin.system.manage',
      name: 'Gérer système',
      description: 'Permet de gérer les paramètres système',
      category: 'admin',
      resource: 'system',
      action: 'manage'
    },
    {
      id: 'admin.reports.read',
      name: 'Voir rapports',
      description: 'Permet de voir les rapports système',
      category: 'admin',
      resource: 'reports',
      action: 'read'
    },
    {
      id: 'admin.security.manage',
      name: 'Gérer sécurité',
      description: 'Permet de gérer les paramètres de sécurité',
      category: 'admin',
      resource: 'security',
      action: 'manage'
    }
  ];

  // Define system roles
  private static readonly SYSTEM_ROLES: Role[] = [
    {
      id: 'producer',
      name: 'Producteur',
      description: 'Agriculteur producteur',
      permissions: [
        'auth.login',
        'profile.view',
        'profile.edit',
        'notifications.read',
        'producer.dashboard',
        'producer.offers.create',
        'producer.offers.read',
        'producer.offers.update',
        'producer.offers.delete',
        'producer.harvests.create',
        'producer.harvests.read',
        'producer.sales.read'
      ],
      isSystemRole: true
    },
    {
      id: 'merchant',
      name: 'Marchand',
      description: 'Vendeur sur le marché',
      permissions: [
        'auth.login',
        'profile.view',
        'profile.edit',
        'notifications.read',
        'merchant.dashboard',
        'merchant.inventory.read',
        'merchant.inventory.update',
        'merchant.orders.read',
        'merchant.orders.update',
        'merchant.sales.read'
      ],
      isSystemRole: true
    },
    {
      id: 'cooperative',
      name: 'Coopérative',
      description: 'Gestionnaire de coopérative',
      permissions: [
        'auth.login',
        'profile.view',
        'profile.edit',
        'notifications.read',
        'cooperative.dashboard',
        'cooperative.members.read',
        'cooperative.members.manage',
        'cooperative.orders.read',
        'cooperative.orders.update',
        'cooperative.distribution.read',
        'cooperative.distribution.update'
      ],
      isSystemRole: true
    },
    {
      id: 'admin',
      name: 'Administrateur',
      description: 'Administrateur système',
      permissions: this.PERMISSIONS.map(p => p.id), // All permissions
      isSystemRole: true
    }
  ];

  // User role assignments (in production, this would be stored in a database)
  private static userRoles: Map<string, string[]> = new Map();
  private static customRoles: Map<string, Role> = new Map();

  // Initialize default user roles
  static {
    // Assign default roles to mock users
    this.userRoles.set('1', ['producer']);
    this.userRoles.set('2', ['merchant']);
    this.userRoles.set('3', ['cooperative']);
    this.userRoles.set('4', ['admin']);
  }

  // Get all permissions
  static getAllPermissions(): Permission[] {
    return [...this.PERMISSIONS];
  }

  // Get permissions by category
  static getPermissionsByCategory(category: string): Permission[] {
    return this.PERMISSIONS.filter(p => p.category === category);
  }

  // Get all roles
  static getAllRoles(): Role[] {
    const systemRoles = [...this.SYSTEM_ROLES];
    const customRoles = Array.from(this.customRoles.values());
    return [...systemRoles, ...customRoles];
  }

  // Get role by ID
  static getRoleById(roleId: string): Role | null {
    const systemRole = this.SYSTEM_ROLES.find(r => r.id === roleId);
    if (systemRole) return systemRole;

    return this.customRoles.get(roleId) || null;
  }

  // Get user roles
  static getUserRoles(userId: string): string[] {
    return this.userRoles.get(userId) || [];
  }

  // Get user permissions
  static getUserPermissions(userId: string): Permission[] {
    const roleIds = this.getUserRoles(userId);
    const permissionIds = new Set<string>();

    for (const roleId of roleIds) {
      const role = this.getRoleById(roleId);
      if (role) {
        role.permissions.forEach(permissionId => permissionIds.add(permissionId));
      }
    }

    return this.PERMISSIONS.filter(p => permissionIds.has(p.id));
  }

  // Check if user has specific permission
  static hasPermission(userId: string, permissionId: string): boolean {
    const permissions = this.getUserPermissions(userId);
    return permissions.some(p => p.id === permissionId);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(userId: string, permissionIds: string[]): boolean {
    return permissionIds.some(id => this.hasPermission(userId, id));
  }

  // Check if user has all of the specified permissions
  static hasAllPermissions(userId: string, permissionIds: string[]): boolean {
    return permissionIds.every(id => this.hasPermission(userId, id));
  }

  // Check resource access
  static canAccessResource(userId: string, resource: string, action: string): boolean {
    const permissions = this.getUserPermissions(userId);
    return permissions.some(p =>
      p.resource === resource &&
      (p.action === action || p.action === 'manage')
    );
  }

  // Get user resource access
  static getUserResourceAccess(userId: string): ResourceAccess[] {
    const permissions = this.getUserPermissions(userId);
    const resourceAccessMap = new Map<string, Set<string>>();

    for (const permission of permissions) {
      if (!resourceAccessMap.has(permission.resource)) {
        resourceAccessMap.set(permission.resource, new Set());
      }

      const actions = resourceAccessMap.get(permission.resource)!;

      if (permission.action === 'manage') {
        actions.add('create');
        actions.add('read');
        actions.add('update');
        actions.add('delete');
        actions.add('manage');
      } else {
        actions.add(permission.action);
      }
    }

    return Array.from(resourceAccessMap.entries()).map(([resource, actions]) => ({
      resource,
      actions: Array.from(actions) as any
    }));
  }

  // Assign role to user
  static assignRole(userId: string, roleId: string): boolean {
    const role = this.getRoleById(roleId);
    if (!role) return false;

    const currentRoles = this.userRoles.get(userId) || [];
    if (!currentRoles.includes(roleId)) {
      currentRoles.push(roleId);
      this.userRoles.set(userId, currentRoles);
    }

    return true;
  }

  // Remove role from user
  static removeRole(userId: string, roleId: string): boolean {
    const currentRoles = this.userRoles.get(userId) || [];
    const index = currentRoles.indexOf(roleId);

    if (index > -1) {
      currentRoles.splice(index, 1);
      this.userRoles.set(userId, currentRoles);
      return true;
    }

    return false;
  }

  // Create custom role
  static createCustomRole(role: Omit<Role, 'isSystemRole'>): Role {
    const newRole: Role = {
      ...role,
      isSystemRole: false
    };

    this.customRoles.set(role.id, newRole);
    return newRole;
  }

  // Update custom role
  static updateCustomRole(roleId: string, updates: Partial<Role>): Role | null {
    const role = this.customRoles.get(roleId);
    if (!role || role.isSystemRole) return null;

    const updatedRole = { ...role, ...updates };
    this.customRoles.set(roleId, updatedRole);
    return updatedRole;
  }

  // Delete custom role
  static deleteCustomRole(roleId: string): boolean {
    const role = this.customRoles.get(roleId);
    if (!role || role.isSystemRole) return false;

    this.customRoles.delete(roleId);

    // Remove role from all users
    for (const [userId, roles] of this.userRoles.entries()) {
      const index = roles.indexOf(roleId);
      if (index > -1) {
        roles.splice(index, 1);
        this.userRoles.set(userId, roles);
      }
    }

    return true;
  }

  // Get permission requirements for routes
  static getRoutePermissionRequirements(): Record<string, string[]> {
    return {
      '/producer/dashboard': ['producer.dashboard'],
      '/producer/offers': ['producer.offers.read'],
      '/producer/harvests': ['producer.harvests.read'],
      '/producer/sales': ['producer.sales.read'],
      '/producer/revenue': ['producer.sales.read'],

      '/merchant/dashboard': ['merchant.dashboard'],
      '/merchant/inventory': ['merchant.inventory.read'],
      '/merchant/orders': ['merchant.orders.read'],
      '/merchant/sales': ['merchant.sales.read'],
      '/merchant/payments': ['merchant.orders.read'],

      '/cooperative/dashboard': ['cooperative.dashboard'],
      '/cooperative/members': ['cooperative.members.read'],
      '/cooperative/orders': ['cooperative.orders.read'],
      '/cooperative/distribution': ['cooperative.distribution.read'],
      '/cooperative/finances': ['cooperative.orders.read'],

      '/admin/dashboard': ['admin.dashboard'],
      '/admin/users': ['admin.users.read'],
      '/admin/security': ['admin.security.manage'],
      '/admin/reports': ['admin.reports.read'],
      '/admin/settings': ['admin.system.manage']
      ,'/admin/analytics': ['admin.reports.read']
      ,'/admin/alerts': ['admin.security.manage']
      ,'/admin/performance': ['admin.system.manage']
      ,'/admin/disputes': ['admin.reports.read']
      ,'/admin/reviews': ['admin.reports.read']
    };
  }

  // Check if user can access route
  static canAccessRoute(userId: string, route: string): boolean {
    const routeRequirements = this.getRoutePermissionRequirements();
    const requiredPermissions = routeRequirements[route] || [];

    if (requiredPermissions.length === 0) {
      return true; // Public route
    }

    return this.hasAnyPermission(userId, requiredPermissions);
  }

  // Get user effective permissions (including inherited permissions)
  static getUserEffectivePermissions(userId: string): {
    directPermissions: Permission[];
    roleBasedPermissions: Permission[];
    allPermissions: Permission[];
  } {
    const roleIds = this.getUserRoles(userId);
    const roleBasedPermissions: Permission[] = [];

    for (const roleId of roleIds) {
      const role = this.getRoleById(roleId);
      if (role) {
        role.permissions.forEach(permissionId => {
          const permission = this.PERMISSIONS.find(p => p.id === permissionId);
          if (permission && !roleBasedPermissions.some(p => p.id === permission.id)) {
            roleBasedPermissions.push(permission);
          }
        });
      }
    }

    return {
      directPermissions: [], // No direct permissions in this implementation
      roleBasedPermissions,
      allPermissions: roleBasedPermissions
    };
  }
}
