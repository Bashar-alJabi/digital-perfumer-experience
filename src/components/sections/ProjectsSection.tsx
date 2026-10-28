"use client";

import { useChapterProgress } from "@/components/three-notes/ThreeNotesProvider";
import NoteFrame from "@/components/three-notes/NoteFrame";
import { projectProgress } from "@/lib/three-notes/score";
import { motion, useTransform, useMotionValueEvent } from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface Project {
	id: string;
	title: string;
	category: string;
	description: string;
	tags: string[];
	link?: string;
	codeLink?: string;
	customImage?: string;
	type: "professional" | "personal";
}

const allProjects: Project[] = [
	// --- Professional Projects ---
	{
		id: "01",
		title: "Sustayn Official Website",
		category: "Corporate Digital Hub",
		description:
			"Official corporate website designed and developed for Sustayn, delivering a high-performance brand presence and fluid UI/UX.",
		tags: ["WordPress", "UI/UX Design", "Performance"],
		link: "https://sustayn.co/",
		customImage: "/projects/sustayn.webp",
		type: "professional",
	},
	{
		id: "02",
		title: "Success School",
		category: "Educational Platform",
		description:
			"Modern educational platform built for interactive learning, custom functionality, and scalable student management.",
		tags: ["WordPress", "Custom Coding", "UX Design"],
		link: "https://success-school.net/",
		customImage: "/projects/success-school.webp",
		type: "professional",
	},
	{
		id: "03",
		title: "Formation Avenir",
		category: "Educational Platform",
		description:
			"Clean, conversion-focused platform designed for teacher training courses and educational program enrollment.",
		tags: ["WordPress", "Elementor", "Responsive"],
		link: "https://formationavenir.com/",
		customImage: "/projects/formation-avenir.webp",
		type: "professional",
	},
	{
		id: "04",
		title: "IndustriXport",
		category: "Industrial B2B Portal",
		description:
			"B2B international business portal focusing on clear service hierarchy, multi-language support, and industrial branding.",
		tags: ["WordPress", "UI/UX", "SEO"],
		link: "https://industrixport.fr/",
		customImage: "/projects/industrixport.webp",
		type: "professional",
	},
	{
		id: "05",
		title: "Rich Stars Real Estate",
		category: "Real Estate Platform",
		description:
			"Dubai property showcase platform crafted with responsive luxury layout structure and seamless property discovery.",
		tags: ["Wix", "Web Development", "UI Design"],
		link: "https://richstarsuae.com/",
		// customImage: "/projects/rich-stars.webp",
		type: "professional",
	},
	{
		id: "06",
		title: "The Private Address Realty",
		category: "Luxury Real Estate",
		description:
			"Exclusive realty showroom showcasing premium property listings with a high-end bespoke digital aesthetic.",
		tags: ["Wix", "Real Estate", "UI Design"],
		link: "https://theprivateaddress.com/",
		customImage: "/projects/the-private-address.webp",
		type: "professional",
	},
	{
		id: "07",
		title: "ARAHA Trading Corporate (PTE)",
		category: "Corporate Frontend Platform",
		description:
			"Sleek corporate web application developed with React and Tailwind CSS, featuring fluid animations and interactive presentation.",
		tags: ["React", "Tailwind CSS", "Shadcn UI", "Motion.dev"],
		link: "https://arahatrading.com/",
		// customImage: "/projects/araha-trading.webp",
		type: "professional",
	},
	{
		id: "08",
		title: "INBS Websites",
		category: "Businessmen Services Platform",
		description: "",
		tags: ["React", "Tailwind CSS", "Shadcn UI", "Motion.dev"],
		link: "https://inbs-uae.com/",
		// customImage: "/projects/inbs-realestate.webp",
		type: "professional",
	},
	{
		id: "09",
		title: "INBS Real Estate Websites",
		category: "Enterprise & Real Estate Portal",
		description:
			"Dual corporate platform and luxury real estate portal engineered for high performance, lead routing, and UI responsiveness.",
		tags: ["React", "Tailwind CSS", "Shadcn UI", "Motion.dev"],
		link: "https://inbsrealestate.com/",
		// customImage: "/projects/inbs-realestate.webp",
		type: "professional",
	},

	// --- Personal Projects ---
	{
		id: "P1",
		title: "Portfolio",
		category: "Personal Portfolio",
		description:
			"Personal portfolio website designed and developed to showcase creative development, digital experiences, and selected projects.",
		tags: ["HTML", "Css", "JavaScript"],
		link: "https://bashar-aljabi.vercel.app/",
		codeLink: "https://github.com/Bashar-alJabi/Portfolio",
		customImage: "/projects/portfolio.webp",
		type: "personal",
	},
	{
		id: "P2",
		title: "Home of Feelings",
		category: "Creative Web Experience",
		description:
			"Interactive web experience focused on emotional storytelling, immersive visual design, and expressive user interaction.",
		tags: ["Next.js", "React", "TypeScript", "Vercel"],
		link: "https://home-of-feelings.vercel.app/",
		codeLink: "https://github.com/Bashar-alJabi/Home-of-Feelings",
		customImage: "/projects/home-of-feelings.webp",
		type: "personal",
	},
	{
		id: "P3",
		title: "Windows",
		category: "OS Interface Web Preview",
		description:
			"Experimental web UI concept modeling desktop operating system window management and interactive desktop layouts.",
		tags: ["PugJs", "Sass", "Bootstrap", "GulpJs"],
		link: "https://windows-preview.vercel.app/",
		codeLink: "https://github.com/Bashar-alJabi/Windows",
		customImage: "/projects/windows.webp",
		type: "personal",
	},
	{
		id: "P4",
		title: "ClickMart",
		category: "E-Commerce Application",
		description:
			"Interactive digital shopping app featuring modern cart state management, product filters, and responsive design.",
		tags: ["React", "TypeScript", "Tailwind", "Shadcn UI"],
		codeLink: "https://github.com/Bashar-alJabi/ClickMart",
		customImage: "/projects/clickmart.webp",
		type: "personal",
	},
	{
		id: "P5",
		title: "BetaShop",
		category: "Next.js Storefront",
		description:
			"Modern full-featured web shop built with Next.js, emphasizing page speed, component architecture, and DaisyUI states.",
		tags: ["Next.js", "TypeScript", "Tailwind", "DaisyUI"],
		link: "https://betashop.vercel.app/",
		codeLink: "https://github.com/Bashar-alJabi/BetaShop",
		customImage: "/projects/betashop.webp",
		type: "personal",
	},
	{
		id: "P6",
		title: "IMEX",
		category: "Internet Movies Explorer",
		description:
			"Movie discovery web application consuming external cinema APIs to dynamically search and present media content.",
		tags: ["React", "React Bootstrap", "Material UI"],
		link: "https://imex4movies.vercel.app/",
		codeLink: "https://github.com/Bashar-alJabi/IMEX",
		customImage: "/projects/imex.webp",
		type: "personal",
	},
];

function ProjectCard({
	project,
	imageSrc,
	isActive,
	handleImageError,
}: {
	project: Project;
	imageSrc: string | null;
	isActive: boolean;
	handleImageError: (id: string) => void;
}) {
	return (
		<motion.div
			animate={{
				opacity: isActive ? 1 : 0.5,
			}}
			transition={{
				duration: 0.45,
				ease: "easeOut",
			}}
			data-project-card={project.id}
			className="project-card group relative w-[85vw] md:w-120 shrink-0 rounded-3xl border border-perfume-soft bg-perfume-surface p-5 md:p-6 overflow-hidden shadow-sm hover:border-perfume-primary/50 transition-all duration-300 flex flex-col justify-between"
		>
			<NoteFrame />
			{/* Image Container */}
			<div className="relative w-full h-48 md:h-60 rounded-2xl overflow-hidden mb-4 border border-perfume-soft/50 bg-perfume-bg">
				{imageSrc ? (
					<Image
						src={imageSrc}
						alt={project.title}
						fill
						sizes="(max-width: 768px) 85vw, 480px"
						onError={() => handleImageError(project.id)}
						className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="w-full h-full bg-linear-to-br from-rose-950/20 via-perfume-soft/40 to-perfume-surface flex items-center justify-center">
						<span className="text-4xl font-serif text-perfume-primary/40">
							/{project.id}
						</span>
					</div>
				)}

				<div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
					{project.tags.map((tag) => (
						<span
							key={tag}
							className="dp-label px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-white/90 border border-white/10"
						>
							{tag}
						</span>
					))}
				</div>

				{project.link && (
					<a
						href={project.link}
						target="_blank"
						rel="noopener noreferrer"
						className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 text-xs hover:bg-perfume-primary"
						aria-label={`Visit ${project.title}`}
					>
						↗
					</a>
				)}
			</div>

			<div className="flex flex-col flex-1 justify-between">
				<div>
					<div className="flex justify-between items-center mb-1.5">
						<span className="dp-label uppercase tracking-[0.25em] font-medium text-perfume-primary">
							{project.category}
						</span>

						<span className="dp-label text-perfume-text/40">/{project.id}</span>
					</div>

					<h3 className="dp-card-title font-normal text-perfume-text mb-2 group-hover:text-perfume-primary transition-colors duration-300">
						{project.link ? (
							<a
								href={project.link}
								target="_blank"
								rel="noopener noreferrer"
								className="hover:underline"
							>
								{project.title}
							</a>
						) : (
							project.title
						)}
					</h3>
				</div>

				<div className="flex items-center gap-3 pt-2 border-t border-perfume-soft/30 dp-label">
					{project.link && (
						<a
							href={project.link}
							target="_blank"
							rel="noopener noreferrer"
							className="text-perfume-primary hover:underline flex items-center gap-1"
						>
							<span>Live Site</span>
							<span>↗</span>
						</a>
					)}

					{project.codeLink && (
						<a
							href={project.codeLink}
							target="_blank"
							rel="noopener noreferrer"
							className="text-perfume-text/60 hover:text-perfume-text hover:underline flex items-center gap-1 ml-auto"
						>
							<span>Source Code</span>
							<span>↗</span>
						</a>
					)}
				</div>
			</div>
		</motion.div>
	);
}


export default function ProjectsSection() {
	const [activeTab, setActiveTab] = useState<"professional" | "personal">("professional");
	const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
	const [geometry, setGeometry] = useState({ distance: 0, offset: 0 });
	const [activeProjectIndex, setActiveProjectIndex] = useState(0);
	const targetRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const filteredProjects = allProjects.filter(p => p.type === activeTab);
	const progress = useChapterProgress("work");
	const x = useTransform(progress, p => geometry.offset - projectProgress(p, filteredProjects.length).travel * geometry.distance);
	const perspective = useTransform(progress, p => Math.sin(projectProgress(p, filteredProjects.length).travel * Math.PI * 2) * 1.1);
	useMotionValueEvent(progress, "change", p => setActiveProjectIndex(projectProgress(p, filteredProjects.length).index));

	useEffect(() => {
		const track = trackRef.current!;
		const measure = () => {
			const card = track.firstElementChild as HTMLElement | null;
			if (!card) return;
			setGeometry({ distance: track.scrollWidth - card.offsetWidth, offset: (innerWidth - card.offsetWidth) / 2 });
		};
		const observer = new ResizeObserver(measure);
		observer.observe(track); observer.observe(targetRef.current!);
		const frame = requestAnimationFrame(measure);
		return () => { observer.disconnect(); cancelAnimationFrame(frame); };
	}, [activeTab]);

	const selectTab = (tab: "professional" | "personal") => {
		setActiveTab(tab); setActiveProjectIndex(0);
		trackRef.current?.parentElement?.scrollTo({ left: 0 });
		if (innerWidth >= 768 && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
			const section = document.getElementById("work")!;
			window.scrollTo({ top: section.offsetTop, behavior: "instant" });
		}
	};
	const seekFocusedCard = (event: React.FocusEvent) => {
		if (innerWidth < 768 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const card = (event.target as HTMLElement).closest<HTMLElement>("[data-project-card]");
		if (!card) return;
		const index = filteredProjects.findIndex(p => p.id === card.dataset.projectCard);
		const section = document.getElementById("work")!;
		window.scrollTo({ top: section.offsetTop + (.06 + index / Math.max(1, filteredProjects.length - 1) * .88) * (section.offsetHeight - innerHeight), behavior: "instant" });
	};
	return <section ref={targetRef} className="projects-section relative md:h-[340vh] bg-perfume-bg text-perfume-text border-t border-perfume-soft/40">
		<div className="projects-viewport md:sticky md:top-0 flex min-h-screen md:h-screen flex-col justify-between overflow-hidden py-20 md:py-24">
			<div className="max-w-7xl w-full mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 z-20">
				<div>
					<span className="dp-label uppercase tracking-[0.4em] font-semibold text-perfume-text/60">[ THE COMPOSITIONS ]</span>
					<h2 className="mt-2 dp-section-title font-normal text-perfume-text">Real-World Work</h2>
				</div>
				<div className="flex items-center gap-2 p-1.5 rounded-full bg-perfume-surface border border-perfume-soft/80 shadow-sm self-start md:self-auto" role="group" aria-label="Project categories">
					<button type="button" aria-pressed={activeTab === "professional"} onClick={() => selectTab("professional")}
						className={"px-5 py-2 dp-small uppercase tracking-widest rounded-full transition-colors cursor-pointer " + (activeTab === "professional" ? "bg-perfume-primary text-white shadow-md" : "text-perfume-text/70 hover:text-perfume-text")}>
						Professional ({allProjects.filter(p => p.type === "professional").length})
					</button>
					<button type="button" aria-pressed={activeTab === "personal"} onClick={() => selectTab("personal")}
						className={"px-5 py-2 dp-small uppercase tracking-widest rounded-full transition-colors cursor-pointer " + (activeTab === "personal" ? "bg-perfume-primary text-white shadow-md" : "text-perfume-text/70 hover:text-perfume-text")}>
						Personal ({allProjects.filter(p => p.type === "personal").length})
					</button>
				</div>
			</div>
			<div className="project-window relative flex items-center my-auto overflow-x-auto md:overflow-hidden py-8" onFocusCapture={seekFocusedCard}>
				<motion.div ref={trackRef} style={{ x, rotateY: perspective, transformPerspective: 1400 }} className="project-track flex gap-6 md:gap-8 w-max px-6 md:px-0">
					{filteredProjects.map((project, index) => <ProjectCard key={project.id} project={project}
						imageSrc={imgErrors[project.id] ? null : project.customImage ?? null} isActive={index === activeProjectIndex}
						handleImageError={id => setImgErrors(previous => ({ ...previous, [id]: true }))} />)}
				</motion.div>
			</div>
		</div>
	</section>;
}
