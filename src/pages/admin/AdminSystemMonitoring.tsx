import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Server,
  MemoryStick,
  Zap
} from 'lucide-react';
import { adminSystemService, type SystemHealth, type SystemAlert } from '@/services/admin/adminSystemService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminSystemMonitoring() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [healthResponse, alertsResponse, metricsResponse] = await Promise.all([
        adminSystemService.getSystemHealth(),
        adminSystemService.getSystemAlerts(false),
        adminSystemService.getSystemMetrics()
      ]);

      if (healthResponse.success && healthResponse.data) {
        setHealth(healthResponse.data);
      }
      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data);
      }
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }
    } catch (error) {
      console.error('Erreur chargement monitoring système:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (serviceName: string, isOnline: boolean) => {
    const Icon = isOnline ? Wifi : WifiOff;
    return <Icon className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-red-500'}`} />;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertSeverity = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">Élevé</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Moyen</Badge>;
      case 'low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Mock performance data for charts
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 60, response: 120 },
    { time: '04:00', cpu: 30, memory: 55, response: 95 },
    { time: '08:00', cpu: 70, memory: 75, response: 180 },
    { time: '12:00', cpu: 85, memory: 80, response: 220 },
    { time: '16:00', cpu: 75, memory: 70, response: 150 },
    { time: '20:00', cpu: 55, memory: 65, response: 130 },
    { time: '24:00', cpu: 40, memory: 58, response: 110 },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Monitoring Système">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<></>} title="Monitoring Système">
      <div className="space-y-6">
        {/* System Health Overview */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <StatsCard
              title="État Global"
              value={health.overall_status === 'healthy' ? 'Sain' : health.overall_status === 'warning' ? 'Attention' : 'Critique'}
              description={new Date(health.last_check).toLocaleString('fr-FR')}
              icon={<Activity className="h-4 w-4" />}
              trend={{ value: health.overall_status === 'healthy' ? 100 : health.overall_status === 'warning' ? 50 : 0, isPositive: health.overall_status === 'healthy' }}
            />
            <StatsCard
              title="CPU"
              value={`${health.cpu_usage}%`}
              description="Utilisation processeur"
              icon={<Cpu className="h-4 w-4" />}
              trend={{ value: health.cpu_usage, isPositive: health.cpu_usage < 80 }}
            />
            <StatsCard
              title="Mémoire"
              value={`${health.memory_usage}%`}
              description="Utilisation mémoire"
              icon={<MemoryStick className="h-4 w-4" />}
              trend={{ value: health.memory_usage, isPositive: health.memory_usage < 80 }}
            />
            <StatsCard
              title="Disque"
              value={`${health.disk_usage}%`}
              description="Espace disque utilisé"
              icon={<HardDrive className="h-4 w-4" />}
              trend={{ value: health.disk_usage, isPositive: health.disk_usage < 80 }}
            />
            <StatsCard
              title="Utilisateurs Actifs"
              value={health.active_users.toLocaleString()}
              description="Utilisateurs connectés"
              icon={<Users className="h-4 w-4" />}
              trend={{ value: health.active_users, isPositive: true }}
            />
            <StatsCard
              title="Temps de Réponse"
              value={`${health.response_time}ms`}
              description="Latence moyenne"
              icon={<Zap className="h-4 w-4" />}
              trend={{ value: health.response_time, isPositive: health.response_time < 200 }}
            />
          </div>
        )}

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Système</CardTitle>
              <CardDescription>Utilisation CPU et Mémoire</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#8884d8" fill="#8884d8" name="CPU %" />
                  <Area type="monotone" dataKey="memory" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Mémoire %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Temps de Réponse</CardTitle>
              <CardDescription>Latence des requêtes (ms)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="response" stroke="#ff7300" strokeWidth={2} name="Réponse (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Service Status */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle>État des Services</CardTitle>
              <CardDescription>Disponibilité des services système</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(health.services).map(([service, isOnline]) => (
                  <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service, isOnline)}
                      <span className="font-medium capitalize">{service}</span>
                    </div>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                      {isOnline ? 'En ligne' : 'Hors ligne'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Alertes Système</CardTitle>
                <CardDescription>Alertes non résolues</CardDescription>
              </div>
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Aucune alerte active</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{alert.type}</span>
                          {getAlertSeverity(alert.severity)}
                        </div>
                        <p className="text-sm text-gray-600">{alert.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.resolved ? 'Résolu' : 'Actif'}
                      </Badge>
                      {!alert.resolved && (
                        <Button variant="outline" size="sm">
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}