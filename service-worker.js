/* =====================================================
   MGVM PWA SERVICE WORKER
   मोर्डे ग्राम विकास मंडळ, मुंबई
===================================================== */

const CACHE_NAME = "mgvm-app-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",

    "./style.css",

    "./script.js",

    "./manifest.json",
    "./logo.png",

    "./members.html",
    "./members.js",

    "./subscription.html",
    "./subscription.js",

    "./income.html",
    "./income.js",

    "./expense.html",
    "./expense.js",

    "./donation.html",
    "./donation.js",

    "./reports.html",
    "./reports.js",

    "./settings.html",
    "./settings.css",
    "./settings.js"
];
/* =====================================================
   INSTALL
===================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

    self.skipWaiting();

});


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys
                .filter(key => key !== CACHE_NAME)
                .map(key => caches.delete(key))

            );

        })

    );

    self.clients.claim();

});


/* =====================================================
   FETCH
===================================================== */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
        .then(response => {

            if (response) {

                return response;

            }

            return fetch(event.request);

        })

    );

});
