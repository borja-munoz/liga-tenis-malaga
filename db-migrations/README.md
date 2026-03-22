# Database Migrations

SQL scripts that create the DuckDB schema and populate it from the CSV files produced by the data scraper.

## Prerequisites

- [DuckDB CLI](https://duckdb.org/docs/installation/) installed
- CSV files present in `data-scraper/` (run the scraper scripts first)

## Running the Migration

Execute the script from the repository root so that the relative paths to the CSV files resolve correctly:

```bash
duckdb public/db/liga_tenis_malaga.duckdb < db-migrations/00-create-base-tables-up.sql
```

The resulting `.duckdb` file is placed in `web-app/public/db/` so that it is included in the Vite build and served by GitHub Pages.

## Schema

### Entity Relationship Overview

```
seasons ──< cycles
seasons ──< seasons_players >── players
players ──< cycle_standings >── cycles
players ──< results_cycles
players ──< results_playoffs
clubs   ──< results_cycles
clubs   ──< results_playoffs
```

### Tables

#### `seasons`

One row per league season.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | VARCHAR | Season name (e.g. "Temporada 1") |
| start_date | DATE | Season start date |
| end_date | DATE | Season end date |

8 seasons are defined, from 2017-10-10 to 2025-06-01.

---

#### `cycles`

One row per cycle within a season. Each season has 5–6 regular cycles plus a Play Off cycle.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| season_id | INTEGER | FK → seasons |
| cycle_order | INTEGER | Position within the season (1, 2, … N, where the last is the Play Off) |
| name | VARCHAR | Cycle name ("Ciclo 1", "Ciclo 2", …, "Play Off") |
| start_date | DATE | Cycle start date |
| end_date | DATE | Cycle end date |

---

#### `players`

Registry of all unique players across all seasons.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | VARCHAR | Full player name |

Populated from `players.csv` and `players_playoffs.csv` (deduped).

---

#### `seasons_players`

Junction table recording which players participated in each season.

| Column | Type | Description |
|---|---|---|
| season_id | INTEGER | FK → seasons |
| player_id | INTEGER | FK → players |

---

#### `clubs`

The four clubs that host matches.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| name | VARCHAR | Club name |

Fixed values: Haza, CRC, Sohail, Cerrado.

---

#### `cycle_standings`

End-of-cycle standings for each player in each group.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| cycle_id | INTEGER | FK → cycles |
| group_number | INTEGER | Group number within the cycle |
| position | INTEGER | Final position in the group |
| target_group | VARCHAR | Destination group for next cycle (used in seasons 4–8) |
| player_id | INTEGER | FK → players |
| points | INTEGER | Ranking points |
| matches_won | INTEGER | |
| matches_lost | INTEGER | |
| matches_not_played | INTEGER | |
| sets_won | INTEGER | |
| sets_lost | INTEGER | |
| sets_balance | INTEGER | sets_won − sets_lost |
| games_won | INTEGER | Individual games won across all sets |
| games_lost | INTEGER | |
| games_balance | INTEGER | games_won − games_lost |
| points_by_position | INTEGER | Points awarded for final position |
| extra_points | INTEGER | Bonus points |
| total_points | INTEGER | points_by_position + extra_points |

---

#### `results_cycles`

Individual match results from regular cycles (not playoffs). Matches are played as best-of-two sets; a tied match is decided by a super tiebreak.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| season_id | INTEGER | Season number |
| cycle_order | INTEGER | Cycle number within the season |
| group_number | INTEGER | Group in which the match was played |
| player_a_id | INTEGER | FK → players |
| player_b_id | INTEGER | FK → players |
| games_won_player_a_set_one | INTEGER | |
| games_won_player_a_set_two | INTEGER | |
| games_won_player_b_set_one | INTEGER | |
| games_won_player_b_set_two | INTEGER | |
| super_tie_break_winner_id | INTEGER | FK → players (NULL if no super tiebreak) |
| club_id | INTEGER | FK → clubs (venue, NULL if not recorded) |
| retired_player_id | INTEGER | FK → players (NULL if no retirement) |

---

#### `results_playoffs`

Individual match results from Play Off rounds. Playoffs can go to three sets.

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| season_id | INTEGER | Season number |
| group_name | VARCHAR | Playoff group/bracket name |
| round | VARCHAR | Round name (e.g. "Cuartos de final", "Final") |
| round_order | INTEGER | Round order within the bracket |
| player_a_id | INTEGER | FK → players |
| player_b_id | INTEGER | FK → players |
| player_a_seed | INTEGER | Seeding for player A (NULL if unseeded) |
| player_b_seed | INTEGER | Seeding for player B (NULL if unseeded) |
| games_won_player_a_set_one | INTEGER | |
| games_won_player_a_set_two | INTEGER | |
| games_won_player_a_set_three | INTEGER | NULL if match ended in two sets |
| games_won_player_b_set_one | INTEGER | |
| games_won_player_b_set_two | INTEGER | |
| games_won_player_b_set_three | INTEGER | NULL if match ended in two sets |
| super_tie_break_winner_id | INTEGER | FK → players (NULL if no super tiebreak) |
| club_id | INTEGER | FK → clubs (NULL if not recorded) |
| retired_player_id | INTEGER | FK → players (NULL if no retirement) |
