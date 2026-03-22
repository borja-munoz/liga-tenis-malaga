# Web Application Architecture

## Component Hierarchy

```
App
└── QueryClientProvider (TanStack React Query)
    └── IntlProvider (react-intl)
        └── AppContext.Provider (locale, modal)
            └── HashRouter
                └── Routes
                    └── DefaultView (layout: Header + Outlet)
                        ├── Dashboard          ← /
                        │   ├── Autocomplete   (player selector)
                        │   ├── PlayerSummaryPanel
                        │   ├── CyclePanel
                        │   │   └── CycleChart
                        │   └── ResultsPanel
                        │       └── MatchResult (× N)
                        └── NotFound           ← *
```

## Data Flow

```
DuckDB-Wasm (browser)
      │
      │  SQL query
      ▼
Custom hook (src/models/)
      │
      │  useQuery(queryKey, queryFn)
      ▼
TanStack React Query cache
      │
      │  { data, isLoading, error }
      ▼
React component
      │
      │  derived/aggregated state
      ▼
MUI + ECharts UI
```

### Data hooks

| Hook | Query | Consumer |
|---|---|---|
| `usePlayers` | All player names + IDs | Dashboard (autocomplete) |
| `useCycles` | Cycle standings for a player | CyclePanel, CycleChart |
| `usePlayerResultsCycles` | Regular cycle match results | ResultsPanel, PlayerSummaryPanel |
| `usePlayerResultsPlayoffs` | Playoff match results | ResultsPanel, PlayerSummaryPanel |

Each hook calls `db.query(sql)` from `duckdb.ts`, which returns an Arrow table that is mapped to a plain TypeScript array before being returned to the component.

## State Management

| Scope | Mechanism |
|---|---|
| Global UI (locale, modal) | React Context (`AppContext`) |
| Server / async data | TanStack React Query |
| Local component state | `useState` / `useEffect` |
| Selected player | `useState` in Dashboard, passed as props |

There is no external state management library (no Redux, Zustand, etc.). The combination of React Query for remote data and React Context for UI state is sufficient given the read-only, single-user nature of the app.

## Routing

Routes are defined in `src/routes.tsx` and lazily loaded with `React.lazy` + `Suspense` for code splitting.

```
/           → Dashboard (lazy)
*           → NotFound (lazy)
```

`DefaultView` acts as a persistent layout shell (header + `<Outlet />`).
`HashRouter` is used so that GitHub Pages can serve the app without server-side routing configuration.

## DuckDB Initialisation (`src/db/duckdb.ts`)

```
main thread
    │  import duckdb-wasm bundles
    ▼
selectBundle()          ← picks the correct WASM bundle for the browser
    │
    ▼
AsyncDuckDB.instantiate()
    │
    ▼
db.open({ path: remote URL, accessMode: READ_ONLY })
    │
    ▼
db.connect()            ← connection reused for all queries
    │
    ▼
conn.query(sql)         ← called by model hooks
```

The initialisation is performed once and the connection object is exported as a module-level singleton. React Query's `staleTime` and `gcTime` settings prevent redundant re-fetches.

## Styling

- **MUI theme** (`src/theme.tsx`) — defines palette, typography, and component overrides.
- **Emotion** — used by MUI internally and for `styled` components where needed.
- **`src/style.css`** — minimal global resets only.

No CSS modules or Tailwind are used; styling is handled entirely through the MUI system.

## Build and Deployment Pipeline

```
yarn build
    │
    ├── tsc          ← type-check (fails fast on type errors)
    │
    └── vite build --base=/liga-tenis-malaga/
            │
            ├── code splitting (lazy routes → separate chunks)
            ├── asset hashing for cache busting
            └── output → dist/
                    │
                    └── deployed to GitHub Pages
```

The `dist/` folder and the `public/db/liga_tenis_malaga.duckdb` file are both served from the same GitHub Pages deployment at `https://borja-munoz.github.io/liga-tenis-malaga/`.

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Mobile-first design | The primary audience accesses the app on phones; all layouts are designed for small screens first and scale up via MUI breakpoints |
| DuckDB-Wasm instead of a REST API | No backend infrastructure needed; the whole app is static and can be hosted for free on GitHub Pages |
| Read-only database access | The app is a read-only analytics viewer; enforcing read-only mode prevents accidental mutations |
| HashRouter | GitHub Pages does not support server-side URL rewriting; hash-based routing avoids 404s on refresh |
| TanStack React Query | Handles caching, deduplication, and loading states without boilerplate; avoids re-fetching the same SQL query on every render |
| React Intl | Provides both English and Spanish UI, matching the bilingual nature of the league data |
