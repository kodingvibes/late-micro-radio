import { useState, useEffect, useMemo } from "react";
import { parseStreamTitle } from "@/lib/parseStreamTitle";
import { STREAMS } from "@/data/streams";

interface IcecastRawSource {
  listenurl?: string;
  listeners: number;
  title?: string;
  bitrate?: number;
  samplerate?: number;
  channels?: number;
  server_type?: string;
}

export interface RawMountMeta {
  listeners: number;
  title: string | null;
  bitrate: number | null;
  samplerate: number | null;
  channels: number | null;
}

export interface MountView {
  name: string;
  display_name: string;
  stream_url: string;
  listeners: number;
  current_track: string | null;
  current_artist: string | null;
  audio_info: { bitrate: number; samplerate: number | null; channels: number | null } | null;
  is_active: boolean;
}

const MOUNT_NAMES = STREAMS.map((s) => s.name);

function streamUrl(name: string): string {
  return `${window.location.origin}/${name}`;
}

async function fetchIcecastStatus(): Promise<Map<string, RawMountMeta>> {
  const resp = await fetch("/status-json.xsl", { cache: "no-store" });
  if (!resp.ok) throw new Error(`status ${resp.status}`);
  const json = await resp.json();
  const raw = json?.icestats?.source;
  if (!raw) return new Map();

  const sources: IcecastRawSource[] = Array.isArray(raw) ? raw : [raw];
  const map = new Map<string, RawMountMeta>();

  for (const src of sources) {
    const mount = src.listenurl?.split("/").filter(Boolean).pop();
    if (!mount) continue;
    map.set(mount, {
      listeners: src.listeners ?? 0,
      title: src.title ?? null,
      bitrate: src.bitrate ?? null,
      samplerate: src.samplerate ?? null,
      channels: src.channels ?? null,
    });
  }
  return map;
}

export function useIcecastStatus() {
  const [rawData, setRawData] = useState<Map<string, RawMountMeta>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchOnce = async () => {
      try {
        if (cancelled) return;
        const data = await fetchIcecastStatus();
        if (!cancelled) {
          setRawData(data);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchOnce();
    const t = setInterval(fetchOnce, 5000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const mounts = useMemo(() => {
    return MOUNT_NAMES.map((name) => {
      const meta = rawData.get(name);
      const stream = STREAMS.find((s) => s.name === name);
      const { track, artist } = meta?.title
        ? parseStreamTitle(meta.title)
        : { track: null, artist: null };
      return {
        name: stream?.name ?? name,
        display_name: stream?.category ?? name,
        stream_url: streamUrl(name),
        listeners: meta?.listeners ?? 0,
        current_track: track,
        current_artist: artist,
        audio_info: meta?.bitrate
          ? { bitrate: meta.bitrate, samplerate: meta.samplerate ?? null, channels: meta.channels ?? null }
          : null,
        is_active: true,
      } satisfies MountView;
    });
  }, [rawData]);

  const totalListeners = useMemo(() => mounts.reduce((acc, m) => acc + m.listeners, 0), [mounts]);

  return { mounts, totalListeners, isLoading };
}
