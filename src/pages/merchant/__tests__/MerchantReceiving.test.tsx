import { describe, it, expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import MerchantReceiving from '@/pages/merchant/MerchantReceiving';
import { merchantService } from '@/services/merchant/merchantService';

describe('MerchantReceiving page', () => {
  it('receives a confirmed order and updates inventory', async () => {
    // Baseline inventory
    const before = await merchantService.getInventory();
    const orangesBefore = before.find(i => i.product === 'Oranges')?.currentStock || 0;
    const ananasBefore = before.find(i => i.product === 'Ananas')?.currentStock || 0;

    renderWithProviders(<MerchantReceiving />);
    // Wait for a confirmed order row (CMD-002 from mock)
    const orderCell = await screen.findByText(/CMD-002/i);
    const tr = orderCell.closest('tr')!;
    const receiveBtn = tr.querySelector('button');
    if (receiveBtn) await userEvent.click(receiveBtn);

    // In modal, click validate
    const validate = await screen.findByRole('button', { name: /valider la réception/i });
    await userEvent.click(validate);

    // Wait for dialog to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Verify inventory increased for oranges and ananas
    const after = await merchantService.getInventory();
    const orangesAfter = after.find(i => i.product === 'Oranges')?.currentStock || 0;
    const ananasAfter = after.find(i => i.product === 'Ananas')?.currentStock || 0;
    expect(orangesAfter).toBeGreaterThan(orangesBefore);
    expect(ananasAfter).toBeGreaterThan(ananasBefore);
  });
});
