/** The score is a pure function of scroll: seeking and reversing never replay an animation. */
export const chapters = ["home", "philosophy", "formula", "about", "impact", "work", "memory", "skills", "contact"] as const;
export type Chapter = (typeof chapters)[number];
export type Quality = "full" | "light" | "still";
export const noteColors = ["#f36371", "#ffd8df", "#191116"] as const;
export const clamp = (value: number) => Math.min(1, Math.max(0, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export function smooth(from: number, to: number, value: number) {
	const t = clamp((value - from) / (to - from));
	return t * t * (3 - 2 * t);
}
export function chapterAt(position: number, starts: readonly number[]): number {
	let index = 0;
	while (index < starts.length - 1 && position >= starts[index + 1]) index++;
	return index;
}
export function pinnedProgress(scroll: number, top: number, height: number, viewport: number) {
	return clamp((scroll - top) / Math.max(viewport * 0.4, height - viewport));
}
export function sceneProgress(scroll: number, top: number, end: number, viewport: number) {
	const start = Math.max(0, top - viewport * 0.5);
	return clamp((scroll - start) / Math.max(1, end - viewport * 0.5 - start));
}
export function formulaLayers(progress: number): [number, number, number] {
	return [smooth(0.16, 0.25, progress), smooth(0.38, 0.47, progress), smooth(0.60, 0.69, progress)];
}
export function statProgress(progress: number, index: number) {
	return clamp((progress * 4 - index - 0.12) / 0.88);
}
export function memoryOpacity(index: number, progress: number) {
	const starts = [0.02, 0.34, 0.66];
	const ends = [0.32, 0.64, 1.1];
	return smooth(starts[index], starts[index] + 0.06, progress) * (1 - smooth(ends[index] - 0.06, ends[index], progress));
}
export function projectProgress(progress: number, count: number) {
	// Short rests at both ends keep the first and last projects usable.
	const travel = clamp((progress - 0.06) / 0.88);
	return { travel, index: Math.round(travel * Math.max(0, count - 1)) };
}
export function chooseQuality(reduced: boolean, compact: boolean, cores: number, memory = 8, saveData = false): Quality {
	return reduced ? "still" : compact || cores <= 4 || memory <= 4 || saveData ? "light" : "full";
}
export function darknessAt(scroll: number, memoryTop: number, contactTop: number, viewport: number) {
	return smooth(memoryTop - viewport * 0.9, memoryTop, scroll) * (1 - smooth(contactTop - viewport * 0.85, contactTop, scroll));
}
export function sceneWeights(chapter: Chapter, progress: number) {
	const particles = chapter === "work" ? smooth(0.92, 1, progress) : chapter === "memory" ? 1 : chapter === "skills" ? 1 - smooth(0.86, 1, progress) : 0;
	return {
		particles,
		release: chapter === "work" ? smooth(0.92, 1, progress) : 1,
		fold: chapter === "skills" ? smooth(0.86, 1, progress) : 0,
		network: chapter === "skills" ? smooth(0, 0.18, progress) * (1 - smooth(0.86, 1, progress)) : 0,
		core: chapter === "about" ? 1 - smooth(0.7, 1, progress) : chapter === "formula" ? smooth(0.78, 0.96, progress) : 0,
		drop: chapter === "home" ? smooth(0, 0.6, progress) : chapter === "philosophy" || chapter === "formula" ? 1 : 0,
	};
}
