import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const baseline = "dd1b4f9";
const original = (file) =>
  execFileSync("git", ["show", baseline + ":" + file], { encoding: "utf8" });
const parse = (name, text) =>
  ts.createSourceFile(
    name,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
function array(source, name) {
  let expression;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name)
      expression = node.initializer.getText(source);
    ts.forEachChild(node, visit);
  };
  visit(source);
  assert.ok(expression, "Missing original content array: " + name);
  return JSON.parse(
    JSON.stringify(vm.runInNewContext(ts.transpile(expression))),
  );
}
const specs = [
  ["PhilosophySection", "notes"],
  ["FormulaSection", "formulaNotes"],
  ["StatsSection", "stats"],
  ["ProjectsSection", "allProjects"],
  ["TechStackSection", "skillGroups"],
];
const current = parse(
  "portfolio-content.ts",
  fs.readFileSync("src/lib/portfolio-content.ts", "utf8"),
);
for (const [component, name] of specs) {
  assert.deepEqual(
    array(current, name),
    array(
      parse(
        component,
        original("src/components/sections/" + component + ".tsx"),
      ),
      name,
    ),
    name + " changed from the original portfolio",
  );
}
const normalize = (value) =>
  value
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
function textNodes(source, includeLiterals = false) {
  const chunks = [];
  const visit = (node) => {
    if (ts.isJsxText(node) || (includeLiterals && ts.isStringLiteral(node)))
      chunks.push(
        normalize(ts.isJsxText(node) ? node.getText(source) : node.text),
      );
    ts.forEachChild(node, visit);
  };
  visit(source);
  return chunks.filter(Boolean);
}
const components = [
  "HeroSection",
  "PhilosophySection",
  "FormulaSection",
  "AboutSection",
  "StatsSection",
  "ProjectsSection",
  "ScentMemorySection",
  "TechStackSection",
  "ContactSection",
].map((n) => "src/components/sections/" + n + ".tsx");
components.push(
  "src/components/layout/Navbar.tsx",
  "src/components/layout/Footer.tsx",
);
const currentText = normalize(
  components
    .flatMap((file) =>
      textNodes(parse(file, fs.readFileSync(file, "utf8")), true),
    )
    .join(" "),
);
const missing = [];
for (const file of components) {
  for (const chunk of textNodes(parse(file, original(file)))) {
    const phrase = chunk
      .replace(/^[\s()[\]—→↗↓↑]+|[\s()[\]—→↗↓↑]+$/g, "")
      .trim();
    if (/[A-Za-z]/.test(phrase) && !currentText.includes(phrase))
      missing.push({ file, phrase });
  }
}
assert.deepEqual(missing, [], "Original visible copy was lost or rewritten");
const originalAssets = execFileSync(
  "git",
  ["ls-tree", "-r", baseline, "--", "public/projects", "public/cv"],
  { encoding: "utf8" },
)
  .trim()
  .split("\n");
for (const entry of originalAssets) {
  const [, hash, file] = entry.match(/^\d+ blob (\w+)\t(.+)$/);
  assert.ok(fs.existsSync(file), "Missing original asset: " + file);
  assert.equal(
    execFileSync("git", ["hash-object", file], { encoding: "utf8" }).trim(),
    hash,
    "Original asset modified: " + file,
  );
}
const chapterSource = fs.readFileSync("src/lib/atelier-state.ts", "utf8");
const ids = [...chapterSource.matchAll(/id: "([^"]+)", name:/g)].map(
  (match) => match[1],
);
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
for (const project of array(current, "allProjects"))
  if (project.customImage)
    assert.ok(fs.existsSync(path.join("public", project.customImage)));
console.log(
  "PASS: original copy, 15 projects, 34 skills, note data, statistics, section order, 11 images and CV match main at " +
    baseline,
);
