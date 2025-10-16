// Mock logistics service for distribution signatures and proofs

export interface DistributionSignature {
  id: string;
  distId: string;
  signer: string;
  date: string;
  photos?: string[];
}

const LS_SIG = 'cooperative_distribution_signatures';

function load(): DistributionSignature[] {
  try { const raw = localStorage.getItem(LS_SIG); return raw ? JSON.parse(raw) as DistributionSignature[] : []; } catch { return []; }
}

function save(data: DistributionSignature[]) { try { localStorage.setItem(LS_SIG, JSON.stringify(data)); } catch {
    // Silently ignore localStorage errors as this is non-critical data
    // In production, this could be logged to an error tracking service
  } }

export const logisticsService = {
  recordSignature(distId: string, signer: string, photos?: string[]): DistributionSignature {
    const items = load();
    const rec: DistributionSignature = { id: `sig_${Date.now()}`, distId, signer, date: new Date().toISOString(), photos: photos || [] };
    items.unshift(rec);
    save(items);
    return rec;
  },
  getSignatures(distId: string): DistributionSignature[] {
    return load().filter(s => s.distId === distId);
  }
};

