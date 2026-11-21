import { CSSProperties, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { Player, useCurrentCycle, usePlayer, usePlayerCycles, usePlayerMatches } from "../models/model";
import {
  CycleSummary,
  initials,
  Match,
  opponentRecords,
  PlayerSummary,
  summarizeCycles,
  summarizeMatches,
} from "../lib/matches";
import { parseId, setLastPlayerId } from "../lib/lastPlayer";
import { h2hPath, playerPath } from "../routes";
import PlayerSearch from "../components/PlayerSearch";
import { SwapIcon } from "../components/Icons";
import { MatchCard, MeetingRow, usePhaseLabel } from "../components/MatchParts";
import { useFitsViewport } from "../lib/layout";

const FREQUENT_OPPONENTS = 10;

export default function H2HPage() {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const a = parseId(params.playerA);
  const b = parseId(params.playerB);

  const { player: playerA } = usePlayer(a);
  const { player: playerB } = usePlayer(b);
  const { matches: matchesA } = usePlayerMatches(a);
  const { matches: matchesB } = usePlayerMatches(b);
  const { cycles: cyclesA } = usePlayerCycles(a);
  const { cycles: cyclesB } = usePlayerCycles(b);

  useEffect(() => {
    if (playerA) setLastPlayerId(playerA.id);
  }, [playerA]);

  const selectA = (p: Player) => navigate(h2hPath(p.id, b === p.id ? null : b));
  const selectB = (p: Player) => navigate(a ? h2hPath(a, p.id) : h2hPath(p.id));
  const swap = () => a && b && navigate(h2hPath(b, a));
  // Drop player 2 and put the cursor in the empty picker to choose another
  const clearB = () => a && navigate(h2hPath(a), { state: { focus: "b" } });
  const focusB = (location.state as { focus?: string } | null)?.focus === "b";
  useEffect(() => {
    // The picker stays mounted across navigations, so autoFocus alone wouldn't fire
    if (focusB && b == null) document.getElementById("h2h-player-b")?.focus();
  }, [focusB, b, location.key]);

  const bothSelected = a != null && b != null && a !== b;
  const ready = bothSelected && playerA && playerB && matchesA && matchesB && cyclesA && cyclesB;

  const pickers = (
    <div className={"h2h-pickers" + (ready ? "" : " h2h-pickers--always")}>
      <PlayerSearch
        id="h2h-player-a"
        className="h2h-picker"
        label={intl.formatMessage({ id: "h2h.player1" })}
        value={a}
        onSelect={selectA}
        compact
        showIcon={false}
      />
      <button
        type="button"
        className="icon-button icon-button--steel"
        onClick={swap}
        disabled={!a || !b}
        aria-label={intl.formatMessage({ id: "h2h.swap" })}
      >
        <SwapIcon />
      </button>
      <PlayerSearch
        id="h2h-player-b"
        className="h2h-picker"
        label={intl.formatMessage({ id: "h2h.player2" })}
        value={b}
        onSelect={selectB}
        onClear={clearB}
        clearLabel={intl.formatMessage({ id: "h2h.clearPlayer2" })}
        compact
        showIcon={false}
      />
    </div>
  );

  return (
    <main className={"page page--fit" + (ready ? " page--h2h" : " page--h2h-pick")}>
      <h1 className="visually-hidden"><FormattedMessage id="nav.h2h" /></h1>
      {pickers}

      {a == null && (
        <section className="card empty-state">
          <h2><FormattedMessage id="h2h.emptyTitle" /></h2>
          <p><FormattedMessage id="h2h.emptyText" /></p>
        </section>
      )}

      {a != null && a === b && (
        <section className="card empty-state">
          <p><FormattedMessage id="h2h.samePlayer" /></p>
        </section>
      )}

      {a != null && b == null && playerA && (
        <FrequentOpponents player={playerA} matches={matchesA} />
      )}

      {bothSelected && !ready && (
        <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>
      )}

      {ready && (
        <HeadToHead
          playerA={playerA}
          playerB={playerB}
          matchesA={matchesA}
          matchesB={matchesB}
          cyclesA={summarizeCycles(cyclesA)}
          cyclesB={summarizeCycles(cyclesB)}
          onSelectA={selectA}
          onSelectB={selectB}
          onClearB={clearB}
          onSwap={swap}
        />
      )}
    </main>
  );
}

function FrequentOpponents({ player, matches }: { player: Player; matches: Match[] | undefined }) {
  const opponents = useMemo(() => (matches ? opponentRecords(matches).slice(0, FREQUENT_OPPONENTS) : []), [matches]);
  return (
    <section className="card card--stack card--fill" aria-labelledby="frequent-title">
      <div className="card__head">
        <h2 id="frequent-title" className="card__title">
          <FormattedMessage id="h2h.frequentTitle" values={{ name: player.name }} />
        </h2>
        <span className="card__hint"><FormattedMessage id="h2h.frequentHint" /></span>
      </div>
      {!matches && <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>}
      <ul className="opponent-list card__scroll">
        {opponents.map((o) => (
          <li key={o.id}>
            <Link to={h2hPath(player.id, o.id)} className="opponent-link">
              <span className="avatar"><span className="avatar__inner">{initials(o.name)}</span></span>
              <span className="opponent-link__name">
                {o.name}
                <span className="opponent-link__meta" style={{ display: "block" }}>
                  <FormattedMessage id="h2h.meetings" values={{ count: o.played }} />
                </span>
              </span>
              <span className="opponent-link__record">
                <span style={{ color: o.won > o.lost ? "var(--yellow)" : undefined }}>{o.won}</span>–{o.lost}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface HeadToHeadProps {
  playerA: Player;
  playerB: Player;
  matchesA: Match[];
  matchesB: Match[];
  cyclesA: CycleSummary;
  cyclesB: CycleSummary;
  onSelectA: (p: Player) => void;
  onSelectB: (p: Player) => void;
  onClearB: () => void;
  onSwap: () => void;
}

function HeadToHead({ playerA, playerB, matchesA, matchesB, cyclesA, cyclesB, onSelectA, onSelectB, onClearB, onSwap }: HeadToHeadProps) {
  const intl = useIntl();
  const phaseLabel = usePhaseLabel();
  const { current } = useCurrentCycle();
  const fits = useFitsViewport();

  const meetings = useMemo(() => matchesA.filter((m) => m.opponentId === playerB.id), [matchesA, playerB.id]);
  const h2h = useMemo(() => summarizeMatches(meetings), [meetings]);
  const summaryA = useMemo(() => summarizeMatches(matchesA), [matchesA]);
  const summaryB = useMemo(() => summarizeMatches(matchesB), [matchesB]);
  const playoffMeetings = meetings.filter((m) => m.kind === "playoff");
  const playoffWins = playoffMeetings.filter((m) => m.won).length;

  const winsA = h2h.won;
  const winsB = h2h.lost;
  const shareA = meetings.length ? Math.round((winsA / meetings.length) * 100) : 50;

  const groupMeta = (c: CycleSummary) => {
    if (c.lastGroup == null) return "";
    const active = current != null && c.lastSeason === current.season && c.lastCycle === current.cycle;
    return intl.formatMessage({ id: active ? "player.group" : "player.lastGroup" }, { group: c.lastGroup });
  };
  const longMeta = (c: CycleSummary, s: PlayerSummary) =>
    [
      groupMeta(c),
      intl.formatMessage({ id: "h2h.seasonsCount" }, { count: c.seasons }),
      intl.formatMessage({ id: "h2h.winRate" }, { rate: s.winRate }),
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <>
      <section className="h2h-hero sheen sheen--subtle" aria-label={intl.formatMessage({ id: "h2h.heroLabel" }, { a: playerA.name, b: playerB.name })}>
        <div className="h2h-hero__players">
          <div className="h2h-player">
            <span className={"avatar" + (winsA > winsB ? " is-leader" : "")}>
              <span className="avatar__inner">{initials(playerA.name)}</span>
            </span>
            <div className="h2h-player__info">
              <Link to={playerPath(playerA.id)} className="h2h-player__name only-mobile">{playerA.name}</Link>
              <PlayerSearch
                id="h2h-hero-a"
                className="h2h-player__picker only-desktop"
                label={intl.formatMessage({ id: "h2h.player1" })}
                value={playerA.id}
                onSelect={onSelectA}
                compact
                showIcon={false}
              />
              <span className="h2h-player__meta only-mobile">{groupMeta(cyclesA)}</span>
              <span className="h2h-player__meta only-desktop">{longMeta(cyclesA, summaryA)}</span>
            </div>
          </div>

          <div className="h2h-score">
            {/* On desktop the swap button takes the place of the dash between the two scores */}
            <div className="h2h-score__value h2h-score__row">
              <span className="visually-hidden">{intl.formatMessage({ id: "h2h.scoreLabel" }, { a: winsA, b: winsB })}</span>
              <span className={winsA > winsB ? "is-leading" : undefined} aria-hidden="true">{winsA}</span>
              <span className="h2h-score__sep only-mobile" aria-hidden="true">–</span>
              <button
                type="button"
                className="icon-button icon-button--steel h2h-score__swap only-desktop"
                onClick={onSwap}
                aria-label={intl.formatMessage({ id: "h2h.swap" })}
              >
                <SwapIcon />
              </button>
              <span className={winsB > winsA ? "is-leading" : undefined} aria-hidden="true">{winsB}</span>
            </div>
            <div className="h2h-score__label">
              <FormattedMessage id="h2h.winsLabel" values={{ count: meetings.length }} />
            </div>
          </div>

          <div className="h2h-player h2h-player--b">
            <span className={"avatar" + (winsB > winsA ? " is-leader" : "")}>
              <span className="avatar__inner">{initials(playerB.name)}</span>
            </span>
            <div className="h2h-player__info">
              <Link to={playerPath(playerB.id)} className="h2h-player__name only-mobile">{playerB.name}</Link>
              <PlayerSearch
                id="h2h-hero-b"
                className="h2h-player__picker only-desktop"
                label={intl.formatMessage({ id: "h2h.player2" })}
                value={playerB.id}
                onSelect={onSelectB}
                onClear={onClearB}
                clearLabel={intl.formatMessage({ id: "h2h.clearPlayer2" })}
                compact
                showIcon={false}
              />
              <span className="h2h-player__meta only-mobile">{groupMeta(cyclesB)}</span>
              <span className="h2h-player__meta only-desktop">{longMeta(cyclesB, summaryB)}</span>
            </div>
          </div>
        </div>

        <div className="split-bar" aria-hidden="true">
          {meetings.length > 0 ? (
            <>
              <div className="split-bar__a" style={{ width: `${shareA}%` }} />
              <div className="split-bar__b" style={{ width: `${100 - shareA}%` }} />
            </>
          ) : null}
        </div>

        <div className="h2h-totals">
          <Total label={intl.formatMessage({ id: "h2h.sets" })} a={h2h.setsWon} b={h2h.setsLost} />
          <Total label={intl.formatMessage({ id: "h2h.games" })} a={h2h.gamesWon} b={h2h.gamesLost} />
          <Total label={intl.formatMessage({ id: "h2h.superTieBreaks" })} a={h2h.superTieBreaksWon} b={h2h.superTieBreaksLost} />
          <Total
            className="only-desktop"
            label={intl.formatMessage({ id: "h2h.playoffs" })}
            a={playoffWins}
            b={playoffMeetings.length - playoffWins}
          />
        </div>
      </section>

      <div className="layout-row layout-row--top fit-row">
        <section className="card card--fill col-main h2h-compare-card" aria-labelledby="compare-title">
          <div className="card__head">
            <h2 id="compare-title" className="card__title"><FormattedMessage id="h2h.compareTitle" /></h2>
            <span className="card__hint"><FormattedMessage id="h2h.compareHint" /></span>
          </div>
          <div className="compare">
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpPlayed" })} a={summaryA.played} b={summaryB.played} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpWinRate" })} a={summaryA.winRate} b={summaryB.winRate} suffix="%" />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpWon" })} a={summaryA.won} b={summaryB.won} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpSeasons" })} a={cyclesA.seasons} b={cyclesB.seasons} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpCycles" })} a={cyclesA.cycles} b={cyclesB.cycles} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpBestGroup" })} a={cyclesA.bestGroup} b={cyclesB.bestGroup} lowerIsBetter />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpPoints" })} a={cyclesA.totalPoints} b={cyclesB.totalPoints} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpSuperTieBreaks" })} a={summaryA.superTieBreaksWon} b={summaryB.superTieBreaksWon} />
            <CompareRow label={intl.formatMessage({ id: "h2h.cmpPlayoffs" })} a={summaryA.playoffs} b={summaryB.playoffs} />
          </div>
        </section>

        <section className="card card--stack card--fill col-side h2h-meetings-card" aria-labelledby="meetings-title">
          <div className="card__head">
            <h2 id="meetings-title" className="card__title"><FormattedMessage id="h2h.meetingsTitle" /></h2>
          </div>
          {meetings.length === 0 && <p className="card__hint"><FormattedMessage id="h2h.neverMet" /></p>}
          {fits ? (
            <ul className="card__scroll meeting-list">
              {meetings.map((m) => (
                <MeetingRow key={m.key} match={m} />
              ))}
            </ul>
          ) : (
            <div className="card__stack-list">
              {meetings.map((m) => (
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
              ))}
            </div>
          )}
          {meetings.length > 0 && (
            <p className="card__hint" style={{ margin: 0 }}>
              <FormattedMessage id="h2h.scoreNote" values={{ name: playerA.name }} />
            </p>
          )}
        </section>
      </div>
    </>
  );
}

function Total({ label, a, b, className }: { label: string; a: number; b: number; className?: string }) {
  return (
    <div className={className}>
      <div className="h2h-totals__value">
        <span className={a > b ? "is-leading" : undefined}>{a}</span>–<span className={b > a ? "is-leading" : undefined}>{b}</span>
      </div>
      <div className="h2h-totals__label">{label}</div>
    </div>
  );
}

function CompareRow({
  label,
  a,
  b,
  lowerIsBetter = false,
  suffix = "",
}: {
  label: string;
  a: number | null;
  b: number | null;
  lowerIsBetter?: boolean;
  suffix?: string;
}) {
  let shareA = 50;
  let leader: "a" | "b" | null = null;
  if (a != null && b != null) {
    if (lowerIsBetter) {
      const ia = a > 0 ? 1 / a : 0;
      const ib = b > 0 ? 1 / b : 0;
      shareA = ia + ib > 0 ? (ia / (ia + ib)) * 100 : 50;
      if (a !== b) leader = a < b ? "a" : "b";
    } else {
      shareA = a + b > 0 ? (a / (a + b)) * 100 : 50;
      if (a !== b) leader = a > b ? "a" : "b";
    }
  } else if (a != null) {
    leader = "a";
    shareA = 100;
  } else if (b != null) {
    leader = "b";
    shareA = 0;
  }
  const fmt = (v: number | null) => (v == null ? "—" : `${v}${suffix}`);
  return (
    <div className="compare-row">
      <div className="compare-row__label">{label}</div>
      <div className="compare-row__bars">
        <span className={"compare-row__value compare-row__value--a" + (leader === "a" ? " is-leading" : "")}>{fmt(a)}</span>
        <div className="compare-row__tracks" aria-hidden="true">
          <div className="compare-row__track compare-row__track--a">
            <div className={"compare-row__fill" + (leader === "a" ? " is-leading" : "")} style={{ width: `${shareA}%` } as CSSProperties} />
          </div>
          <div className="compare-row__track compare-row__track--b">
            <div className={"compare-row__fill" + (leader === "b" ? " is-leading" : "")} style={{ width: `${100 - shareA}%` }} />
          </div>
        </div>
        <span className={"compare-row__value compare-row__value--b" + (leader === "b" ? " is-leading" : "")}>{fmt(b)}</span>
      </div>
    </div>
  );
}
