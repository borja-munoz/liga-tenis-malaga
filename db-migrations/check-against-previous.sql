-- Compares the freshly built database with the published one (attached as
-- "previous"): no cycle may lose standings rows or results. A drop usually
-- means a page was parsed badly or the site removed data.

SELECT CASE WHEN count(*) > 0 THEN error(
  'Cycles with fewer rows than in the published database: ' ||
  string_agg(format('season {} cycle {} ({} standings → {}, {} results → {})',
                    season_id, cycle_order, old_standings, new_standings,
                    old_results, new_results), '; ')) END
FROM (
  WITH counts AS (
    SELECT cy.season_id, cy.cycle_order,
           (SELECT count(*) FROM cycle_standings cs WHERE cs.cycle_id = cy.id) AS standings,
           (SELECT count(*) FROM results_cycles r
            WHERE r.season_id = cy.season_id AND r.cycle_order = cy.cycle_order) AS results
    FROM cycles cy
  ),
  old_counts AS (
    SELECT cy.season_id, cy.cycle_order,
           (SELECT count(*) FROM previous.cycle_standings cs WHERE cs.cycle_id = cy.id) AS standings,
           (SELECT count(*) FROM previous.results_cycles r
            WHERE r.season_id = cy.season_id AND r.cycle_order = cy.cycle_order) AS results
    FROM previous.cycles cy
  )
  SELECT o.season_id, o.cycle_order,
         o.standings AS old_standings, coalesce(n.standings, 0) AS new_standings,
         o.results AS old_results, coalesce(n.results, 0) AS new_results
  FROM old_counts o
       LEFT JOIN counts n USING (season_id, cycle_order)
  WHERE coalesce(n.standings, 0) < o.standings OR coalesce(n.results, 0) < o.results
);
