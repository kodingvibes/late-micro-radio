import { useEffect, useState, useSyncExternalStore } from "react";
import { IcecastPage } from "./IcecastPage";

// Mount helper: the shell renders <div id="micro-radio-root" /> on /icecast
// and we drop our own React tree into it. Re-mounts on every route change
// are cheap; the RadioEngine singleton (window.RadioEngine) survives.
export function mountIcecastPage(root: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ReactDOMClient = (globalThis as any).__late_react_dom_client__;
  if (!ReactDOMClient?.createRoot) {
    root.textContent = "[micro-radio] react-dom/client no disponible";
    return;
  }
  const reactRoot = ReactDOMClient.createRoot(root);
  reactRoot.render(<IcecastPage />);
  return () => reactRoot.unmount();
}
