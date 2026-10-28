"use client";

import { useScore } from "@/components/three-notes/ThreeNotesProvider";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function LoadingScreen() {
	const score = useScore();
	const containerRef = useRef<HTMLDivElement>(null);
	const organismRef = useRef<SVGPathElement>(null);
	const glowRef = useRef<SVGCircleElement>(null);
	const coreRef = useRef<SVGCircleElement>(null);
	const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
	const dustRefs = useRef<(SVGCircleElement | null)[]>([]);


	useEffect(() => {
		const container = containerRef.current!;
		const organism = organismRef.current!;
		const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];
		const dust = dustRefs.current.filter(Boolean) as SVGCircleElement[];
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		const previousOverflow = document.documentElement.style.overflow;
		const previousBodyOverflow = document.body.style.overflow;
		let cancelled = false;
		let timeout: ReturnType<typeof setTimeout>;
		let minimum: ReturnType<typeof setTimeout>;
		let unsubscribe: (() => void) | undefined;
		let exit: gsap.core.Timeline | undefined;
		score.intro.set(0);
		document.documentElement.dataset.notesLoading = "true";
		document.documentElement.style.overflow = "hidden";
		document.body.style.overflow = "hidden";
		const unlock = () => {
			document.documentElement.style.overflow = previousOverflow;
			document.body.style.overflow = previousBodyOverflow;
			delete document.documentElement.dataset.notesLoading;
			window.dispatchEvent(new Event("three-notes-loaded"));
		};
		const ctx = gsap.context(() => {
			gsap.set([organism, glowRef.current, coreRef.current], { transformOrigin: "center" });
			gsap.set(organism, { scale: .1, opacity: 0 });
			gsap.set([dots, dust], { opacity: 0 });
			gsap.fromTo(glowRef.current, { scale: .3, opacity: 0 }, { scale: 1, opacity: .75, duration: reduced ? 0 : .55 });
			gsap.to(organism, { scale: 1, opacity: 1, duration: reduced ? 0 : .55, ease: "power3.out" });
			gsap.to(coreRef.current, { opacity: .35, duration: .5 });
		}, container);
		const ready = new Promise<void>(resolve => {
			if (score.ready.get()) resolve();
			else unsubscribe = score.ready.on("change", value => { if (value) resolve(); });
		});
		const deadline = new Promise<void>(resolve => { timeout = setTimeout(resolve, reduced ? 350 : 1800); });
		const opening = new Promise<void>(resolve => { minimum = setTimeout(resolve, reduced ? 0 : 480); });
		void Promise.all([opening, Promise.race([Promise.all([document.fonts.ready, ready]), deadline])]).then(() => {
			if (cancelled) return;
			clearTimeout(timeout); unsubscribe?.();
			// No project images block entry: those assets are intentionally lazy, below the fold.
			const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-signature] [data-note-anchor]"));
			const skipFlight = reduced || window.scrollY > innerHeight * .5 || (location.hash !== "" && location.hash !== "#home");
			const scale = Math.max(innerWidth / 1000, innerHeight / 1000);
			const intro = { value: 0 };
			exit = gsap.timeline({ onComplete: () => {
				container.style.display = "none";
				score.intro.set(1); unlock();
			} });
			exit.to([organism, coreRef.current, glowRef.current], { opacity: 0, scale: .3, duration: skipFlight ? .1 : .3 });
			if (!skipFlight) {
				exit.to(dots, { opacity: 1, duration: .2, stagger: .04 }, "<");
				dots.forEach((dot, i) => {
					const box = targets[i]?.getBoundingClientRect();
					if (!box) return;
					exit!.to(dot, {
						x: (box.left + box.width / 2 - innerWidth / 2) / scale,
						y: (box.top + box.height / 2 - innerHeight / 2) / scale,
						attr: { r: box.width / 2 / scale, fill: ["#f36371", "#ffd8df", "#000000"][i] },
						duration: .65, ease: "power3.inOut",
					}, .22);
				});
				exit.to(dust, { opacity: .4, x: i => Math.cos(i * 2.1) * (60 + i * 3), y: i => Math.sin(i * 1.7) * (60 + i * 2), duration: .35 }, .1)
					.to(dust, { opacity: 0, duration: .3 }, .45)
					.to(container, { backgroundColor: "#ffeff5", duration: .55 }, .18)
					.to(container.querySelectorAll(".dp-label"), { opacity: 0, duration: .2 }, .15);
			}
			exit.to(intro, { value: 1, duration: skipFlight ? .12 : .5, onUpdate: () => score.intro.set(intro.value) }, skipFlight ? .05 : .52)
				.to(container, { opacity: 0, duration: skipFlight ? .15 : .5 }, skipFlight ? .05 : .58);
		});
		return () => {
			cancelled = true; clearTimeout(timeout); clearTimeout(minimum); unsubscribe?.(); exit?.kill(); ctx.revert(); unlock();
		};
	}, [score]);

	return (
		<div
			ref={containerRef}
			data-lenis-prevent
			className="notes-loader fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#090708]"
			role="status"
			aria-label="Entering Digital Perfumer"
		>
			<svg
				className="absolute inset-0 h-full w-full"
				viewBox="0 0 1000 1000"
				preserveAspectRatio="xMidYMid slice"
				aria-hidden="true"
			>
				<defs>
					<radialGradient id="perfumeOrganism">
						<stop offset="0%" stopColor="#fff7fa" />
						<stop offset="30%" stopColor="#ffd8df" />
						<stop offset="65%" stopColor="#f36371" />
						<stop offset="100%" stopColor="#080607" />
					</radialGradient>

					<radialGradient id="perfumeGlow">
						<stop offset="0%" stopColor="#f36371" stopOpacity="0.55" />
						<stop offset="45%" stopColor="#ffd8df" stopOpacity="0.18" />
						<stop offset="100%" stopColor="#090708" stopOpacity="0" />
					</radialGradient>

					<filter id="organicBlur">
						<feGaussianBlur stdDeviation="16" />
					</filter>

					<filter id="softGlow">
						<feGaussianBlur stdDeviation="28" />
					</filter>
				</defs>

				{/* Ambient organism aura */}
				<circle
					ref={glowRef}
					cx="500"
					cy="500"
					r="180"
					fill="url(#perfumeGlow)"
					filter="url(#softGlow)"
				/>

				{/* Living core */}
				<circle
					ref={coreRef}
					cx="500"
					cy="500"
					r="85"
					fill="#f36371"
					filter="url(#organicBlur)"
				/>

				{/* Main organism */}
				<path
					ref={organismRef}
					d="
						M 500 335
						C 565 350 615 405 640 465
						C 670 535 625 600 570 645
						C 520 685 455 675 400 650
						C 335 620 320 555 345 495
						C 365 445 385 400 430 365
						C 450 350 475 340 500 335
						Z
					"
					fill="url(#perfumeOrganism)"
					filter="url(#organicBlur)"
				/>

				{/* Living fragments */}
				{Array.from({ length: 28 }, (_, index) => (
					<circle
						key={index}
						ref={(element) => {
							dustRefs.current[index] = element;
						}}
						cx="500"
						cy="500"
						r={1.5 + (index % 4)}
						fill={
							index % 3 === 0
								? "#f36371"
								: index % 3 === 1
									? "#ffd8df"
									: "#ffffff"
						}
					/>
				))}

				{/* The three living notes */}
				<g transform="translate(500 500)">
					<circle
						ref={(element) => {
							dotRefs.current[0] = element;
						}}
						cx="0"
						cy="0"
						r="10"
						fill="#f36371"
					/>

					<circle
						ref={(element) => {
							dotRefs.current[1] = element;
						}}
						cx="0"
						cy="0"
						r="10"
						fill="#ffd8df"
						stroke="#f36371"
						strokeWidth="1.5"
					/>

					<circle
						ref={(element) => {
							dotRefs.current[2] = element;
						}}
						cx="0"
						cy="0"
						r="10"
						fill="#ffffff"
					/>
				</g>
			</svg>

			{/* Minimal cinematic typography */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
				<p className="dp-label tracking-[0.45em] text-white/35">
					DIGITAL PERFUMER
				</p>
			</div>

			<div className="absolute left-8 top-8 dp-label tracking-[0.3em] text-white/20">
				TOP / HEART / BASE
			</div>
		</div>
	);
}
