import { DashboardLayout } from '@/components/common/DashboardLayout';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, DollarSign, Target } from 'lucide-react';

const CooperativeDashboard = () => {
  const statsData = [
    {
      title: "Commandes groupées",
      value: 120,
      icon: <Target className="h-6 w-6" />,
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Taux de Distribution",
      value: "95%",
      icon: <TrendingUp className="h-6 w-6" />,
      trend: { value: 5, isPositive: true }
    },
    {
      title: "Finances mutualisées",
      value: "5M FCFA",
      icon: <DollarSign className="h-6 w-6" />,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Performance Globale",
      value: "80%",
      icon: <Users className="h-6 w-6" />,
      trend: { value: 8, isPositive: true }
    },
  ];

  const memberFinances = [
    { name: "Membre 1", progress: 85 },
    { name: "Membre 2", progress: 92 },
    { name: "Membre 3", progress: 67 },
    { name: "Membre 4", progress: 45 },
    { name: "Membre 5", progress: 78 },
  ];

  // Mock data for charts
  const monthlyData = [
    { month: "Jan", orders: 85 },
    { month: "Fév", orders: 45 },
    { month: "Mar", orders: 125 },
    { month: "Avr", orders: 108 },
    { month: "Mai", orders: 140 },
    { month: "Juin", orders: 120 },
  ];

  return (
    <DashboardLayout title="Coopérative" subtitle="Tableau de bord agrégé - Vue d'ensemble de la performance de la coopérative.">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commandes par mois */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes par mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium w-12">{data.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="bg-primary/10 rounded-full h-8 flex items-center">
                        <div 
                          className="bg-primary rounded-full h-8 transition-all duration-500"
                          style={{ width: `${(data.orders / 150) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground w-8">{data.orders}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribution par mois - Chart placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution par mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-secondary/10 rounded-lg">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-12 w-12 text-secondary mx-auto" />
                  <p className="text-muted-foreground">Graphique de distribution</p>
                  <p className="text-sm text-muted-foreground">Données en temps réel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Finances */}
        <Card>
          <CardHeader>
            <CardTitle>Finances par membre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberFinances.map((member) => (
                <div key={member.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{member.name}</span>
                    <span className="text-muted-foreground">{member.progress}%</span>
                  </div>
                  <Progress value={member.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CooperativeDashboard;