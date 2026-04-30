"use client";

import { useEffect, useRef, useState } from "react";

export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let dotX = -40;
    let dotY = -40;
    let glowX = -40;
    let glowY = -40;
    let targetX = -40;
    let targetY = -40;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const isText =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as HTMLElement).isContentEditable);
      const dot = dotRef.current;
      const glow = glowRef.current;
      if (dot) dot.style.opacity = isText ? "0" : "1";
      if (glow) glow.style.opacity = isText ? "0" : "0.7";
      targetX = e.clientX;
      targetY = e.clientY;
      dotX = targetX;
      dotY = targetY;
    };

    const tick = () => {
      glowX += (targetX - glowX) * 0.18;
      glowY += (targetY - glowY) * 0.18;
      const dot = dotRef.current;
      const glow = glowRef.current;
      if (dot) dot.style.transform = `translate3d(${dotX - 4}px, ${dotY - 8}px, 0)`;
      if (glow) glow.style.transform = `translate3d(${glowX - 60}px, ${glowY - 60}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style jsx>{`
        :global(html) { cursor: none; }
        :global(button), :global(a), :global([data-pointer="true"]) { cursor: none; }
      `}</style>
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-[120px] w-[120px] rounded-full opacity-0 transition-opacity duration-200 will-change-transform"
        style={{
          background:
            "radial-gradient(circle, rgba(94,230,168,0.18) 0%, rgba(94,230,168,0) 60%)",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-[14px] w-[8px] opacity-0 transition-opacity duration-150 will-change-transform"
        style={{
          background: "var(--color-mint)",
          boxShadow: "0 0 8px rgba(94,230,168,0.6)",
        }}
      />
    </>
  );
}
