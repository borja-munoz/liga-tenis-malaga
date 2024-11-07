import { useQuery } from "@tanstack/react-query";

import { executeQuery } from "../db/duckdb";

// Models are implemented as custom hooks
// to cache the query results using React Query

function useExecuteQuery(queryKeys: string[], query: string) {
  return useQuery({
    queryKey: queryKeys,
    queryFn: async () => {
      const arrowTable = await executeQuery(query);
      // console.log("Rows: " + arrowTable?.numRows);
      return arrowTable;
    },
  });
}

export function usePlayers() {
  const query = `
    SELECT *
    FROM players
    ORDER BY name
  `;
  return useExecuteQuery(["players"], query);
}

export function usePlayerResultsCycles(playerName: string) {
  const query = `
    SELECT r.*, 
           p1.name AS player_a, 
           p2.name AS player_b, 
           p3.name AS super_tie_break_winner, 
           p4.name AS retired_player,
           cl.name AS club
    FROM results_cycles r
         LEFT OUTER JOIN players p1 ON r.player_a_id = p1.id
         LEFT OUTER JOIN players p2 ON r.player_b_id = p2.id
         LEFT OUTER JOIN players p3 ON r.super_tie_break_winner_id = p3.id
         LEFT OUTER JOIN players p4 ON r.retired_player_id = p4.id
         LEFT OUTER JOIN clubs cl ON r.club_id = cl.id
    WHERE p1.name = '${playerName}' OR
          p2.name = '${playerName}' 
    ORDER BY r.season_id, r.cycle_order
  `;
  return useExecuteQuery(["playerResultsCycles", playerName], query);
}

export function usePlayerResultsPlayoffs(playerName: string) {
  const query = `
    SELECT r.*, 
           p1.name AS player_a, 
           p2.name AS player_b, 
           p3.name AS super_tie_break_winner, 
           p4.name AS retired_player,
           cl.name AS club
    FROM results_playoffs r
         LEFT OUTER JOIN players p1 ON r.player_a_id = p1.id
         LEFT OUTER JOIN players p2 ON r.player_b_id = p2.id
         LEFT OUTER JOIN players p3 ON r.super_tie_break_winner_id = p3.id
         LEFT OUTER JOIN players p4 ON r.retired_player_id = p4.id
         LEFT OUTER JOIN clubs cl ON r.club_id = cl.id
    WHERE p1.name = '${playerName}' OR
          p2.name = '${playerName}' 
    ORDER BY r.season_id, r.group_name, r.round_order
  `;
  return useExecuteQuery(["playerResultsPlayoffs", playerName], query);
}

export function useCycles(playerName: string) {
  const query = `
    SELECT group_number,
           cy.cycle_order as cycle,
           cy.season_id as season,
           cy.start_date,
           cs.position,
           cs.points
    FROM cycle_standings cs
         INNER JOIN players pl ON cs.player_id = pl.id
         INNER JOIN cycles cy ON cs.cycle_id = cy.id
    WHERE pl.name = '${playerName}' 
    ORDER BY start_date
  `;
  return useExecuteQuery(["cycles", playerName], query);
}
