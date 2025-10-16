import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import MerchantSocial from '@/pages/merchant/MerchantSocial';

describe('MerchantSocial page', () => {
  it('computes dues and shows CNPS/CNAM amounts', async () => {
    renderWithProviders(<MerchantSocial />);
    const input = screen.getAllByRole('spinbutton')[0];
    await userEvent.clear(input);
    await userEvent.type(input, '100000');
    const calc = screen.getByRole('button', { name: /calculer/i });
    await userEvent.click(calc);
    // CNPS 5% and CNAM 2% of 100000 (normalize non-digits)
    const fiveThousandAll = await screen.findAllByText((content, el) => {
      const text = el?.textContent?.replace(/\D/g, '') || '';
      return text.includes('5000');
    });
    const twoThousandAll = await screen.findAllByText((content, el) => {
      const text = el?.textContent?.replace(/\D/g, '') || '';
      return text.includes('2000');
    });
    expect(fiveThousandAll.length).toBeGreaterThan(0);
    expect(twoThousandAll.length).toBeGreaterThan(0);
  });
});
