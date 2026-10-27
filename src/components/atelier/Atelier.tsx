"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  chapters,
  getAtelier,
  setAtelier,
  useAtelier,
} from "@/lib/atelier-state";

export default function Atelier({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useAtelier();
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem("atelier-motion");
    } catch {
      /* OS preference remains available. */
    }
    setAtelier({ reduced: media.matches || saved === "reduced" });
    const update = () => setAtelier({ reduced: media.matches });
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    // Progress and section labels also work without WebGL and with reduced motion.
    let scheduled = 0;
    const update = () => {
      scheduled = 0;
      if (!root.current || root.current.dataset.enhanced === "true") return;
      const y = window.scrollY;
      let chapter = 0;
      chapters.forEach((item, index) => {
        const section = document.getElementById(item.id);
        if (section && section.offsetTop <= y + window.innerHeight * 0.35)
          chapter = index;
      });
      setAtelier({ chapter, enhanced: false });
      const progress =
        y /
        Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.current.style.setProperty("--journey-progress", String(progress));
      root.current
        .querySelector(".scroll-perfume")
        ?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    };
    const schedule = () => {
      if (!scheduled) scheduled = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(scheduled);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const element = root.current;
    if (!element || !canvas.current || state.reduced) return;
    import("./atelier-engine")
      .then(({ createAtelier }) => {
        if (disposed || !canvas.current) return;
        try {
          cleanup = createAtelier(element, canvas.current);
        } catch (error) {
          console.warn(
            "Atelier unavailable; using the accessible portfolio.",
            error,
          );
          element.dataset.enhanced = "false";
        }
      })
      .catch(() => {
        element.dataset.enhanced = "false";
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [state.reduced]);
  const toggle = () => {
    const id = chapters[getAtelier().chapter].id;
    if (root.current) root.current.dataset.resumeChapter = id;
    const reduced = !getAtelier().reduced;
    try {
      sessionStorage.setItem("atelier-motion", reduced ? "reduced" : "full");
    } catch {
      /* The control still works for this visit. */
    }
    setAtelier({ reduced });
    if (reduced)
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
      });
  };
  return (
    <div ref={root} className="atelier" data-reduced={state.reduced}>
      <div className="atelier-world" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <div className="atelier-grain" aria-hidden="true" />
      {children}
      <button
        className="motion-toggle"
        onClick={toggle}
        aria-pressed={state.reduced}
        aria-label={
          state.reduced ? "Enable cinematic motion" : "Reduce cinematic motion"
        }
      >
        <span aria-hidden="true">{state.reduced ? "Ⅱ" : "≈"}</span> Motion:{" "}
        {state.reduced ? "Reduced" : "Full"}
      </button>
    </div>
  );
}
