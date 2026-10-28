"use client";

import { useChapterProgress } from "@/components/three-notes/ThreeNotesProvider";
import { memoryOpacity } from "@/lib/three-notes/score";
import { motion, useTransform } from "motion/react";
import { useRef } from "react";

export default function ScentMemorySection() {
	const sectionRef = useRef<HTMLElement>(null);

	const scrollYProgress = useChapterProgress("memory");

	// Statement 01 — enters, stays readable, then leaves.
	const seenOpacity = useTransform(scrollYProgress, p => memoryOpacity(0, p));

	const seenY = useTransform(scrollYProgress, [0.02, 0.08, 0.32], [35, 0, -25]);

	// Statement 02 — gets more time on screen.
	const rememberedOpacity = useTransform(scrollYProgress, p => memoryOpacity(1, p));

	const rememberedY = useTransform(
		scrollYProgress,
		[0.34, 0.4, 0.64],
		[45, 0, -35],
	);

	// Final statement — stays visible until the section ends.
	const differenceOpacity = useTransform(scrollYProgress, p => memoryOpacity(2, p));

	const differenceY = useTransform(scrollYProgress, [0.66, 0.72], [35, 0]);

	return (
		<section
			ref={sectionRef}
			className="relative min-h-[200vh] bg-perfume-bg text-perfume-text"
		>
			<div className="sticky top-0 flex min-h-screen items-center overflow-hidden px-6 py-24 md:px-12">
				<div className="mx-auto w-full max-w-350">
					<div className="relative min-h-130 md:min-h-150">
						{/* SOME DIGITAL EXPERIENCES / ARE SEEN */}
						<motion.div
							style={{
								opacity: seenOpacity,
								y: seenY,
							}}
							className="memory-statement absolute inset-0 flex flex-col justify-center"
						>
							<p className="dp-label mb-8 uppercase tracking-[0.4em] text-perfume-primary">
								Scent Memory
							</p>

							<h2 className="dp-section-title max-w-6xl font-normal leading-[0.88] tracking-[-0.04em]">
								SOME DIGITAL
								<br />
								EXPERIENCES
								<br />
								<span className="text-perfume-text/35">ARE SEEN.</span>
							</h2>
						</motion.div>

						{/* OTHERS / ARE REMEMBERED */}
						<motion.div
							style={{
								opacity: rememberedOpacity,
								y: rememberedY,
							}}
							className="memory-statement absolute inset-0 flex flex-col justify-center"
						>
							<p className="dp-label mb-8 uppercase tracking-[0.4em] text-perfume-primary">
								Scent Memory
							</p>

							<h2 className="dp-section-title max-w-6xl font-normal leading-[0.88] tracking-[-0.04em]">
								OTHERS
								<br />
								<span className="italic text-perfume-primary">
									ARE REMEMBERED.
								</span>
							</h2>
						</motion.div>

						{/* THE DIFFERENCE */}
						<motion.div
							style={{
								opacity: differenceOpacity,
								y: differenceY,
							}}
							className="memory-statement absolute inset-0 flex flex-col justify-center"
						>
							<p className="dp-label mb-8 uppercase tracking-[0.4em] text-perfume-primary">
								The Difference
							</p>

							<h2 className="dp-section-title max-w-5xl font-normal leading-[0.9] tracking-[-0.04em]">
								THAT&apos;S THE DIFFERENCE
								<br />
								<span className="text-perfume-text/45">BETWEEN A WEBSITE</span>
								<br />
								AND A{" "}
								<span className="italic text-perfume-primary">
									DIGITAL EXPERIENCE.
								</span>
							</h2>
						</motion.div>
					</div>

					{/* Minimal progress line */}
					{/* <div className="absolute bottom-10 left-6 right-6 flex items-center justify-center md:left-12 md:right-12">
						<motion.div
							style={{
								scaleX: scrollYProgress,
								transformOrigin: "left",
							}}
							className="h-px w-24 bg-perfume-primary/50 md:w-40"
						/>
					</div> */}
				</div>
			</div>
		</section>
	);
}
