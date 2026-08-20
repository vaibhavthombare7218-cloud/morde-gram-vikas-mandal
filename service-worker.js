/* =========================================================
   MGVM SERVICE WORKER
   मोर्डे ग्राम विकास मंडळ, मुंबई

   PWA OFFLINE CACHE
========================================================= */

const CACHE_NAME = "mgvm-app-v2";


/* =========================================================
   ALL PROJECT FILES
========================================================= */

const FILES_TO_CACHE = [

    /* ---------- MAIN ---------- */

    "./",
    "./index.html",
    "./dashboard.html",

    /* ---------- CSS ---------- */

    "./style.css",
    "./settings.css",
    "./member-details.css",
    "./wadi-count.css",

    /* ---------- COMMON JS ---------- */

    "./script.js",
    "./app.js",
    "./database.js",
    "./header.js",

    /* ---------- MEMBERS ---------- */

    "./members.html",
    "./members.js",

    "./memberlist.html",

    "./member-details.html",
    "./member-details.js",

    "./member_import.html",

    /* ---------- PENDING ---------- */

    "./pending.html",
    "./pending_import.html",

    /* ---------- SUBSCRIPTION ---------- */

    "./subscription.html",
    "./subscription.js",

    /* ---------- INCOME ---------- */

    "./income.html",
    "./income.js",

    /* ---------- EXPENSE ---------- */

    "./expense.html",
    "./expense.js",

    /* ---------- DONATION ---------- */

    "./donation.html",
    "./donation.js",

    /* ---------- REPORTS ---------- */

    "./reports.html",
    "./reports.js",

    /* ---------- RECEIPT ---------- */

    "./receipt.html",

    /* ---------- WADI ---------- */

    "./wadi-count.html",
    "./wadi_report.html",
    "./wadi_report.js",

    /* ---------- SETTINGS ---------- */

    "./settings.html",
    "./settings.js",

    /* ---------- BACKUP / CLEAR ---------- */

    "./backup.html",
    "./clear.html",

    /* ---------- MEETING ---------- */

    "./meeting.html",
    "./meetings.html",
    "./meeting-details.html",

    /* ---------- PWA ---------- */

    "./manifest.json",

    /* ---------- LOGO ---------- */

    "./logo.png"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener("install", event => {

    console.log("MGVM Service Worker: Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            console.log(
                "MGVM Service Worker: Caching files..."
            );

            return cache.addAll(FILES_TO_CACHE);

        })

        .then(() => {

            console.log(
                "MGVM Service Worker: All files cached."
            );

            return self.skipWaiting();

        })

        .catch(error => {

            console.error(
                "MGVM Service Worker Cache Error:",
                error
            );

        })

    );

});


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener("activate", event => {

    console.log("MGVM Service Worker: Activated.");

    event.waitUntil(

        caches.keys()

        .then(cacheNames => {

            return Promise.all(

                cacheNames

                    .filter(cacheName => {

                        return cacheName !== CACHE_NAME;

                    })

                    .map(cacheName => {

                        console.log(
                            "Deleting old cache:",
                            cacheName
                        );

                        return caches.delete(cacheName);

                    })

            );

        })

        .then(() => {

            return self.clients.claim();

        })

    );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(cachedResponse => {

            /* -------------------------------
               CACHE AVAILABLE
            ------------------------------- */

            if (cachedResponse) {

                return cachedResponse;

            }


            /* -------------------------------
               INTERNET REQUEST
            ------------------------------- */

            return fetch(event.request)

                .then(networkResponse => {

                    return networkResponse;

                })

                .catch(() => {

                    /* ---------------------------
                       OFFLINE FALLBACK
                    --------------------------- */

                    if (
                        event.request.mode === "navigate"
                    ) {

                        return caches.match(
                            "./index.html"
                        );

                    }

                });

        })

    );

});
