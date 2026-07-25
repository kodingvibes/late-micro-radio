import { createContext, useContext, useEffect, useState } from "react";
import type { LateTheme } from "@/global";

interface ThemeContextValue {
  mode: LateTheme["mode"];
  accent: LateTheme["accent"];
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DEFAULT_THEME: LateTheme = {
  mode: "dark",
  accent: "indigo",
  accentPrimary: "#6366f1",
  accentSoft: "#818cf8",
  accentRing: "#a5b4fc",
  accentGlowA: "rgba(99,102,241,0.70)",
  accentGlowB: "rgba(99,102,241,0.45)",
  accentGlowALight: "rgba(79,70,229,0.60)",
  accentGlowBLight: "rgba(99,102,241,0.35)",
};

function snapshotFromWindow(): LateTheme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  return window.LateTheme ?? DEFAULT_THEME;
}

function applyToDocument(t: LateTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("theme-light", t.mode === "light");
  root.classList.toggle("theme-dark", t.mode === "dark");
  root.style.setProperty("--accent-primary", t.accentPrimary);
  root.style.setProperty("--accent-soft", t.accentSoft);
  root.style.setProperty("--accent-ring", t.accentRing);
  // ponytail: pre-baked rgba tones from the shell so the
  // page-level halo tracks the accent. The shell sets these
  // in :root when it dispatches `late:theme-change`.
  root.style.setProperty("--accent-glow-a", t.accentGlowA);
  root.style.setProperty("--accent-glow-b", t.accentGlowB);
  root.style.setProperty("--accent-glow-a-light", t.accentGlowALight);
  root.style.setProperty("--accent-glow-b-light", t.accentGlowBLight);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LateTheme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = snapshotFromWindow();
    setState(initial);
    applyToDocument(initial);
    setMounted(true);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<LateTheme>).detail ?? snapshotFromWindow();
      setState(detail);
      applyToDocument(detail);
    };
    window.addEventListener("late:theme-change", onChange as EventListener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "late.theme") {
        const next = snapshotFromWindow();
        setState(next);
        applyToDocument(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("late:theme-change", onChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <ThemeContext.Provider
      value={{ mode: state.mode, accent: state.accent, mounted }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext) ?? { mode: "dark", accent: "indigo", mounted: false };
}
