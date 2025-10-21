/**
 * AI Base Service
 * Provides core AI utilities and helper functions for all AI-powered features
 */

export interface PredictionResult<T> {
  prediction: T;
  confidence: number;
  factors: string[];
  timestamp: Date;
}

export interface AIModelConfig {
  modelName: string;
  version: string;
  threshold: number;
  maxRetries: number;
}

export interface TrainingData {
  features: number[];
  label: number | string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export class AIBaseService {
  protected modelConfig: AIModelConfig;

  constructor(config: Partial<AIModelConfig> = {}) {
    this.modelConfig = {
      modelName: config.modelName || 'base-model',
      version: config.version || '1.0.0',
      threshold: config.threshold || 0.7,
      maxRetries: config.maxRetries || 3
    };
  }

  protected normalizeData(data: number[]): number[] {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    if (range === 0) return data.map(() => 0.5);

    return data.map(value => (value - min) / range);
  }

  protected calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - window + 1);
      const subset = data.slice(start, i + 1);
      const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
      result.push(avg);
    }

    return result;
  }

  protected calculateTrend(data: number[]): { direction: 'up' | 'down' | 'stable'; strength: number } {
    if (data.length < 2) {
      return { direction: 'stable', strength: 0 };
    }

    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;
    const normalizedSlope = avgY !== 0 ? slope / avgY : 0;

    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(normalizedSlope) < 0.05) {
      direction = 'stable';
    } else if (normalizedSlope > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }

    return {
      direction,
      strength: Math.abs(normalizedSlope)
    };
  }

  protected calculateSeasonality(data: number[], period: number = 7): number {
    if (data.length < period * 2) {
      return 1.0;
    }

    const cycles = Math.floor(data.length / period);
    const seasonalPattern: number[] = [];

    for (let i = 0; i < period; i++) {
      let sum = 0;
      let count = 0;

      for (let cycle = 0; cycle < cycles; cycle++) {
        const idx = cycle * period + i;
        if (idx < data.length) {
          sum += data[idx];
          count++;
        }
      }

      seasonalPattern.push(count > 0 ? sum / count : 0);
    }

    const avgValue = seasonalPattern.reduce((sum, val) => sum + val, 0) / seasonalPattern.length;
    const currentIndex = (data.length - 1) % period;

    return avgValue !== 0 ? seasonalPattern[currentIndex] / avgValue : 1.0;
  }

  protected calculateConfidence(
    historicalAccuracy: number[],
    dataQuality: number,
    sampleSize: number
  ): number {
    const avgAccuracy = historicalAccuracy.length > 0
      ? historicalAccuracy.reduce((sum, val) => sum + val, 0) / historicalAccuracy.length
      : 0.5;

    const sizeConfidence = Math.min(1, sampleSize / 100);

    const confidence = (avgAccuracy * 0.5 + dataQuality * 0.3 + sizeConfidence * 0.2);

    return Math.max(0, Math.min(1, confidence));
  }

  protected detectOutliers(data: number[]): boolean[] {
    if (data.length < 4) {
      return data.map(() => false);
    }

    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(data.length * 0.25);
    const q3Index = Math.floor(data.length * 0.75);

    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.map(value => value < lowerBound || value > upperBound);
  }

  protected exponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return [];

    const smoothed: number[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
      smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
    }

    return smoothed;
  }

  protected calculateCorrelation(data1: number[], data2: number[]): number {
    if (data1.length !== data2.length || data1.length === 0) {
      return 0;
    }

    const n = data1.length;
    const mean1 = data1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = data2.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);

    return denominator !== 0 ? numerator / denominator : 0;
  }

  protected weightedAverage(values: number[], weights: number[]): number {
    if (values.length !== weights.length || values.length === 0) {
      return 0;
    }

    const weightedSum = values.reduce((sum, val, idx) => sum + val * weights[idx], 0);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    return totalWeight !== 0 ? weightedSum / totalWeight : 0;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
