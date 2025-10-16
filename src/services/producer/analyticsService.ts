import { ProducerSale, ProducerOffer, ProducerHarvest } from '@/types';

export interface AnalyticsData {
  overview: OverviewMetrics;
  sales: SalesAnalytics;
  production: ProductionAnalytics;
  financial: FinancialAnalytics;
  market: MarketAnalytics;
  predictions: PredictiveAnalytics;
  trends: TrendAnalysis;
}

export interface OverviewMetrics {
  totalRevenue: number;
  totalQuantity: number;
  averageOrderValue: number;
  customerCount: number;
  growthRate: number;
  profitMargin: number;
  operationalEfficiency: number;
}

export interface SalesAnalytics {
  totalSales: number;
  salesByProduct: Array<{
    product: string;
    quantity: number;
    revenue: number;
    growth: number;
  }>;
  salesByMonth: Array<{
    month: string;
    revenue: number;
    quantity: number;
    orders: number;
  }>;
  salesByRegion: Array<{
    region: string;
    revenue: number;
    customers: number;
  }>;
  customerRetention: {
    newCustomers: number;
    returningCustomers: number;
    retentionRate: number;
  };
  salesChannelPerformance: Array<{
    channel: 'direct' | 'marketplace' | 'cooperative';
    revenue: number;
    growth: number;
    commission: number;
  }>;
}

export interface ProductionAnalytics {
  totalHarvests: number;
  totalProduction: number;
  yieldByProduct: Array<{
    product: string;
    quantity: number;
    quality: 'Premium' | 'Standard' | 'Bio';
    efficiency: number;
  }>;
  productionBySeason: Array<{
    season: string;
    production: number;
    revenue: number;
    costs: number;
  }>;
  qualityMetrics: {
    premiumQuality: number;
    standardQuality: number;
    organicQuality: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
  };
  productionEfficiency: {
    landUtilization: number;
    laborEfficiency: number;
    costPerUnit: number;
  };
}

export interface FinancialAnalytics {
  revenue: {
    total: number;
    byProduct: Array<{
      product: string;
      revenue: number;
      percentage: number;
    }>;
    byMonth: Array<{
      month: string;
      revenue: number;
      profit: number;
    }>;
  };
  costs: {
    total: number;
    operational: number;
    labor: number;
    materials: number;
    logistics: number;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
  cashFlow: Array<{
    date: string;
    inflow: number;
    outflow: number;
    balance: number;
  }>;
  keyRatios: {
    returnOnInvestment: number;
    operatingMargin: number;
    debtToEquity: number;
  };
}

export interface MarketAnalytics {
  marketPosition: {
    marketShare: number;
    competitorCount: number;
    pricePosition: 'premium' | 'competitive' | 'budget';
  };
  priceAnalysis: {
    averagePrice: number;
    priceVsMarket: number;
    priceElasticity: number;
    optimalPrice: number;
  };
  customerSatisfaction: {
    averageRating: number;
    reviewCount: number;
    satisfactionTrend: 'improving' | 'stable' | 'declining';
  };
  marketTrends: Array<{
    product: string;
    demand: 'increasing' | 'stable' | 'decreasing';
    priceTrend: 'up' | 'stable' | 'down';
    seasonality: number;
  }>;
}

export interface PredictiveAnalytics {
  revenueForecast: Array<{
    period: string;
    predicted: number;
    confidence: number;
    factors: string[];
  }>;
  demandPrediction: Array<{
    product: string;
    predictedDemand: number;
    season: string;
    confidence: number;
  }>;
  priceRecommendations: Array<{
    product: string;
    currentPrice: number;
    recommendedPrice: number;
    reason: string;
    expectedImpact: 'positive' | 'neutral' | 'negative';
  }>;
  riskAssessment: Array<{
    type: 'market' | 'operational' | 'financial' | 'environmental';
    level: 'low' | 'medium' | 'high';
    probability: number;
    impact: number;
    mitigation: string;
  }>;
}

export interface TrendAnalysis {
  revenueTrend: {
    direction: 'up' | 'down' | 'stable';
    rate: number;
    momentum: 'accelerating' | 'stable' | 'decelerating';
  };
  efficiencyTrend: {
    direction: 'up' | 'down' | 'stable';
    rate: number;
  };
  qualityTrend: {
    direction: 'improving' | 'stable' | 'declining';
    factors: string[];
  };
  seasonalPatterns: Array<{
    product: string;
    peakMonths: number[];
    lowMonths: number[];
    seasonalityStrength: number;
  }>;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private cache = new Map<string, { data: AnalyticsData; timestamp: number }>();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getAnalytics(producerId: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<AnalyticsData> {
    try {
      const cacheKey = `${producerId}-${period}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // In real implementation, this would fetch from various data sources
      const analytics = await this.generateMockAnalytics(producerId, period);

      this.cache.set(cacheKey, { data: analytics, timestamp: Date.now() });
      return analytics;
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      throw error;
    }
  }

  async getRealTimeMetrics(producerId: string): Promise<{
    activeOrders: number;
    todayRevenue: number;
    pendingDeliveries: number;
    inventoryLevel: number;
    systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  }> {
    try {
      // Mock real-time data
      return {
        activeOrders: Math.floor(Math.random() * 10) + 1,
        todayRevenue: Math.floor(Math.random() * 500000) + 100000,
        pendingDeliveries: Math.floor(Math.random() * 5),
        inventoryLevel: Math.floor(Math.random() * 5000) + 1000,
        systemHealth: Math.random() > 0.8 ? 'excellent' : Math.random() > 0.5 ? 'good' : 'warning'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques temps réel:', error);
      throw error;
    }
  }

  async getCustomReport(
    producerId: string,
    reportType: 'financial' | 'production' | 'sales' | 'comprehensive',
    dateRange: { start: string; end: string },
    format: 'pdf' | 'excel' | 'json'
  ): Promise<{
    reportUrl: string;
    generatedAt: string;
    size: number;
    expiresAt: string;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      return {
        reportUrl: `/reports/${producerId}/${reportType}-${Date.now()}.${format}`,
        generatedAt: new Date().toISOString(),
        size: Math.floor(Math.random() * 10000000) + 1000000,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw error;
    }
  }

  async getBenchmarking(producerId: string): Promise<{
    industryAverages: {
      revenuePerAcre: number;
      profitMargin: number;
      yieldPerHectare: number;
      customerRetention: number;
    };
    peerComparison: Array<{
      metric: string;
      yourValue: number;
      peerAverage: number;
      percentile: number;
      ranking: string;
    }>;
    recommendations: Array<{
      area: string;
      current: number;
      target: number;
      impact: 'high' | 'medium' | 'low';
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
  }> {
    try {
      return {
        industryAverages: {
          revenuePerAcre: 2500000,
          profitMargin: 0.25,
          yieldPerHectare: 2000,
          customerRetention: 0.75
        },
        peerComparison: [
          {
            metric: 'Revenue per Acre',
            yourValue: 2800000,
            peerAverage: 2500000,
            percentile: 75,
            ranking: 'Top 25%'
          },
          {
            metric: 'Profit Margin',
            yourValue: 0.28,
            peerAverage: 0.25,
            percentile: 70,
            ranking: 'Top 30%'
          }
        ],
        recommendations: [
          {
            area: 'Organic Certification',
            current: 0,
            target: 1,
            impact: 'high',
            difficulty: 'medium'
          },
          {
            area: 'Direct Sales Channel',
            current: 0.6,
            target: 0.8,
            impact: 'medium',
            difficulty: 'easy'
          }
        ]
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du benchmarking:', error);
      throw error;
    }
  }

  private async generateMockAnalytics(producerId: string, period: string): Promise<AnalyticsData> {
    // Generate comprehensive mock analytics data
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
      overview: {
        totalRevenue: 12500000,
        totalQuantity: 8500,
        averageOrderValue: 1470000,
        customerCount: 45,
        growthRate: 0.15,
        profitMargin: 0.28,
        operationalEfficiency: 0.85
      },
      sales: {
        totalSales: 12500000,
        salesByProduct: [
          { product: 'Cacao', quantity: 3500, revenue: 4200000, growth: 0.12 },
          { product: 'Café', quantity: 2500, revenue: 7000000, growth: 0.18 },
          { product: 'Ananas', quantity: 2500, revenue: 1300000, growth: 0.08 }
        ],
        salesByMonth: months.map((month, index) => ({
          month,
          revenue: Math.floor(Math.random() * 2000000) + 800000,
          quantity: Math.floor(Math.random() * 1000) + 300,
          orders: Math.floor(Math.random() * 20) + 5
        })),
        salesByRegion: [
          { region: 'Abidjan', revenue: 7500000, customers: 25 },
          { region: 'Bouaké', revenue: 3000000, customers: 12 },
          { region: 'Yamoussoukro', revenue: 2000000, customers: 8 }
        ],
        customerRetention: {
          newCustomers: 15,
          returningCustomers: 30,
          retentionRate: 0.67
        },
        salesChannelPerformance: [
          { channel: 'direct', revenue: 5000000, growth: 0.20, commission: 0.05 },
          { channel: 'marketplace', revenue: 6000000, growth: 0.15, commission: 0.10 },
          { channel: 'cooperative', revenue: 1500000, growth: 0.05, commission: 0.03 }
        ]
      },
      production: {
        totalHarvests: 24,
        totalProduction: 12000,
        yieldByProduct: [
          { product: 'Cacao', quantity: 5000, quality: 'Premium', efficiency: 0.85 },
          { product: 'Café', quantity: 4000, quality: 'Standard', efficiency: 0.78 },
          { product: 'Ananas', quantity: 3000, quality: 'Bio', efficiency: 0.92 }
        ],
        productionBySeason: [
          { season: 'Dry Season', production: 5000, revenue: 6500000, costs: 3200000 },
          { season: 'Rainy Season', production: 7000, revenue: 8500000, costs: 4000000 }
        ],
        qualityMetrics: {
          premiumQuality: 35,
          standardQuality: 45,
          organicQuality: 20,
          qualityTrend: 'improving'
        },
        productionEfficiency: {
          landUtilization: 0.78,
          laborEfficiency: 0.82,
          costPerUnit: 650
        }
      },
      financial: {
        revenue: {
          total: 12500000,
          byProduct: [
            { product: 'Cacao', revenue: 4200000, percentage: 33.6 },
            { product: 'Café', revenue: 7000000, percentage: 56.0 },
            { product: 'Ananas', revenue: 1300000, percentage: 10.4 }
          ],
          byMonth: months.map((month, index) => ({
            month,
            revenue: Math.floor(Math.random() * 1500000) + 800000,
            profit: Math.floor(Math.random() * 400000) + 200000
          }))
        },
        costs: {
          total: 9000000,
          operational: 3500000,
          labor: 2500000,
          materials: 2000000,
          logistics: 1000000
        },
        profit: {
          gross: 6500000,
          net: 3500000,
          margin: 0.28,
          trend: 'increasing'
        },
        cashFlow: months.slice(0, 6).map((month, index) => ({
          date: new Date(now.getFullYear(), index, 1).toISOString().split('T')[0],
          inflow: Math.floor(Math.random() * 2000000) + 1000000,
          outflow: Math.floor(Math.random() * 1500000) + 500000,
          balance: Math.floor(Math.random() * 1000000) + 500000
        })),
        keyRatios: {
          returnOnInvestment: 0.28,
          operatingMargin: 0.26,
          debtToEquity: 0.15
        }
      },
      market: {
        marketPosition: {
          marketShare: 0.08,
          competitorCount: 25,
          pricePosition: 'premium'
        },
        priceAnalysis: {
          averagePrice: 1470,
          priceVsMarket: 0.12,
          priceElasticity: -0.8,
          optimalPrice: 1520
        },
        customerSatisfaction: {
          averageRating: 4.6,
          reviewCount: 127,
          satisfactionTrend: 'improving'
        },
        marketTrends: [
          { product: 'Cacao', demand: 'increasing', priceTrend: 'up', seasonality: 0.3 },
          { product: 'Café', demand: 'stable', priceTrend: 'stable', seasonality: 0.2 },
          { product: 'Ananas', demand: 'increasing', priceTrend: 'up', seasonality: 0.5 }
        ]
      },
      predictions: {
        revenueForecast: [
          { period: 'Next Month', predicted: 1350000, confidence: 0.85, factors: ['Seasonal demand', 'Market growth'] },
          { period: 'Next Quarter', predicted: 4200000, confidence: 0.78, factors: ['Harvest season', 'New contracts'] },
          { period: 'Next Year', predicted: 18000000, confidence: 0.70, factors: ['Market expansion', 'Efficiency improvements'] }
        ],
        demandPrediction: [
          { product: 'Cacao', predictedDemand: 600, season: 'High Season', confidence: 0.88 },
          { product: 'Café', predictedDemand: 450, season: 'Harvest Season', confidence: 0.82 },
          { product: 'Ananas', predictedDemand: 350, season: 'Growing Season', confidence: 0.75 }
        ],
        priceRecommendations: [
          { product: 'Cacao', currentPrice: 1200, recommendedPrice: 1250, reason: 'Market demand increasing', expectedImpact: 'positive' },
          { product: 'Café', currentPrice: 2800, recommendedPrice: 2800, reason: 'Market stable', expectedImpact: 'neutral' },
          { product: 'Ananas', currentPrice: 800, recommendedPrice: 850, reason: 'Quality premium opportunity', expectedImpact: 'positive' }
        ],
        riskAssessment: [
          { type: 'market', level: 'medium', probability: 0.3, impact: 0.4, mitigation: 'Diversify customer base' },
          { type: 'operational', level: 'low', probability: 0.15, impact: 0.2, mitigation: 'Equipment maintenance' },
          { type: 'financial', level: 'low', probability: 0.1, impact: 0.3, mitigation: 'Cash flow management' }
        ]
      },
      trends: {
        revenueTrend: {
          direction: 'up',
          rate: 0.15,
          momentum: 'accelerating'
        },
        efficiencyTrend: {
          direction: 'up',
          rate: 0.08
        },
        qualityTrend: {
          direction: 'improving',
          factors: ['Better training', 'New equipment', 'Improved processes']
        },
        seasonalPatterns: [
          { product: 'Cacao', peakMonths: [10, 11, 12], lowMonths: [5, 6, 7], seasonalityStrength: 0.7 },
          { product: 'Café', peakMonths: [3, 4, 5], lowMonths: [8, 9, 10], seasonalityStrength: 0.6 },
          { product: 'Ananas', peakMonths: [1, 2, 3], lowMonths: [7, 8, 9], seasonalityStrength: 0.8 }
        ]
      }
    };
  }

  async getAlerts(producerId: string): Promise<Array<{
    id: string;
    type: 'opportunity' | 'warning' | 'critical';
    title: string;
    message: string;
    actionRequired: boolean;
    timestamp: string;
    category: 'sales' | 'production' | 'financial' | 'market' | 'operational';
  }>> {
    try {
      return [
        {
          id: 'alert1',
          type: 'opportunity',
          title: 'Demande élevée de Cacao Bio',
          message: 'Le marché montre une demande croissante pour le cacao biologique certifié',
          actionRequired: true,
          timestamp: new Date().toISOString(),
          category: 'market'
        },
        {
          id: 'alert2',
          type: 'warning',
          title: 'Coût logistique en hausse',
          message: 'Les coûts de transport ont augmenté de 15% ce mois-ci',
          actionRequired: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          category: 'financial'
        }
      ];
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const analyticsService = AnalyticsService.getInstance();