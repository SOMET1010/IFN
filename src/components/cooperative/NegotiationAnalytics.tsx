import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Award, Clock, DollarSign, Package, Lightbulb } from "lucide-react";
import type { NegotiationMetrics, NegotiationInsight } from "@/types/negotiations";

const mockMetrics: NegotiationMetrics = {
  totalNegotiations: 45,
  activeNegotiations: 8,
  conversionRate: 68,
  averageDuration: 2.5,
  averageDiscount: 7.2,
  topBuyers: [
    { buyerId: "B1", buyerName: "Établissements KOFFI", transactions: 12, totalValue: 45000000 },
    { buyerId: "B2", buyerName: "Barry Callebaut", transactions: 8, totalValue: 38000000 },
    { buyerId: "B3", buyerName: "SOCOCE", transactions: 6, totalValue: 22000000 },
  ],
  monthlyTrend: [
    { month: "Mai", negotiations: 8, conversions: 5, revenue: 15000000 },
    { month: "Juin", negotiations: 10, conversions: 7, revenue: 22000000 },
    { month: "Juil", negotiations: 12, conversions: 9, revenue: 28000000 },
    { month: "Août", negotiations: 9, conversions: 6, revenue: 19000000 },
    { month: "Sept", negotiations: 11, conversions: 8, revenue: 25000000 },
    { month: "Oct", negotiations: 13, conversions: 10, revenue: 32000000 },
  ],
  byProduct: [
    { productName: "Cacao", negotiations: 18, conversionRate: 72, averagePrice: 2400 },
    { productName: "Café", negotiations: 12, conversionRate: 67, averagePrice: 1950 },
    { productName: "Anacarde", negotiations: 10, conversionRate: 60, averagePrice: 1750 },
    { productName: "Karité", negotiations: 5, conversionRate: 80, averagePrice: 2850 },
  ],
};

const mockInsights: NegotiationInsight[] = [
  {
    id: "INS-1",
    type: "success",
    title: "Excellente performance Cacao",
    description: "Vos négociations pour le Cacao se concluent 30% plus vite que la moyenne",
    metric: "2.1 jours",
    comparison: "vs 3.0 jours (moyenne)",
    recommendation: "Continuez à utiliser la même stratégie de prix",
    createdAt: "2025-10-16",
  },
  {
    id: "INS-2",
    type: "warning",
    title: "Marge de négociation élevée",
    description: "Les acheteurs demandent en moyenne 8% de réduction",
    metric: "8%",
    comparison: "vs 5% (recommandé)",
    recommendation: "Ajustez vos prix initiaux légèrement à la hausse",
    createdAt: "2025-10-15",
  },
  {
    id: "INS-3",
    type: "info",
    title: "Meilleur jour pour publier",
    description: "Les offres publiées le mardi obtiennent 40% plus de réponses",
    metric: "Mardi",
    recommendation: "Planifiez vos publications pour le mardi matin",
    createdAt: "2025-10-14",
  },
];

const COLORS = ["#f97316", "#16a34a", "#3b82f6", "#a855f7"];

export const NegotiationAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytiques de Négociation</h2>
        <p className="text-gray-600">Analysez vos performances et optimisez votre stratégie</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{mockMetrics.conversionRate}%</h3>
            <p className="text-sm text-gray-500">Taux de Conversion</p>
            <Badge className="mt-2 bg-green-100 text-green-700">+12% vs mois dernier</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{mockMetrics.averageDuration}j</h3>
            <p className="text-sm text-gray-500">Durée Moyenne</p>
            <Badge className="mt-2 bg-orange-100 text-orange-700">-0.5j vs mois dernier</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{mockMetrics.averageDiscount}%</h3>
            <p className="text-sm text-gray-500">Réduction Moyenne</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">Optimal</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{mockMetrics.activeNegotiations}</h3>
            <p className="text-sm text-gray-500">En Cours</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            Insights IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockInsights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  insight.type === "success" ? "bg-green-100" :
                  insight.type === "warning" ? "bg-orange-100" : "bg-blue-100"
                }`}>
                  {insight.type === "success" ? <TrendingUp className="w-5 h-5 text-green-600" /> :
                   insight.type === "warning" ? <TrendingDown className="w-5 h-5 text-orange-600" /> :
                   <Lightbulb className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                  {insight.metric && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-gray-100 text-gray-700">{insight.metric}</Badge>
                      {insight.comparison && <span className="text-xs text-gray-500">{insight.comparison}</span>}
                    </div>
                  )}
                  {insight.recommendation && (
                    <p className="text-sm text-purple-700 font-medium">💡 {insight.recommendation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMetrics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="negotiations" stroke="#f97316" name="Négociations" />
                <Line type="monotone" dataKey="conversions" stroke="#16a34a" name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance par Produit</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMetrics.byProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversionRate" fill="#16a34a" name="Taux (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top acheteurs */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Acheteurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockMetrics.topBuyers.map((buyer, index) => (
              <div key={buyer.buyerId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{buyer.buyerName}</h4>
                  <p className="text-sm text-gray-600">{buyer.transactions} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {(buyer.totalValue / 1000000).toFixed(1)}M FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

