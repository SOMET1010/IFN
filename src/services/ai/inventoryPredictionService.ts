/**
 * AI-Powered Inventory Prediction Service
 * Predicts stock needs, optimal reorder points, and prevents stockouts
 */

import { AIBaseService, PredictionResult } from './aiBaseService';

export interface InventoryPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  recommendedReorderPoint: number;
  recommendedReorderQuantity: number;
  daysUntilStockout: number;
  confidence: number;
  factors: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface StockOptimization {
  productId: string;
  currentStock: number;
  optimalStock: number;
  overstock: number;
  potentialSavings: number;
  recommendation: string;
}

export interface DemandForecast {
  date: string;
  predictedDemand: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

interface HistoricalSale {
  productId: string;
  quantity: number;
  date: Date;
  price: number;
}

export class InventoryPredictionService extends AIBaseService {
  private static instance: InventoryPredictionService;
  private historicalSales: Map<string, HistoricalSale[]> = new Map();
  private predictionCache: Map<string, { prediction: InventoryPrediction; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 1 * 60 * 60 * 1000;

  static getInstance(): InventoryPredictionService {
    if (!InventoryPredictionService.instance) {
      InventoryPredictionService.instance = new InventoryPredictionService({
        modelName: 'inventory-predictor',
        version: '2.0.0',
        threshold: 0.65
      });
    }
    return InventoryPredictionService.instance;
  }

  async predictStockNeeds(
    productId: string,
    productName: string,
    currentStock: number,
    averagePrice: number,
    category: string
  ): Promise<InventoryPrediction> {
    const cacheKey = `${productId}-${currentStock}`;
    const cached = this.predictionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.prediction;
    }

    await this.delay(300);

    const historicalData = this.getHistoricalSales(productId);
    const demandPattern = this.analyzeDemandPattern(historicalData);
    const seasonalFactor = this.calculateSeasonalityFactor(historicalData, category);
    const trendFactor = this.calculateTrendFactor(historicalData);

    const baseDemand = demandPattern.averageDailyDemand;
    const predictedDailyDemand = baseDemand * seasonalFactor * (1 + trendFactor);
    const leadTime = this.estimateLeadTime(category);
    const safetyStock = this.calculateSafetyStock(demandPattern.stdDeviation, leadTime);

    const predictedDemand = Math.round(predictedDailyDemand * 7);
    const recommendedReorderPoint = Math.round(predictedDailyDemand * leadTime + safetyStock);
    const economicOrderQuantity = this.calculateEOQ(
      predictedDailyDemand * 365,
      averagePrice,
      category
    );

    const daysUntilStockout = currentStock > 0
      ? Math.floor(currentStock / Math.max(1, predictedDailyDemand))
      : 0;

    const urgency = this.determineUrgency(currentStock, recommendedReorderPoint, daysUntilStockout);

    const factors = this.generatePredictionFactors(
      seasonalFactor,
      trendFactor,
      demandPattern,
      historicalData.length
    );

    const confidence = this.calculateConfidence(
      [demandPattern.consistency],
      historicalData.length >= 30 ? 1 : historicalData.length / 30,
      historicalData.length
    );

    const prediction: InventoryPrediction = {
      productId,
      productName,
      currentStock,
      predictedDemand,
      recommendedReorderPoint,
      recommendedReorderQuantity: Math.round(economicOrderQuantity),
      daysUntilStockout,
      confidence,
      factors,
      urgency
    };

    this.predictionCache.set(cacheKey, { prediction, timestamp: Date.now() });

    return prediction;
  }

  async optimizeStockLevels(
    inventoryItems: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      price: number;
      category: string;
    }>
  ): Promise<StockOptimization[]> {
    const optimizations: StockOptimization[] = [];

    for (const item of inventoryItems) {
      const prediction = await this.predictStockNeeds(
        item.productId,
        item.productName,
        item.currentStock,
        item.price,
        item.category
      );

      const optimalStock = prediction.recommendedReorderPoint +
        Math.round(prediction.recommendedReorderQuantity * 0.5);

      const overstock = Math.max(0, item.currentStock - optimalStock);
      const potentialSavings = overstock * item.price * 0.1;

      let recommendation = '';
      if (item.currentStock < prediction.recommendedReorderPoint) {
        recommendation = `Commander ${prediction.recommendedReorderQuantity} unités maintenant`;
      } else if (overstock > 0) {
        recommendation = `Surstock de ${overstock} unités - envisager une promotion`;
      } else {
        recommendation = 'Niveau de stock optimal';
      }

      optimizations.push({
        productId: item.productId,
        currentStock: item.currentStock,
        optimalStock,
        overstock,
        potentialSavings,
        recommendation
      });
    }

    return optimizations;
  }

  async forecastDemand(
    productId: string,
    daysAhead: number = 30
  ): Promise<DemandForecast[]> {
    await this.delay(400);

    const historicalData = this.getHistoricalSales(productId);
    const demandPattern = this.analyzeDemandPattern(historicalData);
    const forecasts: DemandForecast[] = [];

    for (let day = 1; day <= daysAhead; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);

      const seasonalIndex = this.getSeasonalIndex(date, historicalData);
      const trendComponent = this.getTrendComponent(day, historicalData);

      const baseDemand = demandPattern.averageDailyDemand;
      const predictedDemand = baseDemand * seasonalIndex * (1 + trendComponent);

      const uncertainty = demandPattern.stdDeviation * Math.sqrt(day / 7);
      const lowerBound = Math.max(0, predictedDemand - 1.96 * uncertainty);
      const upperBound = predictedDemand + 1.96 * uncertainty;

      const confidenceDecay = Math.max(0.3, 1 - (day / daysAhead) * 0.5);

      forecasts.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.round(predictedDemand),
        lowerBound: Math.round(lowerBound),
        upperBound: Math.round(upperBound),
        confidence: confidenceDecay * demandPattern.consistency
      });
    }

    return forecasts;
  }

  async detectAnomalies(
    productId: string,
    currentDemand: number
  ): Promise<{
    isAnomaly: boolean;
    severity: 'low' | 'medium' | 'high';
    message: string;
    expectedRange: { min: number; max: number };
  }> {
    await this.delay(200);

    const historicalData = this.getHistoricalSales(productId);
    const demandPattern = this.analyzeDemandPattern(historicalData);

    const expectedMin = demandPattern.averageDailyDemand - 2 * demandPattern.stdDeviation;
    const expectedMax = demandPattern.averageDailyDemand + 2 * demandPattern.stdDeviation;

    const isAnomaly = currentDemand < expectedMin || currentDemand > expectedMax;

    let severity: 'low' | 'medium' | 'high' = 'low';
    let message = 'Demande normale';

    if (isAnomaly) {
      const deviation = Math.abs(currentDemand - demandPattern.averageDailyDemand) /
        demandPattern.stdDeviation;

      if (deviation > 3) {
        severity = 'high';
        message = currentDemand > expectedMax
          ? 'Demande exceptionnellement élevée détectée'
          : 'Chute inhabituelle de la demande détectée';
      } else if (deviation > 2) {
        severity = 'medium';
        message = currentDemand > expectedMax
          ? 'Augmentation significative de la demande'
          : 'Diminution significative de la demande';
      }
    }

    return {
      isAnomaly,
      severity,
      message,
      expectedRange: {
        min: Math.round(Math.max(0, expectedMin)),
        max: Math.round(expectedMax)
      }
    };
  }

  private getHistoricalSales(productId: string): HistoricalSale[] {
    if (!this.historicalSales.has(productId)) {
      this.historicalSales.set(productId, this.generateMockHistoricalData(productId));
    }
    return this.historicalSales.get(productId) || [];
  }

  private generateMockHistoricalData(productId: string): HistoricalSale[] {
    const sales: HistoricalSale[] = [];
    const days = 90;
    const baseQuantity = 20 + Math.random() * 30;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const seasonalEffect = 1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const weekdayEffect = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1.0;
      const randomVariation = 0.8 + Math.random() * 0.4;
      const trendEffect = 1 + (days - i) / days * 0.2;

      const quantity = Math.round(
        baseQuantity * seasonalEffect * weekdayEffect * randomVariation * trendEffect
      );

      sales.push({
        productId,
        quantity,
        date,
        price: 500 + Math.random() * 500
      });
    }

    return sales;
  }

  private analyzeDemandPattern(sales: HistoricalSale[]): {
    averageDailyDemand: number;
    stdDeviation: number;
    consistency: number;
  } {
    if (sales.length === 0) {
      return { averageDailyDemand: 10, stdDeviation: 5, consistency: 0.5 };
    }

    const quantities = sales.map(s => s.quantity);
    const mean = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;

    const squaredDiffs = quantities.map(q => Math.pow(q - mean, 2));
    const variance = squaredDiffs.reduce((sum, sq) => sum + sq, 0) / quantities.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = mean !== 0 ? stdDev / mean : 1;
    const consistency = Math.max(0, Math.min(1, 1 - coefficientOfVariation));

    return {
      averageDailyDemand: mean,
      stdDeviation: stdDev,
      consistency
    };
  }

  private calculateSeasonalityFactor(sales: HistoricalSale[], category: string): number {
    const currentMonth = new Date().getMonth();
    const seasonalMultipliers: Record<string, number[]> = {
      'fruits': [0.8, 0.9, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0],
      'legumes': [1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.1],
      'cereales': [1.0, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0]
    };

    const multipliers = seasonalMultipliers[category] || Array(12).fill(1.0);
    return multipliers[currentMonth];
  }

  private calculateTrendFactor(sales: HistoricalSale[]): number {
    if (sales.length < 7) return 0;

    const quantities = sales.map(s => s.quantity);
    const trend = this.calculateTrend(quantities);

    return trend.direction === 'up' ? trend.strength : -trend.strength;
  }

  private estimateLeadTime(category: string): number {
    const leadTimes: Record<string, number> = {
      'fruits': 2,
      'legumes': 3,
      'cereales': 5,
      'volaille': 4,
      'poissons': 1
    };

    return leadTimes[category] || 3;
  }

  private calculateSafetyStock(stdDeviation: number, leadTime: number): number {
    const serviceLevel = 1.65;
    return Math.ceil(serviceLevel * stdDeviation * Math.sqrt(leadTime));
  }

  private calculateEOQ(annualDemand: number, unitCost: number, category: string): number {
    const orderingCost = 5000;
    const holdingCostRate = 0.25;
    const holdingCost = unitCost * holdingCostRate;

    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);

    return Math.max(10, Math.round(eoq));
  }

  private determineUrgency(
    currentStock: number,
    reorderPoint: number,
    daysUntilStockout: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (currentStock <= 0) return 'critical';
    if (daysUntilStockout <= 2) return 'critical';
    if (currentStock < reorderPoint * 0.5) return 'high';
    if (currentStock < reorderPoint) return 'medium';
    return 'low';
  }

  private generatePredictionFactors(
    seasonalFactor: number,
    trendFactor: number,
    demandPattern: { consistency: number },
    sampleSize: number
  ): string[] {
    const factors: string[] = [];

    if (Math.abs(seasonalFactor - 1) > 0.1) {
      factors.push(
        seasonalFactor > 1
          ? `Haute saison: +${Math.round((seasonalFactor - 1) * 100)}%`
          : `Basse saison: ${Math.round((seasonalFactor - 1) * 100)}%`
      );
    }

    if (Math.abs(trendFactor) > 0.05) {
      factors.push(
        trendFactor > 0
          ? `Tendance croissante: +${Math.round(trendFactor * 100)}%`
          : `Tendance décroissante: ${Math.round(trendFactor * 100)}%`
      );
    }

    if (demandPattern.consistency > 0.7) {
      factors.push('Demande stable et prévisible');
    } else if (demandPattern.consistency < 0.4) {
      factors.push('Demande volatile et imprévisible');
    }

    if (sampleSize < 30) {
      factors.push('Données historiques limitées');
    }

    return factors;
  }

  private getSeasonalIndex(date: Date, sales: HistoricalSale[]): number {
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    const monthFactor = 1 + 0.2 * Math.sin((month / 12) * 2 * Math.PI);
    const weekdayFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 1.0;

    return monthFactor * weekdayFactor;
  }

  private getTrendComponent(daysAhead: number, sales: HistoricalSale[]): number {
    if (sales.length < 7) return 0;

    const quantities = sales.slice(-30).map(s => s.quantity);
    const trend = this.calculateTrend(quantities);

    const dailyChange = trend.direction === 'up' ? trend.strength : -trend.strength;

    return dailyChange * (daysAhead / 30);
  }

  clearCache(): void {
    this.predictionCache.clear();
  }
}

export const inventoryPredictionService = InventoryPredictionService.getInstance();
