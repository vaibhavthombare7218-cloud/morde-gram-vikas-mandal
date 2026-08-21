/* =========================================================
   MGVM SERVICE WORKER
   मोर्डे ग्राम विकास मंडळ, मुंबई

   PWA OFFLINE CACHE
   AUTOMATIC UPDATE SYSTEM
========================================================= */


/* =========================================================
   APP VERSION
========================================================= */

const APP_VERSION = "v3";

const CACHE_NAME = "mgvm-app-" + APP_VERSION;


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

    console.log(
        "MGVM Service Worker:",
        APP_VERSION,
        "Installing..."
    );


    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            console.log(
                "MGVM: Caching new version..."
            );

            return cache.addAll(
                FILES_TO_CACHE
            );

        })

        .then(() => {

            console.log(
                "MGVM:",
                APP_VERSION,
                "Cached Successfully."
            );

            /*
             * नवीन Service Worker लगेच तयार ठेवतो
             */

            return self.skipWaiting();

        })

        .catch(error => {

            console.error(
                "MGVM Cache Error:",
                error
            );

        })

    );

});



/* =========================================================
   UPDATE MESSAGE
========================================================= */

self.addEventListener("message", event => {

    if (
        event.data &&
        event.data.type === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});
/* =========================================================
   ACTIVATE
========================================================= */
self.addEventListener("activate", event => {

    console.log(
        "MGVM Service Worker:",
        APP_VERSION,
        "Activated."
    );


    event.waitUntil(

        caches.keys()

        .then(cacheNames => {

            return Promise.all(

                cacheNames

                    .filter(cacheName => {

                        /*
                         * फक्त MGVM चे जुने cache delete करायचे
                         */

                        return (
                            cacheName.startsWith("mgvm-app-") &&
                            cacheName !== CACHE_NAME
                        );

                    })

                    .map(cacheName => {

                        console.log(
                            "MGVM: Removing old cache:",
                            cacheName
                        );

                        return caches.delete(
                            cacheName
                        );

                    })

            );

        })

        .then(() => {

            /*
             * सर्व open pages ला नवीन
             * Service Worker control देतो
             */

            return self.clients.claim();

        })

    );

});


/* =========================================================
   FETCH
========================================================= */

self.addEventListener("fetch", event => {

    /*
     * फक्त GET requests handle करायच्या
     */

    if (event.request.method !== "GET") {

        return;

    }


    event.respondWith(

        caches.match(event.request)

        .then(cachedResponse => {

            /* ---------------------------------------------
               CACHE AVAILABLE
            --------------------------------------------- */

            if (cachedResponse) {

                return cachedResponse;

            }


            /* ---------------------------------------------
               INTERNET REQUEST
            --------------------------------------------- */

            return fetch(event.request)

                .then(networkResponse => {

                    /*
                     * Valid response असल्यास
                     * runtime cache मध्ये ठेवतो
                     */

                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        networkResponse.type === "basic"
                    ) {

                        const responseClone =
                            networkResponse.clone();


                        caches.open(CACHE_NAME)
                            .then(cache => {

                                cache.put(
                                    event.request,
                                    responseClone
                                );

                            });

                    }


                    return networkResponse;

                })

                .catch(() => {

                    /* -------------------------------------
                       OFFLINE FALLBACK
                    ------------------------------------- */

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
