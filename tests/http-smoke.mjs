// HTTP and server HTML only. This does not create a browser or execute client effects.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 3108;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
	stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
let timer;
try {
	await new Promise((resolve, reject) => {
		timer = setTimeout(() => reject(new Error("Production server readiness timed out")), 20000);
		server.once("error", reject);
		server.once("exit", code => reject(new Error(`Server exited: ${code}`)));
		server.stdout.on("data", chunk => { if (chunk.toString().includes("Ready")) resolve(); });
		server.stderr.on("data", chunk => process.stderr.write(chunk));
	});
	clearTimeout(timer);
	const response = await fetch(origin);
	assert.equal(response.status, 200);
	const html = await response.text();
	assert.deepEqual([...html.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]), ["home", "philosophy", "formula", "about", "impact", "work", "memory", "skills", "contact"]);
	assert.equal((html.match(/id="about"/g) || []).length, 1);
	for (const text of ["Digital Perfumer", "Composing Digital Notes for Exceptional Brands", "Sustayn Official Website", "TOP / HEART / BASE", "Back to Top", "digitalperfumer@gmail.com"]) assert.ok(html.includes(text), text);
	for (const anchor of ["home-0", "home-1", "home-2", "bottle-desktop", "bottle-mobile", "core", "skill-panel", "contact-0", "contact-1", "contact-2"]) assert.ok(html.includes(`data-note-anchor="${anchor}"`), anchor);
	assert.equal((html.match(/data-project-card=/g) || []).length, 9);
	for (const path of ["/robots.txt", "/sitemap.xml", "/cv/Bashar-Aljabi_CV.pdf", "/projects/sustayn.webp"]) {
		const result = await fetch(origin + path);
		assert.equal(result.status, 200, path);
		console.log(`${path}: ${result.status} ${result.headers.get("content-type")}`);
	}
	const cssPaths = [...html.matchAll(/href="([^"]+\.css(?:\?[^"]*)?)"/g)].map(m => m[1]);
	assert.ok(cssPaths.length > 0);
	const css = (await Promise.all(cssPaths.map(async path => (await fetch(origin + path)).text()))).join("\n");
	for (const selector of [".notes-stage", ".notes-world", ".formula-liquid", ".note-frame", "prefers-reduced-motion"]) assert.ok(css.includes(selector), selector);
	console.log("HTTP smoke passed: section order, unique IDs, signature anchors, original copy, professional project cards, cinematic/reduced-motion CSS, SEO and original assets.");
} finally {
	clearTimeout(timer);
	server.kill();
}
