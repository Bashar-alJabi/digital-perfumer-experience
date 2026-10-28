"use client";

import { motion } from "motion/react";
import React from "react";

// Key statistics highlighting real-world impact
// const stats = [
// 	{ label: "Years of Experience", value: "5+" },
// 	{ label: "Brands & Businesses", value: "30+" },
// 	{ label: "Websites Built", value: "20+" },
// 	{ label: "Ad Campaigns", value: "15+" },
// ];

export default function AboutSection() {
	return (
		<section
			data-about-content
			className="about-stage scene-stage relative py-28 md:py-36 px-6 md:px-12 bg-perfume-bg text-perfume-text overflow-hidden border-t border-perfume-soft/40"
		>
			{/* Background Glow */}
			<div className="absolute bottom-10 right-10 w-125 h-125 bg-perfume-primary/5 rounded-full blur-[150px] pointer-events-none" />

			<div className="max-w-7xl mx-auto relative z-10">
				{/* Header Badge */}
				<div className="flex items-center gap-3 mb-8">
					<span className="w-1.5 h-1.5 rounded-full bg-perfume-primary" />
					<span className="dp-label uppercase tracking-[0.4em] text-perfume-text/60">
						About The Perfumer
					</span>
				</div>

				{/* Editorial Bio Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start mb-20">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="lg:col-span-7"
					>
						<h2
							// className="text-4xl md:text-6xl lg:text-7xl font-serif font-normal leading-[1.08] tracking-tight text-perfume-text"
							className="dp-section-title font-normal leading-[1.08] tracking-tight text-perfume-text"
						>
							Blending design, technology, and growth into {/* <br /> */}
							<span className="italic font-light text-perfume-primary">
								digital experiences.
							</span>
						</h2>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.15 }}
						// className="lg:col-span-5 space-y-6 text-perfume-text/80 font-sans font-light text-base md:text-lg leading-relaxed"
						className="lg:col-span-5 space-y-6 text-perfume-text/80 font-light dp-body leading-relaxed"
					>
						<p>
							{/* I’m Bashar, a Full-Stack Web Developer and Digital Marketer. I
							bridge the gap between technical execution and business revenue. */}
							I’m Bashar, a Frontend Developer, Web Designer, and Digital
							Marketer, creating digital experiences where design, technology,
							and business work together.
						</p>
						{/* <p>
							A beautiful website is useless if it doesn’t convert, and a great
							ad campaign fails if the platform lags. I build digital ecosystems
							where high-end design, flawless code, and targeted marketing work
							in perfect synergy.
						</p> */}
						<blockquote className="border-l border-perfume-primary/50 pl-6 md:pl-8 text-perfume-text/70 italic">
							A beautiful website should do more than look good. It should
							perform, connect with people, and drive results.
						</blockquote>
					</motion.div>
				</div>

				{/* <div className="mb-20">
					<a
						href="/cv/Bashar-Aljabi_CV.pdf"
						download
						className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-perfume-text text-perfume-bg dp-small tracking-wide font-medium hover:bg-perfume-primary hover:text-white transition-all duration-300 shadow-sm"
					>
						<span>Download CV</span>
						<span className="text-base">↓</span>
					</a>
				</div> */}
				<div className="mb-0">
					<div className="flex items-center gap-6 mb-6">
						<a
							href="https://github.com/Bashar-alJabi"
							target="_blank"
							rel="noopener noreferrer"
							className="dp-small text-perfume-text hover:text-perfume-primary transition-colors duration-300 underline underline-offset-4 decoration-perfume-soft"
						>
							GitHub ↗
						</a>

						<a
							href="https://www.linkedin.com/in/bashar-aljabi-engineer"
							target="_blank"
							rel="noopener noreferrer"
							className="dp-small text-perfume-text hover:text-perfume-primary transition-colors duration-300 underline underline-offset-4 decoration-perfume-soft"
						>
							LinkedIn ↗
						</a>
					</div>

					<a
						href="/cv/Bashar-Aljabi_CV.pdf"
						download
						className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-perfume-text text-perfume-bg dp-small tracking-wide font-medium hover:bg-perfume-primary hover:text-white transition-all duration-300 shadow-sm"
					>
						<span>Download CV</span>
						<span className="text-base">↓</span>
					</a>
				</div>

				{/* Key Statistics Strip */}
				{/* <motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-b border-perfume-soft/60"
				>
					{stats.map((stat, i) => (
						<div key={i} className="space-y-1">
							<span className="dp-card-title text-perfume-text font-normal">
								{stat.value}
							</span>
							<p className="dp-label uppercase tracking-wider text-perfume-text/60">
								{stat.label}
							</p>
						</div>
					))}
				</motion.div> */}
			</div>
		</section>
	);
}
