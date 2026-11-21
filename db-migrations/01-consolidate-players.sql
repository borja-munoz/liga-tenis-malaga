-- Consolidate player records that belong to the same person
-- (the same player appears with different spellings in the web pages).
--
-- Players are matched by NAME, not by id: ids are assigned from the
-- alphabetical order of players.csv, so they shift every time a new
-- player is scraped.
--
-- To merge more players, add (alias, canonical) rows to player_aliases.

CREATE TEMP TABLE player_aliases (
  alias VARCHAR,
  canonical VARCHAR
);

INSERT INTO player_aliases (alias, canonical) VALUES
  -- Adrián Gómez
  ('Adrián Gomez', 'Adrián Gómez'),
  ('Adrián Gómez Cuevas', 'Adrián Gómez'),
  ('Adrian Gomez', 'Adrián Gómez'),
  ('Adrían Gómez', 'Adrián Gómez'),
  -- Adrián Mariscal
  ('Adrian Mariscal', 'Adrián Mariscal'),
  -- Adriano Petrizzo
  ('Adrián Petrizzo', 'Adriano Petrizzo'),
  ('Adrián Petrizzo VS', 'Adriano Petrizzo'),
  -- Alberto Álvarez
  ('Alberto Álvarez XX', 'Alberto Álvarez'),
  ('Alberto Alvarez', 'Alberto Álvarez'),
  -- Alberto Vázquez
  ('Alberto Vázquez', 'Alberto Vazquez'),
  -- Alejandro Gallardo
  ('Alejandro Gallardo Moreno', 'Alejandro Gallardo'),
  -- Alejandro García
  ('Alejandro Garcia', 'Alejandro García'),
  -- Alejandro Gómez
  ('Alejandro Gomez', 'Alejandro Gómez'),
  -- Alexey Metalnikov
  ('Aleksey Metalnikov', 'Alexey Metalnikov'),
  -- Alessandro Giannini
  ('Alessandro Giannin', 'Alessandro Giannini'),
  -- Andrés García
  ('Andrés Garcia', 'Andrés García'),
  ('Andres Garcia', 'Andrés García'),
  -- Spelling variants (accents, case, whitespace) found
  -- when adding seasons 8-10
  -- Alberto Ramírez
  ('Alberto Ramirez', 'Alberto Ramírez'),
  -- Alfredo Perez Piaya
  ('Alfredo Pérez Piaya ', 'Alfredo Perez Piaya'),
  -- Eloy Díaz
  ('Eloy Diaz', 'Eloy Díaz'),
  -- Esteban Benítez
  ('Esteban Benitez', 'Esteban Benítez'),
  -- Francisco L. García
  ('Francisco L. Garcia', 'Francisco L. García'),
  -- Francisco López
  ('Francisco Lopez', 'Francisco López'),
  -- Ismael López
  ('Ismael Lopez', 'Ismael López'),
  -- Istvan Simon
  ('Istvan Simón', 'Istvan Simon'),
  -- Javier López
  ('Javier Lopez', 'Javier López'),
  -- Jerónimo Varela
  ('Jeronimo Varela', 'Jerónimo Varela'),
  -- Jesús Bermúdez
  ('Jesus Bermudez', 'Jesús Bermúdez'),
  ('Jesús Bermudez', 'Jesús Bermúdez'),
  -- Joaquín Almagro
  ('Joaquin Almagro', 'Joaquín Almagro'),
  -- Joaquín Guerrero
  ('Joaquin Guerrero', 'Joaquín Guerrero'),
  -- Jorge Gálvez
  ('Jorge Galvez', 'Jorge Gálvez'),
  -- Jorge Martín
  ('Jorge Martin', 'Jorge Martín'),
  -- Jose María Cantero
  ('Jose Maria Cantero', 'Jose María Cantero'),
  -- Josemi Ortiz
  ('Josemi Ortíz', 'Josemi Ortiz'),
  -- José Alejandro Lopez
  ('Jose Alejandro Lopez', 'José Alejandro Lopez'),
  -- José Cantero
  ('Jose Cantero', 'José Cantero'),
  -- José Madrid
  ('Jose Madrid', 'José Madrid'),
  -- José Manuel Gajate
  ('Jose Manuel Gajate', 'José Manuel Gajate'),
  -- José Segura
  ('Jose Segura', 'José Segura'),
  -- José Sánchez Nieto
  ('Jose Sanchez Nieto', 'José Sánchez Nieto'),
  ('Jose Sánchez Nieto', 'José Sánchez Nieto'),
  ('José Sanchez Nieto', 'José Sánchez Nieto'),
  -- Juan Alarcón
  ('Juan Alarcon', 'Juan Alarcón'),
  -- Juan Andrés Muñoz
  ('Juan Andres Muñoz', 'Juan Andrés Muñoz'),
  -- Loren Arambula
  ('Loren Arambúla', 'Loren Arambula'),
  -- Nacho García
  ('Nacho Garcia', 'Nacho García'),
  -- Nicolás Lemolo
  ('Nicolas Lemolo', 'Nicolás Lemolo'),
  -- Raúl Liébana
  ('Raul Liebana', 'Raúl Liébana'),
  -- Raúl Lorente
  ('Raul Lorente', 'Raúl Lorente'),
  -- Renato García
  ('Renato Garcia', 'Renato García'),
  -- Rubén Yanes
  ('Ruben Yanes', 'Rubén Yanes'),
  -- Rustam Abduraufov
  ('Rustam Abduraufov ', 'Rustam Abduraufov'),
  -- Salvador González
  ('Salvador Gonzalez', 'Salvador González'),
  -- Santiago del Rio
  ('Santiago Del Rio', 'Santiago del Rio'),
  -- Sebastián Prieto
  ('Sebastian Prieto', 'Sebastián Prieto'),
  -- Álvaro Corpas
  ('Alvaro Corpas', 'Álvaro Corpas'),
  -- Álvaro Santos
  ('Alvaro Santos', 'Álvaro Santos'),
  -- Álvaro Serrano
  ('Alvaro Serrano', 'Álvaro Serrano');

-- Fail if any alias or canonical name does not exist (e.g. a typo or
-- a player renamed in the source data), instead of silently skipping it
SELECT error('Unknown player in player_aliases: ' || string_agg(n, ', '))
FROM (
  SELECT alias AS n FROM player_aliases
  UNION
  SELECT canonical FROM player_aliases
) names
WHERE n NOT IN (SELECT name FROM players)
HAVING count(*) > 0;

CREATE TEMP TABLE player_merge AS
SELECT pa.id AS alias_id,
       pc.id AS canonical_id
FROM player_aliases a
     INNER JOIN players pa ON pa.name = a.alias
     INNER JOIN players pc ON pc.name = a.canonical;

UPDATE seasons_players
SET player_id = m.canonical_id
FROM player_merge m
WHERE player_id = m.alias_id;

-- A player may now be enrolled twice in the same season
DELETE FROM seasons_players
WHERE rowid NOT IN (
  SELECT min(rowid)
  FROM seasons_players
  GROUP BY season_id, player_id
);

UPDATE cycle_standings
SET player_id = m.canonical_id
FROM player_merge m
WHERE player_id = m.alias_id;

UPDATE results_cycles
SET player_a_id = m.canonical_id
FROM player_merge m
WHERE player_a_id = m.alias_id;

UPDATE results_cycles
SET player_b_id = m.canonical_id
FROM player_merge m
WHERE player_b_id = m.alias_id;

UPDATE results_cycles
SET super_tie_break_winner_id = m.canonical_id
FROM player_merge m
WHERE super_tie_break_winner_id = m.alias_id;

UPDATE results_cycles
SET retired_player_id = m.canonical_id
FROM player_merge m
WHERE retired_player_id = m.alias_id;

UPDATE results_playoffs
SET player_a_id = m.canonical_id
FROM player_merge m
WHERE player_a_id = m.alias_id;

UPDATE results_playoffs
SET player_b_id = m.canonical_id
FROM player_merge m
WHERE player_b_id = m.alias_id;

UPDATE results_playoffs
SET super_tie_break_winner_id = m.canonical_id
FROM player_merge m
WHERE super_tie_break_winner_id = m.alias_id;

UPDATE results_playoffs
SET retired_player_id = m.canonical_id
FROM player_merge m
WHERE retired_player_id = m.alias_id;

DELETE FROM players
WHERE id IN (SELECT alias_id FROM player_merge);

DROP TABLE player_merge;
DROP TABLE player_aliases;
