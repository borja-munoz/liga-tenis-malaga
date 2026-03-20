# Web Application

React + TypeScript single-page application for exploring Liga Tenis Málaga statistics.

## Features

- Search for any player by name
- **Summary panel** — career totals: matches, sets, games, and super tiebreaks won/lost
- **Cycles panel** — cycle-by-cycle standings with a position trend chart
- **Results panel** — full match history organised by season, including playoff matches

## Design

The app is **mobile-first**. All layouts, components, and typography are designed to work well on small phone screens first, then scale up gracefully to larger viewports. MUI's responsive breakpoint system (`xs`, `sm`, `md`, …) and its `Grid` component are used to adapt the layout at each breakpoint. When adding or changing UI, verify the result on a mobile viewport before checking larger screens.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | latest | UI framework |
| TypeScript | latest | Type safety |
| Vite | latest | Build tool and dev server |
| Material-UI (MUI) | latest | Component library and theming |
| Apache ECharts | ^5.5.1 | Line charts for position trends |
| TanStack React Query | ^5.59.16 | Query caching and async state |
| DuckDB-Wasm | ^1.29.0 | In-browser SQL database |
| React Router | ^6.27.0 | Client-side routing |
| React Intl | ^6.8.4 | i18n (English and Spanish) |
| Yarn | 4.5.2 | Package manager |

## Directory Structure

```
web-app/
├── public/
│   └── db/
│       └── liga_tenis_malaga.duckdb   # Pre-built database (served statically)
├── src/
│   ├── components/                    # Reusable UI components
│   │   ├── CycleChart.tsx             # ECharts line chart for position history
│   │   ├── CyclePanel.tsx             # Cycle standings table + chart
│   │   ├── Header.tsx                 # App header with logo
│   │   ├── LoadingMessage.tsx         # Loading indicator
│   │   ├── MatchResult.tsx            # Single match result card
│   │   ├── ModalMessage.tsx           # Global notification modal
│   │   ├── PlayerSummaryPanel.tsx     # Career statistics summary
│   │   └── ResultsPanel.tsx           # Full match history per season
│   ├── db/
│   │   └── duckdb.ts                  # DuckDB-Wasm initialisation and query runner
│   ├── i18n/
│   │   └── messages.ts                # English and Spanish translation strings
│   ├── models/                        # Custom hooks — one per data query
│   │   ├── useCycles.ts
│   │   ├── usePlayers.ts
│   │   ├── usePlayerResultsCycles.ts
│   │   └── usePlayerResultsPlayoffs.ts
│   ├── pages/
│   │   ├── Dashboard.tsx              # Main page
│   │   └── NotFound.tsx
│   ├── App.tsx                        # Root component with QueryClientProvider
│   ├── context.ts                     # AppContext (locale, modal messages)
│   ├── main.tsx                       # Entry point
│   ├── routes.tsx                     # Route definitions (lazy-loaded)
│   ├── style.css                      # Global styles
│   └── theme.tsx                      # MUI theme customisation
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Setup and Development

```bash
# Install dependencies
cd web-app
yarn install

# Start development server (http://localhost:5173)
yarn dev

# Type-check and build for production
yarn build

# Preview the production build locally
yarn preview
```

## How the Database Works

The app uses **DuckDB-Wasm** — a WebAssembly build of DuckDB that runs entirely in the browser. No backend server is required after the initial page load.

On startup:

1. `duckdb.ts` initialises a DuckDB-Wasm instance using a Web Worker.
2. It fetches the pre-built database file from GitHub Pages:
   `https://borja-munoz.github.io/liga-tenis-malaga/db/liga_tenis_malaga.duckdb`
3. The database is opened in **read-only** mode.
4. All subsequent data access runs SQL queries against this local in-memory copy.

Custom hooks in `src/models/` wrap individual SQL queries and expose them via **TanStack React Query**, which handles caching and loading states.

## Internationalisation

The app supports **English** and **Spanish**. Translations are defined in [src/i18n/messages.ts](src/i18n/messages.ts) and applied via `react-intl`. The active locale is stored in `AppContext`.

## Deployment

The app is deployed to **GitHub Pages** with the base path `/liga-tenis-malaga/`.

Key configuration choices for GitHub Pages compatibility:
- **HashRouter** (`#/`) is used instead of BrowserRouter to avoid 404s on direct URL access.
- The build command sets `--base=/liga-tenis-malaga/`:
  ```bash
  tsc && vite build --base=/liga-tenis-malaga/
  ```
- The compiled database file is served from the same GitHub Pages site.
