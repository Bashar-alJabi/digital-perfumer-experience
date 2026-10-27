"use client";
import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { useAtelier } from "@/lib/atelier-state";
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { reduced } = useAtelier();
  useEffect(() => {
    // Native scrolling remains the source of truth, including anchors and touch.
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    function update() {
      lenis?.destroy();
      lenis = undefined;
      if (!media.matches && !reduced)
        lenis = new Lenis({
          autoRaf: true,
          lerp: 0.09,
          smoothWheel: true,
          anchors: true,
        });
    }
    update();
    media.addEventListener("change", update);
    const seek = (event: Event) => {
      const top = (event as CustomEvent<{ top: number }>).detail.top;
      if (lenis) lenis.scrollTo(top, { immediate: true });
      else window.scrollTo({ top, behavior: "instant" });
    };
    window.addEventListener("atelier-seek", seek);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("atelier-seek", seek);
      lenis?.destroy();
    };
  }, [reduced]);
  return <>{children}</>;
}
