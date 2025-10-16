// In local development, immediately unregister the Service Worker to avoid
// stale assets and HMR websocket interference.
const __HOSTNAME__ = self.location.hostname;
const IS_LOCAL_DEV = (
  ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(__HOSTNAME__) ||
  /^192\.168\./.test(__HOSTNAME__) ||
  /^10\./.test(__HOSTNAME__) ||
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(__HOSTNAME__)
);

if (IS_LOCAL_DEV) {
  // Ensure the newest worker takes control, then unregister and clear caches
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {}
      try {
        await self.registration.unregister();
      } catch {}
      try {
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientList.forEach((client) => client.navigate(client.url));
      } catch {}
    })());
  });
  // Stop here for dev; do not register caching handlers
}

const CACHE_NAME = 'agrimarket-v2';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DATA_CACHE = `${CACHE_NAME}-data`;

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            console.log('Service Worker clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle static assets
  if (event.request.method === 'GET') {
    // Try static cache first
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // For API requests, use network-first strategy
          if (url.pathname.startsWith('/api/')) {
            return fetch(event.request)
              .then((response) => {
                // Clone the response
                const responseToCache = response.clone();

                // Cache successful API responses, but exclude chrome-extension requests
                if (response.status === 200 && !event.request.url.startsWith('chrome-extension://')) {
                  caches.open(DATA_CACHE)
                    .then((cache) => {
                      cache.put(event.request, responseToCache);
                    });
                }

                return response;
              })
              .catch(() => {
                // If offline, try to return cached data
                return caches.match(event.request);
              });
          }

          // For other requests, use cache-first strategy
          return fetch(event.request)
            .then((response) => {
              // Cache successful responses, but exclude chrome-extension requests
              if (response.status === 200 && !event.request.url.startsWith('chrome-extension://')) {
                const responseToCache = response.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline page for HTML requests
              if (event.request.headers.get('accept')?.includes('text/html')) {
                return caches.match('/offline');
              }
            });
        })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker handling background sync:', event.tag);

  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Sync cart items
      syncCartItems()
    );
  }

  if (event.tag === 'sync-orders') {
    event.waitUntil(
      // Sync orders
      syncOrders()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker received push event');

  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      data: {
        url: data.action_url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Ignorer',
          icon: '/favicon.ico'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker notification clicked');

  event.notification.close();

  if (event.action === 'view') {
    const url = event.notification.data.url;
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Helper functions
async function syncCartItems() {
  // Get pending cart items from IndexedDB
  // Send to server
  // Clear pending items
  console.log('Syncing cart items...');
}

async function syncOrders() {
  // Get pending orders from IndexedDB
  // Send to server
  // Update order status
  console.log('Syncing orders...');
}

// Clean up old caches periodically
self.addEventListener('message', (event) => {
  if (event.data === 'clean-up') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith(CACHE_NAME)) {
            return caches.open(cacheName).then((cache) => {
              return cache.keys().then((requests) => {
                return Promise.all(
                  requests.map((request) => {
                    // Remove items older than 7 days
                    const url = new URL(request.url);
                    if (url.pathname.includes('/api/')) {
                      const date = new Date(request.headers.get('date') || Date.now());
                      const now = new Date();
                      const diffTime = Math.abs(now.getTime() - date.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                      if (diffDays > 7) {
                        return cache.delete(request);
                      }
                    }
                    return Promise.resolve();
                  })
                );
              });
            });
          }
        })
      );
    });
  }
});
