"use client";
import type { CSSProperties, ReactNode } from "react";
import { chapters } from "@/lib/atelier-state";

export default function Chapter({
  index,
  children,
  className = "",
}: {
  index: number;
  children: ReactNode;
  className?: string;
}) {
  const chapter = chapters[index];
  return (
    <section
      id={chapter.id}
      data-chapter={index}
      className={`chapter chapter-${chapter.id} ${className}`}
      style={{ "--travel": chapter.travel } as CSSProperties}
      aria-label={chapter.name}
    >
      <div className="scene-viewport">
        <div className="camera-space">
          <div className="scene-content">{children}</div>
        </div>
      </div>
    </section>
  );
}
