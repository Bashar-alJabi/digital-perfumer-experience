"use client";

import { useEffect, useRef } from "react";
import { frame, cancelFrame } from "motion/react";
import { chapterAt, chapters, chooseQuality, clamp, darknessAt, formulaLayers, mix, pinnedProgress, sceneProgress, sceneWeights, smooth, statProgress, type Chapter } from "@/lib/three-notes/score";
import type { Score } from "./ThreeNotesProvider";
import type { NotePose, NotesRenderer, SceneFrame } from "./types";

const pinned = new Set<Chapter>(["formula", "impact", "work", "memory", "skills"]);

export default function ThreeNotesDirector({ score }: { score: Score }) {
	const hostRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const pathsRef = useRef<SVGSVGElement>(null);
	const bridgesRef = useRef<SVGGElement>(null);

	useEffect(() => {
		const host = hostRef.current!;
		const stage = stageRef.current!;
		const root = host.closest<HTMLElement>(".three-notes-experience")!;
		const reduced = matchMedia("(prefers-reduced-motion: reduce)");
		const compact = matchMedia("(max-width: 767px)");
		const elements = chapters.map(id => document.getElementById(id)!);
		let bounds: { top: number; height: number }[] = [];
		let anchors = new Map<string, HTMLElement>();
		let renderer: NotesRenderer | undefined;
		let quality: import("@/lib/three-notes/score").Quality = "still";
		let disposed = false;
		let generation = 0;
		let scheduled = false;
		let pointer = { x: 0, y: 0 };
		let lastFrame: SceneFrame;
		let projectCards: HTMLElement[] = [];
		const rectCache = new Map<Element, DOMRect>();
		const fallback = Array.from(stage.querySelectorAll<HTMLElement>(".note-fallback"));
		const paths = Array.from(pathsRef.current!.querySelectorAll("path"));
		const bridges = Array.from(bridgesRef.current!.querySelectorAll("rect"));

		function measure() {
			bounds = elements.map(el => ({ top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight }));
			anchors = new Map(Array.from(document.querySelectorAll<HTMLElement>("[data-note-anchor]")).filter(el => el.getClientRects().length > 0).map(el => [el.dataset.noteAnchor!, el]));
			projectCards = Array.from(document.querySelectorAll<HTMLElement>("[data-project-card]"));
			requestRender();
		}
		function box(element: Element) {
			if (!rectCache.has(element)) rectCache.set(element, element.getBoundingClientRect());
			return rectCache.get(element)!;
		}
		function rect(name: string) { const element = anchors.get(name); return element ? box(element) : undefined; }
		function point(name: string, x: number, y: number, radius = 12): NotePose {
			const box = rect(name);
			return { x: box ? box.left + box.width / 2 : x, y: box ? box.top + box.height / 2 : y, radius, opacity: 1 };
		}
		function poses(id: Chapter, p: number, w: number, h: number): NotePose[] {
			return [0, 1, 2].map(i => {
				const home = point(`home-${i}`, w / 2 + (i - 1) * 28, h * 0.35, 8);
				if (id === "home") {
					const release = smooth(0, 0.8, p);
					return { x: mix(home.x, w * (0.68 + i * 0.08), release), y: mix(home.y, h * (0.32 + i * 0.13), release), radius: mix(8, compact.matches ? 13 : 23, release), opacity: smooth(0, 0.025, p) };
				}
				if (id === "philosophy") {
					const target = point(`philosophy-${i}`, w * 0.8, h * 0.5, 8);
					const arrival = smooth(h * 0.92, h * 0.48, target.y);
					anchors.get(`philosophy-${i}`)?.closest<HTMLElement>("[data-note-card]")?.style.setProperty("--note-charge", String(arrival));
					return { ...target, x: mix(w * (0.75 + i * 0.06), target.x, arrival), y: target.y - (1 - arrival) * 110, radius: mix(22, 8, arrival) };
				}
				if (id === "formula") {
					const bottle = rect(compact.matches ? "bottle-mobile" : "bottle-desktop");
					const x = bottle ? bottle.left + bottle.width / 2 : w / 2;
					const y = bottle ? bottle.top : h * 0.26;
					const arrival = [0.25, 0.47, 0.69][i];
					const fall = smooth(arrival - 0.14, arrival, p);
					const merge = smooth(0.78, 0.96, p);
					return { x: mix(x + (i - 1) * 54 * (1 - fall), x, merge), y: mix(y - 55 - i * 30 + fall * 155, y + (bottle?.height ?? 450) * 0.36, merge), radius: mix(16, 25 - i * 5, merge), opacity: (1 - smooth(arrival - 0.01, arrival + 0.04, p)) + merge };
				}
				if (id === "about") {
					const center = point("core", w * 0.82, h * 0.3, 30 - i * 8);
					const split = smooth(0.7, 1, p);
					const target = point(`stat-${i}`, w * (0.25 + i * 0.25), h * 0.6, 7);
					return { x: mix(center.x, target.x, split), y: mix(center.y, target.y, split), radius: mix(center.radius, 7, split), opacity: 1 };
				}
				if (id === "impact") {
					const slot = Math.min(3, Math.floor(p * 4));
					const target = point(`stat-${slot}`, w * 0.5, h * 0.5, 4);
					const box = rect(`stat-${slot}`);
					const circle = (box?.width ?? 260) * 118 / 260;
					const angle = statProgress(p, slot) * Math.PI * 2 - Math.PI / 2 - i * 0.12;
					const transfer = slot > 0 ? smooth(0, 0.12, p * 4 - slot) : 1;
					const previous = point(`stat-${Math.max(0, slot - 1)}`, target.x, target.y);
					const previousRadius = (rect(`stat-${Math.max(0, slot - 1)}`)?.width ?? 260) * 118 / 260;
					return { x: mix(previous.x + Math.cos(-Math.PI / 2 - i * .12) * previousRadius, target.x + Math.cos(angle) * circle, transfer),
						y: mix(previous.y + Math.sin(-Math.PI / 2 - i * .12) * previousRadius, target.y + Math.sin(angle) * circle, transfer) - Math.sin(transfer * Math.PI) * 40,
						radius: 4 - i * 0.6, opacity: 1 - smooth(0.94, 1, p) };
				}
				if (id === "work") {
					const visible = projectCards.filter(el => el.offsetWidth > 0);
					const card = visible.reduce<HTMLElement | undefined>((best, el) => !best || Math.abs(box(el).left + el.offsetWidth / 2 - w / 2) < Math.abs(box(best).left + best.offsetWidth / 2 - w / 2) ? el : best, undefined);
					const bounds = card ? box(card) : undefined;
					return { x: bounds ? bounds.left + (i === 0 ? 12 : i === 1 ? bounds.width - 12 : bounds.width * 0.5) : w * 0.7, y: bounds ? bounds.top + (i === 2 ? bounds.height - 9 : 9) : h * 0.5, radius: 3, opacity: 1 - smooth(0.9, 1, p) };
				}
				if (id === "memory") return { x: w * (0.68 + i * 0.08), y: h * (0.3 + i * 0.18), radius: 3, opacity: 0 };
				const target = point(`contact-${i}`, w / 2 + (i - 1) * 28, h * 0.4, 8);
				if (id === "skills") return { ...target, opacity: smooth(0.86, 1, p), y: mix(h * 0.5, target.y, smooth(0.86, 1, p)) };
				return target;
			});
		}

		function render() {
			if (disposed || document.hidden || !bounds.length) return;
			rectCache.clear();
			const w = innerWidth, h = innerHeight, y = scrollY;
			const index = chapterAt(y + h * 0.5, bounds.map(b => b.top));
			const chapter = chapters[index];
			const current = bounds[index];
			const sceneEnd = bounds[index + 1]?.top ?? current.top + current.height - h * 0.5;
			const sceneP = sceneProgress(y, current.top, sceneEnd, h);

			const p = score.progress[chapter].get();
			const still = quality === "still";
			const weights = sceneWeights(chapter, p);
			const darkness = darknessAt(y, bounds[6].top, bounds[8].top, h);
			root.style.setProperty("--world-dark", String(darkness));
			root.style.setProperty("--intro", String(score.intro.get()));
			root.style.setProperty("--signature-handoff", String(still ? 0 : smooth(0, 0.025, score.progress.home.get())));
			root.style.setProperty("--formula-open", String(still ? 0 : smooth(0, 0.1, score.progress.formula.get()) * (1 - smooth(0.7, 0.8, score.progress.formula.get()))));
			const layers = formulaLayers(score.progress.formula.get());
			root.style.setProperty("--formula-ripple", String(still ? 0 : Math.max(...layers.map(layer => Math.sin(layer * Math.PI)))));
			root.style.setProperty("--formula-surface", `${92 - layers.reduce((sum, layer) => sum + layer, 0) * 23.33}%`);
			root.dataset.chapter = chapter;
			const notes = poses(chapter, p, w, h);
			// The handoff begins at the outgoing scene's actual anchors, even when seeking backwards.
			if (index > 0 && sceneP < 0.12) {
				const previous = poses(chapters[index - 1], 1, w, h);
				const blend = smooth(0, 0.12, sceneP);
				notes.forEach((note, i) => {
					note.x = mix(previous[i].x, note.x, blend);
					note.y = mix(previous[i].y, note.y, blend) - Math.sin(blend * Math.PI) * (still ? 0 : 35);
					note.radius = mix(previous[i].radius, note.radius, blend);
					note.opacity = mix(previous[i].opacity, note.opacity, blend);
				});
			}
			const panel = rect("skill-panel");
			lastFrame = { width: w, height: h, chapter, progress: p, journey: index + sceneP, darkness, ...weights, quality: quality, notes,
				grid: { x: panel?.left ?? w * 0.52, y: panel?.top ?? h * 0.25, width: panel?.width ?? w * 0.4, height: panel?.height ?? h * 0.5 }, pointer };
			stage.style.opacity = String(score.intro.get());
			stage.style.visibility = still ? "hidden" : "visible";
			notes.forEach((note, i) => {
				fallback[i].style.cssText = `left:${note.x}px;top:${note.y}px;width:${note.radius * 2}px;height:${note.radius * 2}px;opacity:${clamp(note.opacity)};`;
			});
			// Only the current scene contributes connecting strokes. No content is cloned into WebGL.
			paths.forEach((path, i) => {
				const source = chapter === "skills" ? point(`skill-${i}`, w * 0.3, h * 0.5) : point("core", w * 0.8, h * 0.3);
				const target = chapter === "skills" ? point("skill-panel", w * 0.7, h * 0.5) : notes[i % 3];
				const active = chapter === "skills" ? weights.network : chapter === "about" && i < 3 ? smooth(0.72, 1, p) * (1 - smooth(0.96, 1, p)) : 0;
				path.setAttribute("d", `M${source.x},${source.y} C${mix(source.x, target.x, 0.55)},${source.y} ${mix(source.x, target.x, 0.45)},${target.y} ${target.x},${target.y}`);
				path.style.opacity = String(active * 0.4);
				path.style.strokeDashoffset = String(1 - active);
			});
			bridges.forEach((bridge, i) => {
				const expansion = chapter === "impact" ? smooth(0.84, 1, p) : 0;
				bridge.style.opacity = String(Math.sin(expansion * Math.PI) * 0.45);
				if (!expansion) return;
				const source = rect(`stat-${i}`);
				const first = projectCards.find(card => card.offsetWidth > 0);
				if (!source || !first) return;
				const target = box(first);
				const width = mix(source.width, target.width - i * 6, expansion);
				const height = mix(source.height, target.height - i * 6, expansion);
				bridge.setAttribute("x", String(mix(source.left, target.left + i * 3, expansion)));
				bridge.setAttribute("y", String(mix(source.top, target.top + i * 3, expansion)));
				bridge.setAttribute("width", String(width)); bridge.setAttribute("height", String(height));
				bridge.setAttribute("rx", String(mix(source.width / 2, 24, expansion)));
			});
			if (chapter === "work") projectCards.forEach(card => {
				if (!card.offsetWidth) return;
				const cardBox = box(card);
				const reveal = smooth(w * 1.1, w * 0.64, cardBox.left);
				card.style.setProperty("--frame", String(reveal));
			});
			renderer?.render(lastFrame);
		}
		function update() {
			scheduled = false;
			if (disposed || document.hidden || !bounds.length) return;
			const y = scrollY, h = innerHeight, w = innerWidth;
			for (let i = 0; i < chapters.length; i++) {
				const b = bounds[i];
				const pin = pinned.has(chapters[i]) && !(chapters[i] === "work" && compact.matches) && !(chapters[i] === "skills" && w < 1024);
				const end = bounds[i + 1]?.top ?? b.top + b.height - h * 0.5;
				score.progress[chapters[i]].set(pin ? pinnedProgress(y, b.top, b.height, h) : sceneProgress(y, b.top, end, h));
			}
			// Motion writes the bottle and gallery transforms before WebGL reads their anchors.
			frame.postRender(render);
		}
		function requestRender() { if (!scheduled && !disposed) { scheduled = true; frame.read(update); } }
		async function configure() {
			const version = ++generation;
			const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
			quality = chooseQuality(reduced.matches, compact.matches, navigator.hardwareConcurrency || 4, nav.deviceMemory, nav.connection?.saveData);
			root.dataset.motion = quality;
			renderer?.dispose(); renderer = undefined;
			host.dataset.renderer = "fallback";
			measure();
			if (quality === "still") { score.ready.set(true); return; }
			try {
				const { createNotesRenderer } = await import("./webgl");
				if (disposed || version !== generation) return;
				renderer = createNotesRenderer(host, quality, () => {
					host.dataset.renderer = "fallback";
					score.ready.set(true);
				});
				requestRender();
				host.dataset.renderer = "webgl";
			} catch { host.dataset.renderer = "fallback"; }
			score.ready.set(true);
		}
		function onPointer(event: PointerEvent) {
			if (quality !== "full" || (lastFrame?.chapter !== "skills" && lastFrame?.chapter !== "about")) return;
			pointer = { x: (event.clientX / innerWidth - 0.5) * 2, y: (event.clientY / innerHeight - 0.5) * 2 };
			requestRender();
		}
		const resize = new ResizeObserver(measure);
		elements.forEach(el => resize.observe(el));
		// Tabs and ingredient changes replace DOM anchors without a global query every frame.
		const mutation = new MutationObserver(measure);
		mutation.observe(elements[5], { childList: true, subtree: true });
		mutation.observe(elements[7], { childList: true, subtree: true });
		window.addEventListener("scroll", requestRender, { passive: true });
		elements[5].addEventListener("scroll", requestRender, { capture: true, passive: true });
		window.addEventListener("resize", measure);
		window.addEventListener("pointermove", onPointer, { passive: true });
		document.addEventListener("visibilitychange", requestRender);
		reduced.addEventListener("change", configure);
		compact.addEventListener("change", configure);
		const stopIntro = score.intro.on("change", requestRender);
		void document.fonts.ready.then(() => { if (!disposed) measure(); });
		void configure();
		return () => {
			disposed = true; generation++; cancelFrame(update); cancelFrame(render);
			renderer?.dispose(); resize.disconnect(); mutation.disconnect(); stopIntro();
			window.removeEventListener("scroll", requestRender); window.removeEventListener("resize", measure);
			elements[5].removeEventListener("scroll", requestRender, true);
			window.removeEventListener("pointermove", onPointer); document.removeEventListener("visibilitychange", requestRender);
			reduced.removeEventListener("change", configure); compact.removeEventListener("change", configure);
		};
	}, [score]);

	return <>
		<div className="notes-world" aria-hidden="true"><div className="notes-world-iris" /></div>
		<div ref={stageRef} className="notes-stage" aria-hidden="true">
			<div ref={hostRef} className="notes-renderer">
				{[0, 1, 2].map(i => <i key={i} className={`note-fallback note-fallback-${i}`} />)}
			</div>
			<svg ref={pathsRef} className="notes-connections" width="100%" height="100%">
				{[0, 1, 2, 3, 4].map(i => <path key={i} pathLength="1" fill="none" stroke={["#f36371", "#ffd8df", "#c58a9e"][i % 3]} strokeWidth="1" strokeDasharray="1" />)}
				<g ref={bridgesRef}>{[0, 1, 2].map(i => <rect key={i} fill="none" stroke={["#f36371", "#ffd8df", "#a4546d"][i]} strokeWidth="1" opacity="0" />)}</g>
			</svg>
		</div>
	</>;
}
