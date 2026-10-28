"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import {
  chapterIds,
  clamp,
  composeScore,
  ease,
  sampleScore,
} from "@/lib/experience/score";

export default function Experience({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const initialAnchor = document.getElementById(location.hash.slice(1));
    let anchorRaf = 0;
    const reduced = () =>
      media.matches || document.documentElement.dataset.motion === "reduced";
    let importing = false;
    let disposeWorld: (() => void) | undefined,
      disposed = false,
      raf = 0;
    const root = document.documentElement;
    const chapters = chapterIds
      .map((id) => document.getElementById(id)!)
      .filter(Boolean);
    let bounds: { id: string; top: number; height: number }[] = [],
      score: ReturnType<typeof composeScore> = [];
    let world:
      | {
          draw: (frame: ReturnType<typeof sampleScore>, time: number) => void;
          dispose: () => void;
        }
      | undefined;
    let lastTime = 0;
    const measure = () => {
      bounds = chapters.map((el) => ({
        id: el.id,
        top: el.getBoundingClientRect().top + scrollY,
        height: el.offsetHeight,
      }));
      score = composeScore(bounds, innerHeight, innerWidth < 768);
    };
    const draw = (time: number) => {
      raf = 0;
      if (disposed || document.hidden) return;
      if (time - lastTime < 30) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastTime = time;
      const frame = sampleScore(score, scrollY);
      root.style.setProperty("--world-dark", String(frame.dark));
      const label = document.querySelector<HTMLElement>(".chapter-caption");
      let current = 0;
      chapters.forEach((el, i) => {
        const b = bounds[i],
          p = clamp((scrollY - b.top) / Math.max(1, b.height - innerHeight));
        el.style.setProperty("--chapter-progress", String(p));
        el.dataset.progress = p.toFixed(3);
        if (scrollY >= b.top - innerHeight * 0.35) current = i;
        if (el.id === "philosophy" && !reduced()) {
          el.querySelectorAll<HTMLElement>(".note-card").forEach((card, j) => {
            const q = p * 3 - j,
              visible = q > 0.16 && q < 0.78;
            card.style.opacity = String(
              ease((q - 0.13) / 0.1) * (1 - ease((q - 0.73) / 0.09)),
            );
            card.inert = !visible;
            card.style.transform = `translateY(${(1 - ease((q - 0.13) / 0.1)) * 18}px)`;
          });
          const manifesto = el.querySelector<HTMLElement>(".manifesto");
          if (manifesto)
            manifesto.style.transform = `perspective(1200px) rotateY(${(p - 0.5) * -8}deg) translateZ(${Math.sin(p * Math.PI) * 24}px)`;
        }
        if (el.id === "memory" && !reduced())
          el.querySelectorAll<HTMLElement>(".memory-statement").forEach(
            (item, j) => {
              const q = p * 3 - j;
              item.style.opacity = String(
                ease(q / 0.16) * (j === 2 ? 1 : 1 - ease((q - 0.8) / 0.18)),
              );
              item.style.transform = `perspective(900px) translateZ(${(q - 0.5) * 70}px) translateY(${(1 - ease(q / 0.16)) * 35}px)`;
            },
          );
        if (el.id === "impact")
          el.querySelectorAll<HTMLElement>(".achievement").forEach(
            (item, j) => {
              item.style.setProperty("--ring-fill", String(ease(p * 4 - j)));
            },
          );
      });
      root.dataset.chapter = chapterIds[current];
      if (label)
        label.textContent = `${String(current + 1).padStart(2, "0")} / ${String(chapterIds.length).padStart(2, "0")} — ${["The origin", "Three notes, three ideas", "The formula", "The perfumer", "The impact", "The compositions", "Scent memory", "The ingredients", "The signature", "Full circle"][current]}`;
      world?.draw(frame, time * 0.001);
      if (!reduced()) raf = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const setup = () => {
      root.classList.toggle("cinematic-active", !reduced());
      measure();
      schedule();
      const toggle =
        document.querySelector<HTMLButtonElement>(".motion-toggle");
      if (toggle) {
        toggle.textContent = reduced() ? "Motion: reduced" : "Reduce motion";
        toggle.setAttribute("aria-pressed", String(reduced()));
        toggle.disabled = media.matches;
      }
      if (reduced()) {
        world?.dispose();
        world = undefined;
        root.classList.remove("has-world");
        document.querySelectorAll<HTMLElement>(".note-card").forEach((c) => {
          c.inert = false;
        });
      } else if (!world && !importing) {
        importing = true;
        import("./world")
          .then(({ createWorld }) => {
            importing = false;
            if (disposed || reduced()) return;
            const host = document.getElementById("fragrance-world");
            if (!host) return;
            try {
              world = createWorld(host, () => {
                root.classList.remove("has-world");
              });
              disposeWorld = world.dispose;
              root.classList.add("has-world");
              measure();
              schedule();
            } catch {
              root.classList.remove("has-world");
            }
          })
          .catch(() => {
            importing = false;
            root.classList.remove("has-world");
          });
      }
    };
    const resize = () => {
      measure();
      schedule();
    };
    const restoreAnchor = () => {
      if (disposed || !initialAnchor) return;
      cancelAnimationFrame(anchorRaf);
      anchorRaf = requestAnimationFrame(() => {
        window.scrollTo({
          top: initialAnchor.getBoundingClientRect().top + scrollY,
          behavior: "instant",
        });
        resize();
      });
    };
    const changeMotion = () => {
      const active =
        chapters.find((el) => el.id === root.dataset.chapter) ?? chapters[0];
      const previous = bounds.find((b) => b.id === active.id)!;
      const progress = clamp(
        (scrollY - previous.top) / Math.max(1, previous.height - innerHeight),
      );
      setup();
      const next = bounds.find((b) => b.id === active.id)!;
      window.scrollTo({
        top: next.top + progress * Math.max(0, next.height - innerHeight),
        behavior: "instant",
      });
      schedule();
    };
    setup();
    const observer = new ResizeObserver(resize);
    chapters.forEach((el) => observer.observe(el));
    document.fonts.ready.then(() => {
      if (!disposed) {
        resize();
        restoreAnchor();
      }
    });
    if (document.readyState === "complete") restoreAnchor();
    else addEventListener("load", restoreAnchor, { once: true });
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", resize);
    media.addEventListener("change", changeMotion);
    addEventListener("experience-motion", changeMotion);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(anchorRaf);
      removeEventListener("load", restoreAnchor);
      observer.disconnect();
      disposeWorld?.();
      media.removeEventListener("change", changeMotion);
      removeEventListener("experience-motion", changeMotion);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", schedule);
      root.classList.remove("cinematic-active", "has-world");
    };
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <div className="world-atmosphere" aria-hidden="true" />
      <div id="fragrance-world" aria-hidden="true" />
      <a className="skip-link" href="#work">
        Skip to work
      </a>
      {children}
      <button
        type="button"
        className="motion-toggle"
        aria-pressed="false"
        onClick={() => {
          const root = document.documentElement;
          root.dataset.motion = root.classList.contains("cinematic-active")
            ? "reduced"
            : "full";
          dispatchEvent(new Event("experience-motion"));
        }}
      >
        Reduce motion
      </button>
      <div className="chapter-caption" aria-hidden="true">
        01 / 10 — The origin
      </div>
    </MotionConfig>
  );
}
