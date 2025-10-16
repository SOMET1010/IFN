import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Key,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Shield,
  BarChart3,
  Edit
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  created_at: string;
  expires_at?: string;
  last_used?: string;
  active: boolean;
  usage_count: number;
}

export default function AdminAPIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockKeys: APIKey[] = [
        {
          id: '1',
          name: 'Mobile App API',
          key: 'ak_live_1234567890abcdef',
          description: 'Clé pour l\'application mobile',
          permissions: ['read', 'write'],
          created_at: '2024-01-15T10:00:00Z',
          last_used: '2024-01-20T15:30:00Z',
          active: true,
          usage_count: 1234
        },
        {
          id: '2',
          name: 'Web Dashboard',
          key: 'ak_live_0987654321fedcba',
          description: 'Clé pour le dashboard web',
          permissions: ['read'],
          created_at: '2024-01-10T08:00:00Z',
          last_used: '2024-01-19T12:00:00Z',
          active: true,
          usage_count: 567
        },
        {
          id: '3',
          name: 'Integration Partenaire',
          key: 'ak_live_abcdef123456789',
          description: 'Clé pour les partenaires',
          permissions: ['read', 'write', 'admin'],
          created_at: '2024-01-05T14:00:00Z',
          expires_at: '2024-12-31T23:59:59Z',
          last_used: '2024-01-18T09:00:00Z',
          active: true,
          usage_count: 89
        }
      ];
      setApiKeys(mockKeys);
    } catch (error) {
      console.error('Erreur chargement clés API:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteKey = async (keyId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette clé API ?')) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    }
  };

  const formatKey = (key: string, isVisible: boolean) => {
    if (!isVisible) {
      return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    }
    return key;
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expiresAt) <= thirtyDaysFromNow && new Date(expiresAt) > new Date();
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Clés API">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const activeKeys = apiKeys.filter(key => key.active);
  const totalUsage = apiKeys.reduce((sum, key) => sum + key.usage_count, 0);

  return (
    <DashboardLayout sidebar={<></>} title="Clés API">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard
            title="Clés Actives"
            value={activeKeys.length.toString()}
            description={`${apiKeys.length - activeKeys.length} inactives`}
            icon={<Key className="h-4 w-4" />}
          />
          <StatsCard
            title="Utilisation Totale"
            value={totalUsage.toLocaleString()}
            description="Requêtes totales"
            icon={<Activity className="h-4 w-4" />}
            trend={{ value: totalUsage, isPositive: true }}
          />
          <StatsCard
            title="Moyenne par Clé"
            value={apiKeys.length > 0 ? Math.round(totalUsage / apiKeys.length).toString() : '0'}
            description="Utilisation moyenne"
            icon={<BarChart3 className="h-4 w-4" />}
          />
          <StatsCard
            title="Sécurité"
            value={apiKeys.filter(key => key.permissions.includes('admin')).length.toString()}
            description="Clés admin"
            icon={<Shield className="h-4 w-4" />}
          />
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestion des Clés API</CardTitle>
                <CardDescription>Gérez les clés d\'accès à votre API</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Clé API
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 mb-4">
              <p>Les clés API permettent à vos applications d\'accéder à notre plateforme de manière sécurisée.</p>
              <p>Chaque clé peut avoir des permissions spécifiques et être révoquée à tout moment.</p>
            </div>
          </CardContent>
        </Card>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Clés API Existantes</CardTitle>
                <CardDescription>Liste de toutes les clés API actives</CardDescription>
              </div>
              <Button variant="outline" onClick={loadAPIKeys}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Clé API</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière Utilisation</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Aucune clé API trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiKeys.map((apiKey) => (
                      <TableRow key={apiKey.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{apiKey.name}</div>
                            <div className="text-sm text-gray-500">{apiKey.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {formatKey(apiKey.key, showKeys[apiKey.id] || false)}
                            </code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => toggleKeyVisibility(apiKey.id)}
                            >
                              {showKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => copyToClipboard(apiKey.key)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {apiKey.active ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactif</Badge>
                            )}
                            {isExpired(apiKey.expires_at) && (
                              <Badge variant="destructive" className="text-xs">
                                Expirée
                              </Badge>
                            )}
                            {isExpiringSoon(apiKey.expires_at) && !isExpired(apiKey.expires_at) && (
                              <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                Expire bientôt
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {apiKey.last_used ? (
                            <div className="text-sm">
                              {new Date(apiKey.last_used).toLocaleDateString('fr-FR')}
                              <div className="text-gray-500">
                                {new Date(apiKey.last_used).toLocaleTimeString('fr-FR')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Jamais</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{apiKey.usage_count.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => deleteKey(apiKey.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
