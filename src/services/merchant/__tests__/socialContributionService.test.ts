import { describe, it, expect } from 'vitest';
import { SocialContributionService } from '@/services/merchant/socialContributionService';

describe('SocialContributionService', () => {
  const service = SocialContributionService.getInstance();
  it('computes dues for a period', async () => {
    const dues = await service.computeDues(100000, '2024-10');
    expect(dues.length).toBeGreaterThan(0);
    const cnps = dues.find(d => d.type === 'CNPS');
    expect(cnps?.amountDue).toBe(5000);
  });
});

