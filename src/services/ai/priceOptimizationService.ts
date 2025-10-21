/**
 * AI-Powered Price Optimization Service
 * Provides intelligent pricing recommendations based on market dynamics
 */

import { AIBaseService, PredictionResult } from './aiBaseService';
import { marketTrendsService, MarketTrend } from '../producer/marketTrendsService';

export interface PriceOptimization {
  productId: string;
  productName: string;
  currentPrice: number;
  optimizedPrice: number;
  expectedImpact: {
    revenueChange: number;
    volumeChange: number;
    profitChange: number;
  };
  confidence: number;
  reasoning: string[];
  strategy: 'premium' | 'competitive' | 'penetration' | 'skimming';
}

export interface DynamicPricing {
  basePrice: number;
  currentPrice: number;
  demandMultiplier: number;
  competitionMultiplier: number;
  seasonalMultiplier: number;
  timeMultiplier: number;
  finalPrice: number;
  factors: string[];
}

export interface PriceElasticity {
  productId: string;
  elasticity: number;
  interpretation: string;
  recommendation: string;
}

export interface CompetitivePricing {
  productId: string;
  yourPrice: number;
  averageMarketPrice: number;
  lowestPrice: number;
  highestPrice: number;
  position: 'below' | 'at' | 'above';
  recommendedAdjustment: number;
  reasoning: string;
}

export class PriceOptimizationService extends AIBaseService {
  private static instance: PriceOptimizationService;
  private priceHistory: Map<string, Array<{ price: number; date: Date; volume: number }>> = new Map();

  static getInstance(): PriceOptimizationService {
    if (!PriceOptimizationService.instance) {
      PriceOptimizationService.instance = new PriceOptimizationService({
        modelName: 'price-optimizer',
        version: '2.0.0',
        threshold: 0.7
      });
    }
    return PriceOptimizationService.instance;
  }

  async optimizePrice(
    productId: string,
    productName: string,
    currentPrice: number,
    cost: number,
    category: string,
    quality: 'Standard' | 'Premium' | 'Bio',
    currentVolume: number
  ): Promise<PriceOptimization> {
    await this.delay(400);

    const marketTrend = await marketTrendsService.getMarketTrend(productName);
    const elasticity = await this.calculatePriceElasticity(productId, currentPrice, currentVolume);
    const competitivePosition = await this.analyzeCompetitivePosition(
      productId,
      currentPrice,
      marketTrend
    );

    const strategy = this.determineStrategy(
      currentPrice,
      cost,
      competitivePosition,
      quality,
      elasticity.elasticity
    );

    const optimizedPrice = this.calculateOptimizedPrice(
      currentPrice,
      cost,
      strategy,
      elasticity.elasticity,
      competitivePosition,
      marketTrend
    );

    const impact = this.predictImpact(
      currentPrice,
      optimizedPrice,
      elasticity.elasticity,
      currentVolume,
      cost
    );

    const reasoning = this.generateReasoning(
      strategy,
      competitivePosition,
      elasticity,
      marketTrend,
      quality
    );

    const confidence = this.calculateConfidence(
      [0.8],
      marketTrend ? 0.9 : 0.6,
      this.getPriceHistoryLength(productId)
    );

    return {
      productId,
      productName,
      currentPrice,
      optimizedPrice,
      expectedImpact: impact,
      confidence,
      reasoning,
      strategy
    };
  }

  async calculateDynamicPrice(
    basePrice: number,
    productId: string,
    timeOfDay: number,
    demandLevel: 'low' | 'medium' | 'high',
    stockLevel: number,
    optimalStock: number
  ): Promise<DynamicPricing> {
    await this.delay(200);

    const factors: string[] = [];

    let demandMultiplier = 1.0;
    switch (demandLevel) {
      case 'high':
        demandMultiplier = 1.15;
        factors.push('Demande élevée: +15%');
        break;
      case 'low':
        demandMultiplier = 0.90;
        factors.push('Demande faible: -10%');
        break;
      default:
        factors.push('Demande normale');
    }

    let competitionMultiplier = 1.0;
    const marketData = await marketTrendsService.getMarketTrend('generic');
    if (marketData) {
      if (marketData.trend === 'down') {
        competitionMultiplier = 0.95;
        factors.push('Marché en baisse: -5%');
      } else if (marketData.trend === 'up') {
        competitionMultiplier = 1.05;
        factors.push('Marché en hausse: +5%');
      }
    }

    const currentMonth = new Date().getMonth();
    const seasonalMultiplier = 1 + 0.1 * Math.sin((currentMonth / 12) * 2 * Math.PI);
    if (Math.abs(seasonalMultiplier - 1) > 0.05) {
      factors.push(
        seasonalMultiplier > 1
          ? `Haute saison: +${Math.round((seasonalMultiplier - 1) * 100)}%`
          : `Basse saison: ${Math.round((seasonalMultiplier - 1) * 100)}%`
      );
    }

    let timeMultiplier = 1.0;
    if (timeOfDay >= 6 && timeOfDay <= 10) {
      timeMultiplier = 1.05;
      factors.push('Heures de pointe matinales: +5%');
    } else if (timeOfDay >= 17 && timeOfDay <= 20) {
      timeMultiplier = 1.08;
      factors.push('Heures de pointe soirées: +8%');
    } else if (timeOfDay >= 22 || timeOfDay <= 5) {
      timeMultiplier = 0.85;
      factors.push('Heures creuses: -15%');
    }

    const stockRatio = stockLevel / optimalStock;
    let stockMultiplier = 1.0;
    if (stockRatio > 1.5) {
      stockMultiplier = 0.90;
      factors.push('Surstock: réduction de 10%');
    } else if (stockRatio < 0.3) {
      stockMultiplier = 1.10;
      factors.push('Stock faible: majoration de 10%');
    }

    const finalMultiplier = demandMultiplier *
      competitionMultiplier *
      seasonalMultiplier *
      timeMultiplier *
      stockMultiplier;

    const currentPrice = Math.round(basePrice * finalMultiplier / 5) * 5;

    return {
      basePrice,
      currentPrice,
      demandMultiplier,
      competitionMultiplier,
      seasonalMultiplier,
      timeMultiplier,
      finalPrice: currentPrice,
      factors
    };
  }

  async analyzePriceElasticity(
    productId: string,
    currentPrice: number,
    averageVolume: number
  ): Promise<PriceElasticity> {
    await this.delay(300);

    const history = this.getPriceHistory(productId);

    if (history.length < 10) {
      return {
        productId,
        elasticity: -1.2,
        interpretation: 'Élasticité modérée (données limitées)',
        recommendation: 'Collecter plus de données pour une analyse précise'
      };
    }

    const prices = history.map(h => h.price);
    const volumes = history.map(h => h.volume);

    const priceChanges = [];
    const volumeChanges = [];

    for (let i = 1; i < history.length; i++) {
      const priceChange = (history[i].price - history[i - 1].price) / history[i - 1].price;
      const volumeChange = (history[i].volume - history[i - 1].volume) / history[i - 1].volume;

      if (Math.abs(priceChange) > 0.01) {
        priceChanges.push(priceChange);
        volumeChanges.push(volumeChange);
      }
    }

    let elasticity = -1.2;
    if (priceChanges.length > 0) {
      let sumElasticity = 0;
      for (let i = 0; i < priceChanges.length; i++) {
        const e = volumeChanges[i] / priceChanges[i];
        if (isFinite(e) && !isNaN(e)) {
          sumElasticity += e;
        }
      }
      elasticity = sumElasticity / priceChanges.length;
    }

    let interpretation = '';
    let recommendation = '';

    if (Math.abs(elasticity) < 0.5) {
      interpretation = 'Demande inélastique: les clients sont peu sensibles au prix';
      recommendation = 'Vous pouvez augmenter les prix sans perdre beaucoup de clients';
    } else if (Math.abs(elasticity) < 1.5) {
      interpretation = 'Demande modérément élastique: équilibre prix-volume';
      recommendation = 'Ajustez les prix prudemment en surveillant les volumes';
    } else {
      interpretation = 'Demande très élastique: les clients sont très sensibles au prix';
      recommendation = 'Évitez les hausses de prix, considérez des réductions pour augmenter les volumes';
    }

    return {
      productId,
      elasticity: Math.round(elasticity * 100) / 100,
      interpretation,
      recommendation
    };
  }

  async getCompetitivePricing(
    productId: string,
    productName: string,
    currentPrice: number
  ): Promise<CompetitivePricing> {
    await this.delay(250);

    const marketTrend = await marketTrendsService.getMarketTrend(productName);

    if (!marketTrend) {
      return {
        productId,
        yourPrice: currentPrice,
        averageMarketPrice: currentPrice,
        lowestPrice: currentPrice * 0.8,
        highestPrice: currentPrice * 1.2,
        position: 'at',
        recommendedAdjustment: 0,
        reasoning: 'Données de marché insuffisantes'
      };
    }

    const competitorPrices = marketTrend.competitorPrices.map(c => c.price);
    const averageMarketPrice = competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;
    const lowestPrice = Math.min(...competitorPrices);
    const highestPrice = Math.max(...competitorPrices);

    let position: 'below' | 'at' | 'above';
    if (currentPrice < averageMarketPrice * 0.95) {
      position = 'below';
    } else if (currentPrice > averageMarketPrice * 1.05) {
      position = 'above';
    } else {
      position = 'at';
    }

    let recommendedAdjustment = 0;
    let reasoning = '';

    if (position === 'below' && marketTrend.trend === 'up') {
      recommendedAdjustment = Math.round((averageMarketPrice - currentPrice) * 0.5);
      reasoning = 'Marché en hausse: vous pouvez augmenter vos prix pour vous aligner';
    } else if (position === 'above' && marketTrend.trend === 'down') {
      recommendedAdjustment = -Math.round((currentPrice - averageMarketPrice) * 0.5);
      reasoning = 'Marché en baisse: réduisez vos prix pour rester compétitif';
    } else if (position === 'above') {
      recommendedAdjustment = -Math.round((currentPrice - averageMarketPrice) * 0.3);
      reasoning = 'Vos prix sont au-dessus du marché: risque de perte de clients';
    } else if (position === 'below') {
      recommendedAdjustment = Math.round((averageMarketPrice - currentPrice) * 0.3);
      reasoning = 'Vos prix sont en-dessous: opportunité d\'augmenter les marges';
    } else {
      reasoning = 'Vos prix sont alignés avec le marché';
    }

    return {
      productId,
      yourPrice: currentPrice,
      averageMarketPrice: Math.round(averageMarketPrice),
      lowestPrice: Math.round(lowestPrice),
      highestPrice: Math.round(highestPrice),
      position,
      recommendedAdjustment,
      reasoning
    };
  }

  async findOptimalPricePoint(
    productId: string,
    cost: number,
    targetProfit: number,
    minVolume: number,
    maxVolume: number
  ): Promise<{
    optimalPrice: number;
    expectedVolume: number;
    expectedRevenue: number;
    expectedProfit: number;
    margin: number;
  }> {
    await this.delay(350);

    const elasticity = await this.calculatePriceElasticity(productId, cost * 2, (minVolume + maxVolume) / 2);

    let bestPrice = cost * 1.5;
    let bestProfit = 0;

    for (let price = cost * 1.2; price <= cost * 3; price += cost * 0.1) {
      const volume = this.estimateVolumeAtPrice(price, cost * 2, (minVolume + maxVolume) / 2, elasticity.elasticity);

      const revenue = price * volume;
      const totalCost = cost * volume;
      const profit = revenue - totalCost;

      if (profit > bestProfit && profit >= targetProfit) {
        bestProfit = profit;
        bestPrice = price;
      }
    }

    const finalVolume = this.estimateVolumeAtPrice(
      bestPrice,
      cost * 2,
      (minVolume + maxVolume) / 2,
      elasticity.elasticity
    );

    const revenue = bestPrice * finalVolume;
    const margin = ((bestPrice - cost) / bestPrice) * 100;

    return {
      optimalPrice: Math.round(bestPrice),
      expectedVolume: Math.round(finalVolume),
      expectedRevenue: Math.round(revenue),
      expectedProfit: Math.round(bestProfit),
      margin: Math.round(margin * 10) / 10
    };
  }

  private async calculatePriceElasticity(
    productId: string,
    currentPrice: number,
    currentVolume: number
  ): Promise<{ elasticity: number }> {
    const history = this.getPriceHistory(productId);

    if (history.length < 5) {
      return { elasticity: -1.2 };
    }

    const recentHistory = history.slice(-10);
    const prices = recentHistory.map(h => h.price);
    const volumes = recentHistory.map(h => h.volume);

    const correlation = this.calculateCorrelation(prices, volumes);

    return { elasticity: correlation * -1.5 };
  }

  private async analyzeCompetitivePosition(
    productId: string,
    currentPrice: number,
    marketTrend: MarketTrend | null
  ): Promise<{ position: string; gap: number }> {
    if (!marketTrend) {
      return { position: 'unknown', gap: 0 };
    }

    const avgCompetitorPrice = marketTrend.currentPrice;
    const gap = currentPrice - avgCompetitorPrice;
    const gapPercent = (gap / avgCompetitorPrice) * 100;

    let position = 'aligned';
    if (gapPercent > 10) position = 'premium';
    else if (gapPercent < -10) position = 'discount';

    return { position, gap };
  }

  private determineStrategy(
    currentPrice: number,
    cost: number,
    competitivePosition: { position: string; gap: number },
    quality: string,
    elasticity: number
  ): 'premium' | 'competitive' | 'penetration' | 'skimming' {
    const margin = ((currentPrice - cost) / currentPrice) * 100;

    if (quality === 'Bio' || quality === 'Premium') {
      return 'premium';
    }

    if (Math.abs(elasticity) > 1.5) {
      return 'penetration';
    }

    if (margin > 40) {
      return 'skimming';
    }

    return 'competitive';
  }

  private calculateOptimizedPrice(
    currentPrice: number,
    cost: number,
    strategy: string,
    elasticity: number,
    competitivePosition: { position: string; gap: number },
    marketTrend: MarketTrend | null
  ): number {
    let targetMargin = 0.30;

    switch (strategy) {
      case 'premium':
        targetMargin = 0.45;
        break;
      case 'skimming':
        targetMargin = 0.40;
        break;
      case 'penetration':
        targetMargin = 0.20;
        break;
      case 'competitive':
        targetMargin = 0.30;
        break;
    }

    let baseOptimizedPrice = cost / (1 - targetMargin);

    if (marketTrend) {
      const marketAdjustment = marketTrend.trend === 'up' ? 1.05 : marketTrend.trend === 'down' ? 0.95 : 1.0;
      baseOptimizedPrice *= marketAdjustment;
    }

    if (competitivePosition.position === 'premium' && Math.abs(elasticity) > 1.5) {
      baseOptimizedPrice *= 0.95;
    }

    return Math.round(baseOptimizedPrice / 5) * 5;
  }

  private predictImpact(
    currentPrice: number,
    optimizedPrice: number,
    elasticity: number,
    currentVolume: number,
    cost: number
  ): { revenueChange: number; volumeChange: number; profitChange: number } {
    const priceChange = (optimizedPrice - currentPrice) / currentPrice;
    const volumeChange = elasticity * priceChange;

    const newVolume = currentVolume * (1 + volumeChange);

    const currentRevenue = currentPrice * currentVolume;
    const newRevenue = optimizedPrice * newVolume;
    const revenueChange = ((newRevenue - currentRevenue) / currentRevenue) * 100;

    const currentProfit = (currentPrice - cost) * currentVolume;
    const newProfit = (optimizedPrice - cost) * newVolume;
    const profitChange = ((newProfit - currentProfit) / currentProfit) * 100;

    return {
      revenueChange: Math.round(revenueChange * 10) / 10,
      volumeChange: Math.round(volumeChange * 1000) / 10,
      profitChange: Math.round(profitChange * 10) / 10
    };
  }

  private generateReasoning(
    strategy: string,
    competitivePosition: { position: string; gap: number },
    elasticity: { elasticity: number; interpretation: string },
    marketTrend: MarketTrend | null,
    quality: string
  ): string[] {
    const reasons: string[] = [];

    reasons.push(`Stratégie ${strategy} recommandée`);

    if (quality === 'Bio' || quality === 'Premium') {
      reasons.push(`Produit ${quality}: positionnement premium justifié`);
    }

    reasons.push(elasticity.interpretation);

    if (marketTrend) {
      if (marketTrend.trend === 'up') {
        reasons.push('Marché en hausse: opportunité d\'augmentation');
      } else if (marketTrend.trend === 'down') {
        reasons.push('Marché en baisse: prudence recommandée');
      }
    }

    if (competitivePosition.position === 'premium') {
      reasons.push('Prix actuellement au-dessus du marché');
    } else if (competitivePosition.position === 'discount') {
      reasons.push('Prix actuellement en-dessous du marché');
    }

    return reasons;
  }

  private estimateVolumeAtPrice(
    newPrice: number,
    currentPrice: number,
    currentVolume: number,
    elasticity: number
  ): number {
    const priceChange = (newPrice - currentPrice) / currentPrice;
    const volumeChange = elasticity * priceChange;

    return Math.max(0, currentVolume * (1 + volumeChange));
  }

  private getPriceHistory(productId: string): Array<{ price: number; date: Date; volume: number }> {
    if (!this.priceHistory.has(productId)) {
      this.priceHistory.set(productId, this.generateMockPriceHistory());
    }
    return this.priceHistory.get(productId) || [];
  }

  private getPriceHistoryLength(productId: string): number {
    return this.getPriceHistory(productId).length;
  }

  private generateMockPriceHistory(): Array<{ price: number; date: Date; volume: number }> {
    const history: Array<{ price: number; date: Date; volume: number }> = [];
    const basePrice = 800 + Math.random() * 400;
    const baseVolume = 50 + Math.random() * 50;

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const priceVariation = 0.9 + Math.random() * 0.2;
      const volumeVariation = 0.8 + Math.random() * 0.4;

      history.push({
        price: Math.round(basePrice * priceVariation),
        date,
        volume: Math.round(baseVolume * volumeVariation)
      });
    }

    return history;
  }
}

export const priceOptimizationService = PriceOptimizationService.getInstance();
