// Minimal service worker to enable installability.
// It does not cache app assets by default.
self.addEventListener('install', (event) => {
  // Activate immediately after install
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // Take control of uncontrolled clients as soon as possible
  event.waitUntil(self.clients.claim())
})

// Optional: pass-through fetch (no caching). Keep for future enhancements.
self.addEventListener('fetch', () => {})

