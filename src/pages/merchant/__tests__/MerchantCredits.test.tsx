import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import MerchantCredits from '@/pages/merchant/MerchantCredits';
import { MerchantCreditService } from '@/services/merchant/merchantCreditService';
import type { PaymentTransaction } from '@/types/merchant';

describe('MerchantCredits page', () => {
  beforeEach(async () => {
    // Seed a credit account from a mock credit transaction
    const svc = MerchantCreditService.getInstance();
    const tx: PaymentTransaction = {
      id: 'TXNTEST',
      reference: 'REFTEST',
      amount: 9000,
      currency: 'XOF',
      methodId: 'credit',
      methodName: 'Crédit Client',
      status: 'completed',
      timestamp: new Date(),
      customerInfo: { name: 'Client Test', phone: '+22501020304' },
      fees: 0,
      totalAmount: 9000,
      metadata: { baseAmount: 9000, installments: 3, firstDue: new Date().toISOString().slice(0,10) },
    } as Credit;
    await svc.createFromTransaction(tx);
  });

  it('renders credit list and navigates to detail', async () => {
    renderWithProviders(<MerchantCredits />);
    // list tab should show seeded credit
    const row = await screen.findByText(/Client Test/i);
    const tr = row.closest('tr')!;
    // click "Voir"
    const btn = within(tr).getByRole('button', { name: /voir/i });
    await userEvent.click(btn);
    // switch to Détail tab
    const detailTab = screen.getByRole('tab', { name: /détail/i });
    await userEvent.click(detailTab);
    // expect schedule table
    expect(await screen.findByText(/Échéance/i)).toBeInTheDocument();
  });
});

