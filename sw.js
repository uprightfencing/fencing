/* Upright Fencing app support.
   Pages, styles and scripts always come from the network when online, so the app
   never shows an out-of-date site. Saved copies are used only when offline.
   Form sends and other websites (Web3Forms, Google, fonts) are never touched. */
var VERSION = 'v1';
var PAGES = 'upright-pages-' + VERSION;
var IMAGES = 'upright-images-' + VERSION;
var MAX_IMAGES = 80;
var OFFLINE_FILES = ['offline.html', 'css/style.css', 'js/main.js', 'images/logo-no-bg.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(PAGES)
      .then(function (cache) { return cache.addAll(OFFLINE_FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(names.map(function (name) {
          if (name !== PAGES && name !== IMAGES) return caches.delete(name);
        }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

function canSave(response) {
  return response && response.ok && response.type === 'basic' && !response.redirected;
}

function trimImages() {
  return caches.open(IMAGES).then(function (cache) {
    return cache.keys().then(function (keys) {
      return Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_IMAGES)).map(function (key) {
        return cache.delete(key);
      }));
    });
  });
}

function networkFirst(event, fallback) {
  var request = event.request;
  return fetch(request).then(function (response) {
    if (canSave(response)) {
      var copy = response.clone();
      event.waitUntil(caches.open(PAGES).then(function (cache) { return cache.put(request, copy); }));
    }
    return response;
  }).catch(function () {
    return caches.match(request, { ignoreSearch: true }).then(function (saved) {
      if (saved) return saved;
      if (fallback) return caches.match(fallback);
      return Response.error();
    });
  });
}

function savedImageFirst(event) {
  var request = event.request;
  return caches.match(request).then(function (saved) {
    var fresh = fetch(request).then(function (response) {
      if (canSave(response)) {
        var copy = response.clone();
        event.waitUntil(caches.open(IMAGES)
          .then(function (cache) { return cache.put(request, copy); })
          .then(trimImages));
      }
      return response;
    });
    if (saved) {
      event.waitUntil(fresh.catch(function () {}));
      return saved;
    }
    return fresh;
  });
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event, 'offline.html'));
  } else if (request.destination === 'image') {
    event.respondWith(savedImageFirst(event));
  } else {
    event.respondWith(networkFirst(event));
  }
});
