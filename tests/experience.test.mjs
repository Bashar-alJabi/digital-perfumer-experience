import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";

const baseline = JSON.parse(
  fs.readFileSync(new URL("./original-content.json", import.meta.url)),
);
const read = (p) =>
  fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
async function load(p) {
  const { outputText } = ts.transpileModule(read(p), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(
        outputText.replaceAll(
          'from "three"',
          "from " + JSON.stringify(import.meta.resolve("three")),
        ),
      ).toString("base64")
  );
}

test("all original project, skill, philosophy and formula records survive unchanged", async () => {
  for (const name of ["allProjects", "skillGroups", "notes", "formulaNotes"]) {
    const actual = await load("src/lib/experience/" + name + ".ts");
    assert.deepEqual(actual[name], baseline.data[name]);
  }
  assert.equal(baseline.data.allProjects.length, 15);
  assert.equal(
    baseline.data.skillGroups.reduce((n, g) => n + g.skills.length, 0),
    34,
  );
});
test("the shared note surface starts spherical and reaches the card bounds", async () => {
  const { noteGeometry } = await load("src/lib/experience/geometry.ts");
  const g = noteGeometry(3, 2),
    p = g.attributes.position;
  for (let i = 0; i < p.count; i++)
    assert.ok(
      Math.abs(Math.hypot(p.getX(i), p.getY(i), p.getZ(i)) - 0.85) < 0.00001,
    );
  const card = g.userData.card;
  const extents = [0, 0, 0];
  for (let i = 0; i < card.length; i++)
    extents[i % 3] = Math.max(extents[i % 3], Math.abs(card[i]));
  assert.ok(Math.abs(extents[0] - 1.5) < 0.001);
  assert.ok(Math.abs(extents[1] - 1) < 0.001);
  assert.ok(Math.abs(extents[2] - 0.09) < 0.001);
  assert.equal(card.length, p.array.length);
  g.dispose();
});
test("all project images, CV, original loader, Hero atmosphere and footer are preserved", () => {
  for (const [p, hash] of Object.entries({
    ...baseline.assets,
    ...baseline.protected,
  })) {
    assert.equal(
      createHash("sha256")
        .update(
          p.endsWith(".tsx")
            ? read(p).replaceAll("\r\n", "\n")
            : fs.readFileSync(new URL("../" + p, import.meta.url)),
        )
        .digest("hex"),
      hash,
      p,
    );
  }
});
test("original statistics, contact endpoint and form field contract survive", () => {
  const stats = read("src/components/sections/StatsSection.tsx");
  for (const s of baseline.data.stats) {
    assert.ok(stats.includes(s.value));
    assert.ok(stats.includes(s.label));
  }
  const contact = read("src/components/sections/ContactSection.tsx");
  assert.match(contact, /useForm\("mnpqzbbe"\)/);
  assert.match(contact, /onSubmit=\{handleSubmit\}/);
  for (const name of ["name", "email", "message", "service"])
    assert.ok(contact.includes('name="' + name + '"'));
  assert.ok(contact.includes("digitalperfumer@gmail.com"));
  assert.ok(contact.includes("state.succeeded"));
  assert.ok(contact.includes("state.submitting"));
});
test("scroll score is finite, continuous and independent of scroll direction", async () => {
  const { chapterIds, composeScore, sampleScore } = await load(
    "src/lib/experience/score.ts",
  );
  for (const mobile of [false, true]) {
    const vh = mobile ? 844 : 900;
    let top = 0;
    const bounds = chapterIds.map((id, i) => {
      const height = vh * [1.45, 4.4, 2.5, 1.85, 2.3, 5.6, 3.3, 3.3, 1.3, 1][i];
      const b = { id, top, height };
      top += height;
      return b;
    });
    const score = composeScore(bounds, vh, mobile);
    const saved = new Map();
    for (let y = 0; y <= top - vh; y += 17) {
      const frame = sampleScore(score, y);
      saved.set(y, frame);
      assert.ok(
        frame.notes.every((n) => Object.values(n).every(Number.isFinite)),
      );
      assert.ok(
        frame.notes.every(
          (n) => n.alpha >= 0 && n.alpha <= 1 && n.morph >= 0 && n.morph <= 1,
        ),
      );
    }
    for (const [y, frame] of [...saved].reverse())
      assert.deepEqual(sampleScore(score, y), frame);
    for (const k of score.slice(1, -1)) {
      const before = sampleScore(score, k.at - 0.01),
        after = sampleScore(score, k.at + 0.01);
      before.notes.forEach((n, i) =>
        assert.ok(
          Math.abs(n.x - after.notes[i].x) < 0.005 &&
            Math.abs(n.morph - after.notes[i].morph) < 0.005,
        ),
      );
    }
    const phi = bounds.find((b) => b.id === "philosophy");
    for (let i = 0; i < 3; i++) {
      const f = sampleScore(
        score,
        phi.top + ((phi.height - vh) * (i + 0.4)) / 3,
      );
      assert.equal(f.notes[i].morph, 1);
      assert.equal(f.notes.filter((n) => n.morph > 0.95).length, 1);
    }
  }
});
test("original chapter order and unique anchors remain available", () => {
  const page = read("src/app/page.tsx");
  const ids = [
    ...page.matchAll(
      /id="(home|philosophy|formula|about|impact|work|memory|skills|contact)"/g,
    ),
  ].map((m) => m[1]);
  assert.deepEqual(ids, [
    "home",
    "philosophy",
    "formula",
    "about",
    "impact",
    "work",
    "memory",
    "skills",
    "contact",
  ]);
  const about = read("src/components/sections/AboutSection.tsx");
  assert.ok(!about.includes('id="about"'));
});
