// const CACHE_NAME     = "BharatCart-v1";
// const STATIC_CACHE   = "BharatCart-static-v1";
// const DYNAMIC_CACHE  = "BharatCart-dynamic-v1";

// // Files to cache immediately on install
// const STATIC_ASSETS = [
//   "/",
//   "/index.html",
//   "/manifest.json",
// ];

// // ── Install ──────────────────────────────────────────────────
// self.addEventListener("install", event => {
//   console.log("SW: Installing...");
//   event.waitUntil(
//     caches.open(STATIC_CACHE).then(cache => {
//       return cache.addAll(STATIC_ASSETS);
//     }).then(() => {
//       console.log("SW: Static assets cached");
//       return self.skipWaiting();
//     })
//   );
// });

// // ── Activate ─────────────────────────────────────────────────
// self.addEventListener("activate", event => {
//   console.log("SW: Activating...");
//   event.waitUntil(
//     caches.keys().then(keys => {
//       return Promise.all(
//         keys
//           .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
//           .map(key => {
//             console.log("SW: Deleting old cache:", key);
//             return caches.delete(key);
//           })
//       );
//     }).then(() => self.clients.claim())
//   );
// });

// // ── Fetch Strategy ───────────────────────────────────────────
// self.addEventListener("fetch", event => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip non-GET requests
//   if (request.method !== "GET") return;

//   // Skip API calls — always go to network for fresh data
//   if (url.pathname.startsWith("/api/")) {
//     event.respondWith(
//       fetch(request).catch(() => {
//         return new Response(
//           JSON.stringify({ message: "You are offline. Please check your connection." }),
//           { status: 503, headers: { "Content-Type": "application/json" } }
//         );
//       })
//     );
//     return;
//   }

//   // Skip chrome-extension and non-http requests
//   if (!url.protocol.startsWith("http")) return;

//   // For navigation requests — serve index.html (SPA)
//   if (request.mode === "navigate") {
//     event.respondWith(
//       fetch(request).catch(() => caches.match("/index.html"))
//     );
//     return;
//   }

//   // For static assets — Cache First strategy
//   if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
//     event.respondWith(
//       caches.match(request).then(cached => {
//         if (cached) return cached;
//         return fetch(request).then(response => {
//           if (response.ok) {
//             const clone = response.clone();
//             caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
//           }
//           return response;
//         });
//       })
//     );
//     return;
//   }

//   // For everything else — Network First with cache fallback
//   event.respondWith(
//     fetch(request)
//       .then(response => {
//         if (response.ok) {
//           const clone = response.clone();
//           caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
//         }
//         return response;
//       })
//       .catch(() => caches.match(request))
//   );
// });

// // ── Push Notifications ───────────────────────────────────────
// self.addEventListener("push", event => {
//   const data = event.data?.json() || {};
//   const options = {
//     body:    data.body    || "You have a new notification from BharatCart",
//     icon:    "/icons/icon-192.png",
//     badge:   "/icons/icon-72.png",
//     vibrate: [100, 50, 100],
//     data:    { url: data.url || "/" },
//     actions: [
//       { action: "view",    title: "View",    icon: "/icons/icon-96.png" },
//       { action: "dismiss", title: "Dismiss" },
//     ],
//   };
//   event.waitUntil(
//     self.registration.showNotification(
//       data.title || "BharatCart", options
//     )
//   );
// });

// // ── Notification click ───────────────────────────────────────
// self.addEventListener("notificationclick", event => {
//   event.notification.close();
//   if (event.action === "dismiss") return;
//   const url = event.notification.data?.url || "/";
//   event.waitUntil(
//     clients.matchAll({ type: "window" }).then(windowClients => {
//       for (const client of windowClients) {
//         if (client.url === url && "focus" in client) {
//           return client.focus();
//         }
//       }
//       return clients.openWindow(url);
//     })
//   );
// });

// // ── Background sync ──────────────────────────────────────────
// self.addEventListener("sync", event => {
//   if (event.tag === "sync-cart") {
//     console.log("SW: Background sync — cart");
//   }
// });

// console.log("SW: Service Worker loaded ✅");

const CACHE_NAME     = "BharatCart-v1";
const STATIC_CACHE   = "BharatCart-static-v1";
const DYNAMIC_CACHE  = "BharatCart-dynamic-v1";

// Files to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener("install", event => {
  console.log("SW: Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log("SW: Static assets cached");
      return self.skipWaiting();
    })
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener("activate", event => {
  console.log("SW: Activating...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log("SW: Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch Strategy ───────────────────────────────────────────
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API calls — always go to network for fresh data
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ message: "You are offline. Please check your connection." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      })
    );
    return;
  }

  // Skip chrome-extension and non-http requests
  if (!url.protocol.startsWith("http")) return;

  // For navigation requests — serve index.html (SPA)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // For static assets — Cache First strategy
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else — Network First with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push Notifications ───────────────────────────────────────
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  const options = {
    body:    data.body    || "You have a new notification from BharatCart",
    icon:    "/icons/icon-192.png",
    badge:   "/icons/icon-72.png",
    vibrate: [100, 50, 100],
    data:    { url: data.url || "/" },
    actions: [
      { action: "view",    title: "View",    icon: "/icons/icon-96.png" },
      { action: "dismiss", title: "Dismiss"                              },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || "BharatCart", options
    )
  );
});

// ── Notification click ───────────────────────────────────────
self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ── Background sync ──────────────────────────────────────────
self.addEventListener("sync", event => {
  if (event.tag === "sync-cart") {
    console.log("SW: Background sync — cart");
  }
});

console.log("SW: Service Worker loaded ✅");