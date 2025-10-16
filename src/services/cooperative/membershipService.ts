// Simple in-memory + localStorage membership workflow service
// Note: This is a mock service with persistence in localStorage for demo purposes.

export type MembershipStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'fee_pending'
  | 'active';

export interface MembershipDocument {
  id: string;
  filename: string;
  type: 'id' | 'justificatif' | 'autre';
  url?: string;
  uploadedAt: string;
}

export interface MembershipApplication {
  id: string;
  name: string;
  phone: string;
  role: string;
  location?: string;
  createdAt: string;
  status: MembershipStatus;
  documents: MembershipDocument[];
  notes?: string;
  feeAmount?: number;
  activatedAt?: string;
}

const LS_KEY = 'cooperative_memberships';

function load(): MembershipApplication[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MembershipApplication[]) : [];
  } catch {
    return [];
  }
}

function save(data: MembershipApplication[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export const membershipService = {
  list(): MembershipApplication[] {
    return load();
  },

  submit(app: Omit<MembershipApplication, 'id' | 'createdAt' | 'status'> & { status?: MembershipStatus }): MembershipApplication {
    const current = load();
    const newApp: MembershipApplication = {
      id: `mb_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'submitted',
      ...app,
    };
    current.unshift(newApp);
    save(current);
    return newApp;
  },

  updateStatus(id: string, status: MembershipStatus, notes?: string) {
    const current = load();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      current[idx].status = status;
      if (notes) current[idx].notes = notes;
      if (status === 'active') current[idx].activatedAt = new Date().toISOString();
      save(current);
    }
  },

  recordFee(id: string, amount: number) {
    const current = load();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      current[idx].feeAmount = amount;
      current[idx].status = 'fee_pending';
      save(current);
    }
  },

  activate(id: string) {
    const current = load();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      current[idx].status = 'active';
      current[idx].activatedAt = new Date().toISOString();
      save(current);
    }
  },

  addDocument(id: string, doc: Omit<MembershipDocument, 'id' | 'uploadedAt'>) {
    const current = load();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      const d: MembershipDocument = {
        id: `doc_${Date.now()}`,
        uploadedAt: new Date().toISOString(),
        ...doc,
      };
      current[idx].documents.push(d);
      save(current);
      return d;
    }
    return undefined;
  },

  getActiveMembers(): { id: string; name: string }[] {
    return load()
      .filter(a => a.status === 'active')
      .map(a => ({ id: a.id, name: a.name }));
  },
};

