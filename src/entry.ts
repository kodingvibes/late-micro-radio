import "./index.css";
import { createRoot } from "react-dom/client";
import { createRadioEngine } from "./engine/RadioEngine";
import { mountIcecastPage } from "./pages/Icecast/mount";

import pkg from "../package.json" with { type: "json" };

(globalThis as unknown as { __late_react_dom_client__: { createRoot: typeof createRoot } }).__late_react_dom_client__ = { createRoot };

declare global {
  interface Window {
    RadioEngine: ReturnType<typeof createRadioEngine>;
    __lateMicroRadioMount?: () => void;
  }
}

window.RadioEngine = createRadioEngine(pkg.version);

console.info("[micro-radio] v" + pkg.version + " loaded, " + window.RadioEngine.streams.length + " streams");

// ponytail: don't auto-mount. The shell calls __lateLoadMicro("radio") once
// the route is /icecast. This avoids loading two React instances on the
// same page (one per micro) which breaks useState/useEffect because each
// React has its own dispatcher state.
function tryMount() {
  const root = document.getElementById("micro-radio-root");
  if (root && !root.dataset.microMounted) {
    root.dataset.microMounted = "1";
    mountIcecastPage(root);
  }
}

// Expose the mount fn so the shell can call it explicitly.
window.__lateMicroRadioMount = tryMount;

// Try once (in case the shell already placed the slot before this script
// ran). Then watch for the slot to appear later (route change).
// Auto-deploy verified 2026-07-24.
tryMount();
if (typeof MutationObserver !== "undefined") {
  const obs = new MutationObserver(() => tryMount());
  obs.observe(document.body, { childList: true, subtree: true });
}
