import { Promotion, PromotionCondition } from '@/types/merchant';

export interface PromotionUsage {
  id: string;
  promotionId: string;
  clientId?: string;
  transactionId: string;
  discountAmount: number;
  usageDate: Date;
}

export interface PromotionAnalytics {
  promotionId: string;
  totalUsage: number;
  totalDiscount: number;
  averageDiscount: number;
  usageByDay: Record<string, number>;
  topProducts: Array<{productId: string, usage: number}>;
}

export interface CampaignMetrics {
  campaignId: string;
  totalPromotions: number;
  activePromotions: number;
  totalDiscounts: number;
  redemptionRate: number;
  startDate: Date;
  endDate: Date;
}

export class MerchantPromotionService {
  private static instance: MerchantPromotionService;
  private promotions: Promotion[] = [];
  private promotionUsage: PromotionUsage[] = [];

  static getInstance(): MerchantPromotionService {
    if (!MerchantPromotionService.instance) {
      MerchantPromotionService.instance = new MerchantPromotionService();
      MerchantPromotionService.instance.initializePromotions();
    }
    return MerchantPromotionService.instance;
  }

  private initializePromotions() {
    this.promotions = [
      {
        id: '1',
        name: 'Promo Fruits de Saison',
        description: '10% de réduction sur tous les fruits frais',
        type: 'percentage',
        value: 10,
        conditions: [
          { type: 'min_quantity', value: 2, operator: 'gte' }
        ],
        applicableProducts: ['2', '6'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      },
      {
        id: '2',
        name: 'Offre Spéciale Volaille',
        description: 'Achetez 2 poulets, le 3ème à moitié prix',
        type: 'buy_x_get_y',
        value: 50,
        conditions: [
          { type: 'min_quantity', value: 3, operator: 'gte' }
        ],
        applicableProducts: ['3'],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      },
      {
        id: '3',
        name: 'Réduction Fidélité',
        description: '5% de réduction pour les clients fidèles (200+ points)',
        type: 'percentage',
        value: 5,
        conditions: [
          { type: 'customer_loyalty', value: 200, operator: 'gte' }
        ],
        applicableProducts: [],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      },
      {
        id: '4',
        name: 'Remise Sur Gros Achats',
        description: '1000 FCFA de réduction pour tout achat supérieur à 10000 FCFA',
        type: 'fixed',
        value: 1000,
        conditions: [
          { type: 'min_amount', value: 10000, operator: 'gte' }
        ],
        applicableProducts: [],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      },
      {
        id: '5',
        name: 'Promo du Matin',
        description: '15% de réduction avant 11h',
        type: 'percentage',
        value: 15,
        conditions: [
          { type: 'time_restricted', value: 11, operator: 'lte' }
        ],
        applicableProducts: [],
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true
      }
    ];
  }

  async getActivePromotions(): Promise<Promotion[]> {
    await this.delay(200);
    const now = new Date();
    return this.promotions.filter(promo =>
      promo.isActive &&
      now >= promo.startDate &&
      now <= promo.endDate
    );
  }

  async getApplicablePromotions(
    products: Array<{productId: string, quantity: number, price: number}>,
    totalAmount: number,
    customerLoyaltyPoints: number = 0
  ): Promise<{
    promotions: Promotion[];
    totalDiscount: number;
    finalAmount: number;
    breakdown: Array<{promotion: Promotion, discount: number}>;
  }> {
    await this.delay(300);

    const activePromotions = await this.getActivePromotions();
    const applicablePromotions: Promotion[] = [];
    const breakdown: Array<{promotion: Promotion, discount: number}> = [];
    let totalDiscount = 0;

    for (const promotion of activePromotions) {
      if (this.isPromotionApplicable(promotion, products, totalAmount, customerLoyaltyPoints)) {
        const discount = this.calculatePromotionDiscount(promotion, products, totalAmount);
        if (discount > 0) {
          applicablePromotions.push(promotion);
          breakdown.push({ promotion, discount });
          totalDiscount += discount;
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - totalDiscount);

    return {
      promotions: applicablePromotions,
      totalDiscount,
      finalAmount,
      breakdown
    };
  }

  private isPromotionApplicable(
    promotion: Promotion,
    products: Array<{productId: string, quantity: number, price: number}>,
    totalAmount: number,
    customerLoyaltyPoints: number
  ): boolean {
    for (const condition of promotion.conditions) {
      let meetsCondition = false;

      switch (condition.type) {
        case 'min_quantity': {
          const totalQuantity = products.reduce((sum, product) => {
            if (promotion.applicableProducts.length === 0 ||
                promotion.applicableProducts.includes(product.productId)) {
              return sum + product.quantity;
            }
            return sum;
          }, 0);
          meetsCondition = this.evaluateCondition(totalQuantity, condition.value, condition.operator);
          break;
        }

        case 'min_amount':
          meetsCondition = this.evaluateCondition(totalAmount, condition.value, condition.operator);
          break;

        case 'customer_loyalty':
          meetsCondition = this.evaluateCondition(customerLoyaltyPoints, condition.value, condition.operator);
          break;

        case 'time_restricted': {
          const currentHour = new Date().getHours();
          meetsCondition = this.evaluateCondition(currentHour, condition.value, condition.operator);
          break;
        }
      }

      if (!meetsCondition) {
        return false;
      }
    }

    return true;
  }

  private evaluateCondition(actual: number, required: number, operator: string): boolean {
    switch (operator) {
      case 'gte': return actual >= required;
      case 'lte': return actual <= required;
      case 'eq': return actual === required;
      default: return false;
    }
  }

  private calculatePromotionDiscount(
    promotion: Promotion,
    products: Array<{productId: string, quantity: number, price: number}>,
    totalAmount: number
  ): number {
    let discount = 0;

    switch (promotion.type) {
      case 'percentage': {
        let applicableAmount = totalAmount;
        if (promotion.applicableProducts.length > 0) {
          applicableAmount = products
            .filter(p => promotion.applicableProducts.includes(p.productId))
            .reduce((sum, p) => sum + (p.quantity * p.price), 0);
        }
        discount = (applicableAmount * promotion.value) / 100;
        break;
      }

      case 'fixed':
        discount = promotion.value;
        break;

      case 'buy_x_get_y':
        if (promotion.applicableProducts.length > 0) {
          for (const product of products) {
            if (promotion.applicableProducts.includes(product.productId)) {
              const eligiblePairs = Math.floor(product.quantity / 3);
              discount += eligiblePairs * (product.price * promotion.value / 100);
            }
          }
        }
        break;
    }

    return Math.round(discount);
  }

  async createPromotion(promotion: Omit<Promotion, 'id'>): Promise<Promotion> {
    await this.delay(500);

    const newPromotion: Promotion = {
      ...promotion,
      id: this.generateId()
    };

    this.promotions.push(newPromotion);
    return newPromotion;
  }

  async updatePromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
    await this.delay(300);

    const index = this.promotions.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Promotion not found');
    }

    this.promotions[index] = { ...this.promotions[index], ...updates };
    return this.promotions[index];
  }

  async deletePromotion(id: string): Promise<void> {
    await this.delay(200);
    this.promotions = this.promotions.filter(p => p.id !== id);
  }

  async recordPromotionUsage(
    promotionId: string,
    transactionId: string,
    discountAmount: number,
    clientId?: string
  ): Promise<PromotionUsage> {
    await this.delay(100);

    const usage: PromotionUsage = {
      id: this.generateId(),
      promotionId,
      clientId,
      transactionId,
      discountAmount,
      usageDate: new Date()
    };

    this.promotionUsage.push(usage);
    return usage;
  }

  async getPromotionUsage(promotionId: string, limit: number = 100): Promise<PromotionUsage[]> {
    await this.delay(150);
    return this.promotionUsage
      .filter(usage => usage.promotionId === promotionId)
      .sort((a, b) => new Date(b.usageDate).getTime() - new Date(a.usageDate).getTime())
      .slice(0, limit);
  }

  async getPromotionAnalytics(promotionId: string): Promise<PromotionAnalytics> {
    await this.delay(500);

    const usage = this.promotionUsage.filter(u => u.promotionId === promotionId);
    const totalUsage = usage.length;
    const totalDiscount = usage.reduce((sum, u) => sum + u.discountAmount, 0);
    const averageDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0;

    const usageByDay: Record<string, number> = {};
    usage.forEach(u => {
      const day = u.usageDate.toISOString().split('T')[0];
      usageByDay[day] = (usageByDay[day] || 0) + 1;
    });

    const topProducts = this.getTopProductsForPromotion(promotionId);

    return {
      promotionId,
      totalUsage,
      totalDiscount,
      averageDiscount,
      usageByDay,
      topProducts
    };
  }

  async getPromotionMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalPromotions: number;
    activePromotions: number;
    totalUsage: number;
    totalDiscounts: number;
    topPerformingPromotions: Array<{promotion: Promotion, usage: number, discount: number}>;
    redemptionRate: number;
  }> {
    await this.delay(800);

    const filteredPromotions = this.promotions.filter(promo => {
      if (startDate && promo.startDate < startDate) return false;
      if (endDate && promo.endDate > endDate) return false;
      return true;
    });

    const activePromotions = filteredPromotions.filter(p => p.isActive);
    const relevantUsage = this.promotionUsage.filter(usage => {
      const promotion = this.promotions.find(p => p.id === usage.promotionId);
      if (!promotion) return false;
      if (startDate && promotion.startDate < startDate) return false;
      if (endDate && promotion.endDate > endDate) return false;
      return true;
    });

    const totalUsage = relevantUsage.length;
    const totalDiscounts = relevantUsage.reduce((sum, u) => sum + u.discountAmount, 0);

    const promotionStats: Record<string, {promotion: Promotion, usage: number, discount: number}> = {};
    relevantUsage.forEach(usage => {
      const promotion = this.promotions.find(p => p.id === usage.promotionId);
      if (promotion && !promotionStats[usage.promotionId]) {
        promotionStats[usage.promotionId] = {
          promotion,
          usage: 0,
          discount: 0
        };
      }
      if (promotionStats[usage.promotionId]) {
        promotionStats[usage.promotionId].usage++;
        promotionStats[usage.promotionId].discount += usage.discountAmount;
      }
    });

    const topPerformingPromotions = Object.values(promotionStats)
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    const totalPossibleUsage = filteredPromotions.length * 100;
    const redemptionRate = totalPossibleUsage > 0 ? (totalUsage / totalPossibleUsage) * 100 : 0;

    return {
      totalPromotions: filteredPromotions.length,
      activePromotions: activePromotions.length,
      totalUsage,
      totalDiscounts,
      topPerformingPromotions,
      redemptionRate
    };
  }

  async validatePromotionApplicability(
    promotionId: string,
    products: Array<{productId: string, quantity: number, price: number}>,
    totalAmount: number,
    customerLoyaltyPoints: number = 0
  ): Promise<{applicable: boolean, reason?: string, discount: number}> {
    await this.delay(200);

    const promotion = this.promotions.find(p => p.id === promotionId);
    if (!promotion) {
      return { applicable: false, reason: 'Promotion non trouvée', discount: 0 };
    }

    if (!promotion.isActive) {
      return { applicable: false, reason: 'Promotion inactive', discount: 0 };
    }

    const now = new Date();
    if (now < promotion.startDate || now > promotion.endDate) {
      return { applicable: false, reason: 'Promotion expirée ou non commencée', discount: 0 };
    }

    if (!this.isPromotionApplicable(promotion, products, totalAmount, customerLoyaltyPoints)) {
      return { applicable: false, reason: 'Conditions non remplies', discount: 0 };
    }

    const discount = this.calculatePromotionDiscount(promotion, products, totalAmount);
    return { applicable: true, discount };
  }

  async getBestPromotionForCart(
    products: Array<{productId: string, quantity: number, price: number}>,
    totalAmount: number,
    customerLoyaltyPoints: number = 0
  ): Promise<{promotion?: Promotion, discount: number, savings: number}> {
    await this.delay(300);

    const activePromotions = await this.getActivePromotions();
    let bestPromotion: Promotion | undefined;
    let maxDiscount = 0;

    for (const promotion of activePromotions) {
      const validation = await this.validatePromotionApplicability(
        promotion.id,
        products,
        totalAmount,
        customerLoyaltyPoints
      );

      if (validation.applicable && validation.discount > maxDiscount) {
        maxDiscount = validation.discount;
        bestPromotion = promotion;
      }
    }

    return {
      promotion: bestPromotion,
      discount: maxDiscount,
      savings: maxDiscount
    };
  }

  async createPromotionCampaign(promotions: Omit<Promotion, 'id'>[]): Promise<Promotion[]> {
    await this.delay(1000);

    const createdPromotions: Promotion[] = [];
    for (const promoData of promotions) {
      const promotion = await this.createPromotion(promoData);
      createdPromotions.push(promotion);
    }

    return createdPromotions;
  }

  private getTopProductsForPromotion(promotionId: string): Array<{productId: string, usage: number}> {
    const usage = this.promotionUsage.filter(u => u.promotionId === promotionId);
    const productUsage: Record<string, number> = {};

    usage.forEach(u => {
      const transaction = this.getTransactionProducts(u.transactionId);
      transaction.forEach(productId => {
        productUsage[productId] = (productUsage[productId] || 0) + 1;
      });
    });

    return Object.entries(productUsage)
      .map(([productId, usage]) => ({ productId, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);
  }

  private getTransactionProducts(transactionId: string): string[] {
    const mockProducts = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const numProducts = Math.floor(Math.random() * 5) + 1;
    const products: string[] = [];

    for (let i = 0; i < numProducts; i++) {
      const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
      if (!products.includes(randomProduct)) {
        products.push(randomProduct);
      }
    }

    return products;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}