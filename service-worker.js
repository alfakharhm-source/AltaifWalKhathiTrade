// service-worker.js
const CACHE_NAME = 'my-pwa-cache-v2';
const urlsToCache = [
  '.',
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('Opened cache');
        try {
          await cache.addAll(urlsToCache);
          console.log('All files cached successfully');
        } catch (error) {
          console.error('Failed to cache files:', error);
        }
        return cache;
      })
  );
  // تفعيل Service Worker فوراً
  self.skipWaiting();
});

// استراتيجية: من الكاش أولاً، ثم الشبكة
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(error => {
          console.error('Fetch failed:', error);
          // إرجاع صفحة index.html عند عدم وجود اتصال
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('الموقع غير متصل', {
            status: 404,
            statusText: 'Offline'
          });
        });
      })
  );
});

// تنظيف الكاش القديم
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
    })
  );
  event.waitUntil(clients.claim());
});
