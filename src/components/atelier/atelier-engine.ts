"use client";

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { allProjects } from "@/lib/portfolio-content";
import { chapters, getAtelier, setAtelier } from "@/lib/atelier-state";

const GAP = 22;
const UNITS = 100;
const clamp = THREE.MathUtils.clamp;
const mix = THREE.MathUtils.lerp;
const ease = (v: number) => {
  const t = clamp(v, 0, 1);
  return t * t * (3 - 2 * t);
};

/** A closed, bevelled ribbon, authored as a continuous organic surface.
 * The three sweeps are the original top / heart / base signature in space.
 */
function ribbonGeometry(phase = 0) {
  const positions: number[] = [],
    indices: number[] = [];
  const segments = 192,
    sides = 12;
  const center = (t: number) =>
    new THREE.Vector3(
      1.05 * Math.cos(t) + 0.24 * Math.cos(t * 2 + phase),
      1.52 * Math.sin(t),
      0.48 * Math.sin(t * 2 + phase),
    );
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const p = center(t);
    const tangent = center(t + 0.002)
      .sub(center(t - 0.002))
      .normalize();
    const normal = new THREE.Vector3(-tangent.y, tangent.x, 0).normalize();
    const binormal = new THREE.Vector3()
      .crossVectors(tangent, normal)
      .normalize();
    const twist = t * 0.5 + phase;
    const width = 0.32 + 0.13 * Math.sin(t * 3 + phase);
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const u = Math.cos(a) * width;
      const v = Math.sin(a) * 0.075;
      const n = u * Math.cos(twist) - v * Math.sin(twist);
      const b = u * Math.sin(twist) + v * Math.cos(twist);
      positions.push(
        p.x + normal.x * n + binormal.x * b,
        p.y + normal.y * n + binormal.y * b,
        p.z + normal.z * n + binormal.z * b,
      );
      if (i < segments && j < sides) {
        const k = i * (sides + 1) + j;
        indices.push(
          k,
          k + sides + 1,
          k + 1,
          k + 1,
          k + sides + 1,
          k + sides + 2,
        );
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function cameraMatrix(matrix: THREE.Matrix4) {
  const e = matrix.elements;
  return (
    "matrix3d(" +
    e
      .map((v, i) =>
        Math.abs(v) < 1e-10 ? 0 : [1, 5, 9, 13].includes(i) ? -v : v,
      )
      .join(",") +
    ")"
  );
}
function objectMatrix(matrix: THREE.Matrix4) {
  const e = matrix.elements;
  return (
    "translate(-50%,-50%) matrix3d(" +
    e
      .map((v, i) =>
        Math.abs(v) < 1e-10 ? 0 : [4, 5, 6, 7].includes(i) ? -v : v,
      )
      .join(",") +
    ")"
  );
}

export function createAtelier(root: HTMLElement, canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor("#ffeff5");
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffeff5");
  scene.fog = new THREE.Fog("#ffeff5", 11, 30);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80);
  const cssCamera = new THREE.PerspectiveCamera();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 1.25;
  room.dispose();
  pmrem.dispose();

  const coral = new THREE.MeshPhysicalMaterial({
    color: "#f36371",
    metalness: 0.22,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    transmission: 0.32,
    thickness: 0.65,
    ior: 1.45,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#ffe9ee",
    metalness: 0.08,
    roughness: 0.09,
    clearcoat: 1,
    transmission: 0.82,
    thickness: 0.9,
    ior: 1.46,
  });
  const ink = new THREE.MeshPhysicalMaterial({
    color: "#191318",
    metalness: 0.62,
    roughness: 0.18,
    clearcoat: 1,
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color: "#fff7fa",
    metalness: 0.27,
    roughness: 0.24,
    clearcoat: 0.8,
  });
  const materials = [coral, glass, ink];

  const ambient = new THREE.AmbientLight("#ffeef5", 1.8);
  const key = new THREE.DirectionalLight("#ffffff", 4.2);
  key.position.set(-4, 6, 7);
  const rim = new THREE.DirectionalLight("#f36371", 2.4);
  rim.position.set(5, 2, -3);
  const fill = new THREE.DirectionalLight("#ffffff", 2.1);
  fill.position.set(-5, -1, 4);
  scene.add(ambient, key, rim, fill);

  const worlds = chapters.map((_, i) => {
    const group = new THREE.Group();
    group.position.z = -i * GAP;
    scene.add(group);
    return group;
  });
  function sculpture(parent: THREE.Group, scale = 1) {
    const group = new THREE.Group();
    const pieces = materials.map((material, i) => {
      const mesh = new THREE.Mesh(ribbonGeometry(i * 0.75), material);
      mesh.rotation.set(i * 0.58, i * 0.85, i * 1.02 - 0.38);
      group.add(mesh);
      return mesh;
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.35, 40, 28), coral);
    core.scale.set(1, 1.2, 1);
    group.add(core);
    group.scale.setScalar(scale);
    parent.add(group);
    return { group, pieces, core };
  }
  const hero = sculpture(worlds[0], 1.12);
  hero.group.position.set(2.0, 0.1, 0);
  const philosophy = sculpture(worlds[1], 0.78);
  philosophy.group.position.set(0, -0.15, -1.6);

  // Exploded formula: three sculpted notes enter the glass vessel together.
  const formula = new THREE.Group();
  worlds[2].add(formula);
  const bottleGeometry = new RoundedBoxGeometry(1.65, 2.45, 0.72, 5, 0.2);
  const bottle = new THREE.Mesh(bottleGeometry, glass);
  bottle.position.y = -0.05;
  formula.add(bottle);
  const liquid = new THREE.Mesh(
    new RoundedBoxGeometry(1.45, 1.65, 0.51, 4, 0.16),
    new THREE.MeshPhysicalMaterial({
      color: "#f36371",
      transmission: 0.5,
      thickness: 0.8,
      roughness: 0.13,
      metalness: 0.08,
    }),
  );
  liquid.position.set(0, -0.35, 0);
  formula.add(liquid);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.29, 0.29, 0.24, 48),
    pearl,
  );
  neck.position.y = 1.31;
  formula.add(neck);
  const cap = new THREE.Mesh(
    new RoundedBoxGeometry(0.77, 0.5, 0.64, 4, 0.08),
    ink,
  );
  cap.position.y = 1.63;
  formula.add(cap);
  const formulaPieces = materials.map((m, i) => {
    const mesh = new THREE.Mesh(ribbonGeometry(i), m);
    mesh.scale.setScalar(0.37);
    formula.add(mesh);
    return mesh;
  });

  const editorial = sculpture(worlds[3], 1.3);
  editorial.group.position.set(0, -1.0, -3.7);
  const statsSculptures = [0, 1, 2, 3].map((_, i) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.37 + i * 0.06, 40, 24),
      materials[i % 3],
    );
    worlds[4].add(mesh);
    return mesh;
  });

  // Gallery architecture belongs only to WORK. Images are loaded on demand.
  const gallery = new THREE.Group();
  worlds[5].add(gallery);
  const galleryPlates = [-1, 0, 1].map((offset) => {
    const group = new THREE.Group();
    const frame = new THREE.Mesh(
      new RoundedBoxGeometry(3.92, 2.64, 0.12, 3, 0.075),
      offset === 0 ? ink : pearl,
    );
    const mat = new THREE.MeshBasicMaterial({ color: "#ffd8df" });
    const image = new THREE.Mesh(new THREE.PlaneGeometry(3.78, 2.48), mat);
    image.position.z = 0.068;
    group.add(frame, image);
    gallery.add(group);
    return { group, image, mat };
  });
  const loader = new THREE.TextureLoader();
  const textures = new Map<string, THREE.Texture>();
  const titleTextures = new Map<string, THREE.CanvasTexture>();
  const requested = new Set<string>();
  let galleryKey = "";
  let disposed = false;
  let contextAvailable = true;
  function titleTexture(project: (typeof allProjects)[number]) {
    if (titleTextures.has(project.id)) return titleTextures.get(project.id)!;
    const label = document.createElement("canvas");
    label.width = 1200;
    label.height = 790;
    const ctx = label.getContext("2d")!;
    ctx.fillStyle = "#f9dce5";
    ctx.fillRect(0, 0, 1200, 790);
    ctx.strokeStyle = "#bc8d9e";
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, 1090, 680);
    ctx.fillStyle = "#9a435e";
    ctx.font = "16px sans-serif";
    ctx.fillText(project.category.toUpperCase(), 95, 130);
    ctx.fillStyle = "#392331";
    ctx.font = "66px Georgia";
    const words = project.title.split(" ");
    let line = "",
      row = 310;
    words.forEach((word) => {
      if (ctx.measureText(line + word).width > 970) {
        ctx.fillText(line, 95, row);
        row += 84;
        line = "";
      }
      line += word + " ";
    });
    ctx.fillText(line, 95, row);
    ctx.font = "18px sans-serif";
    ctx.fillText("/" + project.id, 95, 660);
    const texture = new THREE.CanvasTexture(label);
    texture.colorSpace = THREE.SRGBColorSpace;
    titleTextures.set(project.id, texture);
    return texture;
  }
  function loadTexture(path: string) {
    if (requested.has(path)) return;
    requested.add(path);
    loader.load(
      path,
      (texture) => {
        if (disposed) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(
          renderer.capabilities.getMaxAnisotropy(),
          4,
        );
        // The original previews use a top-aligned crop.
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        const aspect = texture.image.width / texture.image.height,
          target = 3.78 / 2.48;
        if (aspect < target) {
          texture.repeat.y = aspect / target;
          texture.offset.y = 1 - texture.repeat.y;
        } else {
          texture.repeat.x = target / aspect;
          texture.offset.x = (1 - texture.repeat.x) / 2;
        }
        textures.set(path, texture);
        galleryKey = "";
      },
      undefined,
      () => {
        requested.delete(path);
      },
    );
  }

  // A memory is the same signature released into a field of luminous particles.
  const memory = sculpture(worlds[6], 0.8);
  memory.group.position.set(2.1, 0, -1);
  const particleCount = 1500;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleTargets = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const a = i * 2.399963,
      radius = Math.sqrt(i / particleCount) * 2.2;
    particleTargets[i * 3] = Math.cos(a) * radius;
    particleTargets[i * 3 + 1] = Math.sin(a) * radius * 0.65;
    particleTargets[i * 3 + 2] = Math.sin(i * 0.13) * 1.3;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );
  const particleMaterial = new THREE.PointsMaterial({
    color: "#f36371",
    size: 0.023,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  worlds[6].add(particles);

  // Five machined glass shelves echo the five existing skill groups.
  const cabinet = new THREE.Group();
  cabinet.position.set(0, -0.2, -2.6);
  worlds[7].add(cabinet);
  const shelves = Array.from({ length: 5 }, (_, i) => {
    const shelf = new THREE.Mesh(
      new RoundedBoxGeometry(3.0, 0.13, 1.0, 3, 0.05),
      i % 2 ? glass : coral,
    );
    shelf.position.y = 1.6 - i * 0.8;
    shelf.rotation.y = -0.22;
    cabinet.add(shelf);
    return shelf;
  });
  const finale = sculpture(worlds[8], 1.25);
  finale.group.position.set(-2.3, -0.3, -4.2);

  // A continuous atelier floor makes every station part of the same place.
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 260),
    new THREE.MeshStandardMaterial({
      color: "#f8e2e9",
      roughness: 0.28,
      metalness: 0.15,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.55, -80);
  scene.add(floor);
  const mistGeometry = new THREE.PlaneGeometry(22, 16);
  const mistMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform float uTime; uniform float uProgress;
      void main(){vec2 p=vUv-.5; float wave=sin(p.x*15.+p.y*8.+uTime*.14)*.015;
      float glow=exp(-length((p-vec2(.22,wave))*vec2(2.2,1.5))*7.);
      float edge=smoothstep(.5,.0,length(p));
      gl_FragColor=vec4(.953,.388,.443,glow*.17*edge);}`,
  });
  const mist = new THREE.Mesh(mistGeometry, mistMaterial);
  scene.add(mist);

  const sections = Array.from(
    root.querySelectorAll<HTMLElement>("[data-chapter]"),
  );
  const views = sections.map(
    (s) => s.querySelector<HTMLElement>(".scene-viewport")!,
  );
  const spaces = sections.map(
    (s) => s.querySelector<HTMLElement>(".camera-space")!,
  );
  const contents = sections.map(
    (s) => s.querySelector<HTMLElement>(".scene-content")!,
  );
  const domObject = new THREE.Object3D();
  const target = new THREE.Vector3();
  const cameraPos = new THREE.Vector3();
  let offsets: number[] = [],
    heights: number[] = [];
  let width = 0,
    height = 0,
    enhanced = false;
  let frame = 0,
    lastTime = 0,
    lastRender = 0,
    renderedFrames = 0,
    accumulatedTime = 0,
    qualityAdjusted = false;
  const startedAt = performance.now();
  const pink = new THREE.Color("#ffeff5"),
    rose = new THREE.Color("#f8dce5");
  const progressBar = root.querySelector<HTMLElement>(".scroll-perfume");
  let maxScroll = 1;
  let measured = false;
  let pointerX = 0,
    pointerY = 0,
    pointerTargetX = 0,
    pointerTargetY = 0;
  let dirty = true,
    lastY = -1,
    lastSelection = "";
  function measure() {
    if (!contextAvailable) return;
    const wasEnhanced = enhanced;
    const resume = getAtelier().chapter;
    width = window.innerWidth;
    height = window.innerHeight;
    enhanced = width >= 900 && height >= 640 && !getAtelier().reduced;
    setAtelier({ enhanced });
    root.dataset.enhanced = String(enhanced);
    root.dataset.webgl = "true";
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, enhanced ? 1.6 : 1.15),
    );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    offsets = sections.map((s) => s.offsetTop);
    heights = sections.map((s) => s.offsetHeight);
    maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
    sections.forEach((s, i) => {
      s.inert = enhanced && i !== getAtelier().chapter;
    });
    if (measured && wasEnhanced !== enhanced)
      window.dispatchEvent(
        new CustomEvent("atelier-seek", { detail: { top: offsets[resume] } }),
      );
    measured = true;
    dirty = true;
  }
  function pointer(e: PointerEvent) {
    pointerTargetX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerTargetY = (e.clientY / window.innerHeight - 0.5) * 2;
    dirty = true;
  }
  function scroll() {
    dirty = true;
  }
  function visibility() {
    if (!document.hidden) {
      lastTime = 0;
      dirty = true;
      frame = requestAnimationFrame(tick);
    } else cancelAnimationFrame(frame);
  }
  function contextLost(e: Event) {
    e.preventDefault();
    contextAvailable = false;
    root.dataset.enhanced = "false";
    root.dataset.webgl = "false";
    root.dataset.ready = "false";
    setAtelier({ enhanced: false });
    sections.forEach((s, i) => {
      s.inert = false;
      s.removeAttribute("data-active");
      views[i].style.visibility = "";
      spaces[i].style.transform = "";
      contents[i].style.transform = "";
      contents[i].style.opacity = "";
    });
    cancelAnimationFrame(frame);
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  window.addEventListener("resize", measure);
  window.addEventListener("scroll", scroll, { passive: true });
  window.addEventListener("pointermove", pointer, { passive: true });
  document.addEventListener("visibilitychange", visibility);
  const resizeObserver = new ResizeObserver(measure);
  sections.forEach((s) => resizeObserver.observe(s));
  document.fonts.ready.then(() => {
    if (!disposed) measure();
  });
  const initialId = root.dataset.resumeChapter || window.location.hash.slice(1);
  const initialSection = sections.findIndex(
    (section) => section.id === initialId,
  );
  measure();
  if (enhanced && initialSection > 0)
    window.dispatchEvent(
      new CustomEvent("atelier-seek", {
        detail: { top: offsets[initialSection] },
      }),
    );
  delete root.dataset.resumeChapter;

  function tick(now: number) {
    if (disposed || document.hidden || !contextAvailable) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;
    const y = window.scrollY;
    let index = 0;
    for (let i = 0; i < offsets.length; i++)
      if (y + (enhanced ? 0 : height * 0.35) >= offsets[i]) index = i;
    const p = clamp((y - offsets[index]) / heights[index], 0, 1);
    const previous = getAtelier();
    if (enhanced) {
      const itemProgress = clamp((p - 0.1) / 0.67, 0, 0.9999);
      if (index === 1) setAtelier({ note: Math.floor(itemProgress * 3) });
      if (index === 5)
        setAtelier({
          project: Math.floor(
            itemProgress * (previous.collection === "professional" ? 9 : 6),
          ),
        });
      if (index === 6) setAtelier({ memory: Math.floor(itemProgress * 3) });
      if (index === 7) setAtelier({ skill: Math.floor(itemProgress * 5) });
    }
    if (previous.chapter !== index) setAtelier({ chapter: index });
    const state = getAtelier();
    const selectedKey =
      state.collection +
      state.project +
      state.note +
      state.skill +
      state.memory;
    const moving =
      Math.abs(pointerTargetX - pointerX) +
        Math.abs(pointerTargetY - pointerY) >
      0.002;
    pointerX = mix(pointerX, pointerTargetX, 1 - Math.exp(-dt * 3.5));
    pointerY = mix(pointerY, pointerTargetY, 1 - Math.exp(-dt * 3.5));
    // Only paint at 30fps while at rest. Scroll and interaction use the full refresh rate.
    const interactive =
      dirty ||
      moving ||
      Math.abs(y - lastY) > 0.1 ||
      selectedKey !== lastSelection;
    if (!interactive && now - lastRender < 1000 / 30) {
      frame = requestAnimationFrame(tick);
      return;
    }
    lastRender = now;
    dirty = false;
    lastY = y;
    lastSelection = selectedKey;
    const travel = enhanced && index < 8 ? ease((p - 0.79) / 0.21) : 0;
    const station = index + travel;
    const z = -station * GAP;
    const drift = enhanced ? Math.sin(p * Math.PI) * 0.14 : 0;
    const orbit = enhanced ? pointerX * 0.065 : 0;
    const intro = index === 0 && y < 50 ? ease((now - startedAt) / 1600) : 1;
    cameraPos.set(
      drift + orbit,
      enhanced ? pointerY * -0.035 : 0,
      8 + z + (1 - intro) * 1.1,
    );
    target.set(orbit * 0.35, 0, z - 0.3);
    camera.position.copy(cameraPos);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    cssCamera.position.copy(cameraPos).multiplyScalar(UNITS);
    cssCamera.quaternion.copy(camera.quaternion);
    cssCamera.updateMatrixWorld();
    const fovPx = (camera.projectionMatrix.elements[5] * height) / 2;
    const cssTransform =
      "perspective(" +
      fovPx +
      "px) translateZ(" +
      fovPx +
      "px) " +
      cameraMatrix(cssCamera.matrixWorldInverse) +
      " translate(" +
      width / 2 +
      "px," +
      height / 2 +
      "px)";
    for (let i = 0; i < sections.length; i++) {
      const active = i === index;
      sections[i].dataset.active = String(active);
      sections[i].inert = enhanced && !active;
      if (enhanced) {
        views[i].style.visibility = active ? "visible" : "hidden";
        if (!active) continue;
        spaces[i].style.transform = cssTransform;
        domObject.position.set(0, 0, -i * GAP * UNITS);
        domObject.rotation.set(0, 0, 0);
        domObject.scale.setScalar((8 * UNITS) / fovPx);
        domObject.updateMatrixWorld();
        contents[i].style.transform = objectMatrix(domObject.matrixWorld);
        contents[i].style.opacity = String(1 - ease((p - 0.79) / 0.09));
        // Move type fragments through different depths in the same camera shot.
        contents[i].style.setProperty("--chapter-progress", String(p));
        contents[i].style.setProperty(
          "--type-depth",
          String(Math.sin(p * Math.PI) * 12) + "px",
        );
      } else {
        views[i].style.visibility = "";
        spaces[i].style.transform = "";
        contents[i].style.transform = "";
        contents[i].style.opacity = "";
      }
    }
    const progress = clamp(y / maxScroll, 0, 1);
    root.style.setProperty("--journey-progress", String(progress));
    if (progressBar) {
      progressBar.setAttribute(
        "aria-valuenow",
        String(Math.round(progress * 100)),
      );
    }
    // A small tint shift is shared by the fog, floor and glass reflections.
    const tint = index === 6 ? 0.6 : Math.sin(p * Math.PI) * 0.12;
    (scene.background as THREE.Color).copy(pink).lerp(rose, tint);
    (scene.fog as THREE.Fog).color.copy(scene.background as THREE.Color);
    worlds.forEach((world, i) => {
      world.visible = Math.abs(i - station) < 1.05;
    });
    const t = now * 0.00013;
    hero.group.rotation.set(
      0.15 + pointerY * 0.07,
      t * 0.2 + pointerX * 0.09,
      -0.12,
    );
    hero.group.position.set(
      enhanced ? 2.0 : 0.85,
      enhanced ? 0.1 : -0.1,
      enhanced ? 0 : -2.2,
    );
    hero.pieces.forEach((piece, i) => {
      piece.rotation.z = i * 1.02 - 0.38 + Math.sin(t + i) * 0.07;
    });
    philosophy.group.rotation.set(0.2, p * 0.9, -0.15);
    philosophy.pieces.forEach((piece, i) => {
      const split = ease((p - 0.05) / 0.4);
      piece.position.y = (i - 1) * split * 0.68;
      piece.scale.setScalar(i === state.note ? 1.08 : 0.9);
    });
    formula.rotation.y = enhanced ? -0.15 + Math.sin(p * 3.14) * 0.32 : 0;
    formulaPieces.forEach((piece, i) => {
      const assemble = ease((p - 0.12 - i * 0.11) / 0.25);
      piece.position.set(
        mix((i - 1) * 1.75, 0, assemble),
        mix(1.65 - i * 1.4, -0.3 + i * 0.22, assemble),
        0.25,
      );
      piece.rotation.set(i * 0.5, p * 2 + i, i * 0.8);
      piece.scale.setScalar(mix(0.37, 0.2, assemble));
    });
    liquid.scale.y = 0.35 + ease(p / 0.7) * 0.65;
    liquid.position.y = -1.15 + liquid.scale.y * 0.8;
    editorial.group.rotation.set(0.7, p * 0.7, -0.4);
    statsSculptures.forEach((mesh, i) => {
      const spread = (i - 1.5) * 2.25;
      mesh.position.set(spread, -1.05 + Math.sin(p * 3.14 + i) * 0.15, -1.3);
      mesh.rotation.y = t + i;
    });
    const projects = allProjects.filter(
      (project) => project.type === state.collection,
    );
    const current = Math.min(state.project, projects.length - 1);
    const nextKey = state.collection + ":" + current;
    if (index === 5 && enhanced && galleryKey !== nextKey) {
      galleryKey = nextKey;
      galleryPlates.forEach((plate, j) => {
        const project = projects[current + j - 1];
        plate.group.visible = !!project;
        const path = project?.customImage;
        if (path) loadTexture(path);
        const texture = path
          ? textures.get(path)
          : project
            ? titleTexture(project)
            : undefined;
        plate.mat.map = texture ?? null;
        plate.mat.color.set(texture ? "#ffffff" : "#ffd8df");
        plate.mat.needsUpdate = true;
      });
    }
    gallery.position.set(enhanced ? 1.85 : 0, enhanced ? 0 : -0.1, 0);
    gallery.visible = enhanced;
    gallery.rotation.y = -0.17 + pointerX * 0.035;
    const focus = enhanced
      ? clamp(
          ((p - 0.1) / 0.67) * projects.length - 0.5,
          0,
          projects.length - 1,
        )
      : current;
    galleryPlates.forEach((plate, j) => {
      const n = j - 1 + current - focus;
      const distance = Math.min(Math.abs(n), 1);
      plate.group.position.set(
        n * 3.2,
        -distance * 0.25,
        -2.8 * Math.pow(distance, 1.2),
      );
      plate.group.rotation.y = -n * 0.3;
      plate.group.scale.setScalar(1 - distance * 0.23);
    });
    const release = ease((p - 0.16) / 0.55);
    memory.group.scale.setScalar(0.8 * (1 - release * 0.55));
    memory.group.rotation.set(p * 0.5, p * 2, 0.4);
    memory.group.position.x = enhanced ? 2.1 : 0;
    const pp = particleGeometry.attributes.position;
    if (index === 6)
      for (let i = 0; i < particleCount; i++) {
        const a = i * 2.399963;
        pp.setXYZ(
          i,
          particleTargets[i * 3] * release +
            (enhanced ? 2.1 : 0) +
            Math.sin(a + t) * 0.08 * release,
          particleTargets[i * 3 + 1] * release +
            Math.cos(a + t) * 0.07 * release,
          particleTargets[i * 3 + 2] * release - 1,
        );
      }
    pp.needsUpdate = true;
    particleMaterial.opacity = release * 0.8;
    shelves.forEach((shelf, i) => {
      const active = i === state.skill;
      shelf.position.x = mix(
        shelf.position.x,
        active ? 0.25 : 0,
        1 - Math.exp(-dt * 7),
      );
      shelf.rotation.y = -0.22 + (active ? Math.sin(t) * 0.12 : 0);
      shelf.scale.x = mix(
        shelf.scale.x,
        active ? 1.12 : 1,
        1 - Math.exp(-dt * 7),
      );
    });
    finale.group.rotation.set(0.4, p * 0.7 + pointerX * 0.06, -0.3);
    mist.position.set(0, 0, z - 7);
    mistMaterial.uniforms.uTime.value = now * 0.001;
    key.position.z = z + 7;
    rim.position.z = z - 3;
    fill.position.z = z + 4;
    renderer.render(scene, camera);
    root.dataset.ready = "true";
    // One-way adaptive resolution: avoids oscillating quality on weaker GPUs.
    if (interactive) {
      renderedFrames++;
      accumulatedTime += dt;
    }
    if (!qualityAdjusted && renderedFrames > 120) {
      if (renderedFrames / accumulatedTime < 38)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      qualityAdjusted = true;
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    window.removeEventListener("resize", measure);
    window.removeEventListener("scroll", scroll);
    window.removeEventListener("pointermove", pointer);
    document.removeEventListener("visibilitychange", visibility);
    canvas.removeEventListener("webglcontextlost", contextLost);
    root.dataset.enhanced = "false";
    root.dataset.webgl = "false";
    root.dataset.ready = "false";
    setAtelier({ enhanced: false });
    sections.forEach((s, i) => {
      s.inert = false;
      s.removeAttribute("data-active");
      views[i].style.visibility = "";
      spaces[i].style.transform = "";
      contents[i].style.transform = "";
      contents[i].style.opacity = "";
    });
    const geometries = new Set<THREE.BufferGeometry>(),
      mats = new Set<THREE.Material>();
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.Points) {
        geometries.add(o.geometry);
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
          mats.add(m),
        );
      }
    });
    geometries.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    titleTextures.forEach((t) => t.dispose());
    environment.dispose();
    renderer.dispose();
  };
}
