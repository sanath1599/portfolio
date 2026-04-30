"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

export function TypedLine({
  text,
  speed = 14,
  delay = 0,
  onDone,
  className = "",
}: {
  text: string;
  speed?: number;
  delay?: number;
  onDone?: () => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) {
      setShown(text);
      onDone?.();
      return;
    }
    let i = 0;
    let timer: number;
    const start = window.setTimeout(() => {
      const tick = () => {
        i++;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          onDone?.();
          return;
        }
        timer = window.setTimeout(tick, speed);
      };
      tick();
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span className={className}>{shown}</span>;
}
