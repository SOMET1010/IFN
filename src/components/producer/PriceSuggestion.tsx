import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Star,
  Calendar,
  Target,
  Info,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { marketTrendsService, MarketTrend, PriceRecommendation } from '@/services/producer/marketTrendsService';
import { formatCurrency, formatDate } from '@/lib/format';

interface PriceSuggestionProps {
  product: string;
  quality: 'Premium' | 'Standard' | 'Bio';
  quantity: number;
  region?: string;
  onPriceSelect?: (price: number, recommendationType: string) => void;
  currentPrice?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export function PriceSuggestion({
  product,
  quality,
  quantity,
  region,
  onPriceSelect,
  currentPrice
}: PriceSuggestionProps) {
  const [marketTrend, setMarketTrend] = useState<MarketTrend | null>(null);
  const [recommendations, setRecommendations] = useState<PriceRecommendation[]>([]);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<PriceRecommendation | null>(null);

  useEffect(() => {
    loadMarketData();
  }, [product, quality, quantity, region]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [trend, recs, analysis] = await Promise.all([
        marketTrendsService.getMarketTrend(product, region),
        marketTrendsService.getPriceRecommendations(product, quality, quantity, region),
        marketTrendsService.getCompetitorAnalysis(product, region)
      ]);

      setMarketTrend(trend);
      setRecommendations(recs);
      setCompetitorAnalysis(analysis);
    } catch (error) {
      console.error('Erreur lors du chargement des données du marché:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const formatChartData = (historicalPrices: Record<string, unknown>[]) => {
    return historicalPrices.map((item, index) => ({
      name: `${index + 1}`,
      price: item.price,
      date: item.date
    })).slice(-30); // Last 30 days
  };

  const getPriceDifference = (suggestedPrice: number) => {
    if (!currentPrice) return null;
    const difference = ((suggestedPrice - currentPrice) / currentPrice) * 100;
    return {
      percentage: Math.abs(difference).toFixed(1),
      isHigher: difference > 0
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyses du marché en cours...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={60} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Chargement des données du marché et des recommandations...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!marketTrend) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Données du marché indisponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Impossible de récupérer les données du marché pour ce produit. Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const chartData = formatChartData(marketTrend.historicalPrices);

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon(marketTrend.trend)}
            Analyse du marché - {product}
          </CardTitle>
          <CardDescription>
            Tendances actuelles et recommandations de prix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(marketTrend.currentPrice)}</div>
              <div className="text-sm text-muted-foreground">Prix actuel du marché</div>
              <div className={`flex items-center justify-center gap-1 mt-1 ${getTrendColor(marketTrend.trend)}`}>
                {getTrendIcon(marketTrend.trend)}
                <span className="text-sm font-medium">{marketTrend.trendPercentage}%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{marketTrend.competitorPrices.length}</div>
              <div className="text-sm text-muted-foreground">Concurrents actifs</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">{competitorAnalysis?.marketShare?.length || 0}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(marketTrend.confidence * 100)}%</div>
              <div className="text-sm text-muted-foreground">Confiance prédiction</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Fiable</span>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Prix']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? formatDate(item.date) : label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommandations de prix
          </CardTitle>
          <CardDescription>
            Suggestions basées sur l'analyse du marché et vos paramètres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => {
              const priceDiff = getPriceDifference(rec.suggestedPrice);

              return (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedRecommendation?.type === rec.type ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedRecommendation(rec)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{rec.type}</span>
                      <Badge className={getRiskColor(rec.risk)}>
                        {rec.risk}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(rec.suggestedPrice)}
                        </div>
                        {priceDiff && (
                          <div className={`text-sm mt-1 ${
                            priceDiff.isHigher ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {priceDiff.isHigher ? '+' : '-'}{priceDiff.percentage}% par rapport à votre prix
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>{rec.reasoning}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Confiance:</span>
                          <div className="flex items-center gap-1">
                            <Progress value={rec.confidence * 100} className="flex-1" />
                            <span>{Math.round(rec.confidence * 100)}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Volume attendu:</span>
                          <div>{rec.expectedVolume} kg</div>
                        </div>
                      </div>

                      <Button
                        className="w-full mt-4"
                        onClick={() => onPriceSelect?.(rec.suggestedPrice, rec.type)}
                      >
                        Appliquer ce prix
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Analysis */}
      {competitorAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Analyse concurrentielle
            </CardTitle>
            <CardDescription>
              Comparaison avec les autres producteurs sur le marché
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="prices" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="prices">Prix</TabsTrigger>
                <TabsTrigger value="quality">Qualité</TabsTrigger>
                <TabsTrigger value="location">Localisation</TabsTrigger>
              </TabsList>

              <TabsContent value="prices" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketTrend.competitorPrices}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="producerName" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Prix']} />
                      <Bar dataKey="price" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-semibold">Prix moyen</div>
                    <div className="text-lg text-primary">{formatCurrency(competitorAnalysis.averagePrice)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Écart min</div>
                    <div className="text-lg text-green-600">{formatCurrency(competitorAnalysis.priceRange.min)}</div>
                  </div>
                  <div>
                    <div className="font-semibold">Écart max</div>
                    <div className="text-lg text-red-600">{formatCurrency(competitorAnalysis.priceRange.max)}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={competitorAnalysis.qualityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ quality, count, avgPrice }) => `${quality}: ${count} (${formatCurrency(avgPrice)})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {competitorAnalysis.qualityDistribution.map((entry: Record<string, unknown>, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div className="grid gap-4">
                  {marketTrend.competitorPrices.map((competitor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold">{competitor.producerName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{competitor.producerName}</div>
                          <div className="text-sm text-muted-foreground">{competitor.location}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(competitor.price)}</div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-sm">{competitor.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights du marché
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Saisonnalité:</strong> Le facteur saisonnier actuel est de {Math.round((marketTrend.seasonalFactor - 1) * 100)}%.
                {marketTrend.seasonalFactor > 1 ? ' C\'est une période favorable pour les prix.' : ' Les prix sont actuellement plus bas que la moyenne.'}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Opportunités</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Demande élevée pour la qualité {quality}</li>
                  <li>• Saison favorable pour {product}</li>
                  <li>• Concurrence limitée dans votre région</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Recommandations</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Considérer la qualité Bio pour +35% de valeur</li>
                  <li>• Volume optimal: {quantity}kg pour le meilleur prix</li>
                  <li>• Surveiller les prix la semaine prochaine</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}