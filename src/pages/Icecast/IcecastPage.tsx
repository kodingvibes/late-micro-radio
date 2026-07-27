import { useEffect, useRef, useSyncExternalStore } from "react";
import { useIcecastStatus } from "./useIcecastStatus";
import { MountCard } from "./MountCard";
import type { MountView } from "./useIcecastStatus";
import type { RadioState, StreamInfo, TrackMeta } from "@/global";
import { STREAMS } from "@/data/streams";
import { useTheme } from "@/providers/theme-provider";

function radioState(): RadioState {
  return window.RadioEngine.getState();
}
function radioSubscribe(fn: () => void): () => void {
  return window.RadioEngine.subscribe(fn);
}

export function IcecastPage() {
  const { mounts, totalListeners, isLoading } = useIcecastStatus();
  const { mode } = useTheme();
  const isLight = mode === "light";
  const radio = useSyncExternalStore(radioSubscribe, radioState, radioState);

  // Push track metadata into the radio engine. We compare against the
  // LAST value we sent (cached in a ref) instead of against
  // radio.track.raw, because the engine might receive updates from
  // OTHER sources (the audio element's metadata event) and we want to
  // avoid a feedback loop. We only re-emit when our derived `raw`
  // string actually changes.
  const lastSentRaw = useRef<string | null>(null);

  useEffect(() => {
    if (!radio.current) return;
    const meta = mounts.find((m) => m.name === radio.current?.mount);
    if (!meta) return;
    const track = meta.current_track ?? null;
    const artist = meta.current_artist ?? null;
    const raw: string | null = track
      ? (artist ? `${artist} - ${track}` : track)
      : null;
    if (raw === lastSentRaw.current) return;
    lastSentRaw.current = raw;
    const next: TrackMeta | null = raw
      ? { artist, title: track, raw }
      : null;
    window.RadioEngine.setTrack(next);
  }, [radio.current, mounts]);

  const handlePlay = (mount: MountView) => {
    const stream: StreamInfo | undefined = STREAMS.find((s) => s.name === mount.name);
    if (!stream || !window.RadioEngine) return;
    window.RadioEngine.play({
      ...stream,
      artist: mount.current_artist ?? undefined,
      title: mount.current_track ?? undefined,
    });
  };

  return (
    <div className={`relative min-h-screen bg-mf-surface ${isLight ? "text-slate-900" : "text-slate-100"}`}>
      {/* ponytail: subtle accent halo behind the page title. The
       * bg-mf-surface base is owned by the shell; this glow just
       * adds a touch of accent at the top so the page reads
       * distinct. opacity-50 keeps it tame in dark mode. */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[420px] -z-10 ${
          isLight ? "bg-accent-glow" : "bg-accent-glow opacity-50"
        }`}
        aria-hidden="true"
      />
      {/* ponytail: WhatsApp-style doodle wallpaper of musical motifs.
       * .bg-doodles sets positioning, theme-switching color and
       * opacity; .bg-musical-doodles in this micro's index.css adds
       * the six motifs. Stacked under glow + page content via -z-10. */}
      <div
        className="bg-doodles bg-musical-doodles"
        aria-hidden="true"
      />
      <div className="py-6 sm:py-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <p className={`text-sm mb-6 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          {`${totalListeners} oyentes · ${mounts.length} emisoras`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mounts.map((mount) => (
              <MountCard
                key={mount.name}
                mount={mount}
                isCurrent={radio.current?.mount === mount.name}
                isPlaying={radio.playing}
                onPlay={handlePlay}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
