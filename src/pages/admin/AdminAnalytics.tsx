import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Activity, Users, DollarSign, PieChart, LineChart } from 'lucide-react';

export default function AdminAnalytics() {
  const kpis = [
    { title: 'Utilisateurs actifs', value: '8,920', icon: <Users className="h-4 w-4" />, trend: { value: 12, isPositive: true } },
    { title: 'Transactions', value: '48,392', icon: <Activity className="h-4 w-4" />, trend: { value: 23, isPositive: true } },
    { title: 'Revenus', value: '24.3M FCFA', icon: <DollarSign className="h-4 w-4" />, trend: { value: 15, isPositive: true } },
    { title: 'Croissance', value: '+18%', icon: <TrendingUp className="h-4 w-4" />, trend: { value: 3, isPositive: true } },
  ];

  const topSegments = [
    { name: 'Producteurs', value: 4523, change: '+8%' },
    { name: 'Marchands', value: 2341, change: '+15%' },
    { name: 'Coopératives', value: 812, change: '+5%' },
  ];

  return (
    <DashboardLayout title="Analytiques" subtitle="Indicateurs et tendances de la plateforme">
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
                Trafic et usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-gradient-primary/10 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <LineChart className="h-10 w-10 mx-auto mb-2 text-primary" />
                  Courbe d'activité (placeholder)
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Répartition par segment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded-lg bg-gradient-secondary/10 flex items-center justify-center mb-4">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-10 w-10 mx-auto mb-2 text-secondary" />
                  Camembert des segments (placeholder)
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {topSegments.map((s) => (
                  <div key={s.name} className="p-3 rounded-md border">
                    <div className="text-sm text-muted-foreground">{s.name}</div>
                    <div className="text-lg font-semibold">{s.value.toLocaleString()}</div>
                    <Badge variant="outline" className="mt-1">{s.change}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

