"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { MotionConfig, motionValue } from "motion/react";
import { chapters, type Chapter } from "@/lib/three-notes/score";
import ThreeNotesDirector from "./ThreeNotesDirector";

export function createScore() {
	return {
		progress: Object.fromEntries(chapters.map(id => [id, motionValue(0)])) as Record<Chapter, ReturnType<typeof motionValue<number>>>,
		intro: motionValue(0),
		ready: motionValue(false),
	};
}
export type Score = ReturnType<typeof createScore>;
const ScoreContext = createContext<Score | null>(null);
export function useScore() {
	const score = useContext(ScoreContext);
	if (!score) throw new Error("Three Notes requires its score provider");
	return score;
}
export function useChapterProgress(id: Chapter) { return useScore().progress[id]; }

export default function ThreeNotesProvider({ children }: { children: ReactNode }) {
	const [score] = useState(createScore);
	return <ScoreContext.Provider value={score}>
		<MotionConfig reducedMotion="user">
			<div className="three-notes-experience">
				<ThreeNotesDirector score={score} />
				{children}
			</div>
		</MotionConfig>
	</ScoreContext.Provider>;
}
