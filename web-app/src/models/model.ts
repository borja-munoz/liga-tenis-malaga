import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { executeQuery } from "../db/duckdb";
import {
  CycleStanding,
  Match,
  MatchRow,
  normalizeMatch,
  sortMatchesDesc,
} from "../lib/matches";

// Models are implemented as custom hooks
// to cache the query results using React Query

function useRows<T>(queryKey: (string | number | null)[], query: string, enabled = true) {
  return useQuery({
    queryKey,
    enabled,
    staleTime: Infinity,
    queryFn: async () => {
      const table = await executeQuery(query);
      return (table?.toArray() ?? []).map((row) => row.toJSON() as T);
    },
  });
}

export interface Player {
  id: number;
  name: string;
}

export function usePlayers() {
  return useRows<Player>(
    ["players"],
    `SELECT id, name FROM players ORDER BY name`
  );
}

/** Player looked up by id from the (cached) player list */
export function usePlayer(playerId: number | null) {
  const { data, status } = usePlayers();
  const player = useMemo(
    () => (playerId == null ? null : data?.find((p) => p.id === playerId) ?? null),
    [data, playerId]
  );
  return { player, status };
}

/** Latest cycle that has standings, used for the "Temporada X · Ciclo Y" pill */
export function useCurrentCycle() {
  const { data, status } = useRows<{ season: number; cycle: number }>(
    ["currentCycle"],
    `SELECT cy.season_id AS season, cy.cycle_order AS cycle
     FROM cycles cy
     WHERE EXISTS (SELECT 1 FROM cycle_standings cs WHERE cs.cycle_id = cy.id)
     ORDER BY cy.start_date DESC
     LIMIT 1`
  );
  return { current: data?.[0] ?? null, status };
}

/** Every match (cycles + play-offs) of a player, newest first, from their point of view */
export function usePlayerMatches(playerId: number | null) {
  const id = Number(playerId);
  const enabled = playerId != null && Number.isInteger(id);
  const query = `
    SELECT m.*,
           pa.name AS player_a_name,
           pb.name AS player_b_name,
           cl.name AS club
    FROM (
      SELECT 'cycle' AS kind, r.id, r.season_id, r.cycle_order, r.group_number,
             NULL::VARCHAR AS group_name, NULL::VARCHAR AS round, NULL::INTEGER AS round_order,
             r.player_a_id, r.player_b_id,
             NULL::INTEGER AS player_a_seed, NULL::INTEGER AS player_b_seed,
             r.games_won_player_a_set_one AS a1, r.games_won_player_b_set_one AS b1,
             r.games_won_player_a_set_two AS a2, r.games_won_player_b_set_two AS b2,
             NULL::INTEGER AS a3, NULL::INTEGER AS b3,
             r.super_tie_break_winner_id AS stb_id, r.retired_player_id AS retired_id, r.club_id
      FROM results_cycles r
      WHERE r.player_a_id = ${id} OR r.player_b_id = ${id}
      UNION ALL
      SELECT 'playoff' AS kind, r.id, r.season_id, NULL::INTEGER AS cycle_order, NULL::INTEGER AS group_number,
             r.group_name, r.round, r.round_order,
             r.player_a_id, r.player_b_id,
             r.player_a_seed, r.player_b_seed,
             r.games_won_player_a_set_one, r.games_won_player_b_set_one,
             r.games_won_player_a_set_two, r.games_won_player_b_set_two,
             r.games_won_player_a_set_three, r.games_won_player_b_set_three,
             r.super_tie_break_winner_id, r.retired_player_id, r.club_id
      FROM results_playoffs r
      WHERE r.player_a_id = ${id} OR r.player_b_id = ${id}
    ) m
    LEFT OUTER JOIN players pa ON m.player_a_id = pa.id
    LEFT OUTER JOIN players pb ON m.player_b_id = pb.id
    LEFT OUTER JOIN clubs cl ON m.club_id = cl.id
  `;
  const { data, status } = useRows<MatchRow>(["playerMatches", enabled ? id : null], query, enabled);
  const matches = useMemo<Match[] | undefined>(
    () => (data ? sortMatchesDesc(data.map((row) => normalizeMatch(row, id))) : undefined),
    [data, id]
  );
  return { matches, status: enabled ? status : ("idle" as const) };
}

/** Cycle standings of a player, oldest first */
export function usePlayerCycles(playerId: number | null) {
  const id = Number(playerId);
  const enabled = playerId != null && Number.isInteger(id);
  const query = `
    SELECT cy.season_id AS season,
           cy.cycle_order AS cycle,
           cs.group_number AS "group",
           cs.position,
           cs.points,
           epoch_ms(cy.start_date::TIMESTAMP) AS "startDate"
    FROM cycle_standings cs
         INNER JOIN cycles cy ON cs.cycle_id = cy.id
    WHERE cs.player_id = ${id}
    ORDER BY cy.start_date, cy.season_id, cy.cycle_order
  `;
  const { data, status } = useRows<CycleStanding>(["playerCycles", enabled ? id : null], query, enabled);
  const cycles = useMemo(
    () => data?.map((r) => ({ ...r, startDate: r.startDate == null ? null : Number(r.startDate) })),
    [data]
  );
  return { cycles, status: enabled ? status : ("idle" as const) };
}
