# Liga Tenis Málaga

Web application to explore statistics and match history for a regional tennis league in Málaga, Spain, covering 8 seasons from 2017 to 2025.

## Live Demo

[https://borja-munoz.github.io/liga-tenis-malaga/](https://borja-munoz.github.io/liga-tenis-malaga/)

## Architecture Overview

```
liga-tenis-malaga/
├── data-scraper/        # Python scripts that extract data from the league website
├── db-migrations/       # SQL scripts that build the DuckDB database from CSV files
└── web-app/             # React + TypeScript single-page application
```

Data flows in one direction:

```
League website (tenismalaga.es)
        │
        ▼
  data-scraper/          ← Python + BeautifulSoup → CSV files
        │
        ▼
  db-migrations/         ← DuckDB SQL → liga_tenis_malaga.duckdb
        │
        ▼
  web-app/               ← DuckDB-Wasm loads DB in the browser → UI
```

## Components

### Data Scraper (`data-scraper/`)

Python scripts that scrape the league website and produce CSV files used to populate the database.

See [data-scraper/README.md](data-scraper/README.md) for details.

### Database Migrations (`db-migrations/`)

SQL scripts that create the DuckDB schema and load data from the CSV files produced by the scraper.

See [db-migrations/README.md](db-migrations/README.md) for details.

### Web Application (`web-app/`)

React + TypeScript SPA that loads the compiled DuckDB database file and lets users browse player statistics, cycle standings, and match results.

See [web-app/README.md](web-app/README.md) for details.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI components | Material-UI (MUI) |
| Charts | Apache ECharts |
| In-browser database | DuckDB-Wasm |
| Data fetching | TanStack React Query |
| Internationalisation | React Intl (EN / ES) |
| Data scraping | Python, BeautifulSoup |
| Deployment | GitHub Pages |

## League Structure

- **8 seasons** — October to June, from 2017–18 to 2024–25
- **Cycles** — 5–6 regular cycles per season, each followed by a Play Off
- **Groups** — players are organised into skill-based groups within each cycle
- **Clubs** — Haza, CRC, Sohail, Cerrado

## Pending Features

- Head-to-head
- Playoff panel with chart for reached round per season (like cycles) and summary 

## Benchmark

- 9.2 MB transferred on initialization -> opening the database and reading players. Most of it corresponds to the WASM file (7.3 MB)
- For some reason, it tries to open WAL files even if we are opening the database in read-only mode. Maybe there is some reference in the .duckdb file to them. It might be possible that I copied the db file when it was still open.
- Getting the data for a player needs 1.0 MB additional. All the requests to the duckdb file are partial requests (status 206)
- Selecting another player does not request additional data 
