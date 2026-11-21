-- Sanity checks run by build-db.sh on the freshly built database.
-- Each failing check raises an error, so the build stops and nothing is
-- published. Older seasons have a few known gaps (names the parser could
-- not read), so the strict checks only cover the current season.

CREATE TEMP TABLE current_season AS
SELECT max(season_id) AS season_id FROM cycles;

-- Every scraped standings row of the current season was loaded
-- (a row is dropped when its cycle or player is missing)
SELECT CASE WHEN loaded <> scraped THEN error(format(
  'Current season standings: {} rows scraped but {} loaded', scraped, loaded)) END
FROM (
  SELECT (SELECT count(*)
          FROM read_csv('data-scraper/standings.csv', delim = ',', header = true) csv
          WHERE csv.season_id = (SELECT season_id FROM current_season)) AS scraped,
         (SELECT count(*)
          FROM cycle_standings cs JOIN cycles cy ON cs.cycle_id = cy.id
          WHERE cy.season_id = (SELECT season_id FROM current_season)) AS loaded
);

-- Every scraped result of the current season was loaded
SELECT CASE WHEN loaded <> scraped THEN error(format(
  'Current season results: {} rows scraped but {} loaded', scraped, loaded)) END
FROM (
  SELECT (SELECT count(*)
          FROM read_csv('data-scraper/results.csv', delim = ',', header = true) csv
          WHERE csv.season = (SELECT season_id FROM current_season)) AS scraped,
         (SELECT count(*)
          FROM results_cycles
          WHERE season_id = (SELECT season_id FROM current_season)) AS loaded
);

-- The newest regular cycle has standings
SELECT CASE WHEN n = 0 THEN error(format(
  'Season {} {} has no standings', season_id, name)) END
FROM (
  SELECT cy.season_id, cy.name,
         (SELECT count(*) FROM cycle_standings cs WHERE cs.cycle_id = cy.id) AS n
  FROM cycles cy
  WHERE cy.name <> 'Play Off'
  ORDER BY cy.start_date DESC
  LIMIT 1
);

-- Both players of every current season result are in that group's standings
SELECT CASE WHEN count(*) > 0 THEN error(format(
  '{} current season results have a player who is not in the group standings, e.g. season {} cycle {} group {}',
  count(*), min(r.season_id), min(r.cycle_order), min(r.group_number))) END
FROM results_cycles r
     JOIN cycles cy ON cy.season_id = r.season_id AND cy.cycle_order = r.cycle_order
WHERE r.season_id = (SELECT season_id FROM current_season)
  AND (NOT EXISTS (FROM cycle_standings cs
                   WHERE cs.cycle_id = cy.id AND cs.group_number = r.group_number
                     AND cs.player_id = r.player_a_id)
       OR NOT EXISTS (FROM cycle_standings cs
                      WHERE cs.cycle_id = cy.id AND cs.group_number = r.group_number
                        AND cs.player_id = r.player_b_id));
