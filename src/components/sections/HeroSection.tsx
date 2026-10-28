"use client";

import OpeningWorld from "@/components/cinematic/OpeningWorld";
import gsap from "gsap";
import React, { useEffect, useRef } from "react";

export default function HeroSection() {
	const containerRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);
	const taglineRef = useRef<HTMLParagraphElement>(null);
	const notesRef = useRef<HTMLDivElement>(null);
	const ctaRef = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				defaults: { ease: "power3.out", duration: 1.4 },
			});

			// Convert HTMLCollection to a standard Array for reliable GSAP staggering
			const noteElements = notesRef.current
				? Array.from(notesRef.current.children)
				: [];

			tl.fromTo(
				noteElements,
				{ scale: 0, opacity: 0 },
				{
					scale: 1,
					opacity: 1,
					stagger: 0.15,
					ease: "back.out(1.7)",
					delay: 0.2,
				},
			)
				.fromTo(
					titleRef.current,
					{ y: 35, opacity: 0 },
					{ y: 0, opacity: 1 },
					"-=0.9",
				)
				.fromTo(
					taglineRef.current,
					{ y: 20, opacity: 0 },
					{ y: 0, opacity: 0.85 },
					"-=1.1",
				)
				.fromTo(
					ctaRef.current,
					{ y: 15, opacity: 0 },
					{ y: 0, opacity: 1 },
					"-=1.0",
				)
				.fromTo(
					scrollRef.current,
					{ opacity: 0 },
					{ opacity: 1, duration: 1 },
					"-=0.5",
				);
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={containerRef}
			className="relative w-full h-screen flex flex-col justify-between items-center px-6 py-12 bg-perfume-bg text-perfume-text overflow-hidden select-none"
		>
			{/* 3D Fluid Canvas Background */}
			<OpeningWorld />

			{/* Spacer for vertical balance */}
			<div className="w-full h-12" />

			{/* Main Content */}
			<div className="opening-copy z-10 text-center max-w-4xl mx-auto flex flex-col items-center my-auto">
				{/* Fragrance Note Cues */}
				<div ref={notesRef} className="opening-dots flex items-center gap-3 mb-6">
					<span
						className="w-4 h-4 rounded-full bg-perfume-primary shadow-[0_0_12px_rgba(243,99,113,0.5)]"
						title="Top Note - Head"
					/>
					<span
						className="w-4 h-4 rounded-full bg-perfume-soft border border-perfume-primary/40"
						title="Heart Note - Body"
					/>
					<span
						className="w-4 h-4 rounded-full bg-perfume-text"
						title="Base Note - Soul"
					/>
				</div>

				{/* Title */}
				<h1
					ref={titleRef}
					// className="text-5xl md:text-8xl lg:text-9xl font-serif font-normal tracking-tight leading-[1.02] mb-6 text-perfume-text drop-shadow-sm"
					className="dp-hero-title font-normal tracking-tight leading-[1.02] mb-6 text-perfume-text drop-shadow-sm"
				>
					Digital Perfumer
				</h1>

				{/* Tagline */}
				<p
					ref={taglineRef}
					// className="text-xs md:text-sm lg:text-base font-medium text-perfume-text/80 tracking-[0.3em] max-w-xl uppercase mb-10"
					className="dp-small font-medium text-perfume-text/80 tracking-[0.3em] max-w-xl uppercase mb-10"
				>
					{/* Composing the Notes of Great Brands */}
					{/* Composing Digital Experiences, One Note at a Time */}
					Composing Digital Notes for Exceptional Brands
				</p>

				{/* Call To Actions */}
				{/* <div ref={ctaRef} className="flex items-center gap-4">
					<a
						href="#projects"
						className="px-7 py-3 rounded-full bg-perfume-text text-perfume-bg dp-small font-medium tracking-wider uppercase hover:bg-perfume-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
					>
						Explore Accords
					</a>
					<a
						href="#philosophy"
						className="px-7 py-3 rounded-full border border-perfume-text/20 text-perfume-text dp-small font-medium tracking-wider uppercase hover:border-perfume-primary hover:text-perfume-primary transition-all duration-300"
					>
						Read Philosophy
					</a>
				</div> */}
				{/* Call To Actions */}
				<div ref={ctaRef} className="flex items-center gap-4">
					<a
						href="#about"
						className="px-7 py-3 rounded-full bg-perfume-text text-perfume-bg dp-small font-medium tracking-wider uppercase hover:bg-perfume-primary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
					>
						Meet the Perfumer
					</a>

					<a
						href="#work"
						className="px-7 py-3 rounded-full border border-perfume-text/20 text-perfume-text dp-small font-medium tracking-wider uppercase hover:border-perfume-primary hover:text-perfume-primary transition-all duration-300"
					>
						Explore My Work
					</a>
				</div>
			</div>

			{/* Scroll Indicator */}
			<div
				ref={scrollRef}
				className="z-10 flex flex-col items-center gap-2 dp-label tracking-widest uppercase text-perfume-text/50"
			>
				{/* <span>Scroll to Discover</span> */}
				<div className="w-4 h-7 rounded-full border border-perfume-text/30 flex justify-center p-1">
					<div className="w-1 h-1.5 rounded-full bg-perfume-primary animate-bounce" />
				</div>
			</div>
		</section>
	);
}
