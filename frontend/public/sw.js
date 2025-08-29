// Service Worker for LinkClub notifications
// This enables push notifications on mobile devices and provides offline functionality

const CACHE_NAME = 'linkclub-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/avatar.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('ServiceWorker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('ServiceWorker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      console.error('Error parsing push data:', error);
      notificationData = {
        title: 'New notification',
        body: event.data.text() || 'You have a new message'
      };
    }
  }

  const options = {
    body: notificationData.body || 'You have a new message',
    icon: notificationData.icon || '/avatar.png',
    badge: notificationData.badge || '/avatar.png',
    tag: notificationData.tag || 'linkclub-notification',
    data: notificationData.data || {},
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    vibrate: [200, 100, 200], // Vibration pattern for mobile
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/avatar.png'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'LinkClub',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (self.clients.openWindow) {
          return self.clients.openWindow('/');
        }
      })
  );
});

// Background sync for offline message sending
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-message-sync') {
    event.waitUntil(
      // Handle offline message queue
      handleOfflineMessages()
    );
  }
});

async function handleOfflineMessages() {
  try {
    // This would integrate with your message queue system
    console.log('Processing offline messages...');
    // Implementation would depend on your offline storage strategy
  } catch (error) {
    console.error('Error processing offline messages:', error);
  }
}

// Message event - communication with main thread
self.addEventListener('message', (event) => {
  console.log('ServiceWorker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle other message types as needed
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    self.registration.showNotification(title, options);
  }
});
