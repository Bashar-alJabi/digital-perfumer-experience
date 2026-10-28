"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    const setup = () => {
      lenis?.destroy();
      lenis = undefined;
      if (
        media.matches ||
        document.documentElement.dataset.motion === "reduced"
      )
        return;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        anchors: true,
      });

      lenis.on("scroll", ScrollTrigger.update);
    };
    setup();
    media.addEventListener("change", setup);
    window.addEventListener("experience-motion", setup);

    const updateLenis = (time: number) => {
      lenis?.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      media.removeEventListener("change", setup);
      window.removeEventListener("experience-motion", setup);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
