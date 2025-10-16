// Mock inventory service to support reception, allocation and distribution completion

export interface InventoryRecord {
  id: string;
  productName: string;
  category?: string;
  quantity: number;
  unit: string; // e.g., kg, unité
  warehouse?: string;
  lastUpdated: string;
}

export interface ReceptionChecklistItem {
  label: string;
  checked: boolean;
}

export interface ReceptionRecord {
  id: string;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  supplier?: string;
  barcode?: string;
  photos?: string[];
  checklist?: ReceptionChecklistItem[];
  receivedAt: string;
  warehouse?: string;
  createdInventoryRecordId?: string;
  qualityStatus?: 'passed' | 'failed' | 'pending';
  qualityScore?: number;
}

export interface AllocationRecord {
  id: string;
  productName: string;
  unit: string;
  quantity: number; // reserved quantity
  purpose: 'distribution' | 'order' | 'other';
  reference?: string; // e.g., DIST-001
  allocatedAt: string;
  issuedAt?: string; // when stock actually leaves
}

const LS_INV = 'cooperative_inventory_items';
const LS_REC = 'cooperative_inventory_receptions';
const LS_ALLOC = 'cooperative_inventory_allocations';

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

export const inventoryService = {
  list(): InventoryRecord[] {
    return load<InventoryRecord>(LS_INV);
  },

  receptions(): ReceptionRecord[] {
    return load<ReceptionRecord>(LS_REC);
  },

  getReceivingRecords(): ReceptionRecord[] {
    return load<ReceptionRecord>(LS_REC);
  },

  addReceivingRecord(data: Omit<ReceptionRecord, 'id' | 'receivedAt' | 'createdInventoryRecordId'>): ReceptionRecord {
    return this.receiveGoods(data);
  },

  updateReceivingRecord(id: string, updates: Partial<ReceptionRecord>): ReceptionRecord | undefined {
    const receptions = load<ReceptionRecord>(LS_REC);
    const index = receptions.findIndex(r => r.id === id);
    if (index < 0) return undefined;
    
    receptions[index] = { ...receptions[index], ...updates };
    save(LS_REC, receptions);
    return receptions[index];
  },

  deleteReceivingRecord(id: string): boolean {
    const receptions = load<ReceptionRecord>(LS_REC);
    const index = receptions.findIndex(r => r.id === id);
    if (index < 0) return false;
    
    receptions.splice(index, 1);
    save(LS_REC, receptions);
    return true;
  },

  updateQualityCheck(id: string, qualityData: { qualityStatus?: 'passed' | 'failed' | 'pending'; qualityScore?: number }): void {
    const receptions = load<ReceptionRecord>(LS_REC);
    const index = receptions.findIndex(r => r.id === id);
    if (index >= 0) {
      receptions[index].qualityStatus = qualityData.qualityStatus || 'passed';
      receptions[index].qualityScore = qualityData.qualityScore || 100;
      save(LS_REC, receptions);
    }
  },

  receiveGoods(input: Omit<ReceptionRecord, 'id' | 'receivedAt' | 'createdInventoryRecordId'>): ReceptionRecord {
    const receptions = load<ReceptionRecord>(LS_REC);
    const items = load<InventoryRecord>(LS_INV);
    // upsert inventory by product name + unit
    const idx = items.findIndex(
      i => i.productName.toLowerCase() === input.productName.toLowerCase() && i.unit === input.unit
    );
    const now = new Date().toISOString();
    let inv: InventoryRecord;
    if (idx >= 0) {
      items[idx].quantity += input.quantity;
      items[idx].lastUpdated = now;
      inv = items[idx];
    } else {
      inv = {
        id: `inv_${Date.now()}`,
        productName: input.productName,
        category: input.category,
        quantity: input.quantity,
        unit: input.unit,
        warehouse: input.warehouse,
        lastUpdated: now,
      };
      items.unshift(inv);
    }
    save(LS_INV, items);

    const rec: ReceptionRecord = {
      id: `rec_${Date.now()}`,
      receivedAt: now,
      createdInventoryRecordId: inv.id,
      ...input,
    };
    receptions.unshift(rec);
    save(LS_REC, receptions);
    return rec;
  },

  completeDistribution(productName: string, unit: string, quantity: number) {
    const items = load<InventoryRecord>(LS_INV);
    const idx = items.findIndex(
      i => i.productName.toLowerCase() === productName.toLowerCase() && i.unit === unit
    );
    if (idx >= 0) {
      items[idx].quantity = Math.max(0, items[idx].quantity - quantity);
      items[idx].lastUpdated = new Date().toISOString();
      save(LS_INV, items);
    }
  },

  // Allocations (reserve stock)
  listAllocations(): AllocationRecord[] {
    return load<AllocationRecord>(LS_ALLOC);
  },

  allocateStock(input: Omit<AllocationRecord, 'id' | 'allocatedAt' | 'issuedAt'>): AllocationRecord | undefined {
    const items = load<InventoryRecord>(LS_INV);
    const idx = items.findIndex(i => i.productName.toLowerCase() === input.productName.toLowerCase() && i.unit === input.unit);
    if (idx < 0) return undefined;
    // Reserve logic: ensure available >= quantity
    const available = items[idx].quantity - this.listAllocations()
      .filter(a => a.productName.toLowerCase() === input.productName.toLowerCase() && a.unit === input.unit && !a.issuedAt)
      .reduce((s, a) => s + a.quantity, 0);
    if (available < input.quantity) return undefined;
    const allocs = load<AllocationRecord>(LS_ALLOC);
    const rec: AllocationRecord = { id: `alloc_${Date.now()}`, allocatedAt: new Date().toISOString(), ...input };
    allocs.unshift(rec);
    save(LS_ALLOC, allocs);
    return rec;
  },

  issueAllocation(id: string): AllocationRecord | undefined {
    const allocs = load<AllocationRecord>(LS_ALLOC);
    const idx = allocs.findIndex(a => a.id === id);
    if (idx < 0) return undefined;
    if (!allocs[idx].issuedAt) {
      // Reduce stock
      const items = load<InventoryRecord>(LS_INV);
      const itemIdx = items.findIndex(i => i.productName.toLowerCase() === allocs[idx].productName.toLowerCase() && i.unit === allocs[idx].unit);
      if (itemIdx >= 0) {
        items[itemIdx].quantity = Math.max(0, items[itemIdx].quantity - allocs[idx].quantity);
        items[itemIdx].lastUpdated = new Date().toISOString();
        save(LS_INV, items);
      }
      allocs[idx].issuedAt = new Date().toISOString();
      save(LS_ALLOC, allocs);
    }
    return allocs[idx];
  },

  getAvailable(productName: string, unit: string): number {
    const items = load<InventoryRecord>(LS_INV);
    const item = items.find(i => i.productName.toLowerCase() === productName.toLowerCase() && i.unit === unit);
    if (!item) return 0;
    const reserved = this.listAllocations().filter(a => a.productName.toLowerCase() === productName.toLowerCase() && a.unit === unit && !a.issuedAt)
      .reduce((s, a) => s + a.quantity, 0);
    return Math.max(0, item.quantity - reserved);
  }
};
