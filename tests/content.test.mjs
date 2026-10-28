import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import { captureSource } from "./content-contract.mjs";

const baseline = JSON.parse(fs.readFileSync(new URL("./fixtures/main-content.json", import.meta.url), "utf8"));
for (const [path, expected] of Object.entries(baseline.sources)) {
	test(`original copy, links, and content survive: ${path}`, () => {
		const current = captureSource(fs.readFileSync(path,"utf8"),path);
		assert.deepEqual(current.data, expected.data);
		for (const text of expected.copy) assert.ok(current.copy.includes(text), `Missing original copy: ${text}`);
		for (const link of expected.links) assert.ok(current.links.includes(link), `Missing original link: ${link}`);
	});
}
test("all original images, CV, typography, and metadata are unchanged", () => {
	for (const [path, hash] of Object.entries(baseline.assets)) {
		const bytes = fs.readFileSync(path);
		const input = /\.(tsx|svg)$/.test(path) ? bytes.toString("utf8").replace(/\r\n/g,"\n") : bytes;
		assert.equal(createHash("sha256").update(input).digest("hex"),hash,path);
	}
});
test("the original section order is intact and the About anchor is unique", () => {
	const page=fs.readFileSync("src/app/page.tsx","utf8");
	assert.deepEqual([...page.matchAll(/<section id="([^"]+)"/g)].map(m=>m[1]), ["home","philosophy","formula","about","impact","work","memory","skills","contact"]);
	assert.ok(!fs.readFileSync("src/components/sections/AboutSection.tsx","utf8").includes('id="about"'));
});
