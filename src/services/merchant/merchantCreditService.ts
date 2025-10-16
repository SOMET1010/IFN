import { PaymentTransaction } from '@/types/merchant';

export type InstallmentStatus = 'due' | 'paid' | 'late';

export interface CreditInstallment {
  id: string;
  creditId: string;
  dueDate: string; // ISO date
  amount: number;
  status: InstallmentStatus;
  paidAt?: string;
  reference?: string;
}

export interface CreditAccount {
  id: string;
  clientName: string;
  clientPhone: string;
  principal: number;
  fees: number;
  total: number;
  createdAt: string;
  status: 'active' | 'closed';
  transactionRef: string;
}

export class MerchantCreditService {
  private static instance: MerchantCreditService;
  private credits: CreditAccount[] = [];
  private installments: CreditInstallment[] = [];

  static getInstance(): MerchantCreditService {
    if (!MerchantCreditService.instance) {
      MerchantCreditService.instance = new MerchantCreditService();
    }
    return MerchantCreditService.instance;
  }

  async createFromTransaction(tx: PaymentTransaction): Promise<CreditAccount> {
    const installments = Number((tx.metadata?.installments as any) || 3);
    const firstDue = String(tx.metadata?.firstDue || new Date(Date.now() + 7*86400000).toISOString().slice(0,10));
    const fees = Number(tx.fees || 0);
    const principal = Number((tx.metadata?.baseAmount as any) || tx.amount);
    const account: CreditAccount = {
      id: this.id(),
      clientName: tx.customerInfo.name,
      clientPhone: tx.customerInfo.phone,
      principal,
      fees,
      total: tx.amount,
      createdAt: new Date().toISOString(),
      status: 'active',
      transactionRef: tx.reference,
    };
    this.credits.push(account);

    const per = Math.round(tx.amount / installments);
    const first = new Date(firstDue);
    for (let i = 0; i < installments; i++) {
      const d = new Date(first);
      d.setMonth(first.getMonth() + i);
      this.installments.push({
        id: this.id(),
        creditId: account.id,
        dueDate: d.toISOString().slice(0,10),
        amount: per,
        status: 'due',
      });
    }
    return account;
  }

  async list(): Promise<CreditAccount[]> {
    await this.delay(100);
    return [...this.credits];
  }

  async get(creditId: string): Promise<{ account: CreditAccount; schedule: CreditInstallment[] }> {
    await this.delay(80);
    const account = this.credits.find(c => c.id === creditId);
    const schedule = this.installments.filter(i => i.creditId === creditId).sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
    if (!account) throw new Error('Credit not found');
    return { account, schedule };
  }

  async payInstallment(creditId: string, installmentId: string, reference: string): Promise<CreditInstallment> {
    await this.delay(120);
    const it = this.installments.find(i => i.id === installmentId && i.creditId === creditId);
    if (!it) throw new Error('Installment not found');
    it.status = 'paid';
    it.paidAt = new Date().toISOString();
    it.reference = reference;
    // Close account if all paid
    const remaining = this.installments.filter(i => i.creditId === creditId && i.status !== 'paid');
    if (remaining.length === 0) {
      const acc = this.credits.find(c => c.id === creditId);
      if (acc) acc.status = 'closed';
    }
    return it;
  }

  async checkOverdues(): Promise<CreditInstallment[]> {
    await this.delay(50);
    const today = new Date().toISOString().slice(0,10);
    const updated: CreditInstallment[] = [];
    this.installments.forEach(i => {
      if (i.status === 'due' && i.dueDate < today) {
        i.status = 'late';
        updated.push({ ...i });
      }
    });
    return updated;
  }

  async generateReceipt(creditId: string): Promise<string> {
    const { account, schedule } = await this.get(creditId);
    const lines: string[] = [];
    lines.push(`Reçu de crédit - ${account.clientName}`);
    lines.push(`Téléphone: ${account.clientPhone}`);
    lines.push(`Référence transaction: ${account.transactionRef}`);
    lines.push(`Créé le: ${new Date(account.createdAt).toLocaleString()}`);
    lines.push(`Montant total: ${account.total} | Principal: ${account.principal} | Frais: ${account.fees}`);
    lines.push('Échéancier:');
    schedule.forEach((it, idx) => {
      lines.push(`#${idx+1} | Due: ${it.dueDate} | Montant: ${it.amount} | Statut: ${it.status}${it.paidAt ? ` | Payé: ${new Date(it.paidAt).toLocaleString()}` : ''}${it.reference ? ` | Réf: ${it.reference}` : ''}`);
    });
    return lines.join('\n');
  }

  async generateReceiptHTML(creditId: string): Promise<string> {
    const { account, schedule } = await this.get(creditId);
    const rows = schedule.map((it, idx) => `
      <tr>
        <td style="padding:6px;border:1px solid #ddd;">${idx + 1}</td>
        <td style="padding:6px;border:1px solid #ddd;">${it.dueDate}</td>
        <td style="padding:6px;border:1px solid #ddd;">${it.amount.toLocaleString()} FCFA</td>
        <td style="padding:6px;border:1px solid #ddd;">${it.status}${it.paidAt ? ` (payé le ${new Date(it.paidAt).toLocaleString()})` : ''}</td>
      </tr>`).join('');
    return `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <h2>Reçu de crédit</h2>
        <p><strong>Client:</strong> ${account.clientName} (${account.clientPhone})</p>
        <p><strong>Référence transaction:</strong> ${account.transactionRef}</p>
        <p><strong>Créé le:</strong> ${new Date(account.createdAt).toLocaleString()}</p>
        <p><strong>Total:</strong> ${account.total.toLocaleString()} FCFA
           &nbsp;—&nbsp; <strong>Principal:</strong> ${account.principal.toLocaleString()} FCFA
           &nbsp;—&nbsp; <strong>Frais:</strong> ${account.fees.toLocaleString()} FCFA</p>
        <h3>Échéancier</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">#</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Échéance</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Montant</th>
              <th style="padding:6px;border:1px solid #ddd;text-align:left;">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  private id() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
  private delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
}
