const CURRENT_KEY  = "late.radio.current";
const PLAYING_KEY  = "late.radio.playing";
const VOLUME_KEY   = "late.radio.volume";
const MUTED_KEY    = "late.radio.muted";

function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can throw (private mode, quota). Audio still works in-memory.
  }
}

export function loadCurrent<T>(): T | null       { return loadJSON<T>(CURRENT_KEY); }
export function loadWasPlaying(): boolean         { return loadJSON<boolean>(PLAYING_KEY) === true; }
export function loadVolume(): number              { const v = loadJSON<number>(VOLUME_KEY); return typeof v === "number" ? v : 0.7; }
export function loadMuted(): boolean              { return loadJSON<boolean>(MUTED_KEY) === true; }
export function saveCurrent(v: unknown)           { saveJSON(CURRENT_KEY, v); }
export function savePlaying(v: boolean)           { saveJSON(PLAYING_KEY, v); }
export function saveVolume(v: number)             { saveJSON(VOLUME_KEY, v); }
export function saveMuted(v: boolean)             { saveJSON(MUTED_KEY, v); }
