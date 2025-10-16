import { secureStorage } from '@/lib/secureStorage';

const NOTIFIED_KEY = 'merchant_lowstock_notified_v1';

async function getNotifiedSet(): Promise<Set<string>> {
  const arr = await secureStorage.getJSON<string[]>(NOTIFIED_KEY);
  return new Set(arr || []);
}

async function saveNotifiedSet(set: Set<string>) {
  await secureStorage.setJSON(NOTIFIED_KEY, Array.from(set));
}

export async function notifyLowStock(items: Array<{ id: string; product: string; level: 'low' | 'critical' }>) {
  const notified = await getNotifiedSet();
  const newOnes = items.filter(i => !notified.has(i.id));
  if (newOnes.length === 0) return;

  // Update app notifications list in localStorage directly (context will pick it up on next mount)
  const raw = localStorage.getItem('userNotifications');
  const list = raw ? JSON.parse(raw) : [];
  const now = new Date().toISOString();

  newOnes.forEach(i => {
    list.unshift({
      id: 'stock-' + i.id + '-' + Date.now(),
      user_id: 'default-user',
      title: i.level === 'critical' ? 'Stock critique' : 'Stock faible',
      message: `${i.product} — niveau ${i.level}`,
      type: 'system',
      priority: i.level === 'critical' ? 'urgent' : 'high',
      is_read: false,
      created_at: now,
      metadata: { productId: i.id, severity: i.level },
    });
    notified.add(i.id);
  });

  localStorage.setItem('userNotifications', JSON.stringify(list.slice(0, 100))); // keep last 100
  await saveNotifiedSet(notified);
}

export async function mockSendSMS(phone: string, text: string) {
  console.log(`[SMS] -> ${phone}: ${text}`);
}

export async function mockSendEmail(email: string, subject: string, html: string) {
  console.log(`[EMAIL] -> ${email}: ${subject}`);
}

