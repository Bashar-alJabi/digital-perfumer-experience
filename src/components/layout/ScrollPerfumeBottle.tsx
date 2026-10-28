"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const sections = [
	{ id: "home", name: "HOME" },
	{ id: "philosophy", name: "PHILOSOPHY" },
	{ id: "formula", name: "FORMULA" },
	{ id: "about", name: "ABOUT" },
	{ id: "impact", name: "IMPACT" },
	{ id: "work", name: "WORK" },
	{ id: "memory", name: "MEMORY" },
	{ id: "skills", name: "SKILLS" },
	{ id: "contact", name: "CONTACT" },
];

export default function ScrollPerfumeBottle() {
	const { scrollYProgress } = useScroll();

	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 90,
		damping: 24,
		mass: 0.4,
	});

	const liquidHeight = useTransform(smoothProgress, [0, 1], ["88%", "0%"]);

	const liquidY = useTransform(smoothProgress, [0, 0.5, 1], [0, -1.5, 0]);

	const glowOpacity = useTransform(
		smoothProgress,
		[0, 0.45, 1],
		[0.28, 0.16, 0],
	);

	const [activeSection, setActiveSection] = useState("HOME");

	useEffect(() => {
		const updateActiveSection = () => {
			const viewportPosition = window.scrollY + window.innerHeight * 0.4;

			let currentSection = sections[0];

			for (const section of sections) {
				const element = document.getElementById(section.id);

				if (!element) continue;

				if (element.offsetTop <= viewportPosition) {
					currentSection = section;
				}
			}

			setActiveSection(currentSection.name);
		};

		updateActiveSection();

		window.addEventListener("scroll", updateActiveSection, {
			passive: true,
		});

		window.addEventListener("resize", updateActiveSection);

		return () => {
			window.removeEventListener("scroll", updateActiveSection);
			window.removeEventListener("resize", updateActiveSection);
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className="perfume-progress pointer-events-none fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 sm:block md:left-5"
		>
			<div className="relative h-44 w-5 md:h-52 md:w-6">
				{/* Bottle neck */}
				<div className="absolute left-1/2 top-0 h-5 w-2.5 -translate-x-1/2 rounded-t-[3px] border border-perfume-text/40 bg-perfume-bg/60 md:h-6 md:w-3" />

				{/* Bottle cap */}
				<div className="absolute left-1/2 -top-0.75 h-1.5 w-3.5 -translate-x-1/2 rounded-xs bg-perfume-text/70 md:w-4" />

				{/* Bottle body */}
				<div className="absolute bottom-0 left-1/2 h-[calc(100%-18px)] w-full -translate-x-1/2 overflow-hidden rounded-[7px] border border-perfume-text/35 bg-perfume-surface/30 backdrop-blur-[2px] md:h-[calc(100%-20px)] md:rounded-lg">
					{/* Liquid glow */}
					<motion.div
						className="absolute inset-x-0 bottom-0 rounded-b-md bg-perfume-primary/30 blur-[5px] md:rounded-b-[7px]"
						style={{
							height: liquidHeight,
							opacity: glowOpacity,
						}}
					/>

					{/* Liquid */}
					<motion.div
						className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-md bg-perfume-primary md:rounded-b-[7px]"
						style={{
							height: liquidHeight,
						}}
					>
						{/* Liquid surface */}
						<motion.div
							className="absolute left-[-15%] top-0 h-1.5 w-[130%] rounded-[50%] bg-perfume-primary/90"
							style={{
								y: liquidY,
							}}
						/>

						{/* Subtle liquid highlight */}
						<div className="absolute inset-y-0 left-[25%] w-px bg-white/20" />
					</motion.div>

					{/* Section name */}
					<div className="absolute inset-0 flex items-center justify-center overflow-hidden">
						<motion.div
							key={activeSection}
							initial={{
								opacity: 0,
								y: 8,
							}}
							animate={{
								opacity: 1,
								y: 0,
							}}
							transition={{
								duration: 0.35,
								ease: "easeOut",
							}}
							className="flex h-full items-center justify-center"
						>
							<motion.span
								className="dp-label text-[10px] font-semibold tracking-[0.28em] md:text-[11px] md:tracking-[0.32em]"
								style={{
									writingMode: "vertical-rl",
									textOrientation: "mixed",
									transform: "rotate(180deg)",
									color: useTransform(
										smoothProgress,
										[0, 0.4, 0.6, 1],
										[
											"rgba(255,255,255,0.95)",
											"rgba(255,255,255,0.95)",
											"rgba(0,0,0,0.85)",
											"rgba(0,0,0,0.85)",
										],
									),
								}}
							>
								{activeSection}
							</motion.span>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
