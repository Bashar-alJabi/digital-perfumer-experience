"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	alpha: number;
	maxLife: number;
	life: number;
}

export default function CustomCursor() {
	const [isHovered, setIsHovered] = useState(false);
	const [cursorText, setCursorText] = useState("");
	const [isVisible, setIsVisible] = useState(false);
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const particlesRef = useRef<Particle[]>([]);
	const lastMousePos = useRef({ x: -100, y: -100 });

	const mouseX = useMotionValue(-100);
	const mouseY = useMotionValue(-100);

	const springConfig = { damping: 28, stiffness: 220, mass: 0.6 };
	const cursorX = useSpring(mouseX, springConfig);
	const cursorY = useSpring(mouseY, springConfig);

	// Soft perfume smoke mist particle setup
	const createMistParticle = (x: number, y: number) => {
		const angle = Math.random() * Math.PI * 2;
		const speed = Math.random() * 0.8 + 0.2; // Gentle spread speed

		particlesRef.current.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed - 0.15, // Subtle upward float
			size: Math.random() * 6 + 4, // Larger initial size for cloud effect
			alpha: Math.random() * 0.2 + 0.1, // Soft, low opacity
			maxLife: Math.random() * 40 + 30,
			life: 0,
		});
	};

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

		const handleChange = () => {
			setPrefersReducedMotion(mediaQuery.matches);
		};

		handleChange();
		mediaQuery.addEventListener("change", handleChange);

		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	useEffect(() => {
		if (prefersReducedMotion || window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		handleResize();
		window.addEventListener("resize", handleResize);

		// let animationFrameId: number;

		// const render = () => {
		// 	ctx.clearRect(0, 0, canvas.width, canvas.height);

		// 	// Render cloud-like perfume mist smoke particles
		// 	for (let i = particlesRef.current.length - 1; i >= 0; i--) {
		// 		const p = particlesRef.current[i];
		// 		p.life++;
		// 		p.x += p.vx;
		// 		p.y += p.vy;
		// 		p.vx *= 0.95; // Smooth air resistance
		// 		p.vy *= 0.95;
		// 		p.size += 0.35; // Expands gradually like real mist smoke

		// 		const currentAlpha = p.alpha * (1 - p.life / p.maxLife);

		// 		if (p.life >= p.maxLife || currentAlpha <= 0) {
		// 			particlesRef.current.splice(i, 1);
		// 			continue;
		// 		}

		// 		// Feathered radial gradient per particle for soft smoke texture
		// 		const particleGrad = ctx.createRadialGradient(
		// 			p.x,
		// 			p.y,
		// 			0,
		// 			p.x,
		// 			p.y,
		// 			p.size,
		// 		);
		// 		particleGrad.addColorStop(0, `rgba(236, 160, 185, ${currentAlpha})`);
		// 		particleGrad.addColorStop(1, "rgba(236, 160, 185, 0)");

		// 		ctx.beginPath();
		// 		ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		// 		ctx.fillStyle = particleGrad;
		// 		ctx.fill();
		// 	}

		// 	animationFrameId = requestAnimationFrame(render);
		// };

		// render();

		let animationFrameId: number | null = null;

		const render = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			let hasActiveParticles = false;

			for (let i = particlesRef.current.length - 1; i >= 0; i--) {
				const p = particlesRef.current[i];

				p.life++;
				p.x += p.vx;
				p.y += p.vy;
				p.vx *= 0.95;
				p.vy *= 0.95;
				p.size += 0.35;

				const currentAlpha = p.alpha * (1 - p.life / p.maxLife);

				if (p.life >= p.maxLife || currentAlpha <= 0) {
					particlesRef.current.splice(i, 1);
					continue;
				}

				hasActiveParticles = true;

				const particleGrad = ctx.createRadialGradient(
					p.x,
					p.y,
					0,
					p.x,
					p.y,
					p.size,
				);

				particleGrad.addColorStop(0, `rgba(236, 160, 185, ${currentAlpha})`);
				particleGrad.addColorStop(1, "rgba(236, 160, 185, 0)");

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = particleGrad;
				ctx.fill();
			}

			animationFrameId = hasActiveParticles
				? requestAnimationFrame(render)
				: null;
		};

		const startRendering = () => {
			if (animationFrameId === null) {
				animationFrameId = requestAnimationFrame(render);
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			const currentX = e.clientX;
			const currentY = e.clientY;

			mouseX.set(currentX);
			mouseY.set(currentY);

			setIsVisible(true);

			const dx = currentX - lastMousePos.current.x;
			const dy = currentY - lastMousePos.current.y;
			const dist = Math.hypot(dx, dy);

			// Subtle mist trigger on movement
			if (dist > 8) {
				const particleCount = Math.min(Math.floor(dist / 10), 2);
				for (let i = 0; i < particleCount; i++) {
					createMistParticle(currentX, currentY);
				}
				lastMousePos.current = { x: currentX, y: currentY };
				startRendering();
			}
		};

		const handleMouseLeave = () => setIsVisible(false);
		const handleMouseEnter = () => setIsVisible(true);

		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const interactiveEl = target.closest("a, button, [data-cursor]");

			if (interactiveEl) {
				setIsHovered(true);
				const customText = interactiveEl.getAttribute("data-cursor-text");
				setCursorText(customText || "");

				// Gentle puff on hover focus
				for (let i = 0; i < 5; i++) {
					createMistParticle(e.clientX, e.clientY);
				}
				startRendering();
			} else {
				setIsHovered(false);
				setCursorText("");
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseleave", handleMouseLeave);
		document.addEventListener("mouseenter", handleMouseEnter);
		window.addEventListener("mouseover", handleMouseOver);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseleave", handleMouseLeave);
			document.removeEventListener("mouseenter", handleMouseEnter);
			window.removeEventListener("mouseover", handleMouseOver);
			// cancelAnimationFrame(animationFrameId);
			if (animationFrameId !== null) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [mouseX, mouseY, prefersReducedMotion]);

	if (prefersReducedMotion) {
		return null;
	}

	return (
		<div
			className={`pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
				isVisible ? "opacity-100" : "opacity-0"
			}`}
		>
			{/* Perfume Mist & Smoke Canvas */}
			<canvas
				ref={canvasRef}
				className="pointer-events-none fixed inset-0 z-40"
			/>

			{/* Outer Fluid Ring - Soft Rose Accent */}
			<motion.div
				className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center rounded-full border border-[rgba(236,160,185,0.4)] bg-[rgba(236,160,185,0.03)] backdrop-blur-[1px]"
				style={{
					x: cursorX,
					y: cursorY,
					translateX: "-50%",
					translateY: "-50%",
				}}
				animate={{
					width: isHovered ? (cursorText ? 72 : 54) : 32,
					height: isHovered ? (cursorText ? 72 : 54) : 32,
					borderColor: isHovered
						? "rgba(236, 160, 185, 0.7)"
						: "rgba(236, 160, 185, 0.35)",
					backgroundColor: isHovered
						? "rgba(236, 160, 185, 0.1)"
						: "rgba(236, 160, 185, 0.02)",
				}}
				transition={{ type: "spring", stiffness: 350, damping: 25 }}
			>
				{cursorText && (
					<motion.span
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-[9px] font-mono tracking-widest uppercase text-[rgb(236,160,185)] font-semibold select-none text-center px-1"
					>
						{cursorText}
					</motion.span>
				)}
			</motion.div>

			{/* Precise Inner Pin Point */}
			<motion.div
				className="pointer-events-none fixed top-0 left-0 z-50 h-1.5 w-1.5 rounded-full bg-[rgb(236,160,185)]"
				style={{
					x: mouseX,
					y: mouseY,
					translateX: "-50%",
					translateY: "-50%",
				}}
				animate={{
					scale: isHovered ? 0 : 1,
					opacity: isHovered ? 0 : 1,
				}}
				transition={{ duration: 0.15 }}
			/>
		</div>
	);
}
