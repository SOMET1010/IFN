export type ContributionType = 'CNPS' | 'CNAM';

export interface ContributionRate {
  type: ContributionType;
  rate: number; // as percentage of base
  label: string;
}

export interface ContributionDue {
  id: string;
  type: ContributionType;
  period: string; // e.g., 2024-10
  baseAmount: number;
  amountDue: number;
  dueDate: string; // ISO date
  status: 'due' | 'paid' | 'late';
}

export interface ContributionPayment {
  id: string;
  dueId: string;
  type: ContributionType;
  amount: number;
  paidAt: Date;
  reference: string;
}

export class SocialContributionService {
  private static instance: SocialContributionService;
  private rates: ContributionRate[] = [
    { type: 'CNPS', rate: 0.05, label: 'CNPS (5%)' },
    { type: 'CNAM', rate: 0.02, label: 'CNAM (2%)' },
  ];
  private payments: ContributionPayment[] = [];

  static getInstance(): SocialContributionService {
    if (!SocialContributionService.instance) {
      SocialContributionService.instance = new SocialContributionService();
    }
    return SocialContributionService.instance;
  }

  async getRates(): Promise<ContributionRate[]> {
    await this.delay(100);
    return this.rates;
  }

  async computeDues(monthlyRevenue: number, periodISO: string): Promise<ContributionDue[]> {
    await this.delay(150);
    const dueDate = this.computeDueDate(periodISO);
    return this.rates.map((r) => ({
      id: `${r.type}-${periodISO}`,
      type: r.type,
      period: periodISO,
      baseAmount: monthlyRevenue,
      amountDue: Math.round(monthlyRevenue * r.rate),
      dueDate,
      status: 'due',
    }));
  }

  async recordPayment(due: ContributionDue, reference: string): Promise<ContributionPayment> {
    await this.delay(120);
    const payment: ContributionPayment = {
      id: this.id(),
      dueId: due.id,
      type: due.type,
      amount: due.amountDue,
      paidAt: new Date(),
      reference,
    };
    this.payments.push(payment);
    return payment;
  }

  async getPaymentHistory(limit: number = 50): Promise<ContributionPayment[]> {
    await this.delay(80);
    return this.payments
      .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
      .slice(0, limit);
  }

  private computeDueDate(periodISO: string): string {
    // period format YYYY-MM; due date is 10th of next month
    const [y, m] = periodISO.split('-').map(Number);
    const d = new Date(y, m, 10);
    return d.toISOString().split('T')[0];
  }

  private id() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
  private delay(ms: number) { return new Promise(res => setTimeout(res, ms)); }
}

