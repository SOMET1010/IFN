import { ProducerOffer } from '@/types';

export interface MarketTrend {
  product: string;
  currentPrice: number;
  priceUnit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  confidence: number; // 0-1
  historicalPrices: HistoricalPrice[];
  competitorPrices: CompetitorPrice[];
  seasonalFactor: number;
  recommendations: PriceRecommendation[];
}

export interface HistoricalPrice {
  date: string;
  price: number;
  volume: number;
  quality?: 'Premium' | 'Standard' | 'Bio';
}

export interface CompetitorPrice {
  producerId: string;
  producerName: string;
  price: number;
  quality: 'Premium' | 'Standard' | 'Bio';
  location: string;
  rating: number;
}

export interface PriceRecommendation {
  type: 'conservative' | 'balanced' | 'aggressive';
  suggestedPrice: number;
  reasoning: string;
  confidence: number;
  expectedVolume: number;
  risk: 'low' | 'medium' | 'high';
}

export interface PriceAlert {
  product: string;
  type: 'spike' | 'drop' | 'opportunity' | 'competition';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action: 'hold' | 'sell' | 'wait' | 'adjust';
}

export class MarketTrendsService {
  private static instance: MarketTrendsService;
  private cache = new Map<string, { data: MarketTrend; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): MarketTrendsService {
    if (!MarketTrendsService.instance) {
      MarketTrendsService.instance = new MarketTrendsService();
    }
    return MarketTrendsService.instance;
  }

  async getMarketTrend(product: string, region?: string): Promise<MarketTrend | null> {
    try {
      // Check cache first
      const cacheKey = `${product}-${region || 'default'}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }

      // Simulate API call with mock data
      const trend = await this.generateMockMarketTrend(product, region);

      // Cache the result
      this.cache.set(cacheKey, { data: trend, timestamp: Date.now() });

      return trend;
    } catch (error) {
      console.error('Erreur lors de la récupération des tendances du marché:', error);
      return null;
    }
  }

  async getMultipleMarketTrends(products: string[], region?: string): Promise<MarketTrend[]> {
    const trends: MarketTrend[] = [];

    for (const product of products) {
      const trend = await this.getMarketTrend(product, region);
      if (trend) {
        trends.push(trend);
      }
    }

    return trends;
  }

  async getPriceRecommendations(product: string, quality: 'Premium' | 'Standard' | 'Bio', quantity: number, region?: string): Promise<PriceRecommendation[]> {
    const trend = await this.getMarketTrend(product, region);
    if (!trend) {
      return [];
    }

    const basePrice = trend.currentPrice;
    const qualityMultiplier = {
      Premium: 1.2,
      Standard: 1.0,
      Bio: 1.35
    }[quality];

    const quantityMultiplier = quantity > 500 ? 0.95 : quantity > 100 ? 0.98 : 1.0;
    const seasonalMultiplier = trend.seasonalFactor;

    const recommendedBasePrice = basePrice * qualityMultiplier * quantityMultiplier * seasonalMultiplier;

    return [
      {
        type: 'conservative',
        suggestedPrice: recommendedBasePrice * 0.95,
        reasoning: 'Prix conservateur pour vente rapide, légèrement sous le marché',
        confidence: 0.85,
        expectedVolume: Math.max(quantity * 1.1, quantity + 50),
        risk: 'low'
      },
      {
        type: 'balanced',
        suggestedPrice: recommendedBasePrice,
        reasoning: 'Prix équilibré basé sur les conditions actuelles du marché',
        confidence: 0.75,
        expectedVolume: quantity,
        risk: 'medium'
      },
      {
        type: 'aggressive',
        suggestedPrice: recommendedBasePrice * 1.05,
        reasoning: 'Prix optimiste pour maximiser les profits',
        confidence: 0.6,
        expectedVolume: Math.max(quantity * 0.8, quantity - 30),
        risk: 'high'
      }
    ];
  }

  async getPriceAlerts(region?: string): Promise<PriceAlert[]> {
    // Simulate price alerts
    return [
      {
        product: 'Cacao',
        type: 'spike',
        message: 'Le prix du cacao a augmenté de 15% cette semaine',
        severity: 'high',
        action: 'sell'
      },
      {
        product: 'Café',
        type: 'opportunity',
        message: 'Demande élevée pour le café qualité Bio',
        severity: 'medium',
        action: 'adjust'
      }
    ];
  }

  async getCompetitorAnalysis(product: string, region?: string): Promise<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketShare: Array<{ producer: string; share: number; price: number }>;
    qualityDistribution: Array<{ quality: string; count: number; avgPrice: number }>;
  }> {
    const trend = await this.getMarketTrend(product, region);
    if (!trend) {
      throw new Error('Impossible d\'analyser les données du marché');
    }

    const prices = trend.competitorPrices.map(c => c.price);
    const averagePrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const qualityGroups = trend.competitorPrices.reduce((acc, comp) => {
      if (!acc[comp.quality]) {
        acc[comp.quality] = [];
      }
      acc[comp.quality].push(comp.price);
      return acc;
    }, {} as Record<string, number[]>);

    return {
      averagePrice,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      marketShare: trend.competitorPrices.map(comp => ({
        producer: comp.producerName,
        share: 1 / trend.competitorPrices.length,
        price: comp.price
      })),
      qualityDistribution: Object.entries(qualityGroups).map(([quality, prices]) => ({
        quality,
        count: prices.length,
        avgPrice: prices.reduce((sum, p) => sum + p, 0) / prices.length
      }))
    };
  }

  private async generateMockMarketTrend(product: string, region?: string): Promise<MarketTrend> {
    // Generate realistic mock data based on product type
    const basePrices = {
      'Cacao': 1200,
      'Café': 2800,
      'Ananas': 800,
      'Mangue': 600,
      'Manioc': 300
    };

    const basePrice = basePrices[product as keyof typeof basePrices] || 1000;
    const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const currentPrice = basePrice * (1 + variation);

    const trend: 'up' | 'down' | 'stable' = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
    const trendPercentage = trend === 'stable' ? Math.random() * 2 : Math.random() * 10;

    // Generate historical prices for the last 30 days
    const historicalPrices: HistoricalPrice[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.3);
      historicalPrices.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price),
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }

    // Generate competitor prices
    const competitorPrices: CompetitorPrice[] = [
      {
        producerId: 'comp1',
        producerName: 'Coopérative Yopougon',
        price: currentPrice * 0.95,
        quality: 'Standard',
        location: 'Yopougon',
        rating: 4.2
      },
      {
        producerId: 'comp2',
        producerName: 'Plantation Bouaké',
        price: currentPrice * 1.1,
        quality: 'Premium',
        location: 'Bouaké',
        rating: 4.5
      },
      {
        producerId: 'comp3',
        producerName: 'Agriculteurs Unis',
        price: currentPrice * 0.9,
        quality: 'Standard',
        location: 'Daloa',
        rating: 3.8
      }
    ];

    // Calculate seasonal factor (simplified)
    const currentMonth = new Date().getMonth();
    const seasonalFactor = 0.9 + Math.sin((currentMonth / 12) * 2 * Math.PI) * 0.1;

    return {
      product,
      currentPrice: Math.round(currentPrice),
      priceUnit: 'FCFA/kg',
      trend,
      trendPercentage: Math.round(trendPercentage * 10) / 10,
      confidence: 0.7 + Math.random() * 0.3,
      historicalPrices,
      competitorPrices,
      seasonalFactor: Math.round(seasonalFactor * 100) / 100,
      recommendations: [
        {
          type: 'conservative' as const,
          suggestedPrice: Math.round(currentPrice * 0.95),
          reasoning: 'Prix conservateur pour vente rapide',
          confidence: 0.85,
          expectedVolume: 150,
          risk: 'low' as const
        },
        {
          type: 'balanced' as const,
          suggestedPrice: Math.round(currentPrice),
          reasoning: 'Prix équilibré basé sur le marché',
          confidence: 0.75,
          expectedVolume: 120,
          risk: 'medium' as const
        }
      ]
    };
  }

  async predictPriceTrend(product: string, daysAhead: number = 7, region?: string): Promise<{
    predictedPrice: number;
    confidence: number;
    factors: string[];
  }> {
    const trend = await this.getMarketTrend(product, region);
    if (!trend) {
      throw new Error('Impossible de prédire la tendance');
    }

    // Simple prediction based on current trend and historical data
    const trendDirection = trend.trend === 'up' ? 1 : trend.trend === 'down' ? -1 : 0;
    const trendStrength = trend.trendPercentage / 100;

    // Apply trend with decay over time
    const trendDecay = Math.max(0, 1 - (daysAhead / 30));
    const priceChange = trendDirection * trendStrength * trendDecay;

    const predictedPrice = trend.currentPrice * (1 + priceChange);

    return {
      predictedPrice: Math.round(predictedPrice),
      confidence: Math.max(0.3, trend.confidence * trendDecay),
      factors: [
        `Tendance actuelle: ${trend.trend} ${trend.trendPercentage}%`,
        `Saisonnalité: ${Math.round((trend.seasonalFactor - 1) * 100)}%`,
        `Prédiction sur ${daysAhead} jours`
      ]
    };
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const marketTrendsService = MarketTrendsService.getInstance();