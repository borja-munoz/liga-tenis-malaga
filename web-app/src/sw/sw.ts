/// <reference lib="webworker" />
/*
 * Service worker (built by vite-plugin-pwa in injectManifest mode).
 *
 * - Precaches the app shell, fonts, icons and the DuckDB database. The
 *   database is versioned by content hash, so publishing new data produces a
 *   new service worker, which the app offers to the user as an update.
 * - Serves the database to DuckDB-Wasm, which reads it with HEAD and HTTP
 *   Range requests, straight from the precache (also offline).
 * - Caches the DuckDB .wasm build the browser actually uses (~35-40 MB each,
 *   so neither is precached) the first time it is fetched.
 * - New versions wait until the user accepts the update (SKIP_WAITING).
 */
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { cleanupOutdatedCaches, createHandlerBoundToURL, matchPrecache, precacheAndRoute } from "workbox-precaching";
import { createPartialResponse } from "workbox-range-requests";
import { NavigationRoute, registerRoute } from "workbox-routing";
import type { RouteHandlerCallbackOptions } from "workbox-core/types";
import { CacheFirst } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope;

// The app asks for this when the user accepts the update prompt
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});
// First install: take control right away so this first visit is cached too
clientsClaim();

cleanupOutdatedCaches();

// ---- Database: answer HEAD and Range requests from the precached file ----
// (registered before precacheAndRoute so it takes precedence)
const isDatabase = ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
  sameOrigin && url.pathname.endsWith(".duckdb");

async function serveDatabase({ request, url }: RouteHandlerCallbackOptions): Promise<Response> {
  const cached = await matchPrecache(url.pathname);
  if (!cached) return fetch(request);

  if (request.method === "HEAD") {
    const length = cached.headers.get("content-length") ?? String((await cached.clone().blob()).size);
    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": cached.headers.get("content-type") ?? "application/octet-stream",
        "Content-Length": length,
        "Accept-Ranges": "bytes",
      },
    });
  }
  if (request.headers.has("range")) return createPartialResponse(request, cached);
  return cached;
}
registerRoute(isDatabase, serveDatabase, "GET");
registerRoute(isDatabase, serveDatabase, "HEAD");

// DuckDB probes for a write-ahead log next to the database. We never publish
// one, so answer locally (also keeps the probe from failing when offline).
const isWal = ({ url, sameOrigin }: { url: URL; sameOrigin: boolean }) =>
  sameOrigin && url.pathname.endsWith(".duckdb.wal");
const notFound = async () => new Response(null, { status: 404 });
registerRoute(isWal, notFound, "HEAD");
registerRoute(isWal, notFound, "GET");

// ---- App shell ----
precacheAndRoute(self.__WB_MANIFEST);
// Hash-based routes only ever load index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// ---- DuckDB engine: cache the .wasm build in use (file names are content-hashed) ----
registerRoute(
  ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith(".wasm"),
  new CacheFirst({
    cacheName: "duckdb-wasm",
    plugins: [new ExpirationPlugin({ maxEntries: 2, purgeOnQuotaError: true })],
  })
);
