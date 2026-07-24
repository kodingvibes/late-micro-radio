# late-micro-radio — Agent Notes

## What this is
- React micro-frontend for the Icecast radio UI.
- Built as an ESM bundle (`dist/entry.js` + `dist/style.css`) that the
  late.kodingvibes.com shell mounts into `<div id="micro-radio-root">` on
  the `/icecast` route.

## Build & release
After ANY change to `src/`:

1. Write commits in [Conventional Commits](https://www.conventionalcommits.org/) format (`feat:`, `fix:`, `chore:`, `docs:`, `BREAKING CHANGE:`, etc.).
2. Push to `main`.
3. Semantic Release (`.github/workflows/release.yml`) will bump `version` in `package.json`, generate `CHANGELOG.md`, create a GitHub release, and push a release commit.

An external deployment script watches the repo and handles building and
publishing the bundle automatically. **Do not run shell-side deploy
scripts manually from this repo.**

**Never bump the version manually** — the release workflow owns `package.json#version` and `CHANGELOG.md`.

## Day-to-day
- Typecheck only: `npm run lint` (= `tsc --noEmit`).
- Full build: `npm run build`.
- Dev server: `npm run dev` (port 5173).

## Backend coupling
- The radio consumes Icecast status from `/status-json.xsl` (proxied by nginx).
- `window.RadioEngine` is the single source of truth for audio playback and
  metadata; the shell reads from it via `useSyncExternalStore`.
