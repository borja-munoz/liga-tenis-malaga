// "This is me": the player who uses the app on this device. The home page
// opens on their group and highlights them. Storage can be unavailable
// (private mode, blocked site data), so every access is guarded; the value
// then only lasts for the session.
import { useCallback, useSyncExternalStore } from "react";

const KEY = "ltm:meId";

let memory: number | null = read();
const listeners = new Set<() => void>();

function read(): number | null {
  try {
    const value = window.localStorage.getItem(KEY);
    const id = value == null ? NaN : Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function write(id: number | null) {
  memory = id;
  try {
    if (id == null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, String(id));
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Changes made in another tab
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      memory = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The "me" player id and a setter (null forgets it) */
export function useMe(): [number | null, (id: number | null) => void] {
  const meId = useSyncExternalStore(subscribe, () => memory);
  const setMe = useCallback((id: number | null) => write(id), []);
  return [meId, setMe];
}
