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

-------------------------------
-- Season 1
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  1,
  'Ciclo 1',
  DATE '2017-10-10',
  DATE '2017-11-19'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  2,
  'Ciclo 2',
  DATE '2017-11-20',
  DATE '2017-12-31'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  3,
  'Ciclo 3',
  DATE '2018-01-01',
  DATE '2018-02-04'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  4,
  'Ciclo 4',
  DATE '2018-02-05',
  DATE '2018-03-11'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  5,
  'Ciclo 5',
  DATE '2018-03-12',
  DATE '2018-04-15'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  1,
  6,
  'Play Off',
  DATE '2018-04-16',
  DATE '2018-05-20'
);

-------------------------------
-- Season 2
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  1,
  'Ciclo 1',
  DATE '2018-10-01',
  DATE '2018-11-04'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  2,
  'Ciclo 2',
  DATE '2018-11-05',
  DATE '2018-12-09'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  3,
  'Ciclo 3',
  DATE '2018-12-10',
  DATE '2019-01-13'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  4,
  'Ciclo 4',
  DATE '2019-01-14',
  DATE '2019-02-17'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  5,
  'Ciclo 5',
  DATE '2019-02-18',
  DATE '2019-03-24'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  6,
  'Ciclo 6',
  DATE '2019-03-25',
  DATE '2019-04-28'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  2,
  7,
  'Play Off',
  DATE '2019-04-29',
  DATE '2019-06-02'
);

-------------------------------
-- Season 3
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  1,
  'Ciclo 1',
  DATE '2019-09-30',
  DATE '2019-11-03'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  2,
  'Ciclo 2',
  DATE '2019-11-04',
  DATE '2019-12-08'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  3,
  'Ciclo 3',
  DATE '2019-12-09',
  DATE '2020-01-12'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  4,
  'Ciclo 4',
  DATE '2020-01-13',
  DATE '2020-02-16'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  5,
  'Ciclo 5',
  DATE '2020-02-17',
  DATE '2020-05-24'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  3,
  6,
  'Play Off',
  DATE '2020-05-25',
  DATE '2020-06-14'
);

-------------------------------
-- Season 4
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  1,
  'Ciclo 1',
  DATE '2020-09-28',
  DATE '2020-11-01'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  2,
  'Ciclo 2',
  DATE '2020-11-02',
  DATE '2020-12-27'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  3,
  'Ciclo 3',
  DATE '2020-12-28',
  DATE '2021-02-28'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  4,
  'Ciclo 4',
  DATE '2021-03-01',
  DATE '2021-03-28'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  5,
  'Ciclo 5',
  DATE '2021-03-29',
  DATE '2021-04-25'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  6,
  'Ciclo 6',
  DATE '2021-04-26',
  DATE '2021-05-23'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  4,
  7,
  'Play Off',
  DATE '2021-05-24',
  DATE '2021-06-13'
);

-------------------------------
-- Season 5
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  1,
  'Ciclo 1',
  DATE '2021-09-27',
  DATE '2021-10-31'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  2,
  'Ciclo 2',
  DATE '2021-11-01',
  DATE '2021-12-05'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  3,
  'Ciclo 3',
  DATE '2021-12-06',
  DATE '2022-01-09'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  4,
  'Ciclo 4',
  DATE '2022-01-10',
  DATE '2022-02-13'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  5,
  'Ciclo 5',
  DATE '2022-02-14',
  DATE '2022-03-20'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  6,
  'Ciclo 6',
  DATE '2022-03-21',
  DATE '2022-04-24'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  5,
  7,
  'Play Off',
  DATE '2022-04-25',
  DATE '2022-05-29'
);

-------------------------------
-- Season 6
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  1,
  'Ciclo 1',
  DATE '2022-09-26',
  DATE '2022-10-30'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  2,
  'Ciclo 2',
  DATE '2022-10-31',
  DATE '2022-12-04'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  3,
  'Ciclo 3',
  DATE '2022-12-05',
  DATE '2023-01-15'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  4,
  'Ciclo 4',
  DATE '2023-01-16',
  DATE '2023-02-19'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  5,
  'Ciclo 5',
  DATE '2023-02-20',
  DATE '2023-03-26'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  6,
  'Ciclo 6',
  DATE '2023-03-27',
  DATE '2023-04-30'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  6,
  7,
  'Play Off',
  DATE '2023-05-01',
  DATE '2023-06-04'
);

-------------------------------
-- Season 7
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  1,
  'Ciclo 1',
  DATE '2023-09-25',
  DATE '2023-10-29'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  2,
  'Ciclo 2',
  DATE '2023-10-30',
  DATE '2023-12-03'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  3,
  'Ciclo 3',
  DATE '2023-12-04',
  DATE '2024-01-14'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  4,
  'Ciclo 4',
  DATE '2024-01-15',
  DATE '2024-02-25'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  5,
  'Ciclo 5',
  DATE '2024-02-26',
  DATE '2024-03-31'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  6,
  'Ciclo 6',
  DATE '2024-04-01',
  DATE '2024-05-05'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  7,
  7,
  'Play Off',
  DATE '2024-05-06',
  DATE '2024-06-09'
);

-------------------------------
-- Season 8
-------------------------------
INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  1,
  'Ciclo 1',
  DATE '2024-09-23',
  DATE '2024-10-27'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  2,
  'Ciclo 2',
  DATE '2024-10-28',
  DATE '2024-12-01'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  3,
  'Ciclo 3',
  DATE '2024-12-02',
  DATE '2025-01-12'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  4,
  'Ciclo 4',
  DATE '2025-01-13',
  DATE '2025-02-16'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  5,
  'Ciclo 5',
  DATE '2025-02-17',
  DATE '2025-03-23'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  6,
  'Ciclo 6',
  DATE '2025-03-24',
  DATE '2025-04-27'
);

INSERT INTO cycles
(
  season_id,
  cycle_order,
  name,
  start_date,
  end_date
)
VALUES
(
  8,
  7,
  'Play Off',
  DATE '2025-04-28',
  DATE '2025-06-01'
);

CREATE SEQUENCE seq_player_id START 1;

CREATE TABLE players (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_player_id'),
  name VARCHAR
);

INSERT INTO players(name) 
SELECT name 
FROM read_csv('data-scraper/players.csv', delim = ',', header = true);

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

CREATE SEQUENCE seq_cycle_standing_id START 1;

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

CREATE SEQUENCE seq_result_id START 1;

CREATE TABLE results (
  id INTEGER PRIMARY KEY DEFAULT NEXTVAL('seq_result_id'),
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
INSERT INTO results(
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

