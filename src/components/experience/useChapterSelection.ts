"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp } from "@/lib/experience/score";

/** Direct selection holds until the visitor deliberately resumes the scroll journey. */
export function useChapterSelection(id: string, count: number) {
  const [index, setIndex] = useState(0),
    manual = useRef<number | null>(null);
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!document.documentElement.classList.contains("cinematic-active"))
        return;
      if (
        manual.current !== null &&
        Math.abs(scrollY - manual.current) < innerHeight * 0.18
      )
        return;
      manual.current = null;
      const p = clamp(
        -el.getBoundingClientRect().top /
          Math.max(1, el.offsetHeight - innerHeight),
      );
      setIndex(Math.min(count - 1, Math.floor(p * count)));
    };
    const scroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", scroll, { passive: true });
    return () => {
      removeEventListener("scroll", scroll);
      cancelAnimationFrame(raf);
    };
  }, [id, count]);
  const select = useCallback(
    (n: number) => {
      manual.current = scrollY;
      setIndex(clamp(n, 0, count - 1));
    },
    [count],
  );
  return [Math.min(index, count - 1), select] as const;
}
