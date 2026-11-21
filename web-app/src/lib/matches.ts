// Match and cycle helpers shared by every page.
// All numbers are computed from the point of view of one player.

export type MatchKind = 'cycle' | 'playoff';

export interface SetScore {
  mine: number;
  theirs: number;
  /** Super tie-break (stored as a winner id in cycles, as a 1-0 "set" in play-offs) */
  tieBreak?: boolean;
}

export interface Match {
  key: string;
  kind: MatchKind;
  season: number;
  cycle: number | null;
  group: number | null;
  playoffGroup: string | null;
  round: string | null;
  roundOrder: number | null;
  playerId: number;
  playerName: string;
  opponentId: number;
  opponentName: string;
  playerSeed: number | null;
  opponentSeed: number | null;
  club: string | null;
  sets: SetScore[];
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  superTieBreak: 'won' | 'lost' | null;
  playerRetired: boolean;
  opponentRetired: boolean;
  won: boolean;
  /** Chronological sort key (season, then cycles, then play-off rounds) */
  order: number;
}

/** Raw row returned by usePlayerMatches (see models/model.ts) */
export interface MatchRow {
  kind: MatchKind;
  id: number;
  season_id: number;
  cycle_order: number | null;
  group_number: number | null;
  group_name: string | null;
  round: string | null;
  round_order: number | null;
  player_a_id: number;
  player_b_id: number;
  player_a_name: string | null;
  player_b_name: string | null;
  player_a_seed: number | null;
  player_b_seed: number | null;
  a1: number | null;
  b1: number | null;
  a2: number | null;
  b2: number | null;
  a3: number | null;
  b3: number | null;
  stb_id: number | null;
  retired_id: number | null;
  club: string | null;
}

export function normalizeMatch(row: MatchRow, playerId: number): Match {
  const isA = row.player_a_id === playerId;
  const pick = (a: number | null, b: number | null): [number, number] =>
    isA ? [a ?? 0, b ?? 0] : [b ?? 0, a ?? 0];

  const [m1, t1] = pick(row.a1, row.b1);
  const [m2, t2] = pick(row.a2, row.b2);
  const sets: SetScore[] = [
    { mine: m1, theirs: t1 },
    { mine: m2, theirs: t2 },
  ];
  let setsWon = (m1 > t1 ? 1 : 0) + (m2 > t2 ? 1 : 0);
  let setsLost = 2 - setsWon;
  let gamesWon = m1 + m2;
  let gamesLost = t1 + t2;

  // Third set (play-offs store the super tie-break here as 1-0)
  if (row.a3 != null && row.b3 != null) {
    const [m3, t3] = pick(row.a3, row.b3);
    sets.push({ mine: m3, theirs: t3, tieBreak: m3 + t3 <= 1 });
    if (m3 > t3) setsWon += 1;
    else setsLost += 1;
    gamesWon += m3;
    gamesLost += t3;
  }

  // Super tie-break (cycles store only the winner)
  let superTieBreak: Match['superTieBreak'] = null;
  if (row.stb_id != null) {
    superTieBreak = row.stb_id === playerId ? 'won' : 'lost';
    if (sets.length === 2) {
      sets.push({
        mine: superTieBreak === 'won' ? 1 : 0,
        theirs: superTieBreak === 'won' ? 0 : 1,
        tieBreak: true,
      });
    }
  }

  const playerRetired = row.retired_id === playerId;
  const opponentRetired = row.retired_id != null && row.retired_id !== playerId;
  const won =
    opponentRetired ||
    superTieBreak === 'won' ||
    (setsWon === 2 && !playerRetired);

  const order =
    row.season_id * 1000 +
    (row.kind === 'playoff' ? 500 + (row.round_order ?? 0) : row.cycle_order ?? 0);

  return {
    key: `${row.kind}-${row.id}`,
    kind: row.kind,
    season: row.season_id,
    cycle: row.cycle_order,
    group: row.group_number,
    playoffGroup: row.group_name,
    round: row.round,
    roundOrder: row.round_order,
    playerId,
    playerName: (isA ? row.player_a_name : row.player_b_name) ?? '',
    opponentId: isA ? row.player_b_id : row.player_a_id,
    opponentName: (isA ? row.player_b_name : row.player_a_name) ?? '',
    playerSeed: isA ? row.player_a_seed : row.player_b_seed,
    opponentSeed: isA ? row.player_b_seed : row.player_a_seed,
    club: row.club,
    sets,
    setsWon,
    setsLost,
    gamesWon,
    gamesLost,
    superTieBreak,
    playerRetired,
    opponentRetired,
    won,
    order,
  };
}

/** Newest first */
export function sortMatchesDesc(matches: Match[]): Match[] {
  return [...matches].sort((a, b) => b.order - a.order || b.key.localeCompare(a.key));
}

export interface PlayerSummary {
  played: number;
  won: number;
  lost: number;
  winRate: number; // 0..100, rounded
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
  superTieBreaksWon: number;
  superTieBreaksLost: number;
  retired: number;
  playoffs: number;
  playoffsWon: number;
}

export function summarizeMatches(matches: Match[]): PlayerSummary {
  const s: PlayerSummary = {
    played: matches.length,
    won: 0,
    lost: 0,
    winRate: 0,
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
    superTieBreaksWon: 0,
    superTieBreaksLost: 0,
    retired: 0,
    playoffs: 0,
    playoffsWon: 0,
  };
  for (const m of matches) {
    if (m.won) s.won += 1;
    else s.lost += 1;
    s.setsWon += m.setsWon;
    s.setsLost += m.setsLost;
    s.gamesWon += m.gamesWon;
    s.gamesLost += m.gamesLost;
    if (m.superTieBreak === 'won') s.superTieBreaksWon += 1;
    if (m.superTieBreak === 'lost') s.superTieBreaksLost += 1;
    if (m.playerRetired) s.retired += 1;
    if (m.kind === 'playoff') {
      s.playoffs += 1;
      if (m.won) s.playoffsWon += 1;
    }
  }
  s.winRate = percent(s.won, s.played);
  return s;
}

export interface CycleStanding {
  season: number;
  cycle: number;
  group: number;
  position: number | null;
  points: number | null;
  startDate: number | null;
  /** Cycle still being played: position and points can still change */
  provisional?: boolean;
}

export interface CycleSummary {
  seasons: number;
  cycles: number;
  bestGroup: number | null;
  bestGroupIndex: number; // index in the chronological list, -1 if none
  totalPoints: number;
  lastGroup: number | null;
  lastSeason: number | null;
  lastCycle: number | null;
}

export function summarizeCycles(rows: CycleStanding[]): CycleSummary {
  const seasons = new Set<number>();
  let bestGroup: number | null = null;
  let bestGroupIndex = -1;
  let totalPoints = 0;
  rows.forEach((r, i) => {
    seasons.add(r.season);
    // Latest occurrence of the best group wins (it's the one worth highlighting)
    if (bestGroup === null || r.group <= bestGroup) {
      bestGroup = r.group;
      bestGroupIndex = i;
    }
    if (!r.provisional) totalPoints += r.points ?? 0;
  });
  const last = rows[rows.length - 1];
  return {
    seasons: seasons.size,
    cycles: rows.length,
    bestGroup,
    bestGroupIndex,
    totalPoints,
    lastGroup: last?.group ?? null,
    lastSeason: last?.season ?? null,
    lastCycle: last?.cycle ?? null,
  };
}

export interface SeasonRecord {
  season: number;
  won: number;
  lost: number;
}

export function recordsBySeason(matches: Match[]): SeasonRecord[] {
  const bySeason = new Map<number, SeasonRecord>();
  for (const m of matches) {
    const r = bySeason.get(m.season) ?? { season: m.season, won: 0, lost: 0 };
    if (m.won) r.won += 1;
    else r.lost += 1;
    bySeason.set(m.season, r);
  }
  return [...bySeason.values()].sort((a, b) => b.season - a.season);
}

export interface MatchPhaseGroup {
  key: string;
  kind: MatchKind;
  cycle: number | null;
  group: number | null;
  playoffGroup: string | null;
  matches: Match[];
}

export interface MatchSeasonGroup {
  season: number;
  won: number;
  lost: number;
  phases: MatchPhaseGroup[];
}

/** Groups an already-sorted list into seasons and phases (cycle or play-off group), keeping order */
export function groupMatches(matches: Match[]): MatchSeasonGroup[] {
  const seasons: MatchSeasonGroup[] = [];
  for (const m of matches) {
    let season = seasons[seasons.length - 1];
    if (!season || season.season !== m.season) {
      season = { season: m.season, won: 0, lost: 0, phases: [] };
      seasons.push(season);
    }
    if (m.won) season.won += 1;
    else season.lost += 1;
    const phaseKey = m.kind === 'cycle' ? `c-${m.cycle}` : `p-${m.playoffGroup}`;
    let phase = season.phases[season.phases.length - 1];
    if (!phase || phase.key !== phaseKey) {
      phase = {
        key: phaseKey,
        kind: m.kind,
        cycle: m.cycle,
        group: m.group,
        playoffGroup: m.playoffGroup,
        matches: [],
      };
      season.phases.push(phase);
    }
    phase.matches.push(m);
  }
  return seasons;
}

export interface OpponentRecord {
  id: number;
  name: string;
  played: number;
  won: number;
  lost: number;
}

/** Most frequent opponents, most played first */
export function opponentRecords(matches: Match[]): OpponentRecord[] {
  const map = new Map<number, OpponentRecord>();
  for (const m of matches) {
    const r = map.get(m.opponentId) ?? { id: m.opponentId, name: m.opponentName, played: 0, won: 0, lost: 0 };
    r.played += 1;
    if (m.won) r.won += 1;
    else r.lost += 1;
    map.set(m.opponentId, r);
  }
  return [...map.values()].sort((a, b) => b.played - a.played || a.name.localeCompare(b.name));
}

export function percent(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** "PLAY OFF B" → "Play-off B" */
export function formatPlayoffGroup(name: string | null): string {
  if (!name) return 'Play-off';
  return name.replace(/play\s*-?\s*off/i, 'Play-off');
}

/** Drops "de final" from round names to keep rows short ("Octavos de final" → "Octavos") */
export function shortRound(round: string | null): string {
  if (!round) return '';
  return round.replace(/\s+de\s+final$/i, '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Accent- and case-insensitive text for matching ("Muñoz" ~ "munoz") */
export function foldText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function formatBalance(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}
