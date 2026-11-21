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
  ('Jose Cantero', 'Jose María Cantero'),
  -- José Madrid
  ('Jose Madrid', 'José Madrid'),
  -- José Manuel Gajate
  ('Jose Manuel Gajate', 'José Manuel Gajate'),
  -- José Segura
  ('Jose Segura', 'Jose Segura Guerrero'),
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
  ('Nicolas Lemolo', 'Nicolás Iemolo'),
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
  ('Salvador Gonzalez', 'Salvador González Novoa'),
  -- Santiago del Rio
  ('Santiago Del Rio', 'Santiago del Rio'),
  -- Sebastián Prieto
  ('Sebastian Prieto', 'Sebastián Prieto'),
  -- Álvaro Corpas
  ('Alvaro Corpas', 'Álvaro Corpas'),
  -- Álvaro Santos
  ('Alvaro Santos', 'Álvaro Santos'),
  -- Álvaro Serrano
  ('Alvaro Serrano', 'Álvaro Serrano'),
  -- Variants reviewed manually (accents, typos, initials,
  -- short vs full names)
  ('Antonio Calderon', 'Antonio Calderón'),
  ('Antonio Ramírez', 'Antonio Ramírez Medina'),
  ('Antonio Ramirez', 'Antonio Ramírez Medina'),
  ('Axel Lopez', 'Áxel López'),
  ('Cristobal Gómez', 'Cristóbal Gómez'),
  ('Daniel Fernandez', 'Daniel Fernández'),
  ('Eduardo Leon', 'Eduardo León'),
  ('Francisco Garcia', 'Francisco García'),
  ('Jesus Ramírez', 'Jesús Ramírez'),
  ('Jesus Vázquez', 'Jesús Vazquez'),
  ('Jose Cano', 'José Cano'),
  ('Jose Carlos Torres', 'José Carlos Torres'),
  ('José Carlos Torres (lesionado', 'José Carlos Torres'),
  ('Jose Maria del Pino', 'José María del Pino'),
  ('Jose Ugart', 'José Ugart'),
  ('Leandro', 'Leandro Nicolini'),
  ('Leandro ', 'Leandro Nicolini'),
  ('Manuel Chaneta ', 'Manuel Chaneta'),
  ('Matías Suarez', 'Matías Suárez'),
  ('Miguel Angel Ramos', 'Miguel Ángel Ramos'),
  ('Miguel Martin', 'Miguel Martín'),
  ('Nicolas Multisanti', 'Nicolás Multisanti'),
  ('Pablo Garcia', 'Pablo García'),
  ('Ruben Jiménez', 'Rubén Jiménez'),
  ('Tomas Mazowski', 'Tomás Mazowski'),
  ('Dennis Kranendok', 'Dennis Kranendonk'),
  ('Filippo Gioielo', 'Filippo Gioiello'),
  ('Gustavo Garcí', 'Gustavo García'),
  ('Guy Wynter', 'Guy Winter'),
  ('Jussie Toivanen', 'Jussi Toivanen'),
  ('Steffano Brunetti', 'Stefano  Brunetti'),
  ('Nicolás Lemolo', 'Nicolás Iemolo'),
  ('David del Prado', 'David de Prado'),
  ('David de Prado Rodríguez', 'David de Prado'),
  ('Pedro Javier Rodríguez XX', 'Pedro Javier Rodríguez'),
  ('Guillermo Martín', 'Guillermo Martín Carro'),
  ('Guillero Martin', 'Guillermo Martín Carro'),
  ('Jose I. Medina', 'Jose Ignacio Medina'),
  ('José Ignacio Medina Spiteri', 'Jose Ignacio Medina'),
  ('Miguel A. Vargas', 'Miguel Ángel Vargas'),
  ('Miguel Angel Vargas Campaña', 'Miguel Ángel Vargas'),
  ('Juan A. Tabernero', 'Juan Antonio Tabernero'),
  ('Juan A. Muñoz', 'Juan Andrés Muñoz'),
  ('Jose A. Rivero', 'José Andrés Rivero'),
  ('Jose M. Gajate', 'José Manuel Gajate'),
  ('Jose Gajate', 'José Manuel Gajate'),
  ('Daniel F. Tamayo', 'Daniel Fernández Tamayo'),
  ('José Cantero', 'Jose María Cantero'),
  ('Jose M. Cantero', 'Jose María Cantero'),
  ('Antonio Mora', 'Antonio Mora-Figueroa'),
  ('Antonio Pelaez', 'Antonio Peláez Aguilera'),
  ('Carlos Perez', 'Carlos Pérez Merino'),
  ('Carlos Merino', 'Carlos Pérez Merino'),
  ('Cesar Henry', 'Cesar Henry Sotomayor'),
  ('Cesar Sotomayor', 'Cesar Henry Sotomayor'),
  ('Curro Ramos', 'Curro Ramos Olmedo'),
  ('Daniel Jimenez Rodriguez', 'Daniel Jimenez'),
  ('David Andres', 'David Andrés Pérez'),
  ('Eduardo Ariza', 'Eduardo Ariza Tello'),
  ('Enrique Monereo López', 'Enrique Monereo'),
  ('Fernando Arias Barrón', 'Fernando Arias'),
  ('Francisco de Paula', 'Francisco de Paula García'),
  ('German Raul', 'Germán Raúl Cebrián'),
  ('Germán Cebrián', 'Germán Raúl Cebrián'),
  ('Ignacio Moreno', 'Ignacio Moreno Dávila'),
  ('Javier Ariño', 'Javier Ariño García'),
  ('Javier Urbieta', 'Javier Urbieta Arias'),
  ('Javier Del Pino', 'Javier del Pino Romero'),
  ('Jorge Cejudo', 'Jorge Cejudo Sempere'),
  ('Jose Castro', 'Jose Castro Rojas'),
  ('Jose Manuel Castro', 'Jose Castro Rojas'),
  ('José Segura', 'Jose Segura Guerrero'),
  ('José Madrid Márquez', 'José Madrid'),
  ('Jose Rodriguez', 'José Rodriguez Vega'),
  ('Juan Bautista', 'Juan Bautista García Collado'),
  ('Luis Gil', 'Luis Gil-Delgado'),
  ('Luis Mesa Garcia', 'Luis Mesa'),
  ('Maria Fernanda', 'Maria Fernanda Quinto'),
  ('Miguel Erik Garcia', 'Miguel Erik'),
  ('Miguel Martín Pérez', 'Miguel Martín'),
  ('Oscar Pacheco Crincoli', 'Oscar Pacheco'),
  ('Pedro Parada', 'Pedro Parada Avendaño'),
  ('Ricardo Ramos', 'Ricardo Ramos Ruiz'),
  ('Ricardo Toma', 'Ricardo Toma Freitag'),
  ('Roberto Gomar', 'Roberto Gomar Monio'),
  ('Salvador González', 'Salvador González Novoa'),
  ('Salvador Ruiz Vera', 'Salvador Ruiz'),
  ('Santiago Ventoso', 'Santiago Ventoso Faccio'),
  ('Manuel Santos de la Coba', 'Manuel de la Coba'),
  ('Javier Silva', 'Javier Silva Silva'),
  ('Manuel Solla', 'Manu Solla'),
  ('Manu', 'Manu Solla'),
  ('Baldo', 'Baldo Foxo'),
  ('Josemi', 'Josemi Ortiz'),
  ('Renato', 'Renato García'),
  ('Rustam', 'Rustam Abduraufov'),
  ('Vidal', 'Vidal Claramonte');

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

-- Fail if a canonical name is also an alias: the merge is applied in a
-- single pass, so chains (A -> B -> C) must point straight to C
SELECT error('Canonical names that are also aliases: ' || string_agg(DISTINCT canonical, ', '))
FROM player_aliases
WHERE canonical IN (SELECT alias FROM player_aliases)
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
