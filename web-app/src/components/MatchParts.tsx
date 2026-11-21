import { Link } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { formatPlayoffGroup, Match, shortRound } from "../lib/matches";
import { h2hPath } from "../routes";

export function ResultBadge({ won, pill = false }: { won: boolean; pill?: boolean }) {
  const intl = useIntl();
  return (
    <>
      <span
        className={"result-badge" + (pill ? " result-badge--pill" : "") + (won ? " is-win" : "")}
        title={intl.formatMessage({ id: won ? "result.won" : "result.lost" })}
        aria-hidden="true"
      >
        <FormattedMessage id={won ? "result.wonShort" : "result.lostShort"} />
      </span>
      <span className="visually-hidden">
        <FormattedMessage id={won ? "result.won" : "result.lost"} />
      </span>
    </>
  );
}

/** One fixed-width cell per set so columns line up from row to row */
export function ScoreLine({ match }: { match: Match }) {
  return (
    <span className="score-line">
      {match.sets.map((set, i) => (
        <span key={i} className={set.mine > set.theirs ? "is-won" : undefined}>
          {set.mine}-{set.theirs}
        </span>
      ))}
    </span>
  );
}

/** "Ciclo 6 · Grupo 9" or "Play-off B · Octavos" */
export function usePhaseLabel() {
  const intl = useIntl();
  return (match: Match, { withRound = true }: { withRound?: boolean } = {}) =>
    match.kind === "cycle"
      ? intl.formatMessage({ id: "phase.cycleGroup" }, { cycle: match.cycle, group: match.group })
      : [formatPlayoffGroup(match.playoffGroup), withRound ? shortRound(match.round) : ""]
          .filter(Boolean)
          .join(" · ");
}

function PlayerLine({
  name,
  seed,
  retired,
  cells,
  isWinner,
  isMe,
}: {
  name: string;
  seed: number | null;
  retired: boolean;
  cells: number[];
  isWinner: boolean;
  isMe: boolean;
}) {
  return (
    <div className={"match-card__line" + (isWinner ? " is-winner" : "") + (isMe ? " is-me" : "")}>
      <span className="match-card__name">
        {name}
        {seed != null && <span className="match-card__tag">({seed})</span>}
        {retired && (
          <span className="match-card__tag">
            <FormattedMessage id="match.retired" />
          </span>
        )}
      </span>
      <span className="match-card__cells">
        {cells.map((value, i) => (
          <span key={i}>{value}</span>
        ))}
      </span>
    </div>
  );
}

/**
 * Two-row scoreboard: the player on top, the opponent below. A neutral card
 * (a match between two other players) has no win/loss badge.
 */
export function MatchCard({ match, context, neutral = false }: { match: Match; context: string; neutral?: boolean }) {
  return (
    <article className="match-card">
      <div className="match-card__meta">
        <span>{context}</span>
        {!neutral && <ResultBadge won={match.won} pill />}
      </div>
      <PlayerLine
        name={match.playerName}
        seed={match.playerSeed}
        retired={match.playerRetired}
        cells={match.sets.map((s) => s.mine)}
        isWinner={match.won}
        isMe={!neutral}
      />
      <PlayerLine
        name={match.opponentName}
        seed={match.opponentSeed}
        retired={match.opponentRetired}
        cells={match.sets.map((s) => s.theirs)}
        isWinner={!match.won}
        isMe={false}
      />
    </article>
  );
}

/** Row in the full match list (card on mobile, table row on desktop) */
export function MatchRow({ match }: { match: Match }) {
  const phaseLabel = usePhaseLabel();
  const mobileMeta = [match.kind === "playoff" ? shortRound(match.round) : null, match.club]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="match-row">
      <span className="match-row__badge">
        <ResultBadge won={match.won} />
      </span>
      <span className="match-row__phase">
        {match.kind === "playoff" ? (
          <>
            <span className="playoff-tag">{formatPlayoffGroup(match.playoffGroup)}</span>
            {shortRound(match.round)}
          </>
        ) : (
          phaseLabel(match)
        )}
      </span>
      <span className="match-row__who">
        <Link to={h2hPath(match.playerId, match.opponentId)} className="match-row__opponent">
          {match.opponentName}
          {match.opponentRetired && (
            <>
              {" "}
              <FormattedMessage id="match.retired" />
            </>
          )}
        </Link>
        {mobileMeta && <span className="match-row__meta">{mobileMeta}</span>}
      </span>
      <span className="match-row__score">
        <ScoreLine match={match} />
      </span>
      <span className="match-row__club">{match.club ?? "—"}</span>
      <Link to={h2hPath(match.playerId, match.opponentId)} className="match-row__action">
        <FormattedMessage id="matches.h2hLink" />
      </Link>
    </li>
  );
}

/** Compact row for a head-to-head meeting on desktop: both names are already in the hero */
export function MeetingRow({ match }: { match: Match }) {
  const intl = useIntl();
  const phaseLabel = usePhaseLabel();
  const retired = match.opponentRetired
    ? match.opponentName
    : match.playerRetired
      ? match.playerName
      : null;
  return (
    <li className="meeting-row">
      <ResultBadge won={match.won} />
      <span className="meeting-row__when">
        <span className="meeting-row__phase">
          {intl.formatMessage({ id: "season.short" }, { season: match.season })} · {phaseLabel(match)}
        </span>
        <span className="meeting-row__meta">
          {[match.club, retired && intl.formatMessage({ id: "match.retiredBy" }, { name: retired })]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </span>
      <ScoreLine match={match} />
    </li>
  );
}
