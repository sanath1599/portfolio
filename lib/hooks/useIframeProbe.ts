"use client";

import { useEffect, useRef, useState } from "react";

export type IframeProbeState = "loading" | "ready" | "blocked";

/**
 * Probes whether an iframe can be embedded.
 * - Listens for `load` (with a 2.5s timeout)
 * - On load, tries to read contentWindow.location — a SecurityError throw is
 *   actually the success signal (cross-origin iframe loaded), while a readable
 *   "about:blank" indicates a blocked load.
 *
 * Returns the probe state plus a ref the caller binds to the iframe.
 */
export function useIframeProbe(url: string | null, timeoutMs = 2500) {
  const [state, setState] = useState<IframeProbeState>("loading");
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!url) return;
    setState("loading");
    const node = iframeRef.current;
    if (!node) return;

    let settled = false;
    const settle = (next: IframeProbeState) => {
      if (settled) return;
      settled = true;
      setState(next);
    };

    const onLoad = () => {
      // give the document a tick to populate
      window.setTimeout(() => {
        try {
          const href = node.contentWindow?.location?.href;
          if (!href) {
            settle("ready");
            return;
          }
          // about:blank or empty means the browser didn't really navigate
          if (href === "about:blank" || href === "") {
            settle("blocked");
            return;
          }
          settle("ready");
        } catch {
          // SecurityError → cross-origin → loaded successfully
          settle("ready");
        }
      }, 80);
    };

    const onError = () => settle("blocked");

    node.addEventListener("load", onLoad);
    node.addEventListener("error", onError);

    const timer = window.setTimeout(() => settle("blocked"), timeoutMs);

    return () => {
      node.removeEventListener("load", onLoad);
      node.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };
  }, [url, timeoutMs]);

  return { state, iframeRef };
}
