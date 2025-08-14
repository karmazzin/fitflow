const CACHE_NAME = 'fitflow-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
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
});

// Background sync for offline workout data
self.addEventListener('sync', event => {
  if (event.tag === 'workout-sync') {
    event.waitUntil(syncWorkoutData());
  }
});

async function syncWorkoutData() {
  // Sync workout progress when connection is restored
  const pendingData = localStorage.getItem('fitflow-pending-sync');
  if (pendingData) {
    try {
      // Send data to server
      const response = await fetch('/api/sync-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: pendingData
      });
      
      if (response.ok) {
        localStorage.removeItem('fitflow-pending-sync');
      }
    } catch (error) {
      console.log('Sync failed, will retry later');
    }
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your workout!',
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-192.png',
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'start-workout',
        title: 'Start Workout'
      },
      {
        action: 'remind-later', 
        title: 'Remind Me Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('FitFlow', options)
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'start-workout') {
    event.waitUntil(
      clients.openWindow('/?start=workout')
    );
  } else if (event.action === 'remind-later') {
    // Schedule another notification
    setTimeout(() => {
      self.registration.showNotification('FitFlow Reminder', {
        body: 'Your workout is still waiting!',
        icon: '/manifest-icon-192.png'
      });
    }, 30 * 60 * 1000); // 30 minutes later
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
