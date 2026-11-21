CREATE SEQUENCE seq_season_id START 1;

CREATE TABLE seasons (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_season_id'),
  name VARCHAR,
  start_date DATE,
  end_date DATE
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 1', 
  DATE '2017-10-10',
  DATE '2018-05-20'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 2', 
  DATE '2018-10-01',
  DATE '2019-06-02'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 3', 
  DATE '2019-09-30',
  DATE '2020-06-14'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 4', 
  DATE '2020-09-28',
  DATE '2021-06-13'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 5', 
  DATE '2021-09-27',
  DATE '2022-05-29'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 6', 
  DATE '2022-09-26',
  DATE '2023-06-04'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 7', 
  DATE '2023-09-25',
  DATE '2024-06-09'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 8', 
  DATE '2024-09-23',
  DATE '2025-06-01'
);

INSERT INTO seasons (
  name, 
  start_date, 
  end_date
)
VALUES (
  'Temporada 9',
  DATE '2025-09-22',
  DATE '2026-06-07'
);

-- End date is an estimate until the season calendar is complete
INSERT INTO seasons (
  name,
  start_date,
  end_date
)
VALUES (
  'Temporada 10',
  DATE '2026-09-21',
  DATE '2027-06-06'
);

CREATE SEQUENCE seq_cycle_id START 1;

CREATE TABLE cycles (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_cycle_id'),
  season_id INTEGER,
  cycle_order INTEGER,
  name VARCHAR,
  start_date DATE,
  end_date DATE,
  FOREIGN KEY (season_id) REFERENCES seasons (id),
);

-- One row per cycle. The scraper adds the regular cycles with the
-- dates shown on each cycle page; the Play Off rows are added by hand
INSERT INTO cycles (season_id, cycle_order, name, start_date, end_date)
SELECT season_id, cycle_order, name, start_date, end_date
FROM read_csv('data-scraper/cycles.csv', delim = ',', header = true,
              columns = {
                'season_id': 'INTEGER',
                'cycle_order': 'INTEGER',
                'name': 'VARCHAR',
                'start_date': 'DATE',
                'end_date': 'DATE'
              })
ORDER BY season_id, cycle_order;

CREATE SEQUENCE seq_player_id START 1;

CREATE TABLE players (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_player_id'),
  name VARCHAR
);

INSERT INTO players(name) 
SELECT name 
FROM read_csv('data-scraper/players.csv', delim = ',', header = true);

INSERT INTO players(name) 
SELECT name 
FROM read_csv('data-scraper/players_playoffs.csv', delim = ',', header = true) csv
WHERE NOT EXISTS (FROM players p WHERE csv.name = p.name);

CREATE TABLE seasons_players (
  season_id INTEGER,
  player_id INTEGER,
  FOREIGN KEY (season_id) REFERENCES seasons(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

WITH csv_seasons_players AS (
  SELECT season_id, p.id
  FROM read_csv('data-scraper/seasons_players.csv', delim = ',', header = true) csv
       INNER JOIN players p ON csv.player_name = p.name
)
INSERT INTO seasons_players(season_id, player_id) 
SELECT season_id, id AS player_id
FROM csv_seasons_players;

WITH csv_seasons_players AS (
  SELECT season_id, p.id
  FROM read_csv('data-scraper/seasons_players_playoffs.csv', delim = ',', header = true) csv
       INNER JOIN players p ON csv.player_name = p.name
)
INSERT INTO seasons_players(season_id, player_id) 
SELECT season_id, id AS player_id
FROM csv_seasons_players csv
WHERE NOT EXISTS (
  FROM seasons_players sp
  WHERE csv.season_id = sp.season_id AND
        csv.id = sp.player_id
);

CREATE SEQUENCE seq_cycle_standing_id START 1;

-- I have to remove the foreign key constraints because
-- when I try later in db migration 01 to consolidate the
-- player records belonging to the same player, an error
-- is thrown, explained here:
-- https://github.com/duckdb/duckdb/issues/1631
-- Updating a record creates a delete and an insert statement
-- but the unique constraint is checked too soon so it fails 
CREATE TABLE cycle_standings (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_cycle_standing_id'),
  cycle_id INTEGER,
  group_number INTEGER,
  position INTEGER,
  target_group VARCHAR,
  player_id INTEGER,
  points INTEGER,
  matches_won INTEGER,
  matches_lost INTEGER,
  matches_not_played INTEGER,
  sets_won INTEGER,
  sets_lost INTEGER,
  sets_balance INTEGER,
  games_won INTEGER,
  games_lost INTEGER,
  games_balance INTEGER,
  points_by_position INTEGER,
  extra_points INTEGER,
  total_points INTEGER,
  FOREIGN KEY (cycle_id) REFERENCES cycles(id), 
  FOREIGN KEY (player_id) REFERENCES players(id)
);

WITH csv_results AS (
  SELECT csv.season_id,
         cy.id AS cycle_id,
         "group" AS group_number,
         replace(Puesto, 'º', '') AS position,
         "Grupo Destino" AS target_group,
         pl.id AS player_id,
         TRY_CAST(Puntos AS INTEGER) AS points,
         Ganados AS matches_won, 
         Perdidos AS matches_lost, 
         "No Jugados" AS matches_not_played,
         "Sets Ganados" AS sets_won, 
         "Sets Perdidos" AS sets_lost, 
         "Balance Sets" AS sets_balance,
         "Juegos Ganados" AS games_won, 
         "Juegos Perdidos" AS games_lost, 
         "Balance Juegos" AS games_balance,
         "Puntos por puesto" AS points_by_position, 
         "Puntos extra" AS extra_points, 
         "Puntos total" AS total_points
  FROM read_csv('data-scraper/standings.csv', delim = ',', header = true) csv
       INNER JOIN cycles cy ON csv.season_id = cy.season_id and csv.cycle_id = cy.cycle_order
       INNER JOIN players pl ON csv.Jugador = pl.name
)
INSERT INTO cycle_standings(
  cycle_id,
  group_number,
  position,
  target_group,
  player_id,
  points,
  matches_won,
  matches_lost,
  matches_not_played,
  sets_won,
  sets_lost,
  sets_balance,
  games_won,
  games_lost,
  games_balance,
  points_by_position,
  extra_points,
  total_points
) 
SELECT cycle_id,
       group_number,
       position,
       target_group,
       player_id,
       points,
       matches_won,
       matches_lost,
       matches_not_played,
       sets_won,
       sets_lost,
       sets_balance,
       games_won,
       games_lost,
       games_balance,
       points_by_position,
       extra_points,
       total_points
FROM csv_results;

CREATE SEQUENCE seq_club_id START 1;

CREATE TABLE clubs (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_club_id'),
  name VARCHAR
);

INSERT INTO clubs (name)
VALUES ('Haza');

INSERT INTO clubs (name)
VALUES ('CRC');

INSERT INTO clubs (name)
VALUES ('Sohail');

INSERT INTO clubs (name)
VALUES ('Cerrado');

CREATE SEQUENCE seq_result_cycle_id START 1;

CREATE TABLE results_cycles (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_result_cycle_id'),
  season_id INTEGER,
  cycle_order INTEGER,
  group_number INTEGER,
  player_a_id INTEGER,
  player_b_id INTEGER,
  games_won_player_a_set_one INTEGER,
  games_won_player_a_set_two INTEGER,
  games_won_player_b_set_one INTEGER,
  games_won_player_b_set_two INTEGER,
  super_tie_break_winner_id INTEGER,
  club_id INTEGER,
  retired_player_id INTEGER,
  FOREIGN KEY (player_a_id) REFERENCES players(id),
  FOREIGN KEY (player_b_id) REFERENCES players(id),
  FOREIGN KEY (super_tie_break_winner_id) REFERENCES players(id),
  FOREIGN KEY (club_id) REFERENCES clubs(id),
  FOREIGN KEY (retired_player_id) REFERENCES players(id)
);

WITH csv_results AS (
  SELECT season, cycle, group_number, 
         p1.id AS player_a_id, p2.id AS player_b_id, 
         games_won_player_a_set_one,
         games_won_player_a_set_two,
         games_won_player_b_set_one,
         games_won_player_b_set_two,
         p3.id AS super_tie_break_winner_id,
         clubs.id AS club_id,
         p4.id AS retired_player_id
  FROM read_csv('data-scraper/results.csv', delim = ',', header = true) csv
       INNER JOIN players p1 ON csv.player_a = p1.name
       INNER JOIN players p2 ON csv.player_b = p2.name
       LEFT OUTER JOIN players p3 ON csv.super_tie_break_winner = p3.name
       LEFT OUTER JOIN clubs ON csv.club = clubs.name
       LEFT OUTER JOIN players p4 ON csv.retired_player = p4.name
)
INSERT INTO results_cycles(
  season_id, 
  cycle_order,
  group_number,
  player_a_id,
  player_b_id,
  games_won_player_a_set_one,
  games_won_player_a_set_two,
  games_won_player_b_set_one,
  games_won_player_b_set_two,
  super_tie_break_winner_id,
  club_id,
  retired_player_id
) 
SELECT season, 
       cycle,
       group_number,
       player_a_id,
       player_b_id,
       games_won_player_a_set_one,
       games_won_player_a_set_two,
       games_won_player_b_set_one,
       games_won_player_b_set_two,
       super_tie_break_winner_id,
       club_id,
       retired_player_id
FROM csv_results;

CREATE SEQUENCE seq_result_playoff_id START 1;

CREATE TABLE results_playoffs (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_result_playoff_id'),
  season_id INTEGER,
  group_name VARCHAR,
  round VARCHAR,
  round_order INTEGER,
  player_a_id INTEGER,
  player_b_id INTEGER,
  player_a_seed INTEGER,
  player_b_seed INTEGER,
  games_won_player_a_set_one INTEGER,
  games_won_player_a_set_two INTEGER,
  games_won_player_a_set_three INTEGER,
  games_won_player_b_set_one INTEGER,
  games_won_player_b_set_two INTEGER,
  games_won_player_b_set_three INTEGER,
  super_tie_break_winner_id INTEGER,
  club_id INTEGER,
  retired_player_id INTEGER,
  FOREIGN KEY (player_a_id) REFERENCES players(id),
  FOREIGN KEY (player_b_id) REFERENCES players(id),
  FOREIGN KEY (super_tie_break_winner_id) REFERENCES players(id),
  FOREIGN KEY (club_id) REFERENCES clubs(id),
  FOREIGN KEY (retired_player_id) REFERENCES players(id)
);

WITH csv_results AS (
  SELECT season, group_name, round, round_order, 
         p1.id AS player_a_id, p2.id AS player_b_id, 
         player_a_seed, player_b_seed,
         games_won_player_a_set_one,
         games_won_player_a_set_two,
         games_won_player_a_set_three,
         games_won_player_b_set_one,
         games_won_player_b_set_two,
         games_won_player_b_set_three,
         p3.id AS super_tie_break_winner_id,
         clubs.id AS club_id,
         p4.id AS retired_player_id
  FROM read_csv('data-scraper/results-playoff.csv', delim = ',', header = true) csv
       INNER JOIN players p1 ON csv.player_a = p1.name
       INNER JOIN players p2 ON csv.player_b = p2.name
       LEFT OUTER JOIN players p3 ON csv.super_tie_break_winner = p3.name
       LEFT OUTER JOIN clubs ON csv.club = clubs.name
       LEFT OUTER JOIN players p4 ON csv.retired_player = p4.name
)
INSERT INTO results_playoffs(
  season_id, 
  group_name,
  round,
  round_order,
  player_a_id,
  player_b_id,
  player_a_seed,
  player_b_seed,
  games_won_player_a_set_one,
  games_won_player_a_set_two,
  games_won_player_a_set_three,
  games_won_player_b_set_one,
  games_won_player_b_set_two,
  games_won_player_b_set_three,
  super_tie_break_winner_id,
  club_id,
  retired_player_id
) 
SELECT season, 
       group_name,
       round,
       round_order,
       player_a_id,
       player_b_id,
       player_a_seed,
       player_b_seed,
       games_won_player_a_set_one,
       games_won_player_a_set_two,
       games_won_player_a_set_three,
       games_won_player_b_set_one,
       games_won_player_b_set_two,
       games_won_player_b_set_three,
       super_tie_break_winner_id,
       club_id,
       retired_player_id
FROM csv_results;

-- When the database was built (shown in the app as the data update date)
CREATE TABLE metadata (
  updated_at TIMESTAMP
);

-- In UTC, whatever the time zone of the machine that builds it
INSERT INTO metadata (updated_at) VALUES (current_timestamp AT TIME ZONE 'UTC');
