"use client";

import { useEffect, useState } from "react";

function format(d: Date): { time: string; date: string } {
  const time = d
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "UTC",
    })
    .replace(/\s/g, "");
  const date = d
    .toLocaleDateString("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  return { time, date };
}

export function useClock(): { time: string; date: string } {
  const [now, setNow] = useState<{ time: string; date: string }>({
    time: "--:--:--",
    date: "----/--/--",
  });

  useEffect(() => {
    const tick = () => setNow(format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

export function useSession(): { elapsed: string } {
  const [start] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState("0s");

  useEffect(() => {
    const tick = () => {
      const seconds = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      setElapsed(m > 0 ? `${m}m${String(s).padStart(2, "0")}s` : `${s}s`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [start]);

  return { elapsed };
}
