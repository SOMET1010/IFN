import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  Users,
  Key,
  Activity,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  created_at: string;
}

export default function AdminPermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockPermissions: Permission[] = [
        { id: '1', name: 'Lire les utilisateurs', description: 'Voir la liste des utilisateurs', category: 'Utilisateurs', resource: 'users', action: 'read' },
        { id: '2', name: 'Créer des utilisateurs', description: 'Ajouter de nouveaux utilisateurs', category: 'Utilisateurs', resource: 'users', action: 'create' },
        { id: '3', name: 'Modifier les utilisateurs', description: 'Mettre à jour les utilisateurs', category: 'Utilisateurs', resource: 'users', action: 'update' },
        { id: '4', name: 'Supprimer les utilisateurs', description: 'Supprimer des utilisateurs', category: 'Utilisateurs', resource: 'users', action: 'delete' },
        { id: '5', name: 'Lire les produits', description: 'Voir les produits', category: 'Marketplace', resource: 'products', action: 'read' },
        { id: '6', name: 'Gérer les produits', description: 'CRUD produits', category: 'Marketplace', resource: 'products', action: 'manage' },
      ];

      const mockRoles: Role[] = [
        { id: '1', name: 'Administrateur', description: 'Accès complet au système', permissions: ['1', '2', '3', '4', '5', '6'], user_count: 5, created_at: '2024-01-01T00:00:00Z' },
        { id: '2', name: 'Modérateur', description: 'Gestion du contenu', permissions: ['1', '5'], user_count: 12, created_at: '2024-01-02T00:00:00Z' },
        { id: '3', name: 'Utilisateur', description: 'Accès limité', permissions: ['5'], user_count: 150, created_at: '2024-01-03T00:00:00Z' },
      ];

      setPermissions(mockPermissions);
      setRoles(mockRoles);
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Permissions">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<></>} title="Permissions">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Permissions"
            value={permissions.length.toString()}
            description="Permissions définies"
            icon={<Key className="h-4 w-4" />}
          />
          <StatsCard
            title="Total Rôles"
            value={roles.length.toString()}
            description="Rôles configurés"
            icon={<Shield className="h-4 w-4" />}
          />
          <StatsCard
            title="Utilisateurs"
            value={roles.reduce((sum, role) => sum + role.user_count, 0).toString()}
            description="Utilisateurs avec rôles"
            icon={<Users className="h-4 w-4" />}
          />
          <StatsCard
            title="Permissions Moyennes"
            value={roles.length > 0 ? Math.round(permissions.length / roles.length).toString() : '0'}
            description="Par rôle"
            icon={<Activity className="h-4 w-4" />}
          />
        </div>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles">Rôles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Rôles</CardTitle>
                    <CardDescription>Gérez les rôles et leurs permissions</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Rôle
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Utilisateurs</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-gray-500">
                              Créé le {new Date(role.created_at).toLocaleDateString('fr-FR')}
                            </div>
                          </TableCell>
                          <TableCell>{role.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map((permId) => {
                                const perm = permissions.find(p => p.id === permId);
                                return perm ? (
                                  <Badge key={permId} variant="outline" className="text-xs">
                                    {perm.name}
                                  </Badge>
                                ) : null;
                              })}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} plus
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{role.user_count} utilisateurs</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des Permissions</CardTitle>
                    <CardDescription>Gérez les permissions du système</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Permission
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Ressource</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="font-medium">{permission.name}</div>
                          </TableCell>
                          <TableCell>{permission.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{permission.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {permission.resource}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{permission.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}