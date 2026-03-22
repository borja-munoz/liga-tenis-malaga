# Data Scraper

Python scripts that extract match results and standings from the Liga Tenis Málaga website and write them to CSV files. The CSV files are then loaded into the DuckDB database by the migration scripts in `db-migrations/`.

## Scripts

| Script | Purpose |
|---|---|
| `extract-data-cycles.py` | Scrapes regular cycle standings and match results |
| `extract-data-playoffs.py` | Scrapes playoff bracket results |

## Dependencies

- Python 3
- `requests` — HTTP client
- `beautifulsoup4` — HTML parsing

Install with:

```bash
pip install requests beautifulsoup4
```

## Usage

Run each script from inside the `data-scraper/` directory:

```bash
cd data-scraper
python extract-data-cycles.py
python extract-data-playoffs.py
```

## Output Files

### Produced by `extract-data-cycles.py`

| File | Description |
|---|---|
| `players.csv` | Unique player names found across all seasons and cycles |
| `seasons_players.csv` | Season–player enrollment (which players appeared in each season) |
| `results.csv` | Match results for regular cycles |

`standings.csv` (cycle standings) is **not** written automatically. The relevant code is commented out because the output requires manual corrections to account for parsing inconsistencies in the source HTML. The file must be produced and curated manually.

### Produced by `extract-data-playoffs.py`

| File | Description |
|---|---|
| `players_playoffs.csv` | Player names found only in playoff data |
| `seasons_players_playoffs.csv` | Season–player enrollment for playoff participants |
| `results-playoff.csv` | Playoff match results including round, seedings, and up to three sets |

## How It Works

The scraper iterates over all 8 seasons and up to 7 cycles per season, fetching each page from `tenismalaga.es`. It uses BeautifulSoup to parse `<font>` elements, which carry the standings tables and result matrices in the source HTML.

For each cycle page the scraper extracts:

1. **Standings table** — player position, points, matches/sets/games won and lost.
2. **Results matrix** — a grid where each cell contains the score for a match between two players (e.g. `6-4 3-6 1-0` for a super tiebreak). Special cases like retirements (`RET`) and club identifiers are also parsed.

### Match result format

Each result cell may contain:
- Set scores: `6-4 3-6`
- Super tiebreak: `6-4 3-6 1-0` (the third pair encodes the winner: `1-0` means player A won)
- Club: a club name appended after the scores
- Retirement: ` RET <name>` appended to indicate a retired player

## Notes

- The `standings.csv` file is excluded from automatic generation because the HTML structure varies across seasons and some pages contain errors. It is maintained manually.
- The scraper includes a special-case fix for a player name (`Álvaro Lara Federico Bernard`) that caused row detection to fail.
- Column order in the standings table changed across seasons (Seasons 1, 2–3, 4–6, and 7–8 each have a different column layout). The scraper handles this with per-season column maps.
