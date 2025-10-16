// Lightweight AES-GCM encryption wrapper around localStorage.
// Falls back to plain localStorage if WebCrypto is unavailable.

const SALT_KEY = 'secure_salt_v1';
const PASSPHRASE_KEY = 'secure_passphrase_v1';

async function getKey(): Promise<CryptoKey | null> {
  if (!(globalThis.crypto && globalThis.crypto.subtle)) return null;
  try {
    let salt = localStorage.getItem(SALT_KEY);
    if (!salt) {
      const arr = globalThis.crypto.getRandomValues(new Uint8Array(16));
      salt = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(SALT_KEY, salt);
    }
    let pass = localStorage.getItem(PASSPHRASE_KEY);
    if (!pass) {
      const arr = globalThis.crypto.getRandomValues(new Uint8Array(32));
      pass = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(PASSPHRASE_KEY, pass);
    }

    const enc = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(pass),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    return key;
  } catch {
    return null;
  }
}

async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  if (!key) return plaintext; // fallback
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext));
  const ivB64 = btoa(String.fromCharCode(...iv));
  const dataB64 = btoa(String.fromCharCode(...new Uint8Array(cipher)));
  return `${ivB64}:${dataB64}`;
}

async function decrypt(payload: string): Promise<string> {
  const key = await getKey();
  if (!key) return payload; // fallback
  const [ivB64, dataB64] = payload.split(':');
  if (!ivB64 || !dataB64) return '';
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plainBuf);
}

export const secureStorage = {
  async setItem(key: string, value: string) {
    try {
      const enc = await encrypt(value);
      localStorage.setItem(key, enc);
    } catch {
      localStorage.setItem(key, value);
    }
  },
  async getItem(key: string): Promise<string | null> {
    const v = localStorage.getItem(key);
    if (v == null) return null;
    try {
      return await decrypt(v);
    } catch {
      return v; // not encrypted or failed
    }
  },
  async removeItem(key: string) {
    localStorage.removeItem(key);
  },
  async setJSON<T>(key: string, obj: T) {
    await this.setItem(key, JSON.stringify(obj));
  },
  async getJSON<T>(key: string): Promise<T | null> {
    const s = await this.getItem(key);
    if (!s) return null;
    try { return JSON.parse(s) as T; } catch { return null; }
  }
};

