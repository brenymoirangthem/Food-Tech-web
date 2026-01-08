const CACHE_NAME = 'foodtech-v1.0.0';
const OFFLINE_URL = '/offline.html';

// Critical files to cache for offline functionality
const CRITICAL_CACHE = [
  '/login.html',
  '/consumer.html',
  '/emergency.html',
  '/offline.html',
  '/session.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching critical resources for offline use');
        return cache.addAll(CRITICAL_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - offline-first strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline data for critical endpoints
              return generateOfflineResponse(event.request);
            });
        })
    );
    return;
  }

  // Handle page requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Generate offline responses for critical API endpoints
function generateOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Food centers offline data
  if (url.pathname.includes('/api/food-centers')) {
    const offlineData = {
      centers: [
        {
          id: 1,
          name: 'Manipur State Emergency Center',
          lat: 24.8170,
          lng: 93.9368,
          address: 'Secretariat Complex, Imphal',
          state: 'Manipur',
          status: 'active',
          contact: 'Emergency Control Room: 100',
          supplies: ['Emergency Rations', 'Water', 'Medical Supplies'],
          capacity: 2000,
          current_supply: 1650
        },
        {
          id: 2,
          name: 'District Emergency Hub - Imphal East',
          lat: 24.8067,
          lng: 93.9449,
          address: 'DC Office Complex, Porompat',
          state: 'Manipur',
          status: 'active',
          contact: '+91 385 244 2233',
          supplies: ['Food Packets', 'Water', 'First Aid'],
          capacity: 1000,
          current_supply: 780
        }
      ]
    };
    
    return new Response(JSON.stringify(offlineData), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Emergency contacts offline data
  if (url.pathname.includes('/api/emergency')) {
    const emergencyData = {
      contacts: [
        { name: 'Manipur Emergency Control', number: '100' },
        { name: 'Police Emergency', number: '112' },
        { name: 'Medical Emergency', number: '108' },
        { name: 'Fire Emergency', number: '101' }
      ],
      instructions: [
        'Stay calm and assess the situation',
        'Contact emergency services immediately',
        'Move to nearest safe food distribution center',
        'Follow local authority instructions'
      ]
    };
    
    return new Response(JSON.stringify(emergencyData), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Offline - No cached data available', { status: 503 });
}

// Background sync for when connection is restored
self.addEventListener('sync', event => {
  if (event.tag === 'emergency-report-sync') {
    event.waitUntil(syncEmergencyReports());
  }
});

// Sync emergency reports when online
async function syncEmergencyReports() {
  try {
    const reports = JSON.parse(localStorage.getItem('pending_emergency_reports') || '[]');
    
    for (const report of reports) {
      try {
        const response = await fetch('/api/emergency-reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
        
        if (response.ok) {
          // Remove synced report from pending list
          const updatedReports = reports.filter(r => r.id !== report.id);
          localStorage.setItem('pending_emergency_reports', JSON.stringify(updatedReports));
        }
      } catch (error) {
        console.log('Failed to sync report:', report.id);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Alert from FoodTech Platform',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'foodtech-alert',
      requireInteraction: data.urgent || false,
      data: data,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FoodTech Alert', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const data = event.notification.data;
    let url = '/';
    
    if (data.type === 'emergency') url = '/emergency.html';
    else if (data.type === 'supply') url = '/supplier.html';
    else if (data.type === 'delivery') url = '/consumer.html';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});