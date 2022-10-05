importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js");
workbox.loadModule("workbox-strategies");

workbox.routing.registerRoute(({ request }) => request.destination === "style", new workbox.strategies.NetworkFirst());

workbox.routing.registerRoute(({ request }) => request.destination === "image", new workbox.strategies.CacheFirst());

workbox.routing.registerRoute(({ request }) => request.destination === "favicon", new workbox.strategies.CacheFirst());

workbox.routing.registerRoute(({ request }) => request.destination === "manifest", new workbox.strategies.CacheFirst());

workbox.routing.registerRoute(({ request }) => request.destination === "script", new workbox.strategies.NetworkFirst());
