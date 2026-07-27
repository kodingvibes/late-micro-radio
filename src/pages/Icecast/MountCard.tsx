import { Play } from "lucide-react";
import { STREAMS } from "@/data/streams";
import type { MountView } from "./useIcecastStatus";

interface MountCardProps {
  mount: MountView;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (mount: MountView) => void;
}

function labelFor(name: string) {
  const s = STREAMS.find((x) => x.name === name);
  return {
    emoji: s?.emoji ?? "\u266A",
    name: s?.category ?? name,
    color: s?.accent ?? "text-accent",
  };
}

export function MountCard({ mount, isCurrent, isPlaying, onPlay }: MountCardProps) {
  const mlabel = labelFor(mount.name);

  return (
    <button
      onClick={() => onPlay(mount)}
      className={[
        "group text-left p-5 rounded-2xl transition-all shadow-card backdrop-blur-sm bg-transparent",
        isCurrent
          ? "bg-accent/10"
          : "hover:bg-accent/5",
      ].join(" ")}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{mlabel.emoji}</span>
          <span className={`font-bold ${mlabel.color}`}>{mlabel.name}</span>
        </div>
        {isCurrent && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isPlaying ? "reproduciendo" : "pausado"}
          </span>
        )}
      </div>
      <div className="text-sm text-slate-300 truncate">
        {mount.current_track ? (
          <>
            {mount.current_artist && <span className="text-slate-500">{mount.current_artist} — </span>}
            {mount.current_track}
          </>
        ) : (
          <span className="text-slate-500 italic">sin metadata</span>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>{mount.listeners} oyentes</span>
        <span className={`flex items-center gap-1 ${mlabel.color}`}>
          <Play className="w-3 h-3" />
          play
        </span>
      </div>
    </button>
  );
}
