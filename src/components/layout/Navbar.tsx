"use client";

import { AnimatePresence, motion } from "motion/react";
// import React, { useEffect, useState } from "react";
import React, { useEffect, useRef, useState } from "react";

interface NavLink {
	name: string;
	href: string;
	noteLabel: string;
}

const navLinks: NavLink[] = [
	{ name: "Philosophy", href: "#philosophy", noteLabel: "01" },
	{ name: "About", href: "#about", noteLabel: "02" },
	{ name: "Work", href: "#work", noteLabel: "03" },
	{ name: "Skills", href: "#skills", noteLabel: "04" },
	{ name: "Contact", href: "#contact", noteLabel: "05" },
];

export default function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	// const [lastScrollY, setLastScrollY] = useState(0);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [activeHover, setActiveHover] = useState<string | null>(null);

	const lastScrollYRef = useRef(0);

	// useEffect(() => {
	// 	const handleScroll = () => {
	// 		const currentScrollY = window.scrollY;

	// 		// Handle transparency state
	// 		setIsScrolled(currentScrollY > 20);

	// 		// Reveal navbar on scroll up, hide on scroll down
	// 		if (currentScrollY > lastScrollY && currentScrollY > 100) {
	// 			setIsVisible(false);
	// 		} else {
	// 			setIsVisible(true);
	// 		}

	// 		setLastScrollY(currentScrollY);
	// 	};

	// 	window.addEventListener("scroll", handleScroll, { passive: true });
	// 	return () => window.removeEventListener("scroll", handleScroll);
	// }, [lastScrollY]);
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Handle transparency state
			setIsScrolled(currentScrollY > 20);

			// Reveal navbar on scroll up, hide on scroll down
			if (currentScrollY > lastScrollYRef.current && currentScrollY > 100) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}

			lastScrollYRef.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.header
			initial={{ y: -100, opacity: 0 }}
			animate={{
				y: isVisible ? 0 : -100,
				opacity: isVisible ? 1 : 0,
			}}
			transition={{ duration: 0.35, ease: "easeOut" }}
			className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 select-none"
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Floating Capsule Bar Container */}
				<nav
					className={`w-full flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 border ${
						isScrolled
							? "bg-perfume-surface/85 backdrop-blur-md border-perfume-soft shadow-lg shadow-black/5"
							: "bg-perfume-bg/30 backdrop-blur-sm border-perfume-soft/40"
					}`}
				>
					{/* Logo / Brand Essence */}
					{/* <a href="#" className="flex items-center gap-3 group">
						<div className="w-8 h-8 rounded-full bg-perfume-primary/10 border border-perfume-primary/30 flex items-center justify-center text-perfume-primary font-bold dp-label group-hover:scale-105 transition-transform duration-300">
							B
						</div>
						<div className="flex flex-col">
							<span className="font-serif text-base tracking-tight font-medium text-perfume-text group-hover:text-perfume-primary transition-colors duration-300">
								Bashar
							</span>
							<span className="dp-label tracking-widest text-perfume-text/50 uppercase -mt-1">
								Eau De Code
							</span>
						</div>
					</a> */}
					{/* Logo / Brand Essence */}
					<div className="flex items-center gap-3">
						{/* Logo → Home */}
						<a href="#home" aria-label="Back to top" className="group">
							<div className="w-8 h-8 rounded-full bg-perfume-primary/10 border border-perfume-primary/30 flex items-center justify-center gap-0.5 group-hover:scale-105 transition-transform duration-300">
								<span className="w-1.5 h-1.5 rounded-full bg-perfume-primary" />
								<span className="w-1.5 h-1.5 rounded-full bg-perfume-soft border border-perfume-primary/40" />
								<span className="w-1.5 h-1.5 rounded-full bg-perfume-text" />
							</div>
						</a>

						{/* Brand Name → About */}
						<a href="#about" className="group">
							<div className="flex flex-col">
								<span className="font-serif text-base tracking-tight font-medium text-perfume-text group-hover:text-perfume-primary transition-colors duration-300">
									Bashar
								</span>
								<span className="dp-label tracking-widest text-perfume-text/50 uppercase -mt-1">
									Eau De Code
								</span>
							</div>
						</a>
					</div>

					{/* Desktop Navigation Links */}
					<div className="hidden lg:flex items-center gap-1 bg-perfume-bg/40 p-1.5 rounded-full border border-perfume-soft/50">
						{navLinks.map((link) => {
							const isHovered = activeHover === link.name;

							return (
								<a
									key={link.name}
									href={link.href}
									onMouseEnter={() => setActiveHover(link.name)}
									onMouseLeave={() => setActiveHover(null)}
									className="relative px-4 py-1.5 rounded-full dp-small tracking-wide text-perfume-text/80 hover:text-perfume-text transition-colors duration-300 flex items-center gap-1.5"
								>
									{isHovered && (
										<motion.div
											layoutId="navHover"
											className="absolute inset-0 bg-perfume-surface rounded-full border border-perfume-primary/30 shadow-xs -z-10"
											transition={{
												type: "spring",
												stiffness: 400,
												damping: 30,
											}}
										/>
									)}

									<span className="dp-label text-perfume-primary opacity-70">
										[{link.noteLabel}]
									</span>
									<span>{link.name}</span>
								</a>
							);
						})}
					</div>

					{/* Right Action & Status Badge */}
					<div className="hidden sm:flex items-center gap-4">
						<div className="flex items-center gap-2 dp-label text-perfume-text/60">
							<span className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							<span className="dp-label">Available</span>
						</div>

						<a
							href="#contact"
							className="px-5 py-2 rounded-full bg-perfume-text text-perfume-bg dp-small font-medium tracking-wide hover:bg-perfume-primary hover:text-white transition-all duration-300 shadow-sm"
						>
							Start a Project →
						</a>
					</div>

					{/* Mobile Hamburger Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-label="Toggle Navigation Menu"
						className="lg:hidden p-2 rounded-full text-perfume-text hover:bg-perfume-soft/40 transition-colors"
					>
						<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
							{isMobileMenuOpen ? (
								<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
							) : (
								<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
							)}
						</svg>
					</button>
				</nav>
			</div>

			{/* Mobile Drawer Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
						className="lg:hidden mt-3 max-w-7xl mx-auto bg-perfume-surface/95 backdrop-blur-xl border border-perfume-soft rounded-3xl p-5 shadow-xl"
					>
						<div className="flex flex-col space-y-3">
							{navLinks.map((link) => (
								<a
									key={link.name}
									href={link.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className="flex items-center justify-between p-3 rounded-xl border border-perfume-soft/40 bg-perfume-bg/50 dp-small text-perfume-text hover:border-perfume-primary/40 transition-colors"
								>
									<span>{link.name}</span>
									<span className="dp-label text-perfume-primary">
										[{link.noteLabel}]
									</span>
								</a>
							))}

							<a
								href="#contact"
								onClick={() => setIsMobileMenuOpen(false)}
								className="w-full text-center py-3 rounded-xl bg-perfume-text text-perfume-bg font-medium dp-small tracking-wider"
							>
								Start a Project →
							</a>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
