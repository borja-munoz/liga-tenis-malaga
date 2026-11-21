import { lazy } from 'react';
import { Navigate } from 'react-router';
import DefaultView from './components/DefaultView';

const PlayerPage = lazy(() => import('./pages/PlayerPage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const H2HPage = lazy(() => import('./pages/H2HPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const ROUTE_PATHS = {
  DEFAULT: '/',
  PLAYER: '/player',
  H2H: '/h2h',
  NOT_FOUND: '/404',
};

export const playerPath = (id?: number | null) => (id ? `/player/${id}` : '/player');
export const matchesPath = (id: number) => `/player/${id}/matches`;
export const h2hPath = (a?: number | null, b?: number | null) =>
  a ? (b ? `/h2h/${a}/${b}` : `/h2h/${a}`) : '/h2h';

const routes = [
  {
    path: ROUTE_PATHS.DEFAULT,
    element: <DefaultView />,
    children: [
      { path: ROUTE_PATHS.DEFAULT, element: <Navigate to={ROUTE_PATHS.PLAYER} replace /> },
      // Old URL, kept so existing links and bookmarks still work
      { path: '/dashboard', element: <Navigate to={ROUTE_PATHS.PLAYER} replace /> },
      { path: '/player', element: <PlayerPage /> },
      { path: '/player/:playerId', element: <PlayerPage /> },
      { path: '/player/:playerId/matches', element: <MatchesPage /> },
      { path: '/h2h', element: <H2HPage /> },
      { path: '/h2h/:playerA', element: <H2HPage /> },
      { path: '/h2h/:playerA/:playerB', element: <H2HPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export default routes;
