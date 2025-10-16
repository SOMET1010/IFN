import { ApiResponse, User } from '@/types';
import { BaseService } from '@/services/baseService';

export type DisputeStatus = 'open' | 'in_review' | 'pending' | 'resolved' | 'rejected';
export type DisputeType =
  | 'erreur_transaction'
  | 'probleme_paiement'
  | 'remboursement'
  | 'commande_non_reçue'
  | 'autre';

export interface DisputeMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: User['role'] | 'support';
  message: string;
  timestamp: string;
}

export interface Dispute {
  id: string;
  transaction_id?: string;
  user_id: string;
  user_name: string;
  type: DisputeType;
  title: string;
  description: string;
  amount?: number;
  status: DisputeStatus;
  created_at: string;
  updated_at: string;
  assigned_agent?: string;
  evidence?: string[]; // file names or URLs
  messages: DisputeMessage[];
}

export class DisputeService extends BaseService<Dispute> {
  constructor() {
    super('/disputes', 'disputes');
  }

  initializeDemoData() {
    const existing = this.getLocalStorageData();
    if (existing && existing.length > 0) return;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00Z`;

    const demo: Dispute[] = [
      {
        id: '12345',
        transaction_id: '67890',
        user_id: 'u-1',
        user_name: 'Utilisateur A',
        type: 'erreur_transaction',
        title: 'Erreur de transaction',
        description: 'Montant débité deux fois pour la même commande.',
        amount: 50000,
        status: 'pending',
        created_at: date(new Date(now.getTime() - 6 * 24 * 3600 * 1000)),
        updated_at: date(new Date(now.getTime() - 5 * 24 * 3600 * 1000)),
        assigned_agent: 'Agent 1',
        evidence: [],
        messages: [],
      },
      {
        id: '12346',
        transaction_id: '67891',
        user_id: 'u-2',
        user_name: 'Utilisateur B',
        type: 'probleme_paiement',
        title: 'Problème de paiement',
        description: 'Échec de paiement mais commande marquée payée.',
        amount: 25000,
        status: 'resolved',
        created_at: date(new Date(now.getTime() - 5 * 24 * 3600 * 1000)),
        updated_at: date(new Date(now.getTime() - 4 * 24 * 3600 * 1000)),
        assigned_agent: 'Agent 2',
        evidence: [],
        messages: [],
      },
      {
        id: '12347',
        transaction_id: '67892',
        user_id: 'u-3',
        user_name: 'Utilisateur C',
        type: 'remboursement',
        title: 'Litige de remboursement',
        description: 'Demande de remboursement non traitée.',
        amount: 100000,
        status: 'in_review',
        created_at: date(new Date(now.getTime() - 4 * 24 * 3600 * 1000)),
        updated_at: date(new Date(now.getTime() - 3 * 24 * 3600 * 1000)),
        assigned_agent: 'Agent 3',
        evidence: [],
        messages: [],
      },
    ];
    this.setLocalStorageData(demo);
  }

  async search(filters: {
    q?: string;
    status?: DisputeStatus | 'all';
    type?: DisputeType | 'all';
    user?: string | 'all';
  }): Promise<ApiResponse<Dispute[]>> {
    const all = this.getLocalStorageData();
    let res = all;
    const { q, status, type, user } = filters;
    if (q) {
      const s = q.toLowerCase();
      res = res.filter(d =>
        d.id.toLowerCase().includes(s) ||
        (d.transaction_id || '').toLowerCase().includes(s) ||
        d.user_name.toLowerCase().includes(s)
      );
    }
    if (status && status !== 'all') res = res.filter(d => d.status === status);
    if (type && type !== 'all') res = res.filter(d => d.type === type);
    if (user && user !== 'all') res = res.filter(d => d.user_name === user);
    return { success: true, data: res };
  }

  async addMessage(disputeId: string, msg: Omit<DisputeMessage, 'id' | 'timestamp'>): Promise<ApiResponse<Dispute | undefined>> {
    const all = this.getLocalStorageData();
    const d = all.find(d => d.id === disputeId);
    if (!d) return { success: false, error: 'Litige introuvable' };
    const newMsg: DisputeMessage = {
      id: Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      ...msg,
    };
    d.messages = [...(d.messages || []), newMsg];
    d.updated_at = new Date().toISOString();
    this.setLocalStorageData(all);
    return { success: true, data: d };
  }

  async addEvidence(disputeId: string, files: string[]): Promise<ApiResponse<Dispute | undefined>> {
    const all = this.getLocalStorageData();
    const d = all.find(d => d.id === disputeId);
    if (!d) return { success: false, error: 'Litige introuvable' };
    d.evidence = [...(d.evidence || []), ...files];
    d.updated_at = new Date().toISOString();
    this.setLocalStorageData(all);
    return { success: true, data: d };
  }
}

export const disputeService = new DisputeService();

