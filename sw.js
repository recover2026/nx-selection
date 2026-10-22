// 遴选应标支持库 · Service Worker
// 策略：网络优先（保证更新即时生效），失败时回退缓存；完全离线时回退到首页。
const CACHE = 'nx-sel-v1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;           // 只接管同源请求
  if (e.request.method !== 'GET') return;
  e.respondWith((function () {
    return fetch(e.request).then(function (res) {
      if (res && res.ok) {
        caches.open(CACHE).then(function (c) { c.put(e.request, res.clone()); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (hit) {
        return hit || caches.match('/index.html') || caches.match('/');
      });
    });
  })());
});
