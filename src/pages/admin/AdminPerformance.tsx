import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Timer, Gauge, Server, BarChart3 } from 'lucide-react';

export default function AdminPerformance() {
  const kpis = [
    { title: 'Uptime', value: '99.97%', description: 'sur 30 jours', icon: <Gauge className="h-4 w-4" />, trend: { value: 0.02, isPositive: true } },
    { title: 'Temps de réponse', value: '182 ms', description: 'moyenne 24h', icon: <Timer className="h-4 w-4" />, trend: { value: -8, isPositive: true } },
    { title: 'Taux d’erreur', value: '0.12%', description: '5xx/4xx cumulés', icon: <Activity className="h-4 w-4" />, trend: { value: -3, isPositive: true } },
    { title: 'Débit', value: '3.2k req/s', description: 'pic heure', icon: <Server className="h-4 w-4" />, trend: { value: 11, isPositive: true } },
  ];

  const services = [
    { name: 'API Gateway', status: 'OK', latency: '120 ms', errors: '0.05%' },
    { name: 'Auth Service', status: 'OK', latency: '160 ms', errors: '0.10%' },
    { name: 'Payments', status: 'OK', latency: '210 ms', errors: '0.20%' },
    { name: 'Notifications', status: 'OK', latency: '180 ms', errors: '0.08%' },
  ];

  return (
    <DashboardLayout title="Performance" subtitle="Suivi de performance et stabilité du système">
      <div className="space-y-6">
        {/* KPI */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, i) => (
            <StatsCard key={i} {...kpi} />
          ))}
        </div>

        {/* Graph placeholders */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Latence (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Graphique de latence (placeholder)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Taux d’erreur (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-gradient-secondary/10 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  Graphique d’erreurs (placeholder)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s) => (
                <div key={s.name} className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="outline">{s.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">Latence: {s.latency}</div>
                  <div className="text-sm text-muted-foreground">Erreurs: {s.errors}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

