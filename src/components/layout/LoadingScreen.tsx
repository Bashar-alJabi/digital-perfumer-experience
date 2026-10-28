"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";

export default function LoadingScreen() {
	const containerRef = useRef<HTMLDivElement>(null);
	const organismRef = useRef<SVGPathElement>(null);
	const glowRef = useRef<SVGCircleElement>(null);
	const coreRef = useRef<SVGCircleElement>(null);
	const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
	const dustRefs = useRef<(SVGCircleElement | null)[]>([]);

	useEffect(() => {
		const container = containerRef.current;
		const organism = organismRef.current;
		const glow = glowRef.current;
		const core = coreRef.current;

		if (!container || !organism || !glow || !core) return;

		const dots = dotRefs.current.filter(Boolean) as SVGCircleElement[];
		const dust = dustRefs.current.filter(Boolean) as SVGCircleElement[];

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		document.body.style.overflow = "hidden";

		const ctx = gsap.context(() => {
			/*
			 * THE ORGANISM
			 * Starts as one living mass.
			 */
			gsap.set(container, {
				opacity: 1,
			});

			gsap.set(organism, {
				opacity: 0,
				scale: 0.08,
				transformOrigin: "center",
			});

			gsap.set(glow, {
				opacity: 0,
				scale: 0.2,
				transformOrigin: "center",
			});

			gsap.set(core, {
				opacity: 0,
				scale: 0,
				transformOrigin: "center",
			});

			gsap.set(dots, {
				opacity: 0,
				scale: 0,
				transformOrigin: "center",
			});

			gsap.set(dust, {
				opacity: 0,
				scale: 0,
				transformOrigin: "center",
			});

			if (reducedMotion) {
				gsap.set(organism, {
					opacity: 1,
					scale: 1,
				});

				gsap.to(container, {
					opacity: 0,
					duration: 0.4,
					delay: 0.5,
					onComplete: () => {
						container.style.display = "none";
						window.dispatchEvent(new Event("dp:opening-ready"));
						document.body.style.overflow = "";
					},
				});

				return;
			}

			const tl = gsap.timeline({
				onComplete: () => {
					container.style.display = "none";
					document.body.style.overflow = "";
				},
			});

			/*
			 * PHASE 1
			 * Something wakes up.
			 */
			tl.to(glow, {
				opacity: 0.75,
				scale: 1,
				duration: 1.2,
				ease: "power2.out",
			})
				.to(
					organism,
					{
						opacity: 1,
						scale: 1,
						duration: 0.9,
						ease: "elastic.out(1, 0.55)",
					},
					"-=0.9",
				)
				.to(
					core,
					{
						opacity: 0.35,
						scale: 1,
						duration: 1,
						ease: "power2.out",
					},
					"-=1",
				);

			/*
			 * PHASE 2
			 * Breathing / living.
			 */
			tl.to(organism, {
				scaleX: 1.08,
				scaleY: 0.92,
				duration: 0.55,
				ease: "sine.inOut",
				yoyo: true,
				repeat: 1,
			})
				.to(
					glow,
					{
						scale: 1.35,
						opacity: 0.35,
						duration: 0.55,
						ease: "sine.inOut",
						yoyo: true,
						repeat: 1,
					},
					"<",
				)
				.to(
					core,
					{
						scale: 1.35,
						opacity: 0.5,
						duration: 0.55,
						ease: "sine.inOut",
						yoyo: true,
						repeat: 1,
					},
					"<",
				);

			/*
			 * PHASE 3
			 * The organism becomes unstable.
			 */
			tl.to(organism, {
				scale: 1.18,
				duration: 0.35,
				ease: "power2.in",
			}).to(organism, {
				scale: 0.88,
				duration: 0.3,
				ease: "power3.in",
			});

			/*
			 * PHASE 4
			 * Explosion / birth of the three notes.
			 */
			tl.to(
				organism,
				{
					opacity: 0,
					scale: 0.25,
					duration: 0.3,
					ease: "power4.in",
				},
				"+=0.05",
			)
				.to(
					core,
					{
						opacity: 0,
						scale: 2,
						duration: 0.35,
						ease: "power3.out",
					},
					"<",
				)
				.to(
					glow,
					{
						scale: 2.5,
						opacity: 0,
						duration: 0.55,
						ease: "power2.out",
					},
					"<",
				)
				.to(
					dots,
					{
						opacity: 1,
						scale: 1,
						duration: 0.7,
						stagger: 0.08,
						ease: "back.out(2.5)",
					},
					"-=0.15",
				);

			/*
			 * PHASE 5
			 * Each note behaves like a living creature.
			 */
			dots.forEach((dot, index) => {
				const angle = [-2.1, -1.05, 0.25][index] ?? 0;
				const distance = [115, 105, 125][index] ?? 110;

				tl.to(
					dot,
					{
						x: Math.cos(angle) * distance,
						y: Math.sin(angle) * distance,
						scale: [1.2, 0.85, 1.05][index] ?? 1,
						duration: 0.65,
						ease: "power2.out",
					},
					"-=0.55",
				);
			});

			/*
			 * Little fragments released during the split.
			 */
			tl.to(
				dust,
				{
					opacity: (index) => (index % 3 === 0 ? 0.65 : 0.3),
					scale: (index) => 0.5 + (index % 4) * 0.2,
					x: (index) => Math.cos(index * 1.7) * (70 + index * 4),
					y: (index) => Math.sin(index * 2.1) * (60 + index * 3),
					duration: 0.8,
					stagger: 0.015,
					ease: "power2.out",
				},
				"-=0.55",
			);

			/*
			 * PHASE 6
			 * They orbit each other.
			 */
			dots.forEach((dot, index) => {
				tl.to(
					dot,
					{
						x: Math.cos(index * 2.1) * 75,
						y: Math.sin(index * 2.1) * 75,
						rotation: index === 1 ? -12 : 12,
						duration: 0.9,
						ease: "sine.inOut",
					},
					"-=0.75",
				);
			});

			/*
			 * PHASE 7
			 * They recognize the logo shape.
			 */
			dots.forEach((dot, index) => {
				tl.to(
					dot,
					{
						x: (index - 1) * 28,
						y: 0,
						scale: 1,
						rotation: 0,
						duration: 1,
						ease: "expo.inOut",
					},
					"-=0.8",
				);
			});

			/*
			 * Final heartbeat.
			 */
			tl.to(dots, {
				scale: 1.25,
				duration: 0.35,
				stagger: 0.06,
				ease: "power2.inOut",
				yoyo: true,
				repeat: 1,
			});

			/*
			 * PHASE 8
			 * Logo dissolves into the website.
			 */
			tl.call(() => window.dispatchEvent(new Event("dp:opening-ready")));
			tl.to(dust, {
				opacity: 0,
				scale: 0,
				duration: 0.5,
			})
				.to(
					dots,
					{
						opacity: 0,
						scale: 2.2,
						duration: 0.7,
						stagger: 0.04,
						ease: "power3.in",
					},
					"-=0.2",
				)
				.to(
					container,
					{
						opacity: 0,
						scale: 1.08,
						duration: 1,
						ease: "power3.inOut",
					},
					"-=0.45",
				);
		}, container);

		return () => {
			ctx.revert();
			document.body.style.overflow = "";
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#090708]"
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
