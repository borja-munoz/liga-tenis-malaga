import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";

import { useCurrentCycle } from "../models/model";
import { getLastPlayerId, parseId } from "../lib/lastPlayer";
import { h2hPath, playerPath } from "../routes";
import { BallLogo } from "./Icons";
import PlayerSearch from "./PlayerSearch";

export default function Header() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { current } = useCurrentCycle();

  const playerMatch = matchPath("/player/:playerId/*", pathname) ?? matchPath("/player/:playerId", pathname);
  const h2hMatch = matchPath("/h2h/:playerA/*", pathname) ?? matchPath("/h2h/:playerA", pathname);
  const isPlayerSection = pathname.startsWith("/player");
  const isH2HSection = pathname.startsWith("/h2h");

  const routePlayerId = parseId(playerMatch?.params.playerId ?? h2hMatch?.params.playerA);
  const playerId = routePlayerId ?? getLastPlayerId();

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to={playerPath(playerId)} className="brand">
          <BallLogo />
          <span className="brand__name">
            Liga Tenis <span>Málaga</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label={intl.formatMessage({ id: "nav.label" })}>
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

        {isPlayerSection && !pathname.endsWith("/matches") && (
          <PlayerSearch
            id="header-player-search"
            className="header-search"
            label={intl.formatMessage({ id: "search.players" })}
            hideLabel={false}
            value={routePlayerId}
            onSelect={(player) => navigate(playerPath(player.id))}
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
