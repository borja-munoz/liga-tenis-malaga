import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Header from './Header';
import ModalMessage from './ModalMessage';

export default function DefaultView() {
  return (
    <>
      <Header />
      {/* Keep the header visible while a page chunk loads */}
      <Suspense
        fallback={
          <main className="page">
            <p className="inline-loading" role="status"><FormattedMessage id="loading" /></p>
          </main>
        }
      >
        <Outlet />
      </Suspense>
      <ModalMessage />
    </>
  );
}
