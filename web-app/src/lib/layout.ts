import { useSyncExternalStore } from "react";

/**
 * Desktop windows tall enough for the pages to fit the viewport without
 * page scroll (see the "pages fit the viewport" section in style.css).
 * Keep in sync with the media query there.
 */
export const FIT_MEDIA = "(min-width: 900px) and (min-height: 600px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(FIT_MEDIA);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(FIT_MEDIA).matches;

export function useFitsViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
