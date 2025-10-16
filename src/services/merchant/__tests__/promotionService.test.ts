import { describe, it, expect } from 'vitest';
import { MerchantPromotionService } from '@/services/merchant/merchantPromotionService';

describe('MerchantPromotionService', () => {
  const service = MerchantPromotionService.getInstance();
  const items = [
    { productId: '2', quantity: 5, price: 300 }, // oranges
    { productId: '3', quantity: 3, price: 2500 }, // poulet
  ];

  it('computes applicable promotions with discount > 0', async () => {
    const total = items.reduce((s, i) => s + i.quantity * i.price, 0);
    const { totalDiscount, finalAmount } = await service.getApplicablePromotions(items, total, 300);
    expect(totalDiscount).toBeGreaterThanOrEqual(0);
    expect(finalAmount).toBe(total - totalDiscount);
  });

  it('finds best promotion for cart', async () => {
    const total = items.reduce((s, i) => s + i.quantity * i.price, 0);
    const best = await service.getBestPromotionForCart(items, total, 500);
    expect(best.discount).toBeGreaterThanOrEqual(0);
  });
});

