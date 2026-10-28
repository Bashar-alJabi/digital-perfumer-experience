import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = fs.readFileSync(new URL("../src/lib/three-notes/score.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } }).outputText;
const { chapters, chapterAt, chooseQuality, darknessAt, formulaLayers, memoryOpacity, pinnedProgress, projectProgress, sceneProgress, sceneWeights, statProgress } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("chapter seeking works in both directions, including jumps and exact boundaries", () => {
	const starts = [0, 100, 240, 400, 600, 800, 1200, 1600, 2000];
	for (const index of [0, 1, 8, 4, 2, 7, 0]) assert.equal(chapters[chapterAt(starts[index], starts)], chapters[index]);
	assert.equal(chapterAt(239.99, starts), 1);
	assert.equal(chapterAt(10000, starts), 8);
});
test("the opening signature stays at its DOM anchor until the first scroll", () => {
	assert.equal(sceneProgress(0, 0, 1000, 1000), 0);
	assert.equal(sceneProgress(500, 0, 1000, 1000), 1);
	assert.equal(sceneProgress(500, 1000, 2000, 1000), 0);
	assert.equal(pinnedProgress(1000, 1000, 2500, 1000), 0);
	assert.equal(pinnedProgress(2500, 1000, 2500, 1000), 1);
});
test("each drop fills one layer, holds between drops, and fully reverses", () => {
	assert.deepEqual(formulaLayers(0), [0, 0, 0]);
	assert.deepEqual(formulaLayers(.3), [1, 0, 0]);
	assert.deepEqual(formulaLayers(.5), [1, 1, 0]);
	assert.deepEqual(formulaLayers(.7), [1, 1, 1]);
	const forward = [0, .2, .4, .64, 1].map(formulaLayers);
	assert.deepEqual([1, .64, .4, .2, 0].map(formulaLayers), forward.toReversed());
	let previous = 0;
	for (let p = 0; p <= 1; p += .005) { const sum = formulaLayers(p).reduce((a,b) => a+b,0); assert.ok(sum >= previous); previous = sum; }
});
test("memory statements have separate reading holds and never overlap", () => {
	for (const [index, hold] of [0.18, .5, .84].entries()) assert.equal(memoryOpacity(index, hold), 1);
	for (let p = 0; p <= 1; p += .001) assert.ok([0,1,2].filter(i => memoryOpacity(i,p) > .01).length <= 1);
	assert.equal(memoryOpacity(2, 1), 1);
});
test("all four impact circles finish, with transfer time before each new trace", () => {
	for (let index=0; index<4; index++) {
		assert.equal(statProgress(index / 4, index), 0);
		assert.equal(statProgress((index + .1) / 4, index), 0);
		assert.equal(statProgress((index + 1) / 4, index), 1);
	}
});
test("the pink/dark transition is continuous and returns to pink at Contact", () => {
	assert.equal(darknessAt(0, 6000, 10000, 1000), 0);
	assert.equal(darknessAt(6000, 6000, 10000, 1000), 1);
	assert.equal(darknessAt(10000, 6000, 10000, 1000), 0);
	let previous = 0;
	for (let y = 5000; y <= 6000; y++) { const d=darknessAt(y,6000,10000,1000); assert.ok(Math.abs(d-previous) < .003); previous=d; }
});
test("first/last projects have usable holds in both categories", () => {
	for (const count of [9, 6, 1]) {
		assert.deepEqual(projectProgress(0, count), { travel: 0, index: 0 });
		assert.deepEqual(projectProgress(.04, count), { travel: 0, index: 0 });
		assert.deepEqual(projectProgress(1, count), { travel: 1, index: count-1 });
	}
});
test("the particle handoff continues from Projects through Memory and closes after Skills", () => {
	assert.equal(sceneWeights("work", 1).particles, sceneWeights("memory", 0).particles);
	assert.equal(sceneWeights("memory", 1).particles, sceneWeights("skills", 0).particles);
	assert.equal(sceneWeights("skills", 1).particles, 0);
	for (const id of chapters) for (const p of [0, .5, 1]) for (const value of Object.values(sceneWeights(id,p))) assert.ok(value >= 0 && value <= 1);
});
test("reduced motion, compact screens, memory, cores, and save-data select the correct budget", () => {
	assert.equal(chooseQuality(true, false, 12, 16), "still");
	assert.equal(chooseQuality(false, true, 12, 16), "light");
	assert.equal(chooseQuality(false, false, 4, 16), "light");
	assert.equal(chooseQuality(false, false, 12, 4), "light");
	assert.equal(chooseQuality(false, false, 12, 16, true), "light");
	assert.equal(chooseQuality(false, false, 12, 16), "full");
});
