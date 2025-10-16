import { secureStorage } from '@/lib/secureStorage';

const BACKUP_KEY_PREFIX = 'merchant_backup_v1_';

export interface BackupSnapshot {
  id: string;
  createdAt: string;
  data: Record<string, unknown>;
}

export async function createSnapshot(): Promise<BackupSnapshot> {
  const keys = [
    'merchant_inventory',
    'merchant_cooperative_needs',
    'merchant_cooperative_participations',
    'userNotifications',
    'merchant_transactions_encrypted',
    'merchant_receipts_encrypted',
  ];

  const data: Record<string, unknown> = {};
  for (const k of keys) {
    // try secure first
    const isSecure = k.endsWith('_encrypted');
    if (isSecure) {
      const v = await secureStorage.getItem(k);
      data[k] = v ?? null;
    } else {
      const v = localStorage.getItem(k);
      try { data[k] = v ? JSON.parse(v) : null; } catch { data[k] = v; }
    }
  }
  const snapshot: BackupSnapshot = {
    id: `bkp_${Date.now()}`,
    createdAt: new Date().toISOString(),
    data,
  };
  await secureStorage.setJSON(BACKUP_KEY_PREFIX + snapshot.id, snapshot);
  localStorage.setItem('merchant_backup_last', snapshot.id);
  return snapshot;
}

export async function listSnapshots(): Promise<Array<{ id: string; createdAt: string }>> {
  const ids: Array<{ id: string; createdAt: string }> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    if (key.startsWith(BACKUP_KEY_PREFIX)) {
      const s = await secureStorage.getJSON<BackupSnapshot>(key);
      if (s) ids.push({ id: s.id, createdAt: s.createdAt });
    }
  }
  return ids.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getSnapshot(id: string): Promise<BackupSnapshot | null> {
  return secureStorage.getJSON<BackupSnapshot>(BACKUP_KEY_PREFIX + id);
}

let scheduled = false;
export function scheduleLocalBackups(intervalMinutes = 30) {
  if (scheduled) return;
  scheduled = true;
  // First run delayed to avoid blocking initial render
  setTimeout(() => createSnapshot().catch(() => {}), 5000);
  setInterval(() => createSnapshot().catch(() => {}), intervalMinutes * 60 * 1000);
}

export function downloadSnapshot(snapshot: BackupSnapshot) {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${snapshot.id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

