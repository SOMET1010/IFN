import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  Smartphone,
  Truck,
  CreditCard,
  MessageSquare,
  BarChart3,
  Shield,
  Zap,
  AlertTriangle,
  RefreshCw,
  Plus,
  ExternalLink,
  Key,
  Users,
  Cloud,
  Globe
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'logistics' | 'communication' | 'analytics' | 'external' | 'database';
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  lastSync?: Date;
  dataPoints: number;
  version: string;
  settings: IntegrationSettings;
  health: HealthStatus;
}

interface IntegrationSettings {
  apiKey?: string;
  webhookUrl?: string;
  syncFrequency: number; // in minutes
  autoSync: boolean;
  dataMapping: Record<string, string>;
  enabledFeatures: string[];
}

interface HealthStatus {
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastIncident?: Date;
}

interface SyncLog {
  id: string;
  integrationId: string;
  type: 'sync' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

const SystemIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    autoSync: true,
    syncFrequency: 30,
    alertOnError: true,
    retentionPeriod: 90
  });

  useEffect(() => {
    // Initialize mock integrations
    loadMockIntegrations();
    loadMockSyncLogs();
  }, []);

  const loadMockIntegrations = () => {
    const mockIntegrations: Integration[] = [
      {
        id: 'orange-money',
        name: 'Orange Money',
        description: 'Paiements mobiles et transferts d\'argent',
        category: 'payment',
        status: 'connected',
        lastSync: new Date(Date.now() - 300000),
        dataPoints: 15420,
        version: '2.1.0',
        settings: {
          apiKey: 'sk_test_...',
          syncFrequency: 15,
          autoSync: true,
          dataMapping: { transaction_id: 'order_id', amount: 'total' },
          enabledFeatures: ['payments', 'refunds', 'webhooks']
        },
        health: {
          uptime: 99.8,
          responseTime: 120,
          errorRate: 0.2
        }
      },
      {
        id: 'moov-money',
        name: 'Moov Money',
        description: 'Solution de paiement mobile',
        category: 'payment',
        status: 'connected',
        lastSync: new Date(Date.now() - 600000),
        dataPoints: 8930,
        version: '1.8.2',
        settings: {
          apiKey: 'mk_test_...',
          syncFrequency: 30,
          autoSync: true,
          dataMapping: { payment_ref: 'reference', customer_phone: 'phone' },
          enabledFeatures: ['payments', 'balance_check']
        },
        health: {
          uptime: 99.5,
          responseTime: 180,
          errorRate: 0.5
        }
      },
      {
        id: 'express-go',
        name: 'Express Go',
        description: 'Livraison express et logistique',
        category: 'logistics',
        status: 'connected',
        lastSync: new Date(Date.now() - 900000),
        dataPoints: 6750,
        version: '3.0.1',
        settings: {
          apiKey: 'eg_live_...',
          webhookUrl: 'https://api.domain.com/webhooks/delivery',
          syncFrequency: 5,
          autoSync: true,
          dataMapping: { tracking_id: 'order_id', status: 'delivery_status' },
          enabledFeatures: ['tracking', 'delivery', 'returns']
        },
        health: {
          uptime: 98.9,
          responseTime: 200,
          errorRate: 1.1
        }
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Notifications et communication client',
        category: 'communication',
        status: 'connected',
        lastSync: new Date(Date.now() - 120000),
        dataPoints: 23500,
        version: '2.5.0',
        settings: {
          apiKey: 'wa_token_...',
          syncFrequency: 1,
          autoSync: true,
          dataMapping: { phone: 'customer_phone', message: 'notification' },
          enabledFeatures: ['notifications', 'customer_service', 'marketing']
        },
        health: {
          uptime: 99.9,
          responseTime: 80,
          errorRate: 0.1
        }
      },
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Analyse du comportement des utilisateurs',
        category: 'analytics',
        status: 'disconnected',
        dataPoints: 0,
        version: '4.0.0',
        settings: {
          apiKey: '',
          syncFrequency: 60,
          autoSync: false,
          dataMapping: {},
          enabledFeatures: []
        },
        health: {
          uptime: 0,
          responseTime: 0,
          errorRate: 0
        }
      },
      {
        id: 'external-market',
        name: 'Marché Externe',
        description: 'Connexion aux marchés partenaires',
        category: 'external',
        status: 'error',
        lastSync: new Date(Date.now() - 3600000),
        dataPoints: 3420,
        version: '1.2.0',
        settings: {
          apiKey: 'ext_key_...',
          syncFrequency: 120,
          autoSync: false,
          dataMapping: { product_id: 'sku', price: 'unit_price' },
          enabledFeatures: ['product_sync', 'inventory']
        },
        health: {
          uptime: 85.0,
          responseTime: 500,
          errorRate: 15.0,
          lastIncident: new Date(Date.now() - 1800000)
        }
      }
    ];
    setIntegrations(mockIntegrations);
  };

  const loadMockSyncLogs = () => {
    const mockLogs: SyncLog[] = [
      {
        id: '1',
        integrationId: 'orange-money',
        type: 'sync',
        message: 'Synchronisation réussie: 125 transactions',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '2',
        integrationId: 'whatsapp',
        type: 'sync',
        message: '45 messages envoyés avec succès',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '3',
        integrationId: 'express-go',
        type: 'warning',
        message: 'Délai de réponse élevé (350ms)',
        timestamp: new Date(Date.now() - 600000)
      },
      {
        id: '4',
        integrationId: 'external-market',
        type: 'error',
        message: 'Échec de connexion: API timeout',
        timestamp: new Date(Date.now() - 1800000)
      }
    ];
    setSyncLogs(mockLogs);
  };

  const handleConnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'connecting' as const }
        : integration
    ));

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(integrations.map(integration =>
        integration.id === integrationId
          ? {
              ...integration,
              status: 'connected' as const,
              lastSync: new Date(),
              health: { ...integration.health, uptime: 100, errorRate: 0 }
            }
          : integration
      ));

      addSyncLog({
        id: Date.now().toString(),
        integrationId,
        type: 'sync',
        message: 'Intégration connectée avec succès',
        timestamp: new Date()
      });
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'disconnected' as const }
        : integration
    ));

    addSyncLog({
      id: Date.now().toString(),
      integrationId,
      type: 'info',
      message: 'Intégration déconnectée',
      timestamp: new Date()
    });
  };

  const handleSync = (integrationId: string) => {
    addSyncLog({
      id: Date.now().toString(),
      integrationId,
      type: 'sync',
      message: 'Synchronisation en cours...',
      timestamp: new Date()
    });

    // Simulate sync process
    setTimeout(() => {
      const integration = integrations.find(i => i.id === integrationId);
      if (integration) {
        setIntegrations(integrations.map(i =>
          i.id === integrationId
            ? { ...i, lastSync: new Date(), dataPoints: i.dataPoints + Math.floor(Math.random() * 100) }
            : i
        ));

        addSyncLog({
          id: Date.now().toString(),
          integrationId,
          type: 'sync',
          message: `Synchronisation réussie: ${Math.floor(Math.random() * 100)} nouveaux points de données`,
          timestamp: new Date()
        });
      }
    }, 1500);
  };

  const addSyncLog = (log: SyncLog) => {
    setSyncLogs(prev => [log, ...prev].slice(0, 50));
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'connecting':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Integration['status']) => {
    const statusConfig = {
      connected: { color: 'bg-green-100 text-green-800', label: 'Connecté' },
      disconnected: { color: 'bg-gray-100 text-gray-800', label: 'Déconnecté' },
      error: { color: 'bg-red-100 text-red-800', label: 'Erreur' },
      connecting: { color: 'bg-blue-100 text-blue-800', label: 'Connexion...' }
    };

    const config = statusConfig[status];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLogIcon = (type: SyncLog['type']) => {
    switch (type) {
      case 'sync':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Database className="h-4 w-4 text-blue-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: Integration['category']) => {
    const categoryIcons = {
      payment: <CreditCard className="h-5 w-5" />,
      logistics: <Truck className="h-5 w-5" />,
      communication: <MessageSquare className="h-5 w-5" />,
      analytics: <BarChart3 className="h-5 w-5" />,
      external: <Globe className="h-5 w-5" />,
      database: <Database className="h-5 w-5" />
    };
    return categoryIcons[category];
  };

  const getCategoryLabel = (category: Integration['category']) => {
    const categoryLabels = {
      payment: 'Paiement',
      logistics: 'Logistique',
      communication: 'Communication',
      analytics: 'Analytique',
      external: 'Externe',
      database: 'Base de données'
    };
    return categoryLabels[category];
  };

  const integrationsByCategory = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const calculateGlobalHealth = () => {
    const connectedIntegrations = integrations.filter(i => i.status === 'connected');
    if (connectedIntegrations.length === 0) return 0;

    const avgUptime = connectedIntegrations.reduce((sum, i) => sum + i.health.uptime, 0) / connectedIntegrations.length;
    const avgResponseTime = connectedIntegrations.reduce((sum, i) => sum + i.health.responseTime, 0) / connectedIntegrations.length;
    const avgErrorRate = connectedIntegrations.reduce((sum, i) => sum + i.health.errorRate, 0) / connectedIntegrations.length;

    return Math.round(avgUptime - (avgErrorRate * 10));
  };

  const globalHealth = calculateGlobalHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intégrations Système</h2>
          <p className="text-gray-600">Gérez les connexions avec les services externes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tout synchroniser
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle intégration
          </Button>
        </div>
      </div>

      {/* Global Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Santé Globale du Système</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{globalHealth}%</div>
              <p className="text-sm text-gray-600">Santé globale</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {integrations.filter(i => i.status === 'connected').length}
              </div>
              <p className="text-sm text-gray-600">Intégrations actives</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {integrations.reduce((sum, i) => sum + i.dataPoints, 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Points de données</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {syncLogs.filter(log => log.type === 'error').length}
              </div>
              <p className="text-sm text-gray-600">Erreurs récentes</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Performance globale</span>
              <span>{globalHealth}%</span>
            </div>
            <Progress value={globalHealth} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres Globaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="globalAutoSync">Synchronisation automatique</Label>
              <Switch
                id="globalAutoSync"
                checked={globalSettings.autoSync}
                onCheckedChange={(checked) => setGlobalSettings({...globalSettings, autoSync: checked})}
              />
            </div>

            <div>
              <Label htmlFor="syncFreq">Fréquence de sync (minutes)</Label>
              <select
                id="syncFreq"
                value={globalSettings.syncFrequency}
                onChange={(e) => setGlobalSettings({...globalSettings, syncFrequency: parseInt(e.target.value)})}
                className="w-full px-3 py-1 border rounded text-sm"
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="alertOnError">Alertes en cas d'erreur</Label>
              <Switch
                id="alertOnError"
                checked={globalSettings.alertOnError}
                onCheckedChange={(checked) => setGlobalSettings({...globalSettings, alertOnError: checked})}
              />
            </div>

            <div>
              <Label htmlFor="retention">Période de rétention (jours)</Label>
              <Input
                id="retention"
                type="number"
                value={globalSettings.retentionPeriod}
                onChange={(e) => setGlobalSettings({...globalSettings, retentionPeriod: parseInt(e.target.value) || 90})}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations by Category */}
      <div className="space-y-6">
        {Object.entries(integrationsByCategory).map(([category, categoryIntegrations]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(category as Integration['category'])}
                <span>{getCategoryLabel(category as Integration['category'])}</span>
                <Badge variant="outline">{categoryIntegrations.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {categoryIntegrations.map((integration) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(integration.status)}
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">Version</p>
                        <p className="font-medium">{integration.version}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Points de données</p>
                        <p className="font-medium">{integration.dataPoints.toLocaleString()}</p>
                      </div>
                      {integration.lastSync && (
                        <div>
                          <p className="text-gray-600">Dernière sync</p>
                          <p className="font-medium">
                            {new Date(integration.lastSync).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                      {integration.status === 'connected' && (
                        <div>
                          <p className="text-gray-600">Temps de réponse</p>
                          <p className="font-medium">{integration.health.responseTime}ms</p>
                        </div>
                      )}
                    </div>

                    {integration.status === 'connected' && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span>Santé</span>
                          <span>{integration.health.uptime.toFixed(1)}%</span>
                        </div>
                        <Progress value={integration.health.uptime} className="h-1" />
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {integration.status === 'connected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSync(integration.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Sync
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Config
                        </Button>
                      </div>

                      {integration.status === 'disconnected' || integration.status === 'error' ? (
                        <Button
                          size="sm"
                          onClick={() => handleConnect(integration.id)}
                          disabled={integration.status === 'connecting'}
                        >
                          {integration.status === 'connecting' ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Link className="h-3 w-3 mr-1" />
                          )}
                          Connecter
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          <Unlink className="h-3 w-3 mr-1" />
                          Déconnecter
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {syncLogs.map((log) => {
              const integration = integrations.find(i => i.id === log.integrationId);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      {integration && (
                        <span className="font-medium text-sm">{integration.name}</span>
                      )}
                      <Badge
                        variant="outline"
                        className={`${
                          log.type === 'error' ? 'border-red-200 text-red-700' :
                          log.type === 'warning' ? 'border-yellow-200 text-yellow-700' :
                          log.type === 'sync' ? 'border-green-200 text-green-700' :
                          'border-blue-200 text-blue-700'
                        }`}
                      >
                        {log.type === 'error' ? 'Erreur' :
                         log.type === 'warning' ? 'Avertissement' :
                         log.type === 'sync' ? 'Synchronisation' :
                         'Information'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {log.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemIntegrations;