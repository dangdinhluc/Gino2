/* TOKUTEI GINO — push notification service worker. */
importScripts('push-url.js');
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'TOKUTEI GINO', body: '', url: undefined };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { title: parsed.title ?? payload.title, body: parsed.body ?? '', url: parsed.url };
    }
  } catch {
    const text = event.data?.text() ?? '';
    payload = { title: 'TOKUTEI GINO', body: text, url: undefined };
  }

  const url = self.TokuteiPushUrl.appRelativeRoute(payload.url);
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body || undefined,
      icon: new URL('assets/games/game-tanuki.webp', self.registration.scope).href,
      badge: new URL('assets/games/game-tanuki.webp', self.registration.scope).href,
      data: { url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      const base = self.registration.scope;
      const destination = self.TokuteiPushUrl.resolvePushDestination(target, base);
      for (const client of windowClients) {
        if ('focus' in client && client.url === destination) return client.focus();
        if ('navigate' in client && client.url.startsWith(base)) {
          return client.navigate(destination).then(() => client.focus());
        }
      }
      return self.clients.openWindow(destination);
    }),
  );
});
