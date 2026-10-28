import * as T from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { clamp, ease, mix, type Frame } from "@/lib/experience/score";

const colors = ["#f36371", "#ffd8df", "#151015"];

import { noteGeometry } from "@/lib/experience/geometry";

export function createWorld(host: HTMLElement, onLost: () => void) {
  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(
    Math.min(devicePixelRatio, innerWidth < 768 ? 1.25 : 1.6),
  );
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.replaceChildren(renderer.domElement);
  const lost = (e: Event) => {
    e.preventDefault();
    onLost();
  };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.z = 12;
  const pmrem = new T.PMREMGenerator(renderer),
    room = new RoomEnvironment(),
    env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new T.AmbientLight(0xffeaf0, 1.7));
  const key = new T.DirectionalLight(0xfff8f1, 4);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new T.DirectionalLight(0xf36371, 5);
  rim.position.set(4, -2, 3);
  scene.add(rim);
  const notes = colors.map((color) => {
    const m = new T.MeshPhysicalMaterial({
      color,
      metalness: 0.34,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
      envMapIntensity: 1.6,
    });
    const mesh = new T.Mesh(noteGeometry(3, 2), m);
    scene.add(mesh);
    return mesh;
  });
  const bottle = new T.Group();
  scene.add(bottle);
  const glass = new T.MeshPhysicalMaterial({
    color: 0xffe8ef,
    metalness: 0.05,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.32,
    ior: 1.45,
    transparent: true,
    opacity: 0.55,
    side: T.DoubleSide,
    depthWrite: false,
    clearcoat: 1,
    envMapIntensity: 2.2,
  });
  const body = new T.Mesh(
    new RoundedBoxGeometry(1.95, 2.75, 0.85, 5, 0.2),
    glass,
  );
  body.position.y = -0.24;
  bottle.add(body);
  const base = new T.Mesh(
    new RoundedBoxGeometry(1.82, 0.1, 0.75, 3, 0.04),
    glass,
  );
  base.position.y = -1.56;
  bottle.add(base);
  const neck = new T.Mesh(new T.CylinderGeometry(0.29, 0.3, 0.4, 32), glass);
  neck.position.y = 1.29;
  bottle.add(neck);
  const capMat = new T.MeshPhysicalMaterial({
    color: 0x171116,
    metalness: 0.8,
    roughness: 0.24,
    clearcoat: 1,
  });
  const cap = new T.Mesh(new T.CylinderGeometry(0.39, 0.39, 0.58, 48), capMat);
  cap.position.y = 1.72;
  bottle.add(cap);
  const collar = new T.Mesh(
    new T.CylinderGeometry(0.32, 0.32, 0.1, 32),
    new T.MeshStandardMaterial({
      color: 0xf0b5bb,
      metalness: 1,
      roughness: 0.2,
    }),
  );
  collar.position.y = 1.42;
  bottle.add(collar);
  const juice = new T.Mesh(
    new RoundedBoxGeometry(1.72, 2.4, 0.65, 4, 0.15),
    new T.MeshPhysicalMaterial({
      color: 0xf36371,
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1,
      transparent: true,
      opacity: 0.8,
    }),
  );
  bottle.add(juice);
  const streams = Array.from({ length: 4 }, (_, i) => {
    const g = new T.BufferGeometry(),
      segments = 128,
      sides = 8;
    const positions = new Float32Array((segments + 1) * (sides + 1) * 3),
      normals = new Float32Array(positions.length),
      indices = [];
    for (let a = 0; a < segments; a++)
      for (let b = 0; b < sides; b++) {
        const n = a * (sides + 1) + b;
        indices.push(
          n,
          n + sides + 1,
          n + 1,
          n + 1,
          n + sides + 1,
          n + sides + 2,
        );
      }
    g.setAttribute(
      "position",
      new T.BufferAttribute(positions, 3).setUsage(T.DynamicDrawUsage),
    );
    g.setAttribute(
      "normal",
      new T.BufferAttribute(normals, 3).setUsage(T.DynamicDrawUsage),
    );
    g.setIndex(indices);
    const m = new T.MeshPhysicalMaterial({
      color: colors[i % 3],
      metalness: 0.12,
      roughness: 0.26,
      clearcoat: 0.2,
      specularIntensity: 0.35,
      envMapIntensity: 0.35,
      transparent: true,
    });
    const mesh = new T.Mesh(g, m);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return mesh;
  });
  const count = innerWidth < 768 ? 360 : 1050,
    starPos = new Float32Array(count * 3),
    starColors = new Float32Array(count * 3);
  let seed = 73;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    starPos.set(
      [(random() - 0.5) * 26, (random() - 0.5) * 18, -random() * 22],
      i * 3,
    );
    new T.Color(
      i % 11 === 0 ? 0xf36371 : i % 7 === 0 ? 0xffd8df : 0xd7d4e5,
    ).toArray(starColors, i * 3);
  }
  const starGeo = new T.BufferGeometry();
  const starBase = starPos.slice();
  starGeo.setAttribute("position", new T.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new T.BufferAttribute(starColors, 3));
  const starMat = new T.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const stars = new T.Points(starGeo, starMat);
  scene.add(stars);
  let w = 0,
    h = 0,
    viewW = 0,
    viewH = 0;
  const resize = () => {
    w = innerWidth;
    h = innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    viewH = 2 * Math.tan(T.MathUtils.degToRad(35) * 0.5) * 12;
    viewW = (viewH * w) / h;
    const cw = (w < 768 ? 0.86 : 0.4) * viewW,
      ch = (w < 768 ? 0.4 : 0.45) * viewH;
    notes.forEach((n) => {
      n.geometry.dispose();
      n.geometry = noteGeometry(cw, ch);
      n.updateMorphTargets();
    });
  };
  resize();
  const a = new T.Vector3(),
    b = new T.Vector3(),
    sig = new T.Vector3(),
    tangent = new T.Vector3(),
    normal = new T.Vector3(),
    binormal = new T.Vector3(),
    up = new T.Vector3(0, 0, 1);
  const contactElement = document.querySelector<HTMLElement>(".contact-vessel");
  const achievements = [
    ...document.querySelectorAll<HTMLElement>(".achievement"),
  ];
  const memory = document.getElementById("memory");
  const signature = document.getElementById("signature");
  const landingDots = [
    ...document.querySelectorAll<HTMLElement>(".signature-settle i"),
  ];
  function draw(f: Frame, time: number) {
    if (w !== innerWidth || h !== innerHeight) resize();
    const mobile = w < 768;
    host.dataset.noteForm = f.notes.map((p) => p.morph.toFixed(2)).join(",");
    notes.forEach((mesh, i) => {
      const p = f.notes[i];
      mesh.visible = p.alpha > 0.005;
      mesh.position.set((p.x - 0.5) * viewW, (0.5 - p.y) * viewH, 0);
      const breathing =
        p.morph > 0.01 ? 0 : Math.sin(time * 0.7 + i * 1.9) * 0.025;
      mesh.position.y += breathing;
      mesh.scale.setScalar(mix(p.size, mobile ? 0.97 : 1, p.morph));
      const landing = signature
        ? ease((h * 0.25 - signature.getBoundingClientRect().top) / (h * 0.25))
        : 0;
      if (landing > 0 && landingDots[i]) {
        const r = landingDots[i].getBoundingClientRect();
        mesh.position.x = mix(
          mesh.position.x,
          ((r.left + r.width * 0.5 - w * 0.5) / w) * viewW,
          landing,
        );
        mesh.position.y = mix(
          mesh.position.y,
          ((h * 0.5 - r.top - r.height * 0.5) / h) * viewH,
          landing,
        );
        mesh.scale.setScalar(
          mix(p.size, ((r.width / w) * viewW) / 1.7, landing),
        );
      }
      const geometry = mesh.geometry;
      if (geometry.userData.morph !== p.morph) {
        const positions = geometry.attributes.position,
          normals = geometry.attributes.normal;
        const base = geometry.userData.sphere,
          card = geometry.userData.card;
        const baseNormals = geometry.userData.sphereNormals,
          cardNormals = geometry.userData.cardNormals;
        for (let j = 0; j < positions.array.length; j++) {
          positions.array[j] = mix(base[j], card[j], p.morph);
          normals.array[j] = mix(baseNormals[j], cardNormals[j], p.morph);
        }
        positions.needsUpdate = true;
        normals.needsUpdate = true;
        geometry.userData.morph = p.morph;
      }
      mesh.rotation.set(
        (1 - p.morph) * Math.sin(time * 0.2 + i) * 0.1,
        (1 - p.morph) * Math.sin(time * 0.25 + i) * 0.22,
        (1 - p.morph) * 0.12,
      );
      const m = mesh.material;
      m.transparent = p.alpha < 0.99;
      m.opacity = p.alpha;
      m.roughness = mix(0.16, 0.65, p.morph);
      m.clearcoat = mix(1, 0.05, p.morph);
      m.metalness = mix(0.34, 0.08, p.morph);
      m.envMapIntensity = mix(1.6, 0.4, p.morph);
      m.color
        .set(colors[i])
        .lerp(new T.Color(i === 2 ? "#231b23" : "#fff7fa"), p.morph * 0.88);
    });
    bottle.visible = f.bottle > 0.005;
    bottle.rotation.y = Math.sin(time * 0.18) * 0.09;
    bottle.rotation.z = (f.fill - 0.5) * 0.045;
    bottle.scale.setScalar(mobile ? 0.85 : 1.05);
    bottle.position.y = -0.06;
    bottle.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.material.transparent = true;
        o.material.opacity =
          (o.material === glass ? 0.55 : o === juice ? 0.8 : 1) * f.bottle;
      }
    });
    juice.scale.y = 0.03 + f.fill * 0.83;
    juice.position.y = -1.4 + 1.2 * juice.scale.y;
    const box = contactElement?.getBoundingClientRect();
    const ringRects = achievements.map((el) => el.getBoundingClientRect());
    const ringProgress = Number(
      document.getElementById("impact")?.dataset.progress ?? 0,
    );
    const path = (u: number, i: number, out: T.Vector3) => {
      const ph = i * 0.76,
        angle = u * Math.PI * 2.15 + ph + time * 0.09;
      const x =
        (mobile ? 0.27 : 0.28) * viewW +
        Math.sin(angle) *
          viewW *
          (mobile ? 0.15 : 0.12) *
          (0.45 + 0.55 * Math.sin(u * Math.PI));
      const y =
          (u - 0.5) * viewH * (mobile ? 0.32 : 0.73) -
          (mobile ? viewH * 0.31 : 0) +
          Math.sin(u * Math.PI * 3 + ph) * 0.18,
        z = Math.cos(angle) * 0.5;
      const ringAngle = u * Math.PI * 2 - Math.PI * 0.5;
      const rect = ringRects[i];
      const ringX = ((rect.left + rect.width * 0.5 - w * 0.5) / w) * viewW;
      const ringY = ((h * 0.5 - rect.top - rect.height * 0.5) / h) * viewH;
      const radius = ((rect.width / w) * viewW * 118) / 260;
      out.set(
        mix(x, ringX + Math.cos(ringAngle) * radius, f.rings),
        mix(y, ringY + Math.sin(ringAngle) * radius, f.rings),
        mix(z, Math.sin(ringAngle * 3 + time * 0.4) * 0.035, f.rings),
      );
      if (f.signature > 0 && box) {
        const cx = ((box.left + box.width * 0.5 - w * 0.5) / w) * viewW,
          cy = ((h * 0.5 - box.top - box.height * 0.5) / h) * viewH;
        const sx =
          ((Math.sign(Math.cos(ringAngle)) *
            Math.pow(Math.abs(Math.cos(ringAngle)), 0.24) *
            box.width) /
            w) *
          viewW *
          0.502;
        const sy =
          ((Math.sign(Math.sin(ringAngle)) *
            Math.pow(Math.abs(Math.sin(ringAngle)), 0.24) *
            box.height) /
            h) *
          viewH *
          0.502;
        out.lerp(
          sig.set(
            cx + sx,
            cy + sy,
            0.15 + Math.sin(u * Math.PI * 8 + time) * 0.03,
          ),
          f.signature,
        );
      }
    };
    streams.forEach((mesh, i) => {
      const opacity = f.fluid * (i === 3 ? f.rings : 1);
      mesh.visible = opacity > 0.003;
      if (!mesh.visible) return;
      mesh.material.opacity = opacity * (i === 2 ? 0.9 : 1);
      const p = mesh.geometry.attributes.position,
        n = mesh.geometry.attributes.normal;
      for (let j = 0; j <= 128; j++) {
        const u =
          (j / 128) *
          mix(1, Math.max(0.001, clamp(ringProgress * 4 - i)), f.rings);
        path(u, i, a);
        path(Math.min(1, u + 0.001), i, b);
        tangent.copy(b).sub(a).normalize();
        if (j === 128) {
          path(u - 0.001, i, b);
          tangent.copy(a).sub(b).normalize();
        }
        normal.crossVectors(tangent, up).normalize();
        binormal.crossVectors(tangent, normal).normalize();
        const tube = mix(
          (mobile ? 0.1 : 0.23) * (Math.sin(u * Math.PI) * 0.75 + 0.22),
          0.02,
          f.rings,
        );
        const radius = mix(tube, 0.014, f.signature);
        for (let k = 0; k <= 8; k++) {
          const th = (k / 8) * Math.PI * 2,
            idx = j * 9 + k;
          const nx = normal.x * Math.cos(th) + binormal.x * Math.sin(th),
            ny = normal.y * Math.cos(th) + binormal.y * Math.sin(th),
            nz = normal.z * Math.cos(th) + binormal.z * Math.sin(th);
          p.setXYZ(
            idx,
            a.x + nx * radius,
            a.y + ny * radius,
            a.z + nz * radius * 0.75,
          );
          n.setXYZ(idx, nx, ny, nz);
        }
      }
      p.needsUpdate = true;
      n.needsUpdate = true;
    });
    stars.visible = f.stars > 0.001;
    starMat.opacity = f.stars * 0.85;
    const inSkills = document.documentElement.dataset.chapter === "skills";
    const spread = inSkills
      ? clamp((f.stars - 0.13) / 0.87)
      : clamp(f.stars * 1.15);
    if (stars.visible) {
      const positions = starGeo.attributes.position;
      for (let i = 0; i < count; i++) {
        const origin = f.notes[i % 3];
        const ox = (inSkills ? origin.x - 0.5 : 0.39) * viewW;
        const oy = (inSkills ? 0.5 - origin.y : 0.27 - (i % 3) * 0.095) * viewH;
        positions.setXYZ(
          i,
          mix(ox, starBase[i * 3], spread),
          mix(oy, starBase[i * 3 + 1], spread),
          mix(0, starBase[i * 3 + 2], spread),
        );
      }
      positions.needsUpdate = true;
    }
    stars.position.z = memory
      ? clamp(-memory.getBoundingClientRect().top / h, 0, 3.5) * 2
      : 0;
    stars.rotation.z = Math.sin(time * 0.03) * 0.018;
    camera.position.z = 12 - f.stars * 1.7;
    camera.position.x = Math.sin((scrollY / h) * 0.2) * 0.12 * f.stars;
    camera.lookAt(0, 0, -3 * f.stars);
    renderer.render(scene, camera);
  }
  return {
    draw,
    dispose: () => {
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        if (o instanceof T.Mesh || o instanceof T.Points) {
          o.geometry.dispose();
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m.dispose());
        }
      });
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
