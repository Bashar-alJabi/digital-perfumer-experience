import ts from "typescript";

export const sources = {
	"src/components/sections/HeroSection.tsx": [],
	"src/components/sections/PhilosophySection.tsx": ["notes", "signatureDots"],
	"src/components/sections/FormulaSection.tsx": ["formulaNotes"],
	"src/components/sections/AboutSection.tsx": [],
	"src/components/sections/StatsSection.tsx": ["stats"],
	"src/components/sections/ProjectsSection.tsx": ["allProjects"],
	"src/components/sections/ScentMemorySection.tsx": [],
	"src/components/sections/TechStackSection.tsx": ["skillGroups"],
	"src/components/sections/ContactSection.tsx": ["serviceOptions", "contactEmail"],
	"src/components/layout/Navbar.tsx": ["navLinks"],
	"src/components/layout/Footer.tsx": [],
	"src/components/layout/LoadingScreen.tsx": [],
	"src/components/layout/ScrollPerfumeBottle.tsx": ["sections"],
};
function literal(node) {
	if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
	if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(p => [p.name.getText().replaceAll('"',''), literal(p.initializer)]));
	throw Error("Unsupported content expression: " + node.getText());
}
export function captureSource(source, path) {
	const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
	const copy = new Set(), links = new Set(), data = {};
	function visit(node) {
		if (ts.isStringLiteral(node) && /^(https?:|mailto:|\/projects\/|\/cv\/)/.test(node.text)) links.add(node.text);
		if (ts.isJsxText(node)) { const text=node.text.replace(/\s+/g," ").trim(); if(text) copy.add(text); }
		if (ts.isJsxAttribute(node) && ["href","src"].includes(node.name.getText()) && node.initializer && ts.isStringLiteral(node.initializer)) links.add(node.initializer.text);
		if (ts.isVariableDeclaration(node) && sources[path].includes(node.name.getText())) data[node.name.getText()] = literal(node.initializer);
		ts.forEachChild(node, visit);
	}
	visit(file);
	return { copy: [...copy].sort(), links: [...links].sort(), data };
}
