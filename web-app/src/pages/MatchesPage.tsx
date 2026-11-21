import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { usePlayer, usePlayerMatches } from "../models/model";
import {
  foldText,
  formatPlayoffGroup,
  groupMatches,
  MatchKind,
  recordsBySeason,
  summarizeMatches,
} from "../lib/matches";
import { parseId, setLastPlayerId } from "../lib/lastPlayer";
import { playerPath } from "../routes";
import { BackIcon, SearchIcon } from "../components/Icons";
import { MatchRow } from "../components/MatchParts";

const PAGE_SIZE = 30;
type ResultFilter = "won" | "lost";

export default function MatchesPage() {
  const intl = useIntl();
  const { playerId: param } = useParams();
  const playerId = parseId(param);
  const { player, status: playerStatus } = usePlayer(playerId);
  const { matches } = usePlayerMatches(playerId);

  // Season / type / result live in the URL so filtered views can be shared and survive "back"
  const [searchParams, setSearchParams] = useSearchParams();
  const season = parseId(searchParams.get("season") ?? undefined);
  const kindParam = searchParams.get("kind");
  const kind: MatchKind | null = kindParam === "cycle" || kindParam === "playoff" ? kindParam : null;
  const resultParam = searchParams.get("result");
  const result: ResultFilter | null = resultParam === "won" || resultParam === "lost" ? resultParam : null;
  const [opponentQuery, setOpponentQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    if (player) setLastPlayerId(player.id);
  }, [player]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setVisible(PAGE_SIZE);
    // On desktop the list scrolls inside its panel: start new filters from the top
    listRef.current?.scrollTo({ top: 0 });
  }, [season, kind, result, opponentQuery, playerId]);

  const setFilter = (key: string, value: string | number | null) => {
    const next = new URLSearchParams(searchParams);
    if (value == null) next.delete(key);
    else next.set(key, String(value));
    setSearchParams(next, { replace: true });
  };

  const seasonRecords = useMemo(() => (matches ? recordsBySeason(matches) : []), [matches]);
  const allRecord = useMemo(() => (matches ? summarizeMatches(matches) : null), [matches]);
  const filtered = useMemo(() => {
    if (!matches) return [];
    const q = foldText(opponentQuery.trim());
    return matches.filter(
      (m) =>
        (season == null || m.season === season) &&
        (kind == null || m.kind === kind) &&
        (result == null || (result === "won" ? m.won : !m.won)) &&
        (q === "" || foldText(m.opponentName).includes(q))
    );
  }, [matches, season, kind, result, opponentQuery]);
  const filteredSummary = useMemo(() => summarizeMatches(filtered), [filtered]);
  const groups = useMemo(() => groupMatches(filtered.slice(0, visible)), [filtered, visible]);

  if (playerId == null || (playerStatus === "success" && !player)) {
    return (
      <main className="page">
        <section className="card empty-state">
          <h2><FormattedMessage id="player.notFoundTitle" /></h2>
          <p><FormattedMessage id="player.notFoundText" /></p>
        </section>
      </main>
    );
  }
  if (!player || !matches || !allRecord) {
    return (
      <main className="page">
        <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>
      </main>
    );
  }

  return (
    <main className="page page--fit page--matches">
      <div className="page-head">
        <div className="page-head__back">
          <Link to={playerPath(player.id)} className="icon-button" aria-label={intl.formatMessage({ id: "matches.back" }, { name: player.name })}>
            <BackIcon />
          </Link>
          <div>
            <h1 className="page-head__title"><FormattedMessage id="matches.title" /></h1>
            <div className="page-head__subtitle">{player.name}</div>
          </div>
        </div>
        <div className="summary-strip" aria-live="polite">
          <div>
            <span className="summary-strip__value">{filteredSummary.played}</span>
            <span className="summary-strip__label"> <FormattedMessage id="matches.played" /></span>
          </div>
          <div className="is-accent">
            <span className="summary-strip__value">{filteredSummary.won}</span>
            <span className="summary-strip__label"> <FormattedMessage id="matches.wins" /></span>
          </div>
          <div>
            <span className="summary-strip__value">{filteredSummary.lost}</span>
            <span className="summary-strip__label"> <FormattedMessage id="matches.losses" /></span>
          </div>
          <div>
            <span className="summary-strip__value">{filteredSummary.winRate}%</span>
            <span className="summary-strip__label"> <FormattedMessage id="matches.winRate" /></span>
          </div>
        </div>
      </div>

      <div className="layout-row layout-row--top fit-row">
        <aside className="filters" aria-label={intl.formatMessage({ id: "filters.label" })}>
          <div>
            <label htmlFor="opponent-filter" className="field-label filters__legend">
              <FormattedMessage id="filters.opponent" />
            </label>
            <div className="filter-input">
              <SearchIcon size={18} />
              <input
                id="opponent-filter"
                type="search"
                value={opponentQuery}
                onChange={(e) => setOpponentQuery(e.target.value)}
                placeholder={intl.formatMessage({ id: "filters.opponentPlaceholder" })}
                autoComplete="off"
              />
            </div>
          </div>

          <fieldset className="filters__group">
            <legend className="field-label filters__legend"><FormattedMessage id="filters.season" /></legend>
            <div className="chip-row">
              <button type="button" className={"chip" + (season == null ? " is-active" : "")} aria-pressed={season == null} onClick={() => setFilter("season", null)}>
                <span><FormattedMessage id="filters.allSeasons" /></span>
                <span className="chip__record only-desktop">{allRecord.won}–{allRecord.lost}</span>
              </button>
              {seasonRecords.map((r) => (
                <button
                  key={r.season}
                  type="button"
                  className={"chip" + (season === r.season ? " is-active" : "")}
                  aria-pressed={season === r.season}
                  onClick={() => setFilter("season", r.season)}
                >
                  <span className="only-mobile"><FormattedMessage id="season.short" values={{ season: r.season }} /></span>
                  <span className="only-desktop"><FormattedMessage id="season.long" values={{ season: r.season }} /></span>
                  <span className="chip__record only-desktop">{r.won}–{r.lost}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="filters__pair">
            <fieldset className="filters__group">
              <legend className="field-label filters__legend"><FormattedMessage id="filters.type" /></legend>
              <div className="segmented">
                <Segment active={kind == null} onClick={() => setFilter("kind", null)} label={intl.formatMessage({ id: "filters.all" })} />
                <Segment active={kind === "cycle"} onClick={() => setFilter("kind", "cycle")} label={intl.formatMessage({ id: "filters.cycles" })} />
                <Segment active={kind === "playoff"} onClick={() => setFilter("kind", "playoff")} label={intl.formatMessage({ id: "filters.playoffs" })} />
              </div>
            </fieldset>
            <fieldset className="filters__group">
              <legend className="field-label filters__legend"><FormattedMessage id="filters.result" /></legend>
              <div className="segmented">
                <Segment
                  active={result == null}
                  onClick={() => setFilter("result", null)}
                  label={intl.formatMessage({ id: "filters.all" })}
                  shortLabel={intl.formatMessage({ id: "filters.allResultsShort" })}
                />
                <Segment
                  active={result === "won"}
                  onClick={() => setFilter("result", "won")}
                  label={intl.formatMessage({ id: "filters.wins" })}
                  shortLabel={intl.formatMessage({ id: "result.wonShort" })}
                />
                <Segment
                  active={result === "lost"}
                  onClick={() => setFilter("result", "lost")}
                  label={intl.formatMessage({ id: "filters.losses" })}
                  shortLabel={intl.formatMessage({ id: "result.lostShort" })}
                />
              </div>
            </fieldset>
          </div>
        </aside>

        <section className="col-main matches-panel" aria-label={intl.formatMessage({ id: "matches.title" })}>
          <div className="match-table-head only-desktop" aria-hidden="true">
            <span />
            <span><FormattedMessage id="matches.colPhase" /></span>
            <span><FormattedMessage id="matches.colOpponent" /></span>
            <span><FormattedMessage id="matches.colScore" /></span>
            <span><FormattedMessage id="matches.colClub" /></span>
            <span />
          </div>

          <div className="matches-panel__body" ref={listRef}>
          {filtered.length === 0 && (
            <div className="empty-state">
              <p><FormattedMessage id="matches.noResults" /></p>
            </div>
          )}

          {groups.map((group) => {
            const record = seasonRecords.find((r) => r.season === group.season);
            const showFullRecord = kind == null && result == null && opponentQuery.trim() === "";
            return (
              <section key={group.season} className="match-season" aria-labelledby={`season-${group.season}`}>
                <div className="season-head">
                  <h2 id={`season-${group.season}`}>
                    <FormattedMessage id="season.long" values={{ season: group.season }} />
                  </h2>
                  <span className="season-head__record">
                    {showFullRecord && record ? `${record.won}–${record.lost}` : `${group.won}–${group.lost}`}
                  </span>
                </div>
                {group.phases.map((phase) => (
                  <div key={phase.key} className="match-season">
                    <div className="phase-head">
                      {phase.kind === "playoff" ? (
                        <span className="playoff-tag">{formatPlayoffGroup(phase.playoffGroup)}</span>
                      ) : (
                        <FormattedMessage id="phase.cycleGroup" values={{ cycle: phase.cycle, group: phase.group }} />
                      )}
                    </div>
                    <ul className="match-list match-list--table">
                      {phase.matches.map((m) => (
                        <MatchRow key={m.key} match={m} />
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            );
          })}

          {filtered.length > 0 && (
            <div className="matches-footer">
              <span>
                <FormattedMessage
                  id="matches.showing"
                  values={{ shown: Math.min(visible, filtered.length), total: filtered.length }}
                />
              </span>
              {visible < filtered.length && (
                <button type="button" className="btn-chrome" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                  <FormattedMessage id="matches.loadMore" values={{ count: filtered.length - visible }} />
                </button>
              )}
            </div>
          )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Segment({
  active,
  onClick,
  label,
  shortLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  shortLabel?: string;
}) {
  return (
    <button type="button" className={active ? "is-active" : undefined} aria-pressed={active} onClick={onClick}>
      {shortLabel ? (
        <>
          <span className="only-mobile" aria-hidden="true">{shortLabel}</span>
          <span className="only-desktop">{label}</span>
          <span className="visually-hidden only-mobile">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
