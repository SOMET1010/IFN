// Service Worker pour Mode Offline - AgriMarket PWA
// Version: 3.0.0

const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `agrimarket-${CACHE_VERSION}`;
const DATA_CACHE = `agrimarket-data-${CACHE_VERSION}`;
const IMAGE_CACHE = `agrimarket-images-${CACHE_VERSION}`;

// Détection environnement local
const __HOSTNAME__ = self.location.hostname;
const IS_LOCAL_DEV = (
  ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(__HOSTNAME__) ||
  /^192\.168\./.test(__HOSTNAME__) ||
  /^10\./.test(__HOSTNAME__) ||
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(__HOSTNAME__)
);

// En développement, désactiver le Service Worker
if (IS_LOCAL_DEV) {
  self.addEventListener('install', () => self.skipWaiting());
  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => client.navigate(client.url));
    })());
  });
} else {
  // Mode Production - Cache complet

  // Assets statiques à mettre en cache
  const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/placeholder.svg'
  ];

  // Routes API à ne PAS mettre en cache (toujours fetch)
  const NO_CACHE_PATTERNS = [
    /\/api\//,
    /supabase\.co/,
    /\.hot-update\./
  ];

  // Installation du Service Worker
  self.addEventListener('install', (event) => {
    console.log('[SW] Installing version', CACHE_VERSION);

    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[SW] Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
        .then(() => self.skipWaiting())
    );
  });

  // Activation et nettoyage des anciens caches
  self.addEventListener('activate', (event) => {
    console.log('[SW] Activating version', CACHE_VERSION);

    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => {
                return name.startsWith('agrimarket-') && name !== CACHE_NAME && name !== DATA_CACHE && name !== IMAGE_CACHE;
              })
              .map((name) => {
                console.log('[SW] Deleting old cache:', name);
                return caches.delete(name);
              })
          );
        })
        .then(() => self.clients.claim())
    );
  });

  // Stratégie de récupération des ressources
  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
      return;
    }

    // Ignorer les patterns à ne pas mettre en cache
    if (NO_CACHE_PATTERNS.some(pattern => pattern.test(url.href))) {
      event.respondWith(fetch(request));
      return;
    }

    // Stratégie selon le type de ressource
    if (request.destination === 'image') {
      event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    } else if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
      event.respondWith(networkFirstStrategy(request, DATA_CACHE));
    } else if (STATIC_ASSETS.includes(url.pathname) || request.destination === 'script' || request.destination === 'style') {
      event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    } else {
      event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
    }
  });

  // Stratégie Cache First (pour assets statiques et images)
  async function cacheFirstStrategy(request, cacheName) {
    try {
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);

      if (cached) {
        return cached;
      }

      const response = await fetch(request);

      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      console.error('[SW] Cache first error:', error);
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);
      return cached || new Response('Offline', { status: 503 });
    }
  }

  // Stratégie Network First (pour API/données)
  async function networkFirstStrategy(request, cacheName) {
    try {
      const response = await fetch(request);

      if (response.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      console.log('[SW] Network first fallback to cache');
      const cache = await caches.open(cacheName);
      const cached = await cache.match(request);

      if (cached) {
        return cached;
      }

      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'Vous êtes hors ligne. Certaines données peuvent être obsolètes.'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Stratégie Stale While Revalidate (pour pages HTML)
  async function staleWhileRevalidateStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => cached);

    return cached || fetchPromise;
  }

  // Gestion des messages du client
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
      const { urls } = event.data;
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(urls))
      );
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
      event.waitUntil(
        caches.keys()
          .then((names) => Promise.all(names.map((name) => caches.delete(name))))
      );
    }
  });

  // Synchronisation en arrière-plan (Background Sync)
  self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
      event.waitUntil(syncData());
    }
  });

  async function syncData() {
    try {
      // Récupérer les données en attente de synchronisation depuis IndexedDB
      // (À implémenter avec la logique métier spécifique)
      console.log('[SW] Synchronizing data...');

      // Simuler une synchronisation réussie
      return Promise.resolve();
    } catch (error) {
      console.error('[SW] Sync failed:', error);
      throw error;
    }
  }

  // Notifications Push (si activées)
  self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'AgriMarket';
    const options = {
      body: data.body || 'Vous avez une nouvelle notification',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      data: data.url || '/',
      tag: data.tag || 'default',
      requireInteraction: false
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  });

  // Clic sur notification
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          const url = event.notification.data || '/';

          // Si une fenêtre est déjà ouverte, la focus
          for (const client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }

          // Sinon, ouvrir une nouvelle fenêtre
          if (self.clients.openWindow) {
            return self.clients.openWindow(url);
          }
        })
    );
  });

  console.log('[SW] Service Worker version', CACHE_VERSION, 'loaded');
}
