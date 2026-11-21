/// <reference lib="webworker" />
/*
 * Service worker (built by vite-plugin-pwa in injectManifest mode).
 *
 * - Precaches the app shell, fonts, icons and the DuckDB database. The
 *   database is versioned by content hash, so publishing new data produces a
 *   new service worker, which the app offers to the user as an update.
 * - The DuckDB engine (.wasm, ~35-40 MB per build) is not precached: the page
 *   stores the build it uses in the "duckdb-wasm" cache (see db/duckdb.ts).
 * - New versions wait until the user accepts the update (SKIP_WAITING).
 */
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

// The app asks for this when the user accepts the update prompt
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});
// First install: take control right away so this first visit is cached too
clientsClaim();

cleanupOutdatedCaches();

// App shell, fonts, icons and the database (fetched whole by db/duckdb.ts)
precacheAndRoute(self.__WB_MANIFEST);
// Hash-based routes only ever load index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
