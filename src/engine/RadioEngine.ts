import type { RadioEngine, RadioState, StreamInfo, TrackMeta } from "@/global";
import { STREAMS } from "@/data/streams";
import {
  loadCurrent, loadWasPlaying, loadVolume, loadMuted,
  saveCurrent, savePlaying, saveVolume, saveMuted,
} from "./persistence";

let sharedAudio: HTMLAudioElement | null = null;
let sharedCtx: AudioContext | null = null;
let sharedAnalyser: AnalyserNode | null = null;
let listenersWired = false;

function ensureSharedAudio(volume: number, muted: boolean): HTMLAudioElement {
  if (sharedAudio) return sharedAudio;
  const a = new Audio();
  a.preload = "none";
  a.crossOrigin = "anonymous";
  a.volume = muted ? 0 : volume;
  sharedAudio = a;
  return a;
}

function ensureAnalyser(): AnalyserNode | null {
  if (sharedAnalyser) return sharedAnalyser;
  if (!sharedAudio) return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  // ponytail: Safari starts the context in 'suspended'. resume() must
  // happen before createMediaElementSource, otherwise the graph wires
  // up but the AnalyserNode receives zero samples.
  sharedCtx.resume().catch(() => {});
  try {
    const source = sharedCtx.createMediaElementSource(sharedAudio);
    const analyser = sharedCtx.createAnalyser();
    analyser.fftSize = 512;
    const gain = sharedCtx.createGain();
    gain.gain.value = 1;
    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(sharedCtx.destination);
    sharedAnalyser = analyser;
  } catch (e) {
    console.warn("[radio] analyser create failed", e);
    return null;
  }
  return sharedAnalyser;
}

export function createRadioEngine(version: string): RadioEngine {
  const listeners = new Set<(s: RadioState) => void>();
  let current: StreamInfo | null = loadCurrent<StreamInfo>();
  let track: TrackMeta | null = null;
  let playing = false;
  let loading = false;
  let volume = loadVolume();
  let muted = loadMuted();
  let wasPlaying = loadWasPlaying();

  // ponytail: useSyncExternalStore requires a stable snapshot. Returning a
  // fresh object from getState() makes React think the state changed every
  // time it re-reads, which triggers an infinite render loop. Cache the
  // snapshot and rebuild it only inside emit().
  let snapshot: RadioState = { current, track, playing, loading, volume, muted };
  const emit = () => {
    snapshot = { current, track, playing, loading, volume, muted };
    listeners.forEach((fn) => fn(snapshot));
  };

  const ensureAudioEl = () => ensureSharedAudio(volume, muted);

  // Autoplay gesture handling — see original AudioProvider for full rationale.
  const tryRestore = () => {
    if (!wasPlaying) return;
    const c = loadCurrent<StreamInfo>();
    if (!c) return;
    wasPlaying = false;
    current = c;
    loading = true;
    let done = false;
    const tryPlay = (inGesture: boolean) => {
      if (done) return;
      const a = ensureSharedAudio(volume, muted);
      if (a.src !== c.url) a.src = c.url;
      if (sharedCtx) {
        sharedCtx.resume().catch(() => {});
      } else if (inGesture) {
        ensureAnalyser();
      }
      const p = a.play();
      if (p && typeof p.then === "function") {
        p.then(() => { done = true; cleanup(); })
          .catch(() => { /* wait for gesture */ });
      } else {
        done = true;
        cleanup();
      }
    };
    const onGesture = () => { tryPlay(true); };
    const cleanup = () => {
      document.removeEventListener("pointerdown", onGesture, true);
      document.removeEventListener("keydown", onGesture, true);
      document.removeEventListener("touchstart", onGesture, true);
    };
    document.addEventListener("pointerdown", onGesture, true);
    document.addEventListener("keydown", onGesture, true);
    document.addEventListener("touchstart", onGesture, true);
    tryPlay(false);
  };

  const play = (s: StreamInfo) => {
    const a = ensureAudioEl();
    track = null;
    current = s;
    loading = true;
    if (a.src !== s.url) a.src = s.url;
    if (sharedCtx) {
      sharedCtx.resume().catch(() => {});
    } else {
      ensureAnalyser();
    }
    savePlaying(true);
    emit();
    a.play().catch(() => {
      playing = false;
      loading = false;
      savePlaying(false);
      emit();
    });
  };

  const toggle = () => {
    if (!sharedAudio) return;
    if (sharedAudio.paused) {
      if (!sharedAudio.src && current) sharedAudio.src = current.url;
      if (sharedCtx) sharedCtx.resume().catch(() => {});
      savePlaying(true);
      sharedAudio.play().catch(() => { savePlaying(false); });
    } else {
      sharedAudio.pause();
      savePlaying(false);
    }
  };

  const stop = () => {
    if (!sharedAudio) return;
    sharedAudio.pause();
    sharedAudio.src = "";
    current = null;
    track = null;
    playing = false;
    savePlaying(false);
    saveCurrent(null);
    emit();
  };

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    volume = clamped;
    saveVolume(clamped);
    if (sharedAudio && !muted) sharedAudio.volume = clamped;
    emit();
  };

  const toggleMute = () => {
    muted = !muted;
    saveMuted(muted);
    if (sharedAudio) sharedAudio.volume = muted ? 0 : volume;
    emit();
  };

  const setTrack = (t: TrackMeta | null) => {
    track = t;
    emit();
  };

  // Wire native events exactly once.
  if (!listenersWired) {
    const a = ensureSharedAudio(loadVolume(), loadMuted());
    const onPlaying = () => { playing = true;  loading = false; savePlaying(true);  emit(); };
    const onPause   = () => { playing = false;              savePlaying(false); emit(); };
    const onWaiting = () => { loading = true;  emit(); };
    const onCanPlay = () => { loading = false; emit(); };
    const onError   = () => { playing = false; loading = false; savePlaying(false); emit(); };
    a.addEventListener("playing", onPlaying);
    a.addEventListener("pause",   onPause);
    a.addEventListener("waiting", onWaiting);
    a.addEventListener("canplay", onCanPlay);
    a.addEventListener("error",   onError);
    listenersWired = true;
  }

  // Kick off the autoplay-restore handshake.
  tryRestore();

  // Persist current stream on every change.
  saveCurrent(current);

  return {
    version,
    streams: STREAMS,
    getState: () => snapshot,
    subscribe(fn) {
      listeners.add(fn);
      fn(snapshot);
      return () => { listeners.delete(fn); };
    },
    play,
    toggle,
    stop,
    setVolume,
    toggleMute,
    setTrack,
    getAudioElement: () => sharedAudio,
    getAnalyser: () => sharedAnalyser || ensureAnalyser(),
  };
}
