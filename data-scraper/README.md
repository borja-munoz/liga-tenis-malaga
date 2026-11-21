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

### Updating with new cycles

The GitHub Action `.github/workflows/update-data.yml` does this every Monday (see the main README). By hand:

`extract-data-cycles.py` has three modes:

| Command | Behaviour |
|---|---|
| `python extract-data-cycles.py` | Full mode: re-scrapes every season and overwrites all output files (including `standings.csv`, losing manual corrections). |
| `python extract-data-cycles.py --mode incremental` | Re-scrapes the last cycle already present in `results.csv` (it may have been scraped while still in progress), any cycle that ended in the last 14 days (results are sometimes entered late) and any newer cycles. |
| `python extract-data-cycles.py --cycles 9:5-6,10:1` | Re-scrapes only the listed cycles (`SEASON:CYCLE` or `SEASON:FIRST-LAST`). |

In both incremental variants, the rows for the re-scraped cycles in `results.csv` and `standings.csv` are **replaced**. Rows for every other cycle are kept untouched, including manual corrections. The cycle still being played is scraped like any other: the app shows its standings as provisional.

`--report FILE` appends a Markdown summary to `FILE`: rows scraped per cycle, new cycles and new player names, with similar existing names. Check those names: if one is another spelling of an existing player, add it to `db-migrations/01-consolidate-players.sql`.

When the scraper finds a cycle that is not in `cycles.csv`, it adds it with the dates shown on the cycle page (e.g. `CICLO 2 26/10/26 – 29/11/26`). Existing rows are never changed, and the Play Off rows are added by hand.

To add a new season, append its URL to `template_seasons` and its column layout to `column_order`, and add the season to `db-migrations/00-create-base-tables-up.sql`. For playoffs, append the URL to `playoff_urls` in `extract-data-playoffs.py`.

`extract-data-playoffs.py` always rewrites its three CSV files from scratch. The committed `results-playoff.csv` contains manual corrections and has no seasons 1–3, which the parser cannot read. So run it in a temporary directory and append only the new seasons' rows to the committed files.

## Output Files

### Produced by `extract-data-cycles.py`

| File | Description |
|---|---|
| `players.csv` | Unique player names found across all seasons and cycles |
| `seasons_players.csv` | Season–player enrollment (which players appeared in each season) |
| `results.csv` | Match results for regular cycles |
| `standings.csv` | Standings of every group in every cycle |
| `cycles.csv` | Cycle calendar: season, cycle, name, start and end date |

Some rows of older seasons in `standings.csv` were corrected by hand (the source HTML has errors there). Incremental runs keep them.

### Produced by `extract-data-playoffs.py`

| File | Description |
|---|---|
| `players_playoffs.csv` | Player names found only in playoff data |
| `seasons_players_playoffs.csv` | Season–player enrollment for playoff participants |
| `results-playoff.csv` | Playoff match results including round, seedings, and up to three sets |

## How It Works

The scraper iterates over all seasons (currently 10) and up to 7 cycles per season, fetching each page from `tenismalaga.es`. It uses BeautifulSoup to parse `<font>` elements, which carry the standings tables and result matrices in the source HTML.

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

- The scraper includes a special-case fix for a player name (`Álvaro Lara Federico Bernard`) that caused row detection to fail.
- Column order in the standings table changed across seasons (Seasons 1, 2–3, 4–6, and 7–10 each have a different column layout). The scraper handles this with per-season column maps.
