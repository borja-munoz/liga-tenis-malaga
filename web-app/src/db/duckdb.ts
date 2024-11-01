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
let connection: AsyncDuckDBConnection | undefined; 

const initDB = async () => {
  if (db) {
    return db; // Return existing database, if any
  }

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker!);
  const logger = new duckdb.ConsoleLogger();
  db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  return db;
}; 

const loadDB = async () => {
  const db = await initDB();
  const dbPath = "http://localhost:5173/db/liga_tenis_malaga.duckdb";
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

export { executeQuery, loadDB };