import * as THREE from "three";
import { clamp, mix, noteColors, type Quality } from "@/lib/three-notes/score";
import type { NotesRenderer, SceneFrame } from "./types";

const particleVertex = `
attribute float seed;
uniform float uJourney;
uniform float uProgress;
uniform float uNetwork;
uniform float uRelease;
uniform float uFold;
uniform float uCount;
uniform vec2 uNotes[3];
uniform float uPixelRatio;
uniform vec2 uViewport;
uniform vec4 uGrid;
uniform vec2 uPointer;
varying float vSeed;
varying float vAlpha;
void main() {
  vSeed = seed;
  float a = seed * 6.283185 + uJourney * 1.6;
  // The last frame's three strokes open into a deep, continuous ribbon.
  vec3 ribbon = vec3(
    .45 + sin(a + position.y * 2.) * (.18 + seed * .22),
    position.y * .92 + cos(a * .7) * .12,
    position.z * 2.8 + sin(a) * .5
  );
  float column = mod(floor(seed * uCount + .01), 16.) / 15.;
  float row = floor(floor(seed * uCount + .01) / 16.) / (ceil(uCount / 16.) - 1.);
  vec2 grid = uGrid.xy + vec2(column, row) * uGrid.zw;
  float noteIndex = mod(floor(seed * uCount + .01), 3.);
  vec2 anchor = noteIndex < .5 ? uNotes[0] : noteIndex < 1.5 ? uNotes[1] : uNotes[2];
  vec3 origin = vec3(anchor, 0.);
  vec3 p = mix(origin, ribbon, uRelease);
  p = mix(p, vec3(grid, .08 * sin(column * 9. + uJourney)), uNetwork);
  p = mix(p, origin, uFold);
  float distanceToPointer = length(p.xy - uPointer);
  p.xy += (p.xy - uPointer) * .016 / max(.12, distanceToPointer) * uNetwork;
  // Perspective is real; the text remains in its readable DOM plane.
  vec4 world = vec4(p.x * uViewport.x, p.y * uViewport.y, p.z, 1.);
  vec4 mv = modelViewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = min(8., (1.2 + fract(seed * 17.) * 2.8) * uPixelRatio * 7. / -mv.z);
  vAlpha = .18 + fract(seed * 13.) * .52;
}`;
const particleFragment = `
uniform float uOpacity;
varying float vSeed;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - .5;
  float d = length(p * vec2(1., .55));
  if (d > .5) discard;
  vec3 coral = vec3(.953, .388, .443);
  vec3 rose = vec3(1., .847, .874);
  vec3 color = mix(coral, rose, step(.45, fract(vSeed * 3.)));
  gl_FragColor = vec4(color, pow(1. - d * 2., 2.) * uOpacity * vAlpha);
}`;

/** One demand-rendered context. Geometry, uniforms and vectors are allocated once. */
export function createNotesRenderer(host: HTMLElement, quality: Quality, onLost: () => void): NotesRenderer {
	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: quality === "full", powerPreference: "low-power" });
	renderer.setPixelRatio(Math.min(devicePixelRatio, quality === "full" ? 1.6 : 1.15));
	renderer.setClearColor(0, 0);
	renderer.outputColorSpace = THREE.SRGBColorSpace;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.15;
	host.appendChild(renderer.domElement);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
	camera.position.z = 8;
	const ambient = new THREE.HemisphereLight(0xfff7fa, 0x6b263a, 2.5);
	const key = new THREE.DirectionalLight(0xfff7fa, 5);
	key.position.set(-3, 5, 6);
	const rim = new THREE.DirectionalLight(0xf36371, 4);
	rim.position.set(4, -2, 3);
	scene.add(ambient, key, rim);

	// A tiny procedural studio reflection: no HDR download, model, or external asset.
	const pixels = new Uint8Array(128 * 64 * 4);
	for (let y = 0; y < 64; y++) for (let x = 0; x < 128; x++) {
		const offset = (y * 128 + x) * 4;
		const strip = Math.exp(-Math.pow((x - 24) / 5, 2)) + Math.exp(-Math.pow((x - 91) / 10, 2)) * 0.8;
		const value = Math.min(255, 20 + strip * 235);
		pixels[offset] = value; pixels[offset + 1] = value * 0.88; pixels[offset + 2] = value * 0.92; pixels[offset + 3] = 255;
	}
	const texture = new THREE.DataTexture(pixels, 128, 64, THREE.RGBAFormat);
	texture.mapping = THREE.EquirectangularReflectionMapping;
	texture.needsUpdate = true;
	const pmrem = new THREE.PMREMGenerator(renderer);
	const environment = pmrem.fromEquirectangular(texture);
	scene.environment = environment.texture;
	texture.dispose(); pmrem.dispose();

	const geometry = new THREE.SphereGeometry(1, quality === "full" ? 40 : 24, quality === "full" ? 28 : 16);
	const sphere = geometry.getAttribute("position");
	const drop = new Float32Array(sphere.count * 3);
	for (let i = 0; i < sphere.count; i++) {
		const y = sphere.getY(i);
		const taper = 0.78 - y * 0.25;
		drop[i * 3] = sphere.getX(i) * taper;
		drop[i * 3 + 1] = y * 1.32;
		drop[i * 3 + 2] = sphere.getZ(i) * taper;
	}
	geometry.morphAttributes.position = [new THREE.Float32BufferAttribute(drop, 3)];
	const materials = noteColors.map(color => new THREE.MeshPhysicalMaterial({
		color, roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.06,
		transmission: quality === "full" ? 0.62 : 0,
		thickness: 0.7, ior: 1.45, transparent: true,
		envMapIntensity: 1.6, depthWrite: false,
	}));
	const notes = materials.map(material => {
		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh); return mesh;
	});
	const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffd8df, transparent: true, opacity: 0, depthWrite: false });
	const core = new THREE.Mesh(geometry, coreMaterial);
	scene.add(core);
	const ringGeometry = new THREE.TorusGeometry(1, 0.006, 6, 80);
	const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf36371, transparent: true, opacity: 0, depthWrite: false });
	const rings = [0, 1, 2].map(() => { const mesh = new THREE.Mesh(ringGeometry, ringMaterial); scene.add(mesh); return mesh; });

	const count = quality === "full" ? 480 : 144;
	const positions = new Float32Array(count * 3), seeds = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		const random = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
		positions[i * 3] = random(i) * 2 - 1;
		positions[i * 3 + 1] = random(i + 1200) * 2 - 1;
		positions[i * 3 + 2] = random(i + 2400) * 2 - 1;
		seeds[i] = i / count;
	}
	const particleGeometry = new THREE.BufferGeometry();
	particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	particleGeometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 1));
	const uniforms = {
		uJourney: { value: 0 }, uProgress: { value: 0 }, uNetwork: { value: 0 },
		uRelease: { value: 0 }, uFold: { value: 0 }, uCount: { value: count }, uNotes: { value: [new THREE.Vector2(), new THREE.Vector2(), new THREE.Vector2()] },
		uOpacity: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() },
		uViewport: { value: new THREE.Vector2(1, 1) }, uGrid: { value: new THREE.Vector4() }, uPointer: { value: new THREE.Vector2(3, 3) },
	};
	const particleMaterial = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
	const particles = new THREE.Points(particleGeometry, particleMaterial);
	particles.frustumCulled = false;
	scene.add(particles);
	const connections: number[] = [];
	for (let i = 0; i < count; i++) {
		if (i % 16 < 15 && i + 1 < count) connections.push(i, i + 1);
		if (i + 16 < count) connections.push(i, i + 16);
	}
	const networkGeometry = particleGeometry.clone();
	networkGeometry.setIndex(connections);
	const networkMaterial = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: `
uniform float uOpacity;
uniform float uNetwork;
varying float vSeed;
void main() { gl_FragColor = vec4(mix(vec3(.953,.388,.443), vec3(1.,.847,.874), vSeed), uOpacity * uNetwork * .11); }
`, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
	const network = new THREE.LineSegments(networkGeometry, networkMaterial);
	network.frustumCulled = false;
	scene.add(network);
	const vector = new THREE.Vector3(), direction = new THREE.Vector3(), edge = new THREE.Vector3();
	const darkColor = new THREE.Color("#e8a9b8"), baseColor = new THREE.Color(noteColors[2]);
	let width = 0, height = 0, lost = false;
	function screenPoint(x: number, y: number, frame: SceneFrame, target: THREE.Vector3) {
		target.set(x / frame.width * 2 - 1, 1 - y / frame.height * 2, 0.5).unproject(camera);
		direction.copy(target).sub(camera.position).normalize();
		target.copy(camera.position).addScaledVector(direction, -camera.position.z / direction.z);
		return target;
	}
	const fail = () => { lost = true; renderer.domElement.hidden = true; onLost(); };
	renderer.debug.onShaderError = fail;
	const onContextLost = (event: Event) => { event.preventDefault(); fail(); };
	renderer.domElement.addEventListener("webglcontextlost", onContextLost);
	return {
		render(frame) {
			if (lost) return;
			if (width !== frame.width || height !== frame.height) {
				width = frame.width; height = frame.height;
				renderer.setSize(width, height); camera.aspect = width / height;
			}
			// A single camera score; its quiet holds never animate away from a reader.
			const amplitude = quality === "full" ? 1 : 0.25;
			camera.position.set(Math.sin(frame.journey * 0.7) * 0.35 * amplitude, Math.sin(frame.journey * 0.4) * 0.18 * amplitude, 8 + Math.sin(frame.journey * 0.55) * 0.55 * amplitude);
			camera.position.x += frame.pointer.x * frame.core * .05 * amplitude;
			camera.fov = 40 - frame.core * 2;
			camera.lookAt(0, 0, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
			frame.notes.forEach((pose, i) => {
				const mesh = notes[i];
				mesh.visible = pose.opacity > 0.001 && pose.y > -120 && pose.y < height + 120;
				if (!mesh.visible) return;
				screenPoint(pose.x, pose.y, frame, vector);
				screenPoint(pose.x + pose.radius, pose.y, frame, edge);
				mesh.position.copy(vector);
				mesh.scale.setScalar(vector.distanceTo(edge));
				mesh.rotation.z = Math.sin(frame.journey + i) * frame.drop * 0.22;
				mesh.morphTargetInfluences![0] = frame.drop;
				materials[i].opacity = clamp(pose.opacity);
				if (i === 2) materials[i].color.copy(baseColor).lerp(darkColor, frame.darkness);
			});
			core.visible = frame.core > 0;
			if (core.visible) {
				core.position.copy(notes[0].position); core.scale.copy(notes[0].scale).multiplyScalar(0.45);
				coreMaterial.opacity = frame.core * 0.85;
			}
			ringMaterial.opacity = frame.core * 0.3;
			rings.forEach((ring, i) => {
				ring.visible = frame.core > 0;
				if (!ring.visible) return;
				ring.position.copy(core.position); ring.scale.copy(notes[0].scale).multiplyScalar(1.5 + i * 0.3);
				ring.rotation.set(0.3 + i * 0.55, frame.journey * 0.22 + i * 0.6, i * 0.7);
			});
			particles.visible = frame.particles > 0;
			network.visible = particles.visible && frame.network > 0;
			if (particles.visible) {
				uniforms.uJourney.value = frame.journey;
				uniforms.uProgress.value = frame.progress;
				uniforms.uNetwork.value = frame.network;
				uniforms.uRelease.value = frame.release;
				uniforms.uFold.value = frame.fold;
				frame.notes.forEach((pose, i) => uniforms.uNotes.value[i].set(pose.x / width * 2 - 1, 1 - pose.y / height * 2));
				uniforms.uOpacity.value = frame.particles;
				const viewHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
				uniforms.uViewport.value.set(viewHeight * camera.aspect, viewHeight);
				uniforms.uGrid.value.set(frame.grid.x / width * 2 - 1, 1 - frame.grid.y / height * 2, frame.grid.width / width * 2, -frame.grid.height / height * 2);
				uniforms.uPointer.value.set(frame.pointer.x, -frame.pointer.y);
			}
			key.intensity = mix(5, 2.5, frame.darkness);
			rim.intensity = mix(3, 5, frame.darkness);
			renderer.render(scene, camera);
		},
		dispose() {
			renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
			geometry.dispose(); materials.forEach(material => material.dispose()); coreMaterial.dispose(); networkGeometry.dispose(); networkMaterial.dispose();
			ringGeometry.dispose(); ringMaterial.dispose(); particleGeometry.dispose(); particleMaterial.dispose(); environment.dispose();
			scene.clear(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
		},
	};
}
