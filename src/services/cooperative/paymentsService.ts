// Mock collective payments service with localStorage persistence

export type PaymentMethod = 'mobile_money' | 'cash' | 'transfer';

export interface Contribution {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  receiptNumber: string;
  status: 'recorded' | 'reconciled';
}

export interface SupplierPayment {
  id: string;
  supplierName: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
}

const LS_KEY_CONTRIB = 'cooperative_contributions';
const LS_KEY_SUP = 'cooperative_supplier_payments';

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const paymentsService = {
  listContributions(): Contribution[] {
    return load<Contribution>(LS_KEY_CONTRIB);
  },

  addContribution(input: Omit<Contribution, 'id' | 'date' | 'receiptNumber' | 'status'> & { date?: string }): Contribution {
    const items = load<Contribution>(LS_KEY_CONTRIB);
    const c: Contribution = {
      id: `ctb_${Date.now()}`,
      date: input.date || new Date().toISOString(),
      receiptNumber: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'recorded',
      ...input,
    };
    items.unshift(c);
    save(LS_KEY_CONTRIB, items);
    return c;
  },

  reconcileContributions() {
    const items = load<Contribution>(LS_KEY_CONTRIB).map(c => ({ ...c, status: 'reconciled' as const }));
    save(LS_KEY_CONTRIB, items);
  },

  listSupplierPayments(): SupplierPayment[] {
    return load<SupplierPayment>(LS_KEY_SUP);
  },

  addSupplierPayment(input: Omit<SupplierPayment, 'id' | 'date'> & { date?: string }): SupplierPayment {
    const items = load<SupplierPayment>(LS_KEY_SUP);
    const p: SupplierPayment = {
      id: `sp_${Date.now()}`,
      date: input.date || new Date().toISOString(),
      ...input,
    };
    items.unshift(p);
    save(LS_KEY_SUP, items);
    return p;
  },

  totals() {
    const contributions = load<Contribution>(LS_KEY_CONTRIB);
    const supplier = load<SupplierPayment>(LS_KEY_SUP);
    const totalContrib = contributions.reduce((s, c) => s + c.amount, 0);
    const totalSupplier = supplier.reduce((s, p) => s + p.amount, 0);
    return { totalContrib, totalSupplier, balance: totalContrib - totalSupplier };
  },

  computeBenefitDistribution(totalProfit: number) {
    const contributions = load<Contribution>(LS_KEY_CONTRIB);
    const perMember = new Map<string, { name: string; total: number }>();
    contributions.forEach(c => {
      const prev = perMember.get(c.memberId) || { name: c.memberName, total: 0 };
      prev.total += c.amount;
      perMember.set(c.memberId, prev);
    });
    const grandTotal = Array.from(perMember.values()).reduce((s, m) => s + m.total, 0) || 1;
    return Array.from(perMember.entries()).map(([memberId, m]) => ({
      memberId,
      memberName: m.name,
      contribution: m.total,
      share: Math.round((m.total / grandTotal) * totalProfit),
    }));
  },
};

