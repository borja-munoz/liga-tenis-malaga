import * as duckdb from '@duckdb/duckdb-wasm';
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import duckdb_wasm_eh from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';

import type { AsyncDuckDB } from '@duckdb/duckdb-wasm';
import { DuckDBAccessMode, type AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

const DB_FILE = "liga_tenis_malaga.duckdb";
const DB_URL = `${import.meta.env.BASE_URL}db/${DB_FILE}`;

/**
 * Cache for the DuckDB engine (.wasm, ~35-40 MB raw, ~7 MB over the network).
 * Too big to precache both builds, so the page keeps the one in use here.
 * The file names are content-hashed, so a cached entry never goes stale.
 */
const ENGINE_CACHE = "duckdb-wasm";

let db : AsyncDuckDB | null = null;
let connection: AsyncDuckDBConnection | undefined;

let initPromise: Promise<AsyncDuckDB> | null = null;

// Memoized so concurrent callers share one instance
const initDB = () => {
  initPromise ??= createDB();
  return initPromise;
};

const createDB = async () => {
  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  const moduleUrl = await engineModuleUrl(bundle.mainModule);
  try {
    await db.instantiate(moduleUrl, bundle.pthreadWorker);
  } finally {
    if (moduleUrl.startsWith("blob:")) URL.revokeObjectURL(moduleUrl);
  }

  return db;
};

/**
 * Downloads the engine once and keeps it for offline use: returns a blob URL
 * of the cached copy (fetched and stored on the first visit), so DuckDB never
 * downloads it a second time. Falls back to the plain URL without Cache API.
 */
async function engineModuleUrl(url: string): Promise<string> {
  if (!("caches" in window)) return url;
  try {
    const key = new URL(url, window.location.href).href;
    const cache = await caches.open(ENGINE_CACHE);
    let response = await cache.match(key);
    if (!response) {
      const fresh = await fetch(key);
      if (!fresh.ok) return url;
      await cache.put(key, fresh.clone());
      response = fresh;
      // Drop builds of older DuckDB versions
      for (const request of await cache.keys()) {
        if (request.url !== key) await cache.delete(request);
      }
    }
    const bytes = await response.blob();
    return URL.createObjectURL(new Blob([bytes], { type: "application/wasm" }));
  } catch {
    return url;
  }
}

/**
 * The whole database in one request: compressed in transit (~250 KB instead
 * of ~3 MB of uncompressed range reads) and served by the service worker's
 * precache when offline.
 */
async function fetchDatabase(): Promise<Uint8Array> {
  const response = await fetch(DB_URL);
  if (!response.ok) throw new Error(`Database download failed: ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

const loadDB = async () => {
  // Download the database while the engine starts
  const [db, buffer] = await Promise.all([initDB(), fetchDatabase()]);
  await db.registerFileBuffer(DB_FILE, buffer);
  await db.open({
    accessMode: DuckDBAccessMode.READ_ONLY,
    path: DB_FILE
  });
};

const getConnection = async () => {
  if (connection) {
    return connection;
  }
  connection = await db!.connect();
  return connection;
};

const executeQuery = async (query: string) => {
  const conn = await getConnection();
  const results = await conn?.query(query);
  return results;
}

/** Resolves once the engine is running (and so cached for offline use) */
const whenEngineReady = async (): Promise<void> => {
  await initDB();
};

export { executeQuery, loadDB, whenEngineReady };
