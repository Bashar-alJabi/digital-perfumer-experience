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
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		let lenis: Lenis | undefined;
		const updateLenis = (time: number) => {
			lenis?.raf(time * 1000);
		};
		const configure = () => {
			gsap.ticker.remove(updateLenis);
			lenis?.destroy(); lenis = undefined;
			if (reduced.matches) return;
			lenis = new Lenis({ duration: 0.85, smoothWheel: true, anchors: true,
				easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			});
			lenis.on("scroll", ScrollTrigger.update);
			if (document.documentElement.dataset.notesLoading) lenis.stop();
			gsap.ticker.add(updateLenis);
		};
		const resume = () => lenis?.start();
		window.addEventListener("three-notes-loaded", resume);
		reduced.addEventListener("change", configure);
		configure();

		return () => {
			window.removeEventListener("three-notes-loaded", resume);
			reduced.removeEventListener("change", configure);
			gsap.ticker.remove(updateLenis);
			lenis?.destroy();
		};
	}, []);

	return <>{children}</>;
}
