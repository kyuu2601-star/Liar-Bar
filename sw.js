const CACHE_NAME = 'liars-bar-v1.1';
// Chỉ cache những file nội bộ quan trọng nhất để đảm bảo Install thành công
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Trả về cache nếu có, nếu không thì fetch từ mạng
      return response || fetch(event.request).then(fetchRes => {
        // Cache thêm các file CSS/Fonts từ CDN khi người dùng lướt web
        if (event.request.url.includes('tailwindcss.com') || event.request.url.includes('fonts.googleapis.com')) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request.url, fetchRes.clone());
            return fetchRes;
          });
        }
        return fetchRes;
      });
    }).catch(() => {
      // Fallback nếu không có mạng và không có cache
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
