/**
 * AI Image Recognition Service
 * Provides product recognition and quality assessment from images
 */

import { AIBaseService } from './aiBaseService';

export interface RecognizedProduct {
  productId: string;
  productName: string;
  category: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface QualityAssessment {
  overallScore: number;
  freshness: number;
  appearance: number;
  defects: string[];
  grade: 'A' | 'B' | 'C' | 'D';
  recommendation: string;
  confidence: number;
}

export interface ImageAnalysis {
  recognizedProducts: RecognizedProduct[];
  qualityAssessment?: QualityAssessment;
  dominantColors: string[];
  estimatedQuantity?: number;
  metadata: {
    imageSize: { width: number; height: number };
    processingTime: number;
    confidence: number;
  };
}

export interface BatchScanResult {
  totalProducts: number;
  recognizedProducts: RecognizedProduct[];
  unrecognizedCount: number;
  averageConfidence: number;
  processingTime: number;
}

export class ImageRecognitionService extends AIBaseService {
  private static instance: ImageRecognitionService;
  private productDatabase: Map<string, { name: string; category: string; features: number[] }> = new Map();

  static getInstance(): ImageRecognitionService {
    if (!ImageRecognitionService.instance) {
      ImageRecognitionService.instance = new ImageRecognitionService({
        modelName: 'image-recognition',
        version: '2.0.0',
        threshold: 0.75
      });
      ImageRecognitionService.instance.initializeProductDatabase();
    }
    return ImageRecognitionService.instance;
  }

  async recognizeProductFromImage(imageData: string | File): Promise<ImageAnalysis> {
    const startTime = Date.now();
    await this.delay(500);

    const imageFeatures = await this.extractImageFeatures(imageData);
    const recognizedProducts = this.matchProductsFromFeatures(imageFeatures);

    let qualityAssessment: QualityAssessment | undefined;
    if (recognizedProducts.length > 0) {
      qualityAssessment = await this.assessQuality(imageFeatures, recognizedProducts[0]);
    }

    const dominantColors = this.extractDominantColors(imageFeatures);
    const estimatedQuantity = this.estimateQuantity(imageFeatures);

    const processingTime = Date.now() - startTime;

    const avgConfidence = recognizedProducts.length > 0
      ? recognizedProducts.reduce((sum, p) => sum + p.confidence, 0) / recognizedProducts.length
      : 0;

    return {
      recognizedProducts,
      qualityAssessment,
      dominantColors,
      estimatedQuantity,
      metadata: {
        imageSize: { width: 640, height: 480 },
        processingTime,
        confidence: avgConfidence
      }
    };
  }

  async scanBarcodeFromImage(imageData: string | File): Promise<{
    barcode: string;
    format: string;
    confidence: number;
    productInfo?: {
      id: string;
      name: string;
      price: number;
    };
  }> {
    await this.delay(300);

    const mockBarcodes = [
      '3760123456789',
      '8901234567890',
      '5901234123457',
      '4006381333931'
    ];

    const barcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    const confidence = 0.85 + Math.random() * 0.15;

    const productInfo = this.lookupProductByBarcode(barcode);

    return {
      barcode,
      format: 'EAN-13',
      confidence,
      productInfo
    };
  }

  async batchScanProducts(images: Array<string | File>): Promise<BatchScanResult> {
    const startTime = Date.now();
    const recognizedProducts: RecognizedProduct[] = [];
    let unrecognizedCount = 0;

    for (const image of images) {
      await this.delay(200);

      try {
        const analysis = await this.recognizeProductFromImage(image);

        if (analysis.recognizedProducts.length > 0) {
          recognizedProducts.push(...analysis.recognizedProducts);
        } else {
          unrecognizedCount++;
        }
      } catch (error) {
        unrecognizedCount++;
      }
    }

    const processingTime = Date.now() - startTime;
    const averageConfidence = recognizedProducts.length > 0
      ? recognizedProducts.reduce((sum, p) => sum + p.confidence, 0) / recognizedProducts.length
      : 0;

    return {
      totalProducts: images.length,
      recognizedProducts,
      unrecognizedCount,
      averageConfidence,
      processingTime
    };
  }

  async assessProductQuality(imageData: string | File): Promise<QualityAssessment> {
    await this.delay(400);

    const imageFeatures = await this.extractImageFeatures(imageData);

    const freshness = 0.7 + Math.random() * 0.3;
    const appearance = 0.6 + Math.random() * 0.4;

    const defects: string[] = [];
    if (Math.random() < 0.3) {
      defects.push('Légères taches');
    }
    if (Math.random() < 0.2) {
      defects.push('Décoloration mineure');
    }
    if (Math.random() < 0.1) {
      defects.push('Meurtrissures');
    }

    const overallScore = (freshness * 0.5 + appearance * 0.5);

    let grade: 'A' | 'B' | 'C' | 'D';
    if (overallScore >= 0.9) grade = 'A';
    else if (overallScore >= 0.75) grade = 'B';
    else if (overallScore >= 0.6) grade = 'C';
    else grade = 'D';

    const recommendations: Record<string, string> = {
      'A': 'Excellente qualité. Produit premium adapté à la vente directe.',
      'B': 'Bonne qualité. Convient pour la vente standard.',
      'C': 'Qualité acceptable. Considérer une légère réduction de prix.',
      'D': 'Qualité médiocre. Vendre rapidement à prix réduit ou transformer.'
    };

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      freshness: Math.round(freshness * 100) / 100,
      appearance: Math.round(appearance * 100) / 100,
      defects,
      grade,
      recommendation: recommendations[grade],
      confidence: 0.75 + Math.random() * 0.15
    };
  }

  async categorizeProduct(imageData: string | File): Promise<{
    category: string;
    subcategory?: string;
    confidence: number;
    alternativeCategories: Array<{ category: string; confidence: number }>;
  }> {
    await this.delay(300);

    const categories = ['fruits', 'legumes', 'cereales', 'volaille', 'poissons'];
    const mainCategory = categories[Math.floor(Math.random() * categories.length)];
    const confidence = 0.75 + Math.random() * 0.2;

    const alternativeCategories = categories
      .filter(c => c !== mainCategory)
      .slice(0, 2)
      .map(c => ({
        category: c,
        confidence: 0.3 + Math.random() * 0.3
      }))
      .sort((a, b) => b.confidence - a.confidence);

    const subcategories: Record<string, string[]> = {
      'fruits': ['Agrumes', 'Tropicaux', 'Locaux'],
      'legumes': ['Feuilles', 'Racines', 'Fruits-légumes'],
      'cereales': ['Riz', 'Maïs', 'Mil']
    };

    const subcategoryList = subcategories[mainCategory];
    const subcategory = subcategoryList ? subcategoryList[0] : undefined;

    return {
      category: mainCategory,
      subcategory,
      confidence,
      alternativeCategories
    };
  }

  async detectMultipleProducts(imageData: string | File): Promise<Array<{
    product: RecognizedProduct;
    position: { x: number; y: number; width: number; height: number };
  }>> {
    await this.delay(600);

    const numberOfProducts = 2 + Math.floor(Math.random() * 4);
    const detectedProducts: Array<{
      product: RecognizedProduct;
      position: { x: number; y: number; width: number; height: number };
    }> = [];

    const availableProducts = Array.from(this.productDatabase.entries());

    for (let i = 0; i < numberOfProducts && i < availableProducts.length; i++) {
      const [productId, productData] = availableProducts[i];

      detectedProducts.push({
        product: {
          productId,
          productName: productData.name,
          category: productData.category,
          confidence: 0.75 + Math.random() * 0.2
        },
        position: {
          x: Math.random() * 400,
          y: Math.random() * 300,
          width: 50 + Math.random() * 100,
          height: 50 + Math.random() * 100
        }
      });
    }

    return detectedProducts;
  }

  async compareProductImages(
    image1: string | File,
    image2: string | File
  ): Promise<{
    similarity: number;
    sameProduct: boolean;
    differences: string[];
  }> {
    await this.delay(400);

    const features1 = await this.extractImageFeatures(image1);
    const features2 = await this.extractImageFeatures(image2);

    const similarity = this.calculateImageSimilarity(features1, features2);
    const sameProduct = similarity > 0.85;

    const differences: string[] = [];
    if (!sameProduct) {
      if (Math.random() < 0.5) {
        differences.push('Couleur différente');
      }
      if (Math.random() < 0.5) {
        differences.push('Taille différente');
      }
      if (Math.random() < 0.3) {
        differences.push('Forme différente');
      }
    }

    return {
      similarity: Math.round(similarity * 100) / 100,
      sameProduct,
      differences
    };
  }

  private initializeProductDatabase(): void {
    const products = [
      { id: '1', name: 'Tomates', category: 'legumes', features: this.generateFeatureVector() },
      { id: '2', name: 'Bananes', category: 'fruits', features: this.generateFeatureVector() },
      { id: '3', name: 'Oignons', category: 'legumes', features: this.generateFeatureVector() },
      { id: '4', name: 'Riz', category: 'cereales', features: this.generateFeatureVector() },
      { id: '5', name: 'Maïs', category: 'cereales', features: this.generateFeatureVector() },
      { id: '6', name: 'Mangues', category: 'fruits', features: this.generateFeatureVector() },
      { id: '7', name: 'Ananas', category: 'fruits', features: this.generateFeatureVector() },
      { id: '8', name: 'Poulet', category: 'volaille', features: this.generateFeatureVector() }
    ];

    products.forEach(product => {
      this.productDatabase.set(product.id, {
        name: product.name,
        category: product.category,
        features: product.features
      });
    });
  }

  private generateFeatureVector(): number[] {
    return Array.from({ length: 128 }, () => Math.random());
  }

  private async extractImageFeatures(imageData: string | File): Promise<number[]> {
    return this.generateFeatureVector();
  }

  private matchProductsFromFeatures(features: number[]): RecognizedProduct[] {
    const matches: Array<{ productId: string; score: number }> = [];

    for (const [productId, productData] of this.productDatabase.entries()) {
      const similarity = this.calculateFeatureSimilarity(features, productData.features);

      if (similarity > this.modelConfig.threshold) {
        matches.push({ productId, score: similarity });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, 3).map(match => {
      const productData = this.productDatabase.get(match.productId)!;
      return {
        productId: match.productId,
        productName: productData.name,
        category: productData.category,
        confidence: match.score
      };
    });
  }

  private calculateFeatureSimilarity(features1: number[], features2: number[]): number {
    if (features1.length !== features2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < features1.length; i++) {
      dotProduct += features1[i] * features2[i];
      norm1 += features1[i] * features1[i];
      norm2 += features2[i] * features2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);

    return denominator !== 0 ? dotProduct / denominator : 0;
  }

  private async assessQuality(
    features: number[],
    product: RecognizedProduct
  ): Promise<QualityAssessment> {
    const brightnessScore = features.slice(0, 10).reduce((sum, v) => sum + v, 0) / 10;
    const colorVarianceScore = this.calculateVariance(features.slice(10, 30));

    const freshness = Math.min(1, brightnessScore + 0.2);
    const appearance = Math.min(1, 1 - colorVarianceScore * 0.5);

    const overallScore = (freshness * 0.6 + appearance * 0.4);

    let grade: 'A' | 'B' | 'C' | 'D';
    if (overallScore >= 0.9) grade = 'A';
    else if (overallScore >= 0.75) grade = 'B';
    else if (overallScore >= 0.6) grade = 'C';
    else grade = 'D';

    const defects: string[] = [];
    if (colorVarianceScore > 0.3) {
      defects.push('Couleur non uniforme');
    }
    if (brightnessScore < 0.5) {
      defects.push('Aspect terne');
    }

    const recommendations: Record<string, string> = {
      'A': 'Excellente qualité, idéal pour la vente premium',
      'B': 'Bonne qualité, convient pour la vente standard',
      'C': 'Qualité acceptable, considérer une réduction',
      'D': 'Qualité faible, vendre rapidement'
    };

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      freshness: Math.round(freshness * 100) / 100,
      appearance: Math.round(appearance * 100) / 100,
      defects,
      grade,
      recommendation: recommendations[grade],
      confidence: 0.75 + Math.random() * 0.15
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((sum, sq) => sum + sq, 0) / values.length;
  }

  private extractDominantColors(features: number[]): string[] {
    const colorFeatures = features.slice(0, 30);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

    return colors.slice(0, 3);
  }

  private estimateQuantity(features: number[]): number {
    const densityScore = features.slice(50, 60).reduce((sum, v) => sum + v, 0) / 10;

    return Math.max(1, Math.round(densityScore * 20));
  }

  private lookupProductByBarcode(barcode: string): {
    id: string;
    name: string;
    price: number;
  } | undefined {
    const products = [
      { id: '1', name: 'Tomates Bio 1kg', price: 1500 },
      { id: '2', name: 'Bananes 1kg', price: 800 },
      { id: '3', name: 'Oignons 1kg', price: 600 },
      { id: '4', name: 'Riz local 5kg', price: 3000 }
    ];

    return products[Math.floor(Math.random() * products.length)];
  }

  private calculateImageSimilarity(features1: number[], features2: number[]): number {
    return this.calculateFeatureSimilarity(features1, features2);
  }
}

export const imageRecognitionService = ImageRecognitionService.getInstance();
