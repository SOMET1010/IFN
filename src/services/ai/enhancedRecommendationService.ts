/**
 * Enhanced AI Recommendation Service
 * Provides personalized recommendations using collaborative filtering and content-based approaches
 */

import { AIBaseService } from './aiBaseService';
import { Product } from '@/types';

export interface UserBehavior {
  userId: string;
  productViews: Map<string, number>;
  productPurchases: Map<string, number>;
  searchQueries: string[];
  categoryPreferences: Map<string, number>;
  timeOfDayActivity: number[];
  avgSessionDuration: number;
}

export interface RecommendationScore {
  productId: string;
  score: number;
  reasons: string[];
  type: 'collaborative' | 'content' | 'trending' | 'seasonal' | 'personalized';
}

export interface SmartRecommendation {
  product: Product;
  score: number;
  reasons: string[];
  confidence: number;
  tags: string[];
}

export interface CrossSellRecommendation {
  mainProductId: string;
  recommendations: Array<{
    productId: string;
    productName: string;
    correlation: number;
    reason: string;
  }>;
}

export class EnhancedRecommendationService extends AIBaseService {
  private static instance: EnhancedRecommendationService;
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private productSimilarity: Map<string, Map<string, number>> = new Map();
  private userSimilarity: Map<string, Map<string, number>> = new Map();
  private purchasePatterns: Map<string, string[]> = new Map();

  static getInstance(): EnhancedRecommendationService {
    if (!EnhancedRecommendationService.instance) {
      EnhancedRecommendationService.instance = new EnhancedRecommendationService({
        modelName: 'enhanced-recommender',
        version: '2.0.0',
        threshold: 0.6
      });
    }
    return EnhancedRecommendationService.instance;
  }

  async getPersonalizedRecommendations(
    userId: string,
    products: Product[],
    limit: number = 10
  ): Promise<SmartRecommendation[]> {
    await this.delay(400);

    const userBehavior = this.getUserBehavior(userId);
    const scores: RecommendationScore[] = [];

    for (const product of products) {
      const collaborativeScore = await this.calculateCollaborativeScore(userId, product.id);
      const contentScore = this.calculateContentScore(userId, product);
      const trendingScore = this.calculateTrendingScore(product.id);
      const seasonalScore = this.calculateSeasonalScore(product);
      const personalizedScore = this.calculatePersonalizedScore(userBehavior, product);

      const weights = {
        collaborative: 0.30,
        content: 0.25,
        trending: 0.15,
        seasonal: 0.15,
        personalized: 0.15
      };

      const finalScore =
        collaborativeScore * weights.collaborative +
        contentScore * weights.content +
        trendingScore * weights.trending +
        seasonalScore * weights.seasonal +
        personalizedScore * weights.personalized;

      const reasons = this.generateReasons(
        collaborativeScore,
        contentScore,
        trendingScore,
        seasonalScore,
        personalizedScore,
        product
      );

      const dominantType = this.getDominantType({
        collaborative: collaborativeScore,
        content: contentScore,
        trending: trendingScore,
        seasonal: seasonalScore,
        personalized: personalizedScore
      });

      scores.push({
        productId: product.id,
        score: finalScore,
        reasons,
        type: dominantType
      });
    }

    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, limit);

    return topScores.map(score => {
      const product = products.find(p => p.id === score.productId)!;
      return {
        product,
        score: score.score,
        reasons: score.reasons,
        confidence: this.calculateRecommendationConfidence(score.score, userBehavior),
        tags: this.generateRecommendationTags(score.type, score.score)
      };
    });
  }

  async getCrossSellRecommendations(
    productId: string,
    allProducts: Product[],
    limit: number = 5
  ): Promise<CrossSellRecommendation> {
    await this.delay(300);

    const frequentlyBoughtTogether = this.getFrequentlyBoughtTogether(productId);
    const similarProducts = this.getSimilarProducts(productId, allProducts);

    const recommendations: Array<{
      productId: string;
      productName: string;
      correlation: number;
      reason: string;
    }> = [];

    for (const relatedId of frequentlyBoughtTogether) {
      const product = allProducts.find(p => p.id === relatedId);
      if (product) {
        recommendations.push({
          productId: relatedId,
          productName: product.name,
          correlation: 0.8 + Math.random() * 0.2,
          reason: 'Souvent acheté ensemble'
        });
      }
    }

    for (const similar of similarProducts) {
      if (!recommendations.find(r => r.productId === similar.id)) {
        recommendations.push({
          productId: similar.id,
          productName: similar.name,
          correlation: 0.6 + Math.random() * 0.2,
          reason: 'Produits similaires'
        });
      }
    }

    recommendations.sort((a, b) => b.correlation - a.correlation);

    return {
      mainProductId: productId,
      recommendations: recommendations.slice(0, limit)
    };
  }

  async getBundleRecommendations(
    cartItems: string[],
    allProducts: Product[],
    maxBundleSize: number = 3
  ): Promise<Array<{
    products: Product[];
    totalDiscount: number;
    reasoning: string;
    popularity: number;
  }>> {
    await this.delay(350);

    const bundles: Array<{
      products: Product[];
      totalDiscount: number;
      reasoning: string;
      popularity: number;
    }> = [];

    for (const itemId of cartItems) {
      const complementary = this.getFrequentlyBoughtTogether(itemId);

      for (const compId of complementary.slice(0, 2)) {
        const product = allProducts.find(p => p.id === compId);
        if (product && !cartItems.includes(compId)) {
          const bundleProducts = [
            allProducts.find(p => p.id === itemId)!,
            product
          ].filter(Boolean);

          if (bundleProducts.length === 2) {
            bundles.push({
              products: bundleProducts,
              totalDiscount: 10,
              reasoning: 'Fréquemment achetés ensemble',
              popularity: 0.75 + Math.random() * 0.25
            });
          }
        }
      }
    }

    const categoryBundles = this.generateCategoryBundles(cartItems, allProducts);
    bundles.push(...categoryBundles);

    bundles.sort((a, b) => b.popularity - a.popularity);

    return bundles.slice(0, 5);
  }

  async getSeasonalRecommendations(
    userId: string,
    products: Product[],
    limit: number = 8
  ): Promise<SmartRecommendation[]> {
    await this.delay(250);

    const currentMonth = new Date().getMonth();
    const seasonalProducts: RecommendationScore[] = [];

    for (const product of products) {
      const seasonalScore = this.calculateSeasonalScore(product);

      if (seasonalScore > 0.6) {
        const userBehavior = this.getUserBehavior(userId);
        const personalizedScore = this.calculatePersonalizedScore(userBehavior, product);

        const finalScore = seasonalScore * 0.6 + personalizedScore * 0.4;

        seasonalProducts.push({
          productId: product.id,
          score: finalScore,
          reasons: ['Produit de saison', this.getSeasonalReason(currentMonth, product.category)],
          type: 'seasonal'
        });
      }
    }

    seasonalProducts.sort((a, b) => b.score - a.score);
    const topSeasonal = seasonalProducts.slice(0, limit);

    return topSeasonal.map(score => {
      const product = products.find(p => p.id === score.productId)!;
      return {
        product,
        score: score.score,
        reasons: score.reasons,
        confidence: 0.85,
        tags: ['Saison', 'Disponible maintenant']
      };
    });
  }

  async getTrendingRecommendations(
    products: Product[],
    limit: number = 6
  ): Promise<SmartRecommendation[]> {
    await this.delay(200);

    const trending: RecommendationScore[] = [];

    for (const product of products) {
      const trendingScore = this.calculateTrendingScore(product.id);
      const velocityScore = this.calculateVelocityScore(product.id);

      const finalScore = trendingScore * 0.6 + velocityScore * 0.4;

      if (finalScore > 0.5) {
        trending.push({
          productId: product.id,
          score: finalScore,
          reasons: ['En forte demande', 'Très populaire cette semaine'],
          type: 'trending'
        });
      }
    }

    trending.sort((a, b) => b.score - a.score);
    const topTrending = trending.slice(0, limit);

    return topTrending.map(score => {
      const product = products.find(p => p.id === score.productId)!;
      return {
        product,
        score: score.score,
        reasons: score.reasons,
        confidence: 0.8,
        tags: ['Tendance', 'Populaire']
      };
    });
  }

  recordUserInteraction(
    userId: string,
    productId: string,
    interactionType: 'view' | 'purchase' | 'search',
    metadata?: Record<string, unknown>
  ): void {
    let behavior = this.userBehaviors.get(userId);

    if (!behavior) {
      behavior = {
        userId,
        productViews: new Map(),
        productPurchases: new Map(),
        searchQueries: [],
        categoryPreferences: new Map(),
        timeOfDayActivity: Array(24).fill(0),
        avgSessionDuration: 0
      };
      this.userBehaviors.set(userId, behavior);
    }

    switch (interactionType) {
      case 'view':
        behavior.productViews.set(productId, (behavior.productViews.get(productId) || 0) + 1);
        break;
      case 'purchase':
        behavior.productPurchases.set(productId, (behavior.productPurchases.get(productId) || 0) + 1);
        this.updatePurchasePatterns(userId, productId);
        break;
      case 'search':
        if (metadata?.query) {
          behavior.searchQueries.push(metadata.query as string);
        }
        break;
    }

    const hour = new Date().getHours();
    behavior.timeOfDayActivity[hour]++;
  }

  private async calculateCollaborativeScore(userId: string, productId: string): Promise<number> {
    const similarUsers = this.findSimilarUsers(userId, 10);

    if (similarUsers.length === 0) {
      return 0.5;
    }

    let weightedScore = 0;
    let totalWeight = 0;

    for (const { userId: similarUserId, similarity } of similarUsers) {
      const similarUserBehavior = this.getUserBehavior(similarUserId);
      const purchased = similarUserBehavior.productPurchases.get(productId) || 0;
      const viewed = similarUserBehavior.productViews.get(productId) || 0;

      const userScore = purchased > 0 ? 1.0 : viewed > 0 ? 0.5 : 0;

      weightedScore += userScore * similarity;
      totalWeight += similarity;
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0.5;
  }

  private calculateContentScore(userId: string, product: Product): number {
    const userBehavior = this.getUserBehavior(userId);

    const categoryPreference = userBehavior.categoryPreferences.get(product.category) || 0;
    const maxCategoryPreference = Math.max(...Array.from(userBehavior.categoryPreferences.values()), 1);
    const categoryScore = categoryPreference / maxCategoryPreference;

    const qualityScore = product.quality === 'Bio' ? 0.9 : product.quality === 'Premium' ? 0.8 : 0.6;

    const availabilityScore = product.status === 'available' ? 1.0 : 0.3;

    return categoryScore * 0.5 + qualityScore * 0.3 + availabilityScore * 0.2;
  }

  private calculateTrendingScore(productId: string): number {
    const recentViews = Math.random() * 100;
    const recentPurchases = Math.random() * 50;

    const viewScore = Math.min(1, recentViews / 100);
    const purchaseScore = Math.min(1, recentPurchases / 50);

    return viewScore * 0.4 + purchaseScore * 0.6;
  }

  private calculateSeasonalScore(product: Product): number {
    const currentMonth = new Date().getMonth();

    const seasonalPatterns: Record<string, number[]> = {
      'fruits': [0.6, 0.7, 0.9, 1.0, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 0.8],
      'legumes': [0.9, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0],
      'cereales': [0.8, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.8]
    };

    const pattern = seasonalPatterns[product.category] || Array(12).fill(0.8);
    return pattern[currentMonth];
  }

  private calculatePersonalizedScore(userBehavior: UserBehavior, product: Product): number {
    const hasViewed = userBehavior.productViews.has(product.id);
    const hasPurchased = userBehavior.productPurchases.has(product.id);

    if (hasPurchased) {
      return 0.3;
    }

    if (hasViewed) {
      return 0.8;
    }

    const categoryViews = userBehavior.categoryPreferences.get(product.category) || 0;
    const maxViews = Math.max(...Array.from(userBehavior.categoryPreferences.values()), 1);

    return categoryViews / maxViews;
  }

  private calculateVelocityScore(productId: string): number {
    const last7Days = Math.random() * 50;
    const previous7Days = Math.random() * 30;

    if (previous7Days === 0) return 0.7;

    const growth = (last7Days - previous7Days) / previous7Days;

    return Math.min(1, 0.5 + growth);
  }

  private getUserBehavior(userId: string): UserBehavior {
    if (!this.userBehaviors.has(userId)) {
      this.userBehaviors.set(userId, {
        userId,
        productViews: new Map(),
        productPurchases: new Map(),
        searchQueries: [],
        categoryPreferences: new Map([
          ['fruits', 5],
          ['legumes', 3],
          ['cereales', 2]
        ]),
        timeOfDayActivity: Array(24).fill(0),
        avgSessionDuration: 300
      });
    }
    return this.userBehaviors.get(userId)!;
  }

  private findSimilarUsers(userId: string, limit: number): Array<{ userId: string; similarity: number }> {
    const currentUser = this.getUserBehavior(userId);
    const similarities: Array<{ userId: string; similarity: number }> = [];

    for (const [otherUserId, otherBehavior] of this.userBehaviors.entries()) {
      if (otherUserId === userId) continue;

      const similarity = this.calculateUserSimilarity(currentUser, otherBehavior);

      if (similarity > 0.3) {
        similarities.push({ userId: otherUserId, similarity });
      }
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, limit);
  }

  private calculateUserSimilarity(user1: UserBehavior, user2: UserBehavior): number {
    const commonProducts = new Set([
      ...Array.from(user1.productPurchases.keys()),
      ...Array.from(user2.productPurchases.keys())
    ]);

    if (commonProducts.size === 0) return 0;

    let intersection = 0;
    for (const productId of commonProducts) {
      if (user1.productPurchases.has(productId) && user2.productPurchases.has(productId)) {
        intersection++;
      }
    }

    return intersection / commonProducts.size;
  }

  private getFrequentlyBoughtTogether(productId: string): string[] {
    if (!this.purchasePatterns.has(productId)) {
      const mockRelated = ['1', '2', '3', '4', '5', '6'];
      return mockRelated.filter(id => id !== productId).slice(0, 3);
    }
    return this.purchasePatterns.get(productId) || [];
  }

  private getSimilarProducts(productId: string, allProducts: Product[]): Product[] {
    const targetProduct = allProducts.find(p => p.id === productId);
    if (!targetProduct) return [];

    return allProducts
      .filter(p => p.id !== productId && p.category === targetProduct.category)
      .slice(0, 3);
  }

  private updatePurchasePatterns(userId: string, productId: string): void {
    const userBehavior = this.getUserBehavior(userId);
    const recentPurchases = Array.from(userBehavior.productPurchases.keys()).slice(-10);

    for (const otherId of recentPurchases) {
      if (otherId !== productId) {
        if (!this.purchasePatterns.has(productId)) {
          this.purchasePatterns.set(productId, []);
        }
        const patterns = this.purchasePatterns.get(productId)!;
        if (!patterns.includes(otherId)) {
          patterns.push(otherId);
        }
      }
    }
  }

  private generateCategoryBundles(
    cartItems: string[],
    allProducts: Product[]
  ): Array<{
    products: Product[];
    totalDiscount: number;
    reasoning: string;
    popularity: number;
  }> {
    const bundles: Array<{
      products: Product[];
      totalDiscount: number;
      reasoning: string;
      popularity: number;
    }> = [];

    const categories = new Set(
      cartItems.map(id => allProducts.find(p => p.id === id)?.category).filter(Boolean)
    );

    if (categories.size > 0) {
      const complementaryCategories = this.getComplementaryCategories(Array.from(categories) as string[]);

      for (const compCategory of complementaryCategories) {
        const compProducts = allProducts.filter(p => p.category === compCategory && !cartItems.includes(p.id));
        if (compProducts.length > 0) {
          bundles.push({
            products: [compProducts[0]],
            totalDiscount: 15,
            reasoning: 'Complète parfaitement votre panier',
            popularity: 0.7
          });
        }
      }
    }

    return bundles;
  }

  private getComplementaryCategories(categories: string[]): string[] {
    const complementary: Record<string, string[]> = {
      'fruits': ['legumes', 'cereales'],
      'legumes': ['fruits', 'volaille'],
      'cereales': ['legumes', 'poissons'],
      'volaille': ['legumes', 'cereales'],
      'poissons': ['legumes', 'cereales']
    };

    const result = new Set<string>();
    for (const category of categories) {
      const comps = complementary[category] || [];
      comps.forEach(c => result.add(c));
    }

    return Array.from(result);
  }

  private generateReasons(
    collaborative: number,
    content: number,
    trending: number,
    seasonal: number,
    personalized: number,
    product: Product
  ): string[] {
    const reasons: string[] = [];

    if (collaborative > 0.7) {
      reasons.push('Apprécié par des utilisateurs similaires');
    }

    if (content > 0.7) {
      reasons.push('Correspond à vos préférences');
    }

    if (trending > 0.7) {
      reasons.push('Très populaire en ce moment');
    }

    if (seasonal > 0.8) {
      reasons.push('Produit de saison');
    }

    if (personalized > 0.7) {
      reasons.push('Basé sur votre historique');
    }

    if (product.quality === 'Bio' || product.quality === 'Premium') {
      reasons.push(`Qualité ${product.quality}`);
    }

    return reasons.slice(0, 3);
  }

  private getDominantType(scores: Record<string, number>): 'collaborative' | 'content' | 'trending' | 'seasonal' | 'personalized' {
    let maxScore = 0;
    let maxType: 'collaborative' | 'content' | 'trending' | 'seasonal' | 'personalized' = 'collaborative';

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxType = type as typeof maxType;
      }
    }

    return maxType;
  }

  private calculateRecommendationConfidence(score: number, userBehavior: UserBehavior): number {
    const dataQuality = Math.min(1, (userBehavior.productPurchases.size + userBehavior.productViews.size) / 50);
    return score * 0.7 + dataQuality * 0.3;
  }

  private generateRecommendationTags(type: string, score: number): string[] {
    const tags: string[] = [];

    if (score > 0.8) {
      tags.push('Fortement recommandé');
    }

    switch (type) {
      case 'collaborative':
        tags.push('Choix similaires');
        break;
      case 'content':
        tags.push('Pour vous');
        break;
      case 'trending':
        tags.push('Tendance');
        break;
      case 'seasonal':
        tags.push('Saisonnier');
        break;
      case 'personalized':
        tags.push('Personnalisé');
        break;
    }

    return tags;
  }

  private getSeasonalReason(month: number, category: string): string {
    const reasons: Record<string, string> = {
      'fruits': 'Fruits frais de saison',
      'legumes': 'Légumes du moment',
      'cereales': 'Céréales de la récolte'
    };

    return reasons[category] || 'Disponible maintenant';
  }
}

export const enhancedRecommendationService = EnhancedRecommendationService.getInstance();
