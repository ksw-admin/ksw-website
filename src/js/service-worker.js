importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.1.1/workbox-sw.js");

workbox.loadModule("workbox-strategies");

workbox.routing.registerRoute(({ request }) => request.destination === "image", new workbox.strategies.NetworkFirst());
