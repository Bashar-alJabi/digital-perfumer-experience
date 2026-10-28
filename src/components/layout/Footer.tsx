"use client";

// import React, { useEffect, useState } from "react";
import React from "react";

export default function Footer() {
	// const [year, setYear] = useState<number | null>(null);

	// useEffect(() => {
	// 	setYear(new Date().getFullYear());
	// }, []);
	const year = new Date().getFullYear();

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
	};

	return (
		<footer className="relative py-8 px-6 md:px-12 bg-perfume-bg text-perfume-text border-t border-perfume-soft/40">
			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 dp-label text-perfume-text/60">
				{/* Copyright */}
				<div className="text-center sm:text-left">
					{/* © {year ?? "2026"} — All rights reserved. Crafted with passion. */}
					© {year} — All rights reserved.
				</div>

				{/* Center Signature */}
				<div className="flex items-center gap-2 tracking-wide">
					<span>Digital Perfumer</span>
					<span className="w-1.5 h-1.5 rounded-full bg-perfume-primary animate-pulse" />
					<span>By Bashar Al-Jabi</span>
				</div>

				{/* Back to Top Button */}
				<button
					type="button"
					onClick={scrollToTop}
					aria-label="Scroll back to top of the page"
					className="group flex items-center gap-1.5 hover:text-perfume-primary transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-perfume-primary focus-visible:ring-offset-2 rounded-md px-2 py-1 cursor-pointer"
				>
					<span>Back to Top</span>
					<span className="inline-block transition-transform duration-300 group-hover:-translate-y-1">
						↑
					</span>
				</button>
			</div>
		</footer>
	);
}
