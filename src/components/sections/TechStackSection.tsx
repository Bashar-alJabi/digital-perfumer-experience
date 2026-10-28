"use client";

import { useChapterProgress } from "@/components/three-notes/ThreeNotesProvider";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface SkillGroup {
	id: string;
	code: string;
	categoryTitle: string;
	subtitle: string;
	description: string;
	skills: { name: string; highlight?: boolean }[];
}

const skillGroups: SkillGroup[] = [
	{
		id: "web-design",
		code: "PLT-01",
		categoryTitle: "Web Design & Platforms",
		subtitle: "Design, CMS & No-Code",
		description:
			"Design tools and website platforms used to create polished, responsive, and effective digital experiences.",
		skills: [
			{ name: "WordPress / Elementor", highlight: true },
			{ name: "Canva", highlight: true },
			{ name: "Wix" },
			{ name: "Figma" },
		],
	},
	{
		id: "frontend",
		code: "FE-02",
		categoryTitle: "Frontend Development",
		subtitle: "Modern Interfaces & Frontend Engineering",
		description:
			"Modern frontend technologies used to build responsive, interactive, and high-performance web experiences.",
		skills: [
			{ name: "Next.js", highlight: true },
			{ name: "React", highlight: true },
			{ name: "Tailwind CSS", highlight: true },
			{ name: "TypeScript", highlight: true },
			{ name: "HTML5 & CSS3" },
			{ name: "JavaScript (ES6+)" },
			{ name: "Sass / SCSS" },
			{ name: "Bootstrap" },
			{ name: "Pug.js" },
			{ name: "Gulp.js" },
		],
	},
	{
		id: "practices",
		code: "DEV-03",
		categoryTitle: "Development Practices & Tools",
		subtitle: "Workflow, Integration & Development Tools",
		description:
			"Tools and practices used for version control, API integration, testing, deployment, and AI-assisted workflows.",
		skills: [
			{ name: "AI-Assisted Development", highlight: true },
			{ name: "Git & GitHub", highlight: true },
			{ name: "API Integration", highlight: true },
			{ name: "Testing" },
			{ name: "CI/CD" },
			{ name: "Agile" },
		],
	},
	{
		id: "capabilities",
		code: "CAP-04",
		categoryTitle: "Digital Capabilities",
		subtitle: "Design, Performance & Problem Solving",
		description:
			"Practical capabilities focused on creating responsive, accessible, optimized, and reliable digital experiences.",
		skills: [
			{ name: "UI/UX Design", highlight: true },
			{ name: "Responsive Design", highlight: true },
			{ name: "Website Optimization & Maintenance", highlight: true },
			{ name: "Troubleshooting & Debugging" },
			{ name: "Mobile-First Development" },
			{ name: "Problem Solving" },
		],
	},
	{
		id: "marketing",
		code: "MKT-05",
		categoryTitle: "Digital Marketing",
		subtitle: "Growth, Advertising & Analytics",
		description:
			"Digital marketing skills focused on advertising, lead generation, audience targeting, creative campaigns, and performance analysis.",
		skills: [
			{ name: "Meta Ads", highlight: true },
			{ name: "TikTok Ads", highlight: true },
			{ name: "Google Ads", highlight: true },
			{ name: "Campaign Setup & Optimization" },
			{ name: "Audience Targeting" },
			{ name: "Lead Generation" },
			{ name: "Ad Creative Design" },
			{ name: "Performance Analysis" },
		],
	},
];

const containerVariants = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			staggerChildren: 0.05,
		},
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: { duration: 0.2 },
	},
};

const itemVariants = {
	hidden: { opacity: 0, scale: 0.9, y: 8 },
	visible: { opacity: 1, scale: 1, y: 0 },
};

export default function TechStackSection() {
	const sectionRef = useRef<HTMLElement>(null);

	const [activeGroupIndex, setActiveGroupIndex] = useState(0);

	const scrollYProgress = useChapterProgress("skills");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(min-width: 1024px)");

		const handleScrollChange = (progress: number) => {
			if (!mediaQuery.matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

			const index = Math.min(
				skillGroups.length - 1,
				Math.max(0, Math.round(progress * (skillGroups.length - 1))),
			);

			setActiveGroupIndex(index);
		};

		const unsubscribe = scrollYProgress.on("change", handleScrollChange);

		return () => unsubscribe();
	}, [scrollYProgress]);

	const activeGroup = skillGroups[activeGroupIndex];

	return (
		<section
			ref={sectionRef}
			className="relative min-h-0 bg-perfume-bg text-perfume-text border-t border-perfume-soft/40 lg:min-h-[500vh]"
		>
			<div className="flex min-h-0 items-center px-6 py-16 md:px-12 md:py-20 lg:sticky lg:top-0 lg:min-h-screen lg:overflow-hidden">
				<div className="mx-auto w-full max-w-7xl">
					{/* Section Header */}
					<div className="mb-10 flex flex-col gap-5 md:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
						<div>
							<p className="dp-label uppercase tracking-[0.4em] font-semibold text-perfume-text/60">
								[ THE INGREDIENTS ]
							</p>

							<h2 className="mt-4 dp-section-title font-normal leading-tight text-perfume-text">
								Digital{" "}
								<span className="italic text-perfume-primary">Skills</span>
							</h2>
						</div>

						<p className="dp-body max-w-md font-light leading-relaxed text-perfume-text/75">
							The tools, technologies, and expertise I use to design, build, and
							grow digital experiences.
						</p>
					</div>

					{/* Scroll-driven Ingredients */}
					<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
						{/* Category Selector */}
						<div className="lg:col-span-5 space-y-2.5">
							{skillGroups.map((group, index) => {
								const isActive = index === activeGroupIndex;

								return (
									<button
										key={group.id}
										type="button"
										aria-pressed={isActive}
										data-note-anchor={`skill-${index}`}
										onClick={() => {
											setActiveGroupIndex(index);
											if (matchMedia("(min-width: 1024px)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
												const section = document.getElementById("skills")!;
												window.scrollTo({ top: section.offsetTop + (section.offsetHeight - innerHeight) * index / (skillGroups.length - 1), behavior: "instant" });
											}
										}}
										className={`group relative w-full overflow-hidden rounded-2xl border p-4 text-left transition-all duration-500 cursor-pointer md:p-5 ${
											isActive
												? "border-perfume-primary bg-perfume-surface shadow-md"
												: "border-perfume-soft/60 bg-perfume-bg/50 hover:border-perfume-primary/30 hover:bg-perfume-surface/40"
										}`}
									>
										{isActive && (
											<motion.span
												layoutId="active-skill-indicator"
												className="absolute left-0 top-0 bottom-0 w-1 bg-perfume-primary"
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 35,
												}}
											/>
										)}

										<div className="flex items-center justify-between gap-4">
											<div className="flex min-w-0 items-center gap-3 md:gap-4">
												<span
													className={`dp-label shrink-0 transition-colors duration-300 ${
														isActive
															? "font-bold text-perfume-primary"
															: "text-perfume-text/40"
													}`}
												>
													{group.code}
												</span>

												<div className="min-w-0">
													<h3 className="dp-small truncate text-perfume-text">
														{group.categoryTitle}
													</h3>

													<p className="dp-label mt-0.5 font-light text-perfume-text/60">
														{group.skills.length} Skills
													</p>
												</div>
											</div>

											<span
												className={`shrink-0 text-lg transition-all duration-300 ${
													isActive
														? "translate-x-1 text-perfume-primary"
														: "text-perfume-text/30"
												}`}
											>
												→
											</span>
										</div>
									</button>
								);
							})}
						</div>

						{/* Active Ingredient */}
						<div className="lg:col-span-7" data-note-anchor="skill-panel">
							<AnimatePresence mode="wait">
								<motion.div
									key={activeGroup.id}
									initial={{
										opacity: 0,
										x: 24,
									}}
									animate={{
										opacity: 1,
										x: 0,
									}}
									exit={{
										opacity: 0,
										x: -24,
									}}
									transition={{
										duration: 0.4,
										ease: "easeOut",
									}}
									className="flex min-h-80 flex-col justify-between rounded-3xl border border-perfume-soft bg-perfume-surface p-7 shadow-sm md:min-h-95 md:p-10 lg:min-h-105 lg:p-12"
								>
									<div>
										<div className="mb-6 border-b border-perfume-soft/50 pb-5 md:mb-8 md:pb-6">
											<span className="dp-label uppercase tracking-widest text-perfume-primary">
												[{activeGroup.code}] {activeGroup.subtitle}
											</span>

											<h3 className="dp-card-title mt-1 text-perfume-text">
												{activeGroup.categoryTitle}
											</h3>
										</div>

										<p className="dp-body mb-7 font-light leading-relaxed text-perfume-text/80 md:mb-8">
											{activeGroup.description}
										</p>

										<motion.div
											variants={containerVariants}
											initial="hidden"
											animate="visible"
											className="flex flex-wrap gap-2.5 md:gap-3"
										>
											{activeGroup.skills.map((skill) => (
												<motion.span
													key={skill.name}
													variants={itemVariants}
													className={`inline-flex items-center gap-1.5 dp-small rounded-xl border px-4 py-2.5 transition-all duration-500 ${
														skill.highlight
															? "border-perfume-primary/50 bg-perfume-primary/10 font-medium text-perfume-text shadow-[0_4px_20px_rgba(243,99,113,0.08)] hover:border-perfume-primary hover:bg-perfume-primary/15"
															: "border-perfume-soft/70 bg-perfume-bg/60 text-perfume-text/65 hover:bg-perfume-bg/90 hover:text-perfume-text/80"
													}`}
												>
													{skill.highlight && (
														<motion.span
															initial={{
																scale: 0,
																rotate: -45,
															}}
															animate={{
																scale: 1,
																rotate: 0,
															}}
															transition={{
																duration: 0.35,
																ease: "easeOut",
															}}
															className="font-serif text-xs text-perfume-primary"
														>
															✦
														</motion.span>
													)}

													{skill.name}
												</motion.span>
											))}
										</motion.div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
