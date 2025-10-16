import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render';
import MerchantSourcing from '@/pages/merchant/MerchantSourcing';

describe('MerchantSourcing page', () => {
  it('selects an offer and creates a purchase order (UI)', async () => {
    // mock URL.createObjectURL for download in JSDOM
    // @ts-expect-error - Mock URL methods for JSDOM environment
    global.URL.createObjectURL = global.URL.createObjectURL || (() => 'blob:mock');
    // @ts-expect-error - Mock URL methods for JSDOM environment
    global.URL.revokeObjectURL = global.URL.revokeObjectURL || (() => {});
    renderWithProviders(<MerchantSourcing />);
    // Wait for offers table to load
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');
    // first data row (skip header)
    const firstRow = rows[1];
    const checkbox = within(firstRow).getByRole('checkbox');
    await userEvent.click(checkbox);
    // Create PO
    const createBtn = screen.getByRole('button', { name: /créer bon de commande/i });
    expect(createBtn).toBeEnabled();
    await userEvent.click(createBtn);
    // While placing, label changes (may be quick); check button text returns
    expect(await screen.findByRole('button', { name: /créer bon de commande/i })).toBeInTheDocument();
  });
});
