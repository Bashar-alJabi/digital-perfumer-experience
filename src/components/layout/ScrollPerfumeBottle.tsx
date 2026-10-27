"use client";
import { chapters, useAtelier } from "@/lib/atelier-state";
export default function ScrollPerfumeBottle() {
  const { chapter } = useAtelier();
  return (
    <div
      className="scroll-perfume"
      role="progressbar"
      aria-label={`Journey progress: ${chapters[chapter].name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((chapter / 8) * 100)}
    >
      <div className="progress-bottle">
        <span className="progress-cap" />
        <span className="progress-neck" />
        <div className="progress-body">
          <div className="progress-liquid" />
          <span className="progress-highlight" />
          <span className="progress-chapter">{chapters[chapter].name}</span>
        </div>
      </div>
    </div>
  );
}
