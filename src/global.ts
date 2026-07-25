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

import type { ThemeMode, AccentName, LateTheme } from "@late/theme";
export type { ThemeMode, AccentName };

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
  setTrack(t: TrackMeta | null): void;
  getAudioElement(): HTMLAudioElement | null;
  getAnalyser(): AnalyserNode | null;
}

declare global {
  interface Window {
    RadioEngine: RadioEngine;
    LateTheme?: LateTheme;
  }
}
