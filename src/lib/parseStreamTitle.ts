// Icecast status title parser. Moved from the shell's lib/chat/domain/parsers.ts
// (the rest of that file is chat-specific and stays in the shell until Phase 3).
// ponytail: Icecast stream titles come as "Artist - Track" with a hyphen-minus-
// space separator. SomaFM titles sometimes use em-dash or en-dash; we accept all.
export function parseStreamTitle(title: string): { track: string | null; artist: string | null } {
  const trimmed = title.trim();
  if (!trimmed) return { track: null, artist: null };
  const seps = [" - ", " \u2014 ", " \u2013 "];
  for (const sep of seps) {
    const idx = trimmed.indexOf(sep);
    if (idx !== -1) {
      return { artist: trimmed.slice(0, idx), track: trimmed.slice(idx + sep.length) };
    }
  }
  return { track: trimmed, artist: null };
}
