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

let db : AsyncDuckDB | null = null;
let selectedBundle: duckdb.DuckDBBundle | null = null;
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
  selectedBundle = bundle;

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  return db;
}; 

const loadDB = async () => {
  const db = await initDB();
  // Same origin as the app (and absolute: DuckDB fetches it from its worker),
  // so the service worker can serve it from the cache
  const dbPath = new URL(`${import.meta.env.BASE_URL}db/liga_tenis_malaga.duckdb`, window.location.origin).href;
  await db.open({ 
    accessMode: DuckDBAccessMode.READ_ONLY,
    path: dbPath
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

/** Engine files in use, so the service worker can keep them for offline use */
const getEngineUrls = async (): Promise<string[]> => {
  await initDB();
  return selectedBundle ? [selectedBundle.mainModule, selectedBundle.mainWorker].filter((u): u is string => !!u) : [];
};

export { executeQuery, getEngineUrls, loadDB };