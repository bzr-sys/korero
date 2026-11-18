// Korero needs Bazaar to show anything, so nothing is cached for offline use.
// Opening it without a connection shows a page that says so.
const CACHE = 'korero-offline-1'
const OFFLINE_PAGE = '/offline.html'

function cacheOfflinePage() {
  return caches
    .open(CACHE)
    .then((cache) => cache.add(new Request(OFFLINE_PAGE, { cache: 'no-cache' })))
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheOfflinePage().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Online: keep the offline page as current as the app
        event.waitUntil(cacheOfflinePage().catch(() => {}))
        return response
      })
      .catch(() => caches.match(OFFLINE_PAGE))
  )
})
