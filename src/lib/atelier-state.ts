"use client";

import { useSyncExternalStore } from "react";

export const chapters = [
  { id: "home", name: "HOME", travel: 1.65 },
  { id: "philosophy", name: "PHILOSOPHY", travel: 2.8 },
  { id: "formula", name: "FORMULA", travel: 2.6 },
  { id: "about", name: "ABOUT", travel: 1.7 },
  { id: "impact", name: "IMPACT", travel: 1.6 },
  { id: "work", name: "WORK", travel: 5.5 },
  { id: "memory", name: "MEMORY", travel: 2.8 },
  { id: "skills", name: "SKILLS", travel: 3.6 },
  { id: "contact", name: "CONTACT", travel: 1.8 },
] as const;

type AtelierState = {
  chapter: number;
  note: number;
  memory: number;
  skill: number;
  project: number;
  collection: "professional" | "personal";
  reduced: boolean;
  enhanced: boolean;
};
const initial: AtelierState = {
  chapter: 0,
  note: 0,
  memory: 0,
  skill: 0,
  project: 0,
  collection: "professional",
  reduced: false,
  enhanced: false,
};
let snapshot = initial;
const listeners = new Set<() => void>();

export function setAtelier(patch: Partial<AtelierState>) {
  if (
    Object.entries(patch).every(
      ([key, value]) => snapshot[key as keyof AtelierState] === value,
    )
  )
    return;
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}
export function getAtelier() {
  return snapshot;
}
export function useAtelier() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getAtelier,
    () => initial,
  );
}
/** Seek through the same native scroll route used by the camera. */
export function seekChapterItem(id: string, index: number, count: number) {
  const section = document.getElementById(id);
  if (!section || !document.querySelector("[data-enhanced='true']")) return;
  const fraction = 0.1 + ((index + 0.5) / count) * 0.67;
  window.dispatchEvent(
    new CustomEvent("atelier-seek", {
      detail: { top: section.offsetTop + section.offsetHeight * fraction },
    }),
  );
}
