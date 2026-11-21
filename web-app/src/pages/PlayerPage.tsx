import { CSSProperties, Fragment, RefObject, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { useCurrentCycle, usePlayer, usePlayerCycles, usePlayerMatches } from "../models/model";
import {
  formatBalance,
  groupMatches,
  percent,
  summarizeCycles,
  summarizeMatches,
} from "../lib/matches";
import { getLastPlayerId, parseId, setLastPlayerId } from "../lib/lastPlayer";
import { useFitsViewport } from "../lib/layout";
import { matchesPath, playerPath } from "../routes";
import CycleChart from "../components/CycleChart";
import { MatchCard, usePhaseLabel } from "../components/MatchParts";

const RECENT_MATCHES = 3;
// Desktop pages fit the viewport: the recent list shows as many of these as fit
const RECENT_MATCHES_FIT = 8;

export default function PlayerPage() {
  const { playerId: param } = useParams();
  const playerId = parseId(param);

  if (playerId == null) {
    const last = getLastPlayerId();
    if (param == null && last != null) {
      return <Navigate to={playerPath(last)} replace />;
    }
    return (
      <main className="page">
        <section className="card empty-state">
          <h2><FormattedMessage id="player.emptyTitle" /></h2>
          <p><FormattedMessage id="player.emptyText" /></p>
        </section>
      </main>
    );
  }
  return <PlayerDashboard playerId={playerId} />;
}

function PlayerDashboard({ playerId }: { playerId: number }) {
  const intl = useIntl();
  const phaseLabel = usePhaseLabel();
  const { player, status: playerStatus } = usePlayer(playerId);
  const { matches, status: matchesStatus } = usePlayerMatches(playerId);
  const { cycles, status: cyclesStatus } = usePlayerCycles(playerId);
  const { current } = useCurrentCycle();

  useEffect(() => {
    if (player) setLastPlayerId(player.id);
  }, [player]);

  const summary = useMemo(() => (matches ? summarizeMatches(matches) : null), [matches]);
  const cycleSummary = useMemo(() => (cycles ? summarizeCycles(cycles) : null), [cycles]);
  const fits = useFitsViewport();
  const recentCount = fits ? RECENT_MATCHES_FIT : RECENT_MATCHES;
  const recentMatches = useMemo(() => (matches ? matches.slice(0, recentCount) : []), [matches, recentCount]);
  const recent = useMemo(() => groupMatches(recentMatches), [recentMatches]);
  const recentRef = useRef<HTMLDivElement>(null);
  // The list only mounts once every query has loaded, so re-run when that happens
  const ready = playerStatus === "success" && matchesStatus === "success" && cyclesStatus === "success";
  useHideOverflowingCards(recentRef, fits && ready, recent);

  if (playerStatus === "success" && !player) {
    return (
      <main className="page">
        <section className="card empty-state">
          <h2><FormattedMessage id="player.notFoundTitle" /></h2>
          <p><FormattedMessage id="player.notFoundText" /></p>
        </section>
      </main>
    );
  }
  if (!player || !summary || !cycleSummary || matchesStatus !== "success" || cyclesStatus !== "success") {
    return (
      <main className="page">
        <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>
      </main>
    );
  }

  const isInCurrentCycle =
    current != null && cycleSummary.lastSeason === current.season && cycleSummary.lastCycle === current.cycle;

  return (
    <main className="page page--fit page--player">
      <h1 className="visually-hidden">{player.name}</h1>
      <div className="layout-row fit-row fit-row--top">
        {/* Hero */}
        <section className="col-side">
          <div className="hero sheen">
            <div>
              <div className="hero__eyebrow">
                <FormattedMessage id="player.label" />
                {cycleSummary.lastGroup != null && (
                  <>
                    {" · "}
                    <FormattedMessage
                      id={isInCurrentCycle ? "player.group" : "player.lastGroup"}
                      values={{ group: cycleSummary.lastGroup }}
                    />
                  </>
                )}
              </div>
              <h2 className="hero__name">{player.name}</h2>
              <div className="hero__meta">
                <FormattedMessage
                  id="player.seasonsCycles"
                  values={{ seasons: cycleSummary.seasons, cycles: cycleSummary.cycles }}
                />
                {summary.playoffs > 0 && (
                  <span className="only-desktop" style={{ display: "inline" }}>
                    {" · "}
                    <FormattedMessage id="player.playoffMatches" values={{ count: summary.playoffs }} />
                  </span>
                )}
              </div>
            </div>
            <div className="hero__stats">
              <div className="win-ring" style={{ "--pct": `${summary.winRate}%` } as CSSProperties}>
                <div className="win-ring__inner">
                  <span className="win-ring__value">{summary.winRate}%</span>
                  <span className="win-ring__label"><FormattedMessage id="player.wins" /></span>
                </div>
              </div>
              <div className="hero__counts only-desktop">
                <span><FormattedMessage id="player.wonCount" values={{ count: summary.won }} /></span>
                <span><FormattedMessage id="player.lostCount" values={{ count: summary.lost }} /></span>
                <span><FormattedMessage id="player.playedCount" values={{ count: summary.played }} /></span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="card card--fill col-main summary-card" aria-labelledby="summary-title">
          <div className="card__head">
            <h2 id="summary-title" className="card__title"><FormattedMessage id="summary.title" /></h2>
          </div>
          <div className="tiles only-mobile">
            <Tile label={intl.formatMessage({ id: "summary.played" })} value={summary.played} />
            <Tile label={intl.formatMessage({ id: "summary.won" })} value={summary.won} accent />
            <Tile label={intl.formatMessage({ id: "summary.lost" })} value={summary.lost} />
          </div>
          <div className="tiles tiles--detail only-desktop">
            <Tile label={intl.formatMessage({ id: "summary.setsWon" })} value={summary.setsWon} />
            <Tile label={intl.formatMessage({ id: "summary.setsLost" })} value={summary.setsLost} />
            <Tile label={intl.formatMessage({ id: "summary.gamesWon" })} value={summary.gamesWon} />
            <Tile label={intl.formatMessage({ id: "summary.gamesLost" })} value={summary.gamesLost} />
            <Tile label={intl.formatMessage({ id: "summary.superTieBreaksWon" })} value={summary.superTieBreaksWon} />
            <Tile label={intl.formatMessage({ id: "summary.retired" })} value={summary.retired} />
          </div>
          <div className="bars">
            <BalanceBar label={intl.formatMessage({ id: "summary.sets" })} won={summary.setsWon} lost={summary.setsLost} />
            <BalanceBar label={intl.formatMessage({ id: "summary.games" })} won={summary.gamesWon} lost={summary.gamesLost} />
            <BalanceBar
              label={intl.formatMessage({ id: "summary.superTieBreaks" })}
              won={summary.superTieBreaksWon}
              lost={summary.superTieBreaksLost}
            />
          </div>
        </section>
      </div>

      <div className="layout-row fit-row fit-row--bottom">
        {/* Cycles */}
        <section className="card card--chart card--fill col-main" aria-labelledby="cycles-title">
          <div className="card__head">
            <h2 id="cycles-title" className="card__title"><FormattedMessage id="cycles.title" /></h2>
            <span className="card__hint"><FormattedMessage id="cycles.hint" /></span>
          </div>
          {cycles && cycles.length > 0 ? (
            <CycleChart data={cycles} bestIndex={cycleSummary.bestGroupIndex} />
          ) : (
            <p className="card__hint"><FormattedMessage id="cycles.none" /></p>
          )}
          <div className="tiles tiles--auto" style={{ marginTop: 14 }}>
            <Tile center className="only-desktop" label={intl.formatMessage({ id: "cycles.seasons" })} value={cycleSummary.seasons} highlight />
            <Tile center className="only-desktop" label={intl.formatMessage({ id: "cycles.cycles" })} value={cycleSummary.cycles} highlight />
            <Tile center label={intl.formatMessage({ id: "cycles.bestGroup" })} value={cycleSummary.bestGroup ?? "—"} highlight />
            <Tile center label={intl.formatMessage({ id: "cycles.points" })} value={cycleSummary.totalPoints} highlight />
          </div>
        </section>

        {/* Recent matches */}
        <section className="card card--stack card--fill col-side" aria-labelledby="recent-title">
          <div className="card__head">
            <h2 id="recent-title" className="card__title"><FormattedMessage id="recent.title" /></h2>
          </div>
          {recentMatches.length === 0 && <p className="card__hint"><FormattedMessage id="recent.none" /></p>}
          <div className="card__scroll card__stack-list recent-list" ref={recentRef}>
          {fits
            ? // Desktop: one self-contained card per match, so the list can stop at any card
              recentMatches.map((m) => (
                <MatchCard
                  key={m.key}
                  match={m}
                  context={[
                    intl.formatMessage({ id: "season.short" }, { season: m.season }),
                    phaseLabel(m),
                    m.club,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))
            : recent.map((season) =>
                season.phases.map((phase) => (
                  <Fragment key={`${season.season}-${phase.key}`}>
                    <div className="card__hint recent-list__hint">
                      {intl.formatMessage({ id: "season.short" }, { season: season.season })} · {phaseLabel(phase.matches[0]!, { withRound: false })}
                    </div>
                    {phase.matches.map((m) => (
                      <MatchCard
                        key={m.key}
                        match={m}
                        context={[m.kind === "playoff" ? m.round : null, m.club].filter(Boolean).join(" · ")}
                      />
                    ))}
                  </Fragment>
                ))
              )}
          </div>
          {summary.played > 0 && (
            <Link to={matchesPath(player.id)} className="btn-chrome" style={{ marginTop: 4 }}>
              <FormattedMessage id="recent.seeAll" values={{ count: summary.played }} />
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}

function Tile({
  label,
  value,
  accent = false,
  highlight = false,
  center = false,
  className = "",
}: {
  label: string;
  value: number | string;
  accent?: boolean;
  highlight?: boolean;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={["tile", accent && "tile--accent", center && "tile--center", className].filter(Boolean).join(" ")}>
      {center ? (
        <>
          <div className={"tile__value" + (highlight ? " tile__value--accent" : "")}>{value}</div>
          <div className="tile__label">{label}</div>
        </>
      ) : (
        <>
          <div className="tile__label">{label}</div>
          <div className={"tile__value" + (highlight ? " tile__value--accent" : "")}>{value}</div>
        </>
      )}
    </div>
  );
}

function BalanceBar({ label, won, lost }: { label: string; won: number; lost: number }) {
  const balance = won - lost;
  return (
    <div>
      <div className="bar__head">
        <span className="bar__label">
          {label} {won} – {lost}
        </span>
        <span className={"bar__balance" + (balance > 0 ? " is-positive" : "")}>{formatBalance(balance)}</span>
      </div>
      <div
        className="bar__track"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent(won, won + lost)}
      >
        <div className="bar__fill" style={{ width: `${percent(won, won + lost)}%` }} />
      </div>
    </div>
  );
}

/**
 * Hides the match cards that don't fit entirely in the container (and the
 * phase labels left without cards), so the list never shows a cut-off card.
 * The first card is always shown.
 */
function useHideOverflowingCards(ref: RefObject<HTMLElement>, enabled: boolean, deps: unknown) {
  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const items = () => Array.from(container.children) as HTMLElement[];
    const update = () => {
      items().forEach((el) => (el.style.visibility = ""));
      if (!enabled) return;
      const limit = container.getBoundingClientRect().bottom + 0.5;
      let seenCard = false;
      let hiding = false;
      items().forEach((el) => {
        const isCard = el.classList.contains("match-card");
        if (!hiding && isCard && seenCard && el.getBoundingClientRect().bottom > limit) hiding = true;
        if (isCard) seenCard = true;
        if (hiding) el.style.visibility = "hidden";
      });
      // A phase label whose cards are all hidden goes too
      items().forEach((el, i, all) => {
        if (el.classList.contains("recent-list__hint")) {
          const next = all[i + 1];
          if (!next || next.style.visibility === "hidden") el.style.visibility = "hidden";
        }
      });
    };
    update();
    // Re-check when the list or a card changes size (window resize, web fonts loading)
    const observer = new ResizeObserver(update);
    observer.observe(container);
    items().forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ref, enabled, deps]);
}
