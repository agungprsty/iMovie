const CACHE_NAME = 'film-rec-cache-v1';
const urlsToCache = [
  'index.html',
  'detail.html',
  'app.js',
  'assets/css/styles.css',
  'assets/js/index.js',
  'assets/js/detail.js',
  'assets/img/android-chrome-192x192.png',
  'assets/img/android-chrome-512x512.png',
  'all_movies.json'  // Ensure this file is available in your project
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
                }
                return cache.put(url, response);
              })
              .catch(error => {
                console.error(`Failed to cache ${url}:`, error);
              });
          })
        );
      })
      .catch(error => {
        console.error('Cache open failed:', error);
      })
  );
});

// Intercept fetch requests and serve cached resources if available
self.addEventListener('fetch', event => {
  const apiUrl = 'https://api.themoviedb.org';

  if (event.request.url.startsWith(apiUrl)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          let responseClone = response.clone();

          // Open cache
          caches.open(CACHE_NAME).then(cache => {
            // Cache the fetched data
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // If fetch fails, serve from cache
          return caches.match('all_movies.json');
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

// Activate service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (!cacheWhitelist.includes(key)) {
          return caches.delete(key);
        }
      }))
    )
  );
});
