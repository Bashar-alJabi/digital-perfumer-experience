import type { Chapter, Quality } from "@/lib/three-notes/score";

export interface NotePose { x: number; y: number; radius: number; opacity: number; }
export interface SceneFrame {
	width: number;
	height: number;
	chapter: Chapter;
	progress: number;
	journey: number;
	darkness: number;
	drop: number;
	core: number;
	particles: number;
	release: number;
	fold: number;
	network: number;
	quality: Quality;
	notes: NotePose[];
	grid: { x: number; y: number; width: number; height: number };
	pointer: { x: number; y: number };
}
export interface NotesRenderer { render(frame: SceneFrame): void; dispose(): void; }
