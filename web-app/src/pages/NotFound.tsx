import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { ROUTE_PATHS } from '../routes';

export default function NotFound() {
  return (
    <main className="page">
      <section className="card empty-state">
        <p className="card__hint">Error 404</p>
        <h1 style={{ fontSize: 28, margin: '8px 0 12px' }}>
          <FormattedMessage id="notFound.title" />
        </h1>
        <p><FormattedMessage id="notFound.text" /></p>
        <Link to={ROUTE_PATHS.DEFAULT} className="btn-chrome" style={{ marginTop: 20 }}>
          <FormattedMessage id="notFound.action" />
        </Link>
      </section>
    </main>
  );
}
