export {};

export type StreamInfo = {
  name: string;
  url: string;
  mount: string;
  artist?: string;
  title?: string;
  category?: string;
  emoji?: string;
  accent?: string;
};

export type TrackMeta = {
  artist: string | null;
  title: string | null;
  raw: string | null;
};

export type RadioState = {
  current: StreamInfo | null;
  track: TrackMeta | null;
  playing: boolean;
  loading: boolean;
  volume: number;
  muted: boolean;
};

export interface RadioEngine {
  version: string;
  streams: readonly StreamInfo[];
  getState(): RadioState;
  subscribe(fn: (s: RadioState) => void): () => void;
  play(s: StreamInfo): void;
  toggle(): void;
  stop(): void;
  setVolume(v: number): void;
  toggleMute(): void;
  // ponytail: Icecast metadata update from the page (e.g. SomaFM title
  // changes while the same stream keeps playing). The engine's own audio
  // element emits metadata events, but those only fire on load. For
  // mid-play metadata updates, the page calls setTrack().
  setTrack(t: TrackMeta | null): void;
  getAudioElement(): HTMLAudioElement | null;
  getAnalyser(): AnalyserNode | null;
}

declare global {
  interface Window {
    RadioEngine: RadioEngine;
  }
}
