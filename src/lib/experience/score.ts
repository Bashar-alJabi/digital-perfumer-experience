export const chapterIds = [
  "home",
  "philosophy",
  "formula",
  "about",
  "impact",
  "work",
  "memory",
  "skills",
  "contact",
  "signature",
] as const;
export const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export type Pose = {
  x: number;
  y: number;
  size: number;
  morph: number;
  alpha: number;
};
export type Frame = {
  at: number;
  notes: Pose[];
  dark: number;
  bottle: number;
  fill: number;
  fluid: number;
  rings: number;
  stars: number;
  signature: number;
};
export type ChapterBounds = { id: string; top: number; height: number };
const pose = (x: number, y: number, size = 1, morph = 0, alpha = 1): Pose => ({
  x,
  y,
  size,
  morph,
  alpha,
});
const home = [
  pose(0.72, 0.38, 1.05),
  pose(0.83, 0.6, 0.72),
  pose(0.65, 0.68, 0.52),
];
const waiting = [
  pose(0.74, 0.24, 0.26),
  pose(0.85, 0.38, 0.23),
  pose(0.88, 0.64, 0.2),
];

/** Absolute scroll keyframes. Sampling has no accumulated state, so reverse scroll and anchors agree. */
export function composeScore(
  bounds: ChapterBounds[],
  vh: number,
  mobile: boolean,
): Frame[] {
  const frames: Frame[] = [];
  const add = (
    at: number,
    notes: Pose[],
    values: Partial<Omit<Frame, "at" | "notes">> = {},
  ) => {
    const previous = frames.at(-1);
    frames.push({
      dark: previous?.dark ?? 0,
      bottle: previous?.bottle ?? 0,
      fill: previous?.fill ?? 0,
      fluid: previous?.fluid ?? 0,
      rings: previous?.rings ?? 0,
      stars: previous?.stars ?? 0,
      signature: previous?.signature ?? 0,
      ...values,
      at,
      notes: notes.map((n) => ({ ...n })),
    });
  };
  const b = (id: string) => bounds.find((c) => c.id === id)!;
  const at = (id: string, p: number) =>
    b(id).top + Math.max(1, b(id).height - vh) * p;
  const h = mobile
    ? [pose(0.3, 0.72, 0.55), pose(0.64, 0.76, 0.4), pose(0.81, 0.68, 0.28)]
    : home;
  add(0, h);
  add(at("home", 0.25), h);
  add(at("philosophy", 0) - vh * 0.45, waiting);
  for (let i = 0; i < 3; i++) {
    const spheres = waiting.map((n, j) =>
      j < i ? pose(0.48 + j * 0.025, 0.84, 0.1) : { ...n },
    );
    spheres[i] = pose(mobile ? 0.5 : 0.74, mobile ? 0.64 : 0.51, 0.42);
    add(at("philosophy", i / 3), spheres);
    const cards = spheres.map((n) => ({ ...n }));
    cards[i] = pose(mobile ? 0.5 : 0.74, mobile ? 0.64 : 0.51, 1, 1);
    add(at("philosophy", (i + 0.18) / 3), cards);
    add(at("philosophy", (i + 0.73) / 3), cards);
    add(
      at("philosophy", (i + 0.96) / 3),
      spheres.map((n, j) => (j === i ? pose(0.48 + i * 0.025, 0.84, 0.1) : n)),
    );
  }
  const neck = [
    pose(0.43, 0.28, 0.13),
    pose(0.5, 0.22, 0.12),
    pose(0.57, 0.28, 0.11),
  ];
  add(at("formula", 0) - vh * 0.2, neck, { dark: 1, bottle: 1 });
  add(at("formula", 0.08), neck);
  for (let i = 0; i < 3; i++)
    add(
      at("formula", 0.22 + i * 0.2),
      neck.map((n, j) => (j <= i ? pose(0.5, 0.58, 0.08, 0, 0.08) : n)),
      { fill: (i + 1) / 3 },
    );
  add(
    at("formula", 0.9),
    neck.map(() => pose(0.5, 0.58, 0.05, 0, 0)),
    { fill: 1 },
  );
  const hidden = neck.map(() => pose(0.5, 0.5, 0.01, 0, 0));
  add(at("about", 0), hidden, { bottle: 0, fluid: 1 });
  add(at("about", 0.85), hidden);
  add(at("impact", 0.18), hidden, { rings: 1 });
  add(at("impact", 0.85), hidden);
  add(
    at("work", 0),
    [pose(0.89, 0.23, 0.13), pose(0.92, 0.33, 0.1), pose(0.89, 0.42, 0.07)],
    { fluid: 0, rings: 0, dark: 0.92 },
  );
  add(at("work", 0.95), [
    pose(0.89, 0.23, 0.13),
    pose(0.92, 0.33, 0.1),
    pose(0.89, 0.42, 0.07),
  ]);
  add(at("memory", 0), hidden, { stars: 1, dark: 1 });
  add(at("memory", 0.82), hidden);
  const skillNotes = mobile
    ? [pose(0.73, 0.14, 0.1), pose(0.82, 0.14, 0.08), pose(0.9, 0.14, 0.06)]
    : [pose(0.7, 0.31, 0.18), pose(0.78, 0.31, 0.14), pose(0.86, 0.31, 0.1)];
  add(at("skills", 0), skillNotes, { stars: 0.13 });
  add(at("skills", 0.8), skillNotes);
  add(at("contact", 0), hidden, { fluid: 1, signature: 1, stars: 0 });
  add(at("contact", 0.86), hidden);
  add(b("signature").top - vh * 0.25, hidden);
  add(
    b("signature").top,
    [pose(0.46, 0.45, 0.12), pose(0.5, 0.45, 0.12), pose(0.54, 0.45, 0.12)],
    { fluid: 0, signature: 0, dark: 0 },
  );
  add(b("signature").top + b("signature").height - vh, [
    pose(0.46, 0.45, 0.12),
    pose(0.5, 0.45, 0.12),
    pose(0.54, 0.45, 0.12),
  ]);
  return frames.sort((a, b) => a.at - b.at);
}
export function sampleScore(frames: Frame[], y: number): Frame {
  if (y <= frames[0].at) return frames[0];
  let i = 1;
  while (i < frames.length - 1 && frames[i].at < y) i++;
  const a = frames[i - 1],
    b = frames[i],
    t = ease((y - a.at) / Math.max(1, b.at - a.at));
  const out = {
    ...a,
    at: y,
    notes: a.notes.map(
      (n, j) =>
        Object.fromEntries(
          Object.keys(n).map((k) => [
            k,
            mix(n[k as keyof Pose], b.notes[j][k as keyof Pose], t),
          ]),
        ) as Pose,
    ),
  };
  for (const k of [
    "dark",
    "bottle",
    "fill",
    "fluid",
    "rings",
    "stars",
    "signature",
  ] as const)
    out[k] = mix(a[k], b[k], t);
  return out;
}
