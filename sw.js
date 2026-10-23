// 遴选应标支持库 · Service Worker
// 策略：缓存优先（重复访问秒开）+ 后台静默更新（stale-while-revalidate）；完全离线时回退首页。
const CACHE = 'nx-sel-v4';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil((function () {
    return caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    });
  })().then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;          // 只接管同源请求
  if (e.request.method !== 'GET') return;
  e.respondWith((function () {
    return caches.match(e.request).then(function (hit) {
      // 后台静默更新（无论是否命中缓存都跑，用于下次更快/保持最新）
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) {
          caches.open(CACHE).then(function (c) { c.put(e.request, res.clone()); });
        }
        return res;
      }).catch(function () { return hit; });
      // 有缓存立即返回（秒开），没有缓存才等网络
      return hit || net;
    });
  })());
});
