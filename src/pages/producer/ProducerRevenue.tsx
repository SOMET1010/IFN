import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, Target, DollarSign } from 'lucide-react';
import ProducerLayout from '@/components/producer/ProducerLayout';
import { formatCurrency } from '@/lib/format';
import FloatingVoiceNavigator from '@/components/producer/FloatingVoiceNavigator';

const ProducerRevenue = () => {
  const revenueData = [
    { month: "Janvier", revenue: 800000, target: 1000000 },
    { month: "Février", revenue: 625000, target: 800000 },
    { month: "Mars", revenue: 225000, target: 600000 },
    { month: "Avril", revenue: 0, target: 700000 },
  ];

  const totalRevenue = revenueData.reduce((sum, month) => sum + month.revenue, 0);
  const totalTarget = revenueData.reduce((sum, month) => sum + month.target, 0);
  const achievementRate = Math.round((totalRevenue / totalTarget) * 100);

  const productRevenue = [
    { product: "Cacao", revenue: 800000, percentage: 48.5 },
    { product: "Café", revenue: 625000, percentage: 37.9 },
    { product: "Anacarde", revenue: 225000, percentage: 13.6 },
  ];
  const currentMonthRevenue = revenueData[revenueData.length - 1]?.revenue ?? 0;

  return (
      <ProducerLayout title="Revenus" showBackButton={true} backTo="/producer/dashboard">

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            {/* Revenue Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Revenus totaux</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Ce mois</p>
                  <p className="text-lg sm:text-2xl font-bold">{formatCurrency(currentMonthRevenue)}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Objectif atteint</p>
                  <p className="text-lg sm:text-2xl font-bold">{achievementRate}%</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Croissance</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">+12%</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Revenus par mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data) => (
                  <div key={data.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(data.revenue)} / {formatCurrency(data.target)}
                      </span>
                    </div>
                    <Progress 
                      value={(data.revenue / data.target) * 100} 
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {Math.round((data.revenue / data.target) * 100)}% de l'objectif
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Product */}
          <Card>
            <CardHeader>
              <CardTitle>Revenus par produit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productRevenue.map((product) => (
                  <div key={product.product} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{product.product}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={product.percentage} className="flex-1 h-2" />
                      <span className="text-xs font-medium w-12 text-right">
                        {product.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </main>
        <FloatingVoiceNavigator />
      </ProducerLayout>
  );
};

export default ProducerRevenue;
