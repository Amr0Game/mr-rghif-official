// Service worker للوحة إدارة مستر رغيف: يخزّن واجهة اللوحة فقط، ولا يخزّن أي طلبات أو بيانات.
var V = "mr-admin-v2";
var SHELL = ["./admin-v2.html", "./admin-logo.png", "./admin-icon-192.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return; // لا نلمس طلبات Supabase أبداً
  e.respondWith(fetch(r).then(function (res) {
    var keep = SHELL.some(function (s) { return new URL(s, location.href).href === u.href; });
    if (res.ok && keep) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); }
    return res;
  }).catch(function () { return caches.match(r); }));
});
