import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HeartPulse,
  Activity,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Database,
  Server,
  Clock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HealthMetric {
  name: string;
  value: number;
  max: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  uptime: number;
  lastCheck: string;
}

export default function AdminHealth() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock health metrics
      const mockMetrics: HealthMetric[] = [
        { name: 'CPU Usage', value: 45, max: 100, unit: '%', status: 'good', icon: <Cpu className="h-4 w-4" /> },
        { name: 'Memory Usage', value: 67, max: 100, unit: '%', status: 'warning', icon: <HardDrive className="h-4 w-4" /> },
        { name: 'Disk Space', value: 82, max: 100, unit: '%', status: 'warning', icon: <HardDrive className="h-4 w-4" /> },
        { name: 'Response Time', value: 180, max: 500, unit: 'ms', status: 'good', icon: <Zap className="h-4 w-4" /> },
        { name: 'Database Connections', value: 45, max: 100, unit: '', status: 'good', icon: <Database className="h-4 w-4" /> },
        { name: 'Active Users', value: 1250, max: 2000, unit: '', status: 'good', icon: <Users className="h-4 w-4" /> },
      ];

      const mockServices: ServiceHealth[] = [
        { name: 'API Server', status: 'healthy', responseTime: 120, uptime: 99.9, lastCheck: new Date().toISOString() },
        { name: 'Database', status: 'healthy', responseTime: 45, uptime: 99.8, lastCheck: new Date().toISOString() },
        { name: 'Cache Server', status: 'healthy', responseTime: 25, uptime: 100, lastCheck: new Date().toISOString() },
        { name: 'Storage Service', status: 'warning', responseTime: 350, uptime: 95.2, lastCheck: new Date().toISOString() },
        { name: 'Email Service', status: 'healthy', responseTime: 180, uptime: 98.5, lastCheck: new Date().toISOString() },
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
    } catch (error) {
      console.error('Erreur chargement santé système:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOverallHealth = () => {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 2) return 'warning';
    return 'healthy';
  };

  // Mock performance data
  const performanceData = [
    { time: '00:00', cpu: 30, memory: 55, response: 120 },
    { time: '04:00', cpu: 25, memory: 50, response: 95 },
    { time: '08:00', cpu: 70, memory: 75, response: 180 },
    { time: '12:00', cpu: 85, memory: 80, response: 220 },
    { time: '16:00', cpu: 75, memory: 70, response: 150 },
    { time: '20:00', cpu: 55, memory: 65, response: 130 },
    { time: '24:00', cpu: 35, memory: 58, response: 110 },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebar={<></>} title="Santé Système">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const overallHealth = getOverallHealth();

  return (
    <DashboardLayout sidebar={<></>} title="Santé Système">
      <div className="space-y-6">
        {/* Overall Health Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className={`h-6 w-6 ${overallHealth === 'healthy' ? 'text-green-500' : overallHealth === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                <div>
                  <CardTitle>État Global du Système</CardTitle>
                  <CardDescription>
                    Dernière vérification: {new Date().toLocaleString('fr-FR')}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(overallHealth)}>
                {overallHealth === 'healthy' ? 'Sain' : overallHealth === 'warning' ? 'Attention' : 'Critique'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  {getStatusIcon(metric.status)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {metric.max}{metric.unit}
                    </span>
                  </div>
                  <Progress
                    value={(metric.value / metric.max) * 100}
                    className={`h-2 ${metric.status === 'good' ? '[&>div]:bg-green-500' : metric.status === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-red-500'}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Système</CardTitle>
              <CardDescription>Utilisation CPU et Mémoire</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" strokeWidth={2} name="Mémoire %" />
                </LineChart>
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

        {/* Service Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>État des Services</CardTitle>
                <CardDescription>Disponibilité et performance des services</CardDescription>
              </div>
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <Card key={service.name} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span className="font-medium">{service.name}</span>
                      </div>
                      {getStatusIcon(service.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status === 'healthy' ? 'Sain' : service.status === 'warning' ? 'Attention' : 'Critique'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temps de réponse:</span>
                        <span>{service.responseTime}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponibilité:</span>
                        <span>{service.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernière vérif:</span>
                        <span>{new Date(service.lastCheck).toLocaleTimeString('fr-FR')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}