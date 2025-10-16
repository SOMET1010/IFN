import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  Star,
  Users,
  Calendar,
  Target,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatCurrency as fc } from '@/lib/format';

interface OfferAnalyticsProps {
  offers: Record<string, unknown>[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OfferAnalytics = ({ offers, timeRange, onTimeRangeChange }: OfferAnalyticsProps) => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalClicks: 0,
      conversionRate: 0,
      averageRating: 0,
      totalRevenue: 0
    },
    performance: {
      topPerformers: [],
      trendingUp: [],
      trendingDown: []
    },
    insights: {
      bestTimeToPost: '',
      optimalPriceRange: '',
      suggestedImprovements: []
    }
  });

  const [chartData, setChartData] = useState({
    viewsOverTime: [],
    revenueOverTime: [],
    categoryDistribution: [],
    pricePerformance: []
  });

  useEffect(() => {
    calculateAnalytics();
  }, [offers, timeRange, calculateAnalytics]);

  const calculateAnalytics = useCallback(() => {
    // Calculate overview metrics
    const totalViews = offers.reduce((sum, offer) => sum + (offer.views || 0), 0);
    const totalClicks = offers.reduce((sum, offer) => sum + (offer.clicks || 0), 0);
    const totalPurchases = offers.reduce((sum, offer) => sum + (offer.purchases || 0), 0);
    const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;
    const averageRating = offers.reduce((sum, offer) => sum + (offer.rating || 0), 0) / offers.length || 0;
    const totalRevenue = offers.reduce((sum, offer) => sum + (offer.revenue || 0), 0);

    // Identify top performers
    const topPerformers = offers
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    // Identify trending up/down
    const trendingUp = offers
      .filter(offer => (offer.trend || 0) > 0)
      .sort((a, b) => (b.trend || 0) - (a.trend || 0))
      .slice(0, 3);

    const trendingDown = offers
      .filter(offer => (offer.trend || 0) < 0)
      .sort((a, b) => (a.trend || 0) - (b.trend || 0))
      .slice(0, 3);

    // Generate insights
    const insights = {
      bestTimeToPost: '9h-11h et 17h-19h',
      optimalPriceRange: '500-2000 FCFA',
      suggestedImprovements: [
        'Ajouter plus de photos pour augmenter les vues de 25%',
        'Répondre rapidement aux questions pour améliorer la conversion',
        'Mettre à jour les prix selon la demande du marché'
      ]
    };

    setAnalytics({
      overview: {
        totalViews,
        totalClicks,
        conversionRate,
        averageRating,
        totalRevenue
      },
      performance: {
        topPerformers,
        trendingUp,
        trendingDown
      },
      insights
    });

    // Generate chart data
    generateChartData();
  }, [offers, generateChartData]);

  const generateChartData = useCallback(() => {
    // Views over time (mock data for demonstration)
    const viewsOverTime = Array.from({ length: 7 }, (_, i) => ({
      date: `J-${6 - i}`,
      views: Math.floor(Math.random() * 1000) + 200,
      clicks: Math.floor(Math.random() * 100) + 10
    }));

    // Revenue over time
    const revenueOverTime = Array.from({ length: 7 }, (_, i) => ({
      date: `J-${6 - i}`,
      revenue: Math.floor(Math.random() * 50000) + 10000
    }));

    // Category distribution
    const categoryCount = offers.reduce((acc, offer) => {
      acc[offer.category] = (acc[offer.category] || 0) + 1;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));

    // Price performance
    const pricePerformance = offers.map(offer => ({
      name: offer.name,
      price: offer.price,
      views: offer.views || 0,
      revenue: offer.revenue || 0
    }));

    setChartData({
      viewsOverTime,
      revenueOverTime,
      categoryDistribution,
      pricePerformance
    });
  }, [offers, fc]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatCurrency = (amount: number) => fc(amount);

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Analytique des offres</h2>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vues totales</p>
                <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalViews)}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taux de conversion</p>
                <p className="text-2xl font-bold">{analytics.overview.conversionRate.toFixed(1)}%</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.3%
                </div>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Note moyenne</p>
                <p className="text-2xl font-bold">{analytics.overview.averageRating.toFixed(1)}/5</p>
                <div className="flex items-center text-xs text-yellow-600">
                  <Star className="h-3 w-3 mr-1" />
                  Stable
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Revenus</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18%
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Offres actives</p>
                <p className="text-2xl font-bold">{offers.length}</p>
                <div className="flex items-center text-xs text-blue-600">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  En ligne
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Vues et conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="clicks" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenus sur la période</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Répartition par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Insights de performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Meilleur moment pour publier
              </h4>
              <p className="text-sm text-gray-600">{analytics.insights.bestTimeToPost}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Fourchette de prix optimale
              </h4>
              <p className="text-sm text-gray-600">{analytics.insights.optimalPriceRange}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Suggestions d'amélioration
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {analytics.insights.suggestedImprovements.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Meilleures performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performance.topPerformers.slice(0, 3).map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.name}</p>
                      <p className="text-xs text-gray-600">{formatNumber(offer.views || 0)} vues</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Top
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              En tendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performance.trendingUp.map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.name}</p>
                      <p className="text-xs text-gray-600">+{Math.abs(offer.trend || 0)}%</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    En hausse
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center">
              <TrendingDown className="h-4 w-4 mr-2" />
              À améliorer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.performance.trendingDown.map((offer, index) => (
                <div key={offer.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{offer.name}</p>
                      <p className="text-xs text-gray-600">{Math.abs(offer.trend || 0)}%</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    En baisse
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OfferAnalytics;
