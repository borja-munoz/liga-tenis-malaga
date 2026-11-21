import { CSSProperties, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import {
  CurrentCycle,
  GroupStanding,
  useCurrentCycle,
  useCycleResults,
  useCycleStandings,
  useUpdatedAt,
} from "../models/model";
import { formatBalance, Match, MatchRow, normalizeMatch, percent } from "../lib/matches";
import { parseId } from "../lib/lastPlayer";
import { useMe } from "../lib/me";
import { groupPath, playerPath } from "../routes";
import PlayerSearch from "../components/PlayerSearch";
import { MatchCard } from "../components/MatchParts";
import { BackIcon, ForwardIcon } from "../components/Icons";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Current cycle: progress, standings and results of one group */
export default function HomePage() {
  const { group: param } = useParams();
  const { current, status } = useCurrentCycle();
  const { data: standings, status: standingsStatus } = useCycleStandings(current);
  const { data: results, status: resultsStatus } = useCycleResults(current);
  const [meId] = useMe();

  const groups = useMemo(() => groupStandings(standings ?? []), [standings]);
  const meGroup = useMemo(
    () => (meId == null ? null : standings?.find((s) => s.playerId === meId)?.group ?? null),
    [standings, meId]
  );

  if (status === "success" && !current) {
    return (
      <main className="page">
        <section className="card empty-state">
          <h2><FormattedMessage id="home.noCycleTitle" /></h2>
        </section>
      </main>
    );
  }
  if (!current || standingsStatus !== "success" || resultsStatus !== "success") {
    return (
      <main className="page">
        <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>
      </main>
    );
  }

  const numbers = [...groups.keys()];
  const requested = parseId(param);
  if (param != null && (requested == null || !groups.has(requested))) {
    return <Navigate to={groupPath()} replace />;
  }
  const group = requested ?? meGroup ?? numbers[0] ?? null;

  return (
    <CycleView
      cycle={current}
      groups={groups}
      group={group}
      results={results ?? []}
      meId={meId}
      meGroup={meGroup}
    />
  );
}

interface CycleViewProps {
  cycle: CurrentCycle;
  groups: Map<number, GroupStanding[]>;
  group: number | null;
  results: MatchRow[];
  meId: number | null;
  meGroup: number | null;
}

function CycleView({ cycle, groups, group, results, meId, meGroup }: CycleViewProps) {
  const intl = useIntl();
  const navigate = useNavigate();
  const [notPlaying, setNotPlaying] = useState<string | null>(null);

  const numbers = [...groups.keys()];
  const players = group != null ? groups.get(group) ?? [] : [];
  const index = group != null ? numbers.indexOf(group) : -1;
  const prev = index > 0 ? numbers[index - 1] : null;
  const next = index >= 0 && index < numbers.length - 1 ? numbers[index + 1] : null;

  const totalMatches = useMemo(
    () => [...groups.values()].reduce((sum, g) => sum + (g.length * (g.length - 1)) / 2, 0),
    [groups]
  );
  const groupResults = useMemo(() => results.filter((r) => r.group_number === group), [results, group]);
  const matches = useMemo(() => groupResults.map((r) => fromPointOfView(r, meId)), [groupResults, meId]);
  const pending = useMemo(() => pendingMatches(players, groupResults), [players, groupResults]);

  const findGroup = (playerId: number, name: string) => {
    for (const [number, rows] of groups) {
      if (rows.some((r) => r.playerId === playerId)) {
        setNotPlaying(null);
        navigate(groupPath(number));
        return;
      }
    }
    setNotPlaying(name);
  };

  return (
    <main className="page page--home">
      <h1 className="visually-hidden">
        <FormattedMessage id="season.withCycle" values={{ season: cycle.season, cycle: cycle.cycle }} />
      </h1>

      {meId == null && <MePrompt />}

      <div className="layout-row">
        <section className="col-side">
          <CycleHero cycle={cycle} played={results.length} total={totalMatches} />
        </section>

        <section className="card col-main" aria-labelledby="standings-title">
          <div className="group-nav">
            <Link
              to={prev != null ? groupPath(prev) : "#"}
              className={"icon-button" + (prev == null ? " is-disabled" : "")}
              aria-disabled={prev == null}
              aria-label={intl.formatMessage({ id: "home.prevGroup" })}
              onClick={(e) => prev == null && e.preventDefault()}
            >
              <BackIcon />
            </Link>
            <div className="group-nav__title">
              <h2 id="standings-title" className="card__title">
                <FormattedMessage id="player.group" values={{ group }} />
              </h2>
              <span className="card__hint">
                <FormattedMessage id="home.groupOf" values={{ count: numbers.length }} />
              </span>
            </div>
            <Link
              to={next != null ? groupPath(next) : "#"}
              className={"icon-button" + (next == null ? " is-disabled" : "")}
              aria-disabled={next == null}
              aria-label={intl.formatMessage({ id: "home.nextGroup" })}
              onClick={(e) => next == null && e.preventDefault()}
            >
              <ForwardIcon />
            </Link>
          </div>

          <div className="group-tools">
            {meGroup != null && meGroup !== group && (
              <Link to={groupPath(meGroup)} className="chip is-active">
                <FormattedMessage id="home.myGroup" values={{ group: meGroup }} />
              </Link>
            )}
            <PlayerSearch
              id="group-player-search"
              className="group-tools__search"
              label={intl.formatMessage({ id: "home.findGroup" })}
              hideLabel
              compact
              value={null}
              onSelect={(p) => findGroup(p.id, p.name)}
            />
          </div>
          {notPlaying && (
            <p className="card__hint" role="status">
              <FormattedMessage id="home.notPlaying" values={{ name: notPlaying }} />
            </p>
          )}

          <StandingsTable rows={players} group={group} meId={meId} provisional={cycle.inProgress} />
        </section>
      </div>

      <section className="card card--stack" aria-labelledby="results-title">
        <div className="card__head">
          <h2 id="results-title" className="card__title"><FormattedMessage id="home.resultsTitle" /></h2>
          <span className="card__hint">
            <FormattedMessage
              id="home.resultsCount"
              values={{ played: matches.length, total: matches.length + pending.length }}
            />
          </span>
        </div>
        {matches.length === 0 && <p className="card__hint"><FormattedMessage id="home.noResults" /></p>}
        <div className="group-results">
          {matches.map(({ match, neutral }) => (
            <MatchCard key={match.key} match={match} context={match.club ?? ""} neutral={neutral} />
          ))}
        </div>
        {pending.length > 0 && (
          <>
            <h3 className="group-results__subtitle">
              <FormattedMessage id="home.pendingTitle" values={{ count: pending.length }} />
            </h3>
            <ul className="pending-list">
              {pending.map(([a, b]) => (
                <li key={`${a.playerId}-${b.playerId}`} className={isMe(a, b, meId) ? "is-me" : undefined}>
                  <span>{a.name}</span>
                  <span className="pending-list__vs">vs</span>
                  <span>{b.name}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}

function CycleHero({ cycle, played, total }: { cycle: CurrentCycle; played: number; total: number }) {
  const intl = useIntl();
  const updatedAt = useUpdatedAt();
  const dateRange = `${formatDay(intl, cycle.startDate)} – ${formatDay(intl, cycle.endDate)}`;
  // Days left including today (the cycle ends at the end of its last day)
  const end = new Date(`${cycle.endDate}T23:59:59`).getTime();
  const daysLeft = Math.ceil((end - Date.now()) / DAY_MS);
  const progress = percent(played, total);

  return (
    <div className="hero sheen cycle-hero">
      <div>
        <div className="hero__eyebrow">
          <FormattedMessage id={cycle.inProgress ? "home.currentCycle" : "home.lastCycle"} />
        </div>
        <h2 className="hero__name cycle-hero__title">
          <FormattedMessage id="season.withCycle" values={{ season: cycle.season, cycle: cycle.cycle }} />
        </h2>
        <div className="hero__meta">
          {dateRange}
          {" · "}
          {cycle.inProgress ? (
            <FormattedMessage id="home.daysLeft" values={{ count: Math.max(daysLeft, 1) }} />
          ) : (
            <FormattedMessage id="home.finished" />
          )}
        </div>
      </div>
      <div className="cycle-hero__progress">
        <div className="bar__head">
          <span className="bar__label">
            <FormattedMessage id="home.matchesPlayed" values={{ played, total }} />
          </span>
          <span className="bar__balance is-positive">{progress}%</span>
        </div>
        <div
          className="bar__track"
          role="meter"
          aria-label={intl.formatMessage({ id: "home.progress" })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="bar__fill" style={{ width: `${progress}%` } as CSSProperties} />
        </div>
        {updatedAt && (
          <div className="cycle-hero__updated">
            <FormattedMessage
              id="home.updatedAt"
              values={{
                date: intl.formatDate(new Date(updatedAt), { weekday: "short", day: "numeric", month: "short" }),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StandingsTable({
  rows,
  group,
  meId,
  provisional,
}: {
  rows: GroupStanding[];
  group: number | null;
  meId: number | null;
  provisional: boolean;
}) {
  const intl = useIntl();
  return (
    <>
      <table className="standings">
        <thead>
          <tr>
            <th scope="col" className="standings__pos">
              <abbr title={intl.formatMessage({ id: "home.colPosition" })}>#</abbr>
            </th>
            <th scope="col" className="standings__name"><FormattedMessage id="home.colPlayer" /></th>
            <th scope="col" className="num"><FormattedMessage id="home.colPoints" /></th>
            <th scope="col" className="num">
              <abbr title={intl.formatMessage({ id: "home.colRecordLong" })}>
                <FormattedMessage id="home.colRecord" />
              </abbr>
            </th>
            <th scope="col" className="num only-desktop-cell"><FormattedMessage id="home.colSets" /></th>
            <th scope="col" className="standings__target"><FormattedMessage id="home.colNext" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const setsBalance = (r.setsWon ?? 0) - (r.setsLost ?? 0);
            return (
              <tr key={r.playerId} className={r.playerId === meId ? "is-me" : undefined}>
                <td className="standings__pos">{r.position ?? "—"}</td>
                <td className="standings__name">
                  <Link to={playerPath(r.playerId)}>{r.name}</Link>
                </td>
                <td className="num standings__points">{r.points ?? 0}</td>
                <td className="num">{r.won ?? 0}-{r.lost ?? 0}</td>
                <td className="num only-desktop-cell">{formatBalance(setsBalance)}</td>
                <td className="standings__target">
                  <TargetGroup target={r.target} group={group} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {provisional && (
        <p className="card__hint standings__note"><FormattedMessage id="home.provisional" /></p>
      )}
    </>
  );
}

/** "G3" with an arrow: up (better group), down or same */
function TargetGroup({ target, group }: { target: string | null; group: number | null }) {
  const intl = useIntl();
  const number = target ? Number(target.replace(/\D/g, "")) : NaN;
  if (!target || !Number.isFinite(number) || group == null) return <span className="target">{target ?? "—"}</span>;
  const move = number < group ? "up" : number > group ? "down" : "same";
  return (
    <span className={`target target--${move}`} title={intl.formatMessage({ id: `home.move.${move}` })}>
      <span aria-hidden="true">{move === "up" ? "▲" : move === "down" ? "▼" : "="}</span> {target}
    </span>
  );
}

/** Asks who uses the app, so the home page opens on their group */
function MePrompt() {
  const intl = useIntl();
  const [, setMe] = useMe();
  return (
    <section className="card me-prompt" aria-labelledby="me-prompt-title">
      <div>
        <h2 id="me-prompt-title" className="card__title"><FormattedMessage id="me.promptTitle" /></h2>
        <p className="card__hint"><FormattedMessage id="me.promptText" /></p>
      </div>
      <PlayerSearch
        id="me-search"
        className="me-prompt__search"
        label={intl.formatMessage({ id: "me.promptLabel" })}
        hideLabel
        compact
        value={null}
        onSelect={(p) => setMe(p.id)}
      />
    </section>
  );
}

function groupStandings(rows: GroupStanding[]): Map<number, GroupStanding[]> {
  const map = new Map<number, GroupStanding[]>();
  for (const r of rows) {
    const list = map.get(r.group) ?? [];
    list.push(r);
    map.set(r.group, list);
  }
  return map;
}

/** From "me" if they played it; otherwise from the winner, without a win/loss badge */
function fromPointOfView(row: MatchRow, meId: number | null): { match: Match; neutral: boolean } {
  if (meId != null && (row.player_a_id === meId || row.player_b_id === meId)) {
    return { match: normalizeMatch(row, meId), neutral: false };
  }
  const fromA = normalizeMatch(row, row.player_a_id);
  return { match: fromA.won ? fromA : normalizeMatch(row, row.player_b_id), neutral: true };
}

/** Pairs of the group that have no result yet, in standings order */
function pendingMatches(players: GroupStanding[], results: MatchRow[]): [GroupStanding, GroupStanding][] {
  const played = new Set(results.map((r) => pairKey(r.player_a_id, r.player_b_id)));
  const pairs: [GroupStanding, GroupStanding][] = [];
  players.forEach((a, i) =>
    players.slice(i + 1).forEach((b) => {
      if (!played.has(pairKey(a.playerId, b.playerId))) pairs.push([a, b]);
    })
  );
  return pairs;
}

const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const isMe = (a: GroupStanding, b: GroupStanding, meId: number | null) =>
  meId != null && (a.playerId === meId || b.playerId === meId);

function formatDay(intl: ReturnType<typeof useIntl>, iso: string) {
  // Local noon, so the day never shifts with the time zone
  return intl.formatDate(new Date(`${iso}T12:00:00`), { day: "numeric", month: "short" });
}
