#!/usr/bin/env bash
# Builds web-app/public/db/liga_tenis_malaga.duckdb from the CSV files in
# data-scraper/, checks it and replaces the published file only if every
# check passes. Run from anywhere; needs the DuckDB CLI.
set -euo pipefail

cd "$(dirname "$0")/.."

OUT=web-app/public/db/liga_tenis_malaga.duckdb
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

echo "Building the database..."
duckdb -bail "$WORK/stage.duckdb" < db-migrations/00-create-base-tables-up.sql
duckdb -bail -cmd ".mode trash" "$WORK/stage.duckdb" < db-migrations/01-consolidate-players.sql

echo "Checking the data..."
duckdb -bail -readonly -cmd ".mode trash" "$WORK/stage.duckdb" < db-migrations/check-data.sql
if [ -f "$OUT" ]; then
  duckdb -bail -readonly -cmd ".mode trash" "$WORK/stage.duckdb" \
    -cmd "ATTACH '$OUT' AS previous (READ_ONLY)" < db-migrations/check-against-previous.sql
fi

# The consolidation updates leave free space in the file, so copy the data
# into a compact file. A new file uses storage version v1.0.0, which the
# web app's DuckDB-Wasm (DuckDB 1.1) can read.
echo "Compacting..."
duckdb -bail -readonly "$WORK/stage.duckdb" -c "EXPORT DATABASE '$WORK/export' (FORMAT parquet);"
duckdb -bail "$WORK/final.duckdb" -c "IMPORT DATABASE '$WORK/export';"

mv "$WORK/final.duckdb" "$OUT"
echo "Database written to $OUT"
