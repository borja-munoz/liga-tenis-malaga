// Remembers the last player viewed so the app reopens on them
// (handy once the app is installed as a PWA). Storage can be unavailable
// (private mode, blocked site data), so every access is guarded.

const KEY = "ltm:lastPlayerId";

export function getLastPlayerId(): number | null {
  try {
    const value = window.localStorage.getItem(KEY);
    const id = value == null ? NaN : Number(value);
    return Number.isInteger(id) ? id : null;
  } catch {
    return null;
  }
}

export function setLastPlayerId(id: number) {
  try {
    window.localStorage.setItem(KEY, String(id));
  } catch {
    // ignore
  }
}

export function parseId(value: string | undefined): number | null {
  if (value == null) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
