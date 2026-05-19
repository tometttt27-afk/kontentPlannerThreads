// Service Worker for Konten Planner PWA
const CACHE_NAME = 'konten-planner-v1';
const urlsToCache = [
  '.',
  'Index.html',
  'Script.html',
  'Styles.html',
  'Code.gs',
  'manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache addAll error (offline install is OK):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseClone = response.clone();
        
        // Cache it
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If offline, return from cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          
          // Return offline page if needed
          if (event.request.destination === 'document') {
            return caches.match('Index.html');
          }
        });
      })
  );
});

// Background sync for data
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Data tersinkronisasi'
      });
    });
  } catch (err) {
    console.log('Sync error:', err);
  }
}
