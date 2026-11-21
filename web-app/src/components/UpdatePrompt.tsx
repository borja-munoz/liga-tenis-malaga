import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useRegisterSW } from "virtual:pwa-register/react";

import { getEngineUrls } from "../db/duckdb";
import { BallLogo, CloseIcon } from "./Icons";

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const OFFLINE_TOAST_MS = 6000;

/**
 * Registers the service worker and tells the user when a new version (code or
 * data) is ready. The new version only takes over when the user accepts.
 */
export default function UpdatePrompt() {
  const intl = useIntl();
  const [updating, setUpdating] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Look for new versions periodically, when the app comes back to the
      // foreground (installed PWAs stay open for days) and when back online
      const check = () => {
        if (!navigator.onLine || registration.installing) return;
        registration.update().catch(() => undefined);
      };
      setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") check();
      });
      window.addEventListener("online", check);
    },
  });

  // First install: the DuckDB engine (too big to precache) was downloaded before
  // the service worker took control. Fetch it again through the worker so it
  // gets cached, then tell the user the app works offline.
  const [offlineToast, setOfflineToast] = useState(false);
  useEffect(() => {
    if (!offlineReady) return;
    let cancelled = false;
    getEngineUrls()
      .then((urls) => Promise.all(urls.map((url) => fetch(url).then((r) => r.blob()))))
      .then(() => !cancelled && setOfflineToast(true))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [offlineReady]);
  useEffect(() => {
    if (!offlineToast) return;
    const timer = setTimeout(() => {
      setOfflineToast(false);
      setOfflineReady(false);
    }, OFFLINE_TOAST_MS);
    return () => clearTimeout(timer);
  }, [offlineToast, setOfflineReady]);

  if (needRefresh) {
    return (
      <div className="app-toast" role="alertdialog" aria-labelledby="update-title" aria-describedby="update-text">
        <BallLogo size={30} />
        <div className="app-toast__body">
          <p id="update-title" className="app-toast__title"><FormattedMessage id="pwa.updateTitle" /></p>
          <p id="update-text" className="app-toast__text"><FormattedMessage id="pwa.updateText" /></p>
        </div>
        <div className="app-toast__actions">
          <button type="button" className="app-toast__secondary" onClick={() => setNeedRefresh(false)} disabled={updating}>
            <FormattedMessage id="pwa.later" />
          </button>
          <button
            type="button"
            className="app-toast__primary"
            disabled={updating}
            onClick={() => {
              setUpdating(true);
              // Activates the waiting service worker and reloads the page
              void updateServiceWorker(true);
            }}
          >
            <FormattedMessage id={updating ? "pwa.updating" : "pwa.update"} />
          </button>
        </div>
      </div>
    );
  }

  if (offlineToast) {
    return (
      <div className="app-toast app-toast--compact" role="status">
        <BallLogo size={24} />
        <p className="app-toast__title app-toast__body"><FormattedMessage id="pwa.offlineReady" /></p>
        <button
          type="button"
          className="icon-button app-toast__close"
          aria-label={intl.formatMessage({ id: "pwa.close" })}
          onClick={() => {
            setOfflineToast(false);
            setOfflineReady(false);
          }}
        >
          <CloseIcon />
        </button>
      </div>
    );
  }

  return null;
}
