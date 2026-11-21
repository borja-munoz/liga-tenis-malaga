import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { useCurrentCycle, useCycleStandings } from "../models/model";
import { getLastPlayerId, parseId } from "../lib/lastPlayer";
import { groupPath, h2hPath, playerPath } from "../routes";
import { BallLogo } from "./Icons";
import PlayerSearch from "./PlayerSearch";

export default function Header() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { current } = useCurrentCycle();
  // Cached by React Query: the same query as the cycle page
  const { data: standings } = useCycleStandings(current);

  const playerMatch = matchPath("/player/:playerId/*", pathname) ?? matchPath("/player/:playerId", pathname);
  const h2hMatch = matchPath("/h2h/:playerA/*", pathname) ?? matchPath("/h2h/:playerA", pathname);
  const isCycleSection = pathname === "/" || pathname.startsWith("/group");
  const isPlayerSection = pathname.startsWith("/player");
  const isH2HSection = pathname.startsWith("/h2h");

  const routePlayerId = parseId(playerMatch?.params.playerId ?? h2hMatch?.params.playerA);
  const playerId = routePlayerId ?? getLastPlayerId();

  // On the cycle page the search opens the player's group (or their page
  // when they don't play this cycle); elsewhere it opens their page
  const onSearchSelect = (id: number) => {
    const group = isCycleSection ? standings?.find((s) => s.playerId === id)?.group : undefined;
    navigate(group != null ? groupPath(group) : playerPath(id));
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to={groupPath()} className="brand">
          <BallLogo />
          <span className="brand__name">
            Liga Tenis <span>Málaga</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label={intl.formatMessage({ id: "nav.label" })}>
          <Link
            to={groupPath()}
            className={"main-nav__link" + (isCycleSection ? " is-active" : "")}
            aria-current={isCycleSection ? "page" : undefined}
          >
            <FormattedMessage id="nav.cycle" />
          </Link>
          <Link
            to={playerPath(playerId)}
            className={"main-nav__link" + (isPlayerSection ? " is-active" : "")}
            aria-current={isPlayerSection ? "page" : undefined}
          >
            <FormattedMessage id="nav.player" />
          </Link>
          <Link
            to={h2hPath(playerId)}
            className={"main-nav__link" + (isH2HSection ? " is-active" : "")}
            aria-current={isH2HSection ? "page" : undefined}
          >
            <FormattedMessage id="nav.h2h" />
          </Link>
        </nav>

        {(isCycleSection || (isPlayerSection && !pathname.endsWith("/matches"))) && (
          <PlayerSearch
            id="header-player-search"
            className="header-search"
            label={intl.formatMessage({ id: isCycleSection ? "home.findGroup" : "search.players" })}
            hideLabel={false}
            value={routePlayerId}
            onSelect={(player) => onSearchSelect(player.id)}
          />
        )}

        {current && (
          <span className="season-pill">
            <span className="only-mobile">
              <FormattedMessage id="season.short" values={{ season: current.season }} />
            </span>
            <span className="only-desktop">
              <FormattedMessage id="season.withCycle" values={{ season: current.season, cycle: current.cycle }} />
            </span>
          </span>
        )}
      </div>
    </header>
  );
}
