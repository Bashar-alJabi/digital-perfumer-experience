"use client";

import { motion, useTransform } from "motion/react";
import { useChapterProgress } from "@/components/three-notes/ThreeNotesProvider";
import { smooth, statProgress } from "@/lib/three-notes/score";

const stats = [
	{ label: "Years of Experience", value: "5+" },
	{ label: "Brands & Businesses", value: "30+" },
	{ label: "Websites Built", value: "20+" },
	{ label: "Ad Campaigns", value: "15+" },
];

function StatCircle({ index, mobile = false }: { index: number; mobile?: boolean }) {
	const progress = useChapterProgress("impact");
	const draw = useTransform(progress, p => statProgress(p, index));
	const dashOffset = useTransform(draw, p => (1 - p) * 2 * Math.PI * 118);
	const reveal = useTransform(draw, p => 0.12 + smooth(0.6, 0.94, p) * 0.88);
	const opacity = useTransform(progress, p => mobile ? 1 - smooth(0.4, 0.85, Math.abs(Math.min(3, p * 4) - index)) : 1);
	const stat = stats[index];
	return <motion.div style={{ opacity }} className={mobile ? "stat-mobile absolute inset-0 flex items-center justify-center" : "relative flex w-full flex-1 items-center justify-center"}>
		<div data-note-anchor={`stat-${index}`} className={`stat-orbit relative aspect-square w-full ${mobile ? "max-w-75" : "max-w-65 md:max-w-75"}`}>
			<div className="absolute inset-0 rounded-full border border-perfume-soft/50" />
			<svg viewBox="0 0 260 260" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
				<motion.circle cx="130" cy="130" r="118" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-perfume-primary"
					style={{ strokeDasharray: 2 * Math.PI * 118, strokeDashoffset: dashOffset }} />
			</svg>
			<div className="absolute inset-5.5 rounded-full border border-perfume-soft/40" />
			<motion.div style={{ opacity: reveal }} className="stat-copy absolute inset-0 flex flex-col items-center justify-center text-center">
				<span className="font-serif text-[3.5rem] font-normal leading-none tracking-[-0.06em] md:text-[4.5rem]">{stat.value}</span>
				<span className="dp-small mt-4 max-w-37.5 text-perfume-text/60">{stat.label}</span>
			</motion.div>
		</div>
	</motion.div>;
}

export default function StatsSection() {
	return <section className="relative h-[260vh] bg-perfume-bg text-perfume-text">
		<div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-12">
			<div className="stats-mobile relative flex h-full w-full items-center justify-center sm:hidden">
				{stats.map((stat, index) => <StatCircle key={stat.label} index={index} mobile />)}
			</div>
			<div className="stats-grid mx-auto hidden w-full max-w-7xl grid-cols-2 items-center justify-items-center gap-10 sm:grid lg:grid-cols-4 lg:gap-6">
				{stats.map((stat, index) => <StatCircle key={stat.label} index={index} />)}
			</div>
		</div>
	</section>;
}
