"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./experience.css";

function DigitalCore({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const particles = useRef<THREE.Points>(null);
  const architecture = useRef<THREE.Group>(null);
  const geometry = useMemo(() => {
    const count = 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = i * 2.399963229728653;
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const dist = 1.8 + Math.sin(i * 17.12) * 0.28;
      positions[3 * i] = Math.cos(theta) * radius * dist;
      positions[3 * i + 1] = y * dist;
      positions[3 * i + 2] = Math.sin(theta) * radius * dist;
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame((state, delta) => {
    const p = progress.current;
    const damp = (from: number, to: number) => THREE.MathUtils.damp(from, to, 2.3, delta);
    if (group.current) {
      group.current.rotation.y = damp(group.current.rotation.y, p * Math.PI * 1.5 + (reduced ? 0 : state.clock.elapsedTime * 0.035));
      group.current.rotation.x = damp(group.current.rotation.x, p * 0.44);
      group.current.position.x = damp(group.current.position.x, p > 0.43 ? -1.15 : 0);
      group.current.scale.setScalar(damp(group.current.scale.x, 1 + Math.sin(p * Math.PI) * 0.23));
    }
    if (inner.current) inner.current.rotation.z += reduced ? 0 : delta * 0.08;
    if (particles.current) particles.current.rotation.y -= reduced ? 0 : delta * 0.025;
    if (architecture.current) { architecture.current.position.z = damp(architecture.current.position.z, p * 3); architecture.current.rotation.z = damp(architecture.current.rotation.z, p * 0.3); }
    state.camera.position.z = damp(state.camera.position.z, 7.8 - Math.sin(p * Math.PI * 0.82) * 4.5);
    state.camera.position.x = damp(state.camera.position.x, p > 0.48 ? 0.7 : 0);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={group}>
      <group ref={architecture}>
        {Array.from({ length: 9 }, (_, index) => (
          <group key={index} position={[0, 0, -3.2 - index * 1.75]} rotation={[0, 0, index * 0.11]}>
            <mesh>
              <torusGeometry args={[2.2 + index * 0.1, 0.009, 6, 96]} />
              <meshBasicMaterial color={index % 2 ? "#8189ff" : "#f36a83"} transparent opacity={0.35} depthWrite={false} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <ringGeometry args={[2.65 + index * 0.1, 2.67 + index * 0.1, 4]} />
              <meshBasicMaterial color="#a9a5ff" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh position={[0, 0, -5.5]}>
        <torusKnotGeometry args={[1.5, 0.015, 180, 6, 3, 7]} />
        <meshBasicMaterial color="#777cf7" transparent opacity={0.35} />
      </mesh>
      <Float speed={reduced ? 0 : 1} floatIntensity={reduced ? 0 : 0.18} rotationIntensity={0}>
        <mesh ref={inner}>
          <icosahedronGeometry args={[1.1, 2]} />
          <meshPhysicalMaterial color="#7d7fff" metalness={0.15} roughness={0.12} transparent opacity={0.24} transmission={0.8} thickness={1.5} depthWrite={false} />
        </mesh>
        <mesh rotation={[0.45, 0.15, 0.3]}>
          <torusGeometry args={[1.62, 0.013, 8, 160]} />
          <meshBasicMaterial color="#fc7799" transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[1.15, 0.8, 0.2]}>
          <torusGeometry args={[1.82, 0.009, 8, 160]} />
          <meshBasicMaterial color="#989bff" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[0.2, 1.35, 0.7]}>
          <torusGeometry args={[1.45, 0.009, 8, 160]} />
          <meshBasicMaterial color="#f6d0da" transparent opacity={0.65} />
        </mesh>
        <points ref={particles} geometry={geometry}>
          <pointsMaterial color="#f28ca7" size={0.025} transparent opacity={0.8} sizeAttenuation depthWrite={false} />
        </points>
      </Float>
    </group>
  );
}

function World({ progress, reduced }: { progress: React.RefObject<number>; reduced: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 7.8], fov: 43 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} fallback={<div className="exp-canvas-fallback" />}>
      <color attach="background" args={["#090b12"]} />
      <ambientLight intensity={0.55} />
      <fog attach="fog" args={["#090b12", 13, 33]} />
      <pointLight position={[3, 3, 4]} color="#ff839e" intensity={33} distance={12} />
      <pointLight position={[-4, -2, 2]} color="#828cff" intensity={25} distance={12} />
      {!reduced && <Stars radius={25} depth={18} count={850} factor={2} saturation={0} fade speed={0.25} />}
      <Suspense fallback={null}><DigitalCore progress={progress} reduced={reduced} /></Suspense>
    </Canvas>
  );
}

export default function CinematicExperience() {
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPreference = () => setReduced(preference.matches);
    onPreference();
    preference.addEventListener("change", onPreference);
    return () => preference.removeEventListener("change", onPreference);
  }, []);

  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => { progress.current = self.progress; },
    });
    return () => trigger.kill();
  }, []);

  return (
    <main ref={root} className="exp-root">
      <div className="exp-world" aria-hidden="true"><World progress={progress} reduced={reduced} /></div>
      <div className="exp-grain" aria-hidden="true" />
      <header className="exp-header">
        <a href="#arrival" className="exp-brand">DP<span className="exp-brand-dot">.</span></a>
        <span className="exp-header-note">DIGITAL PERFUMER / EXPERIMENT 001</span>
        <a className="exp-return" href="/">Original portfolio ↗</a>
      </header>
      <div className="exp-rail" aria-hidden="true"><span>01</span><i /><span>03</span></div>
      <section id="arrival" className="exp-panel exp-arrival">
        <div className="exp-orbit-label" aria-hidden="true">FIG. 001 — DIGITAL ESSENCE / INTERACTIVE SYSTEM</div>
        <div className="exp-copy exp-copy-center">
          <p className="exp-eyebrow">BASHAR AL-JABI — CREATIVE DEVELOPER</p>
          <h1>DIGITAL<br /><em>PERFUMER</em></h1>
          <p className="exp-intro">Composing digital experiences at the intersection of design, code and strategy.</p>
          <a className="exp-explore" href="#philosophy">Enter the experience <span>↓</span></a>
        </div>
        <span className="exp-chapter">CHAPTER 01 / THE AWAKENING</span>
      </section>
      <section id="philosophy" className="exp-panel exp-philosophy">
        <div className="exp-copy exp-copy-left">
          <p className="exp-eyebrow">02 / THE PHILOSOPHY</p>
          <h2>BEYOND<br />THE SCREEN.<br /><em>INTO EXPERIENCE.</em></h2>
          <p>Every memorable digital experience begins with a signature — a balance of visual identity, thoughtful interaction and precise engineering.</p>
          <div className="exp-lines"><span>DESIGN</span><span>DEVELOPMENT</span><span>IMPACT</span></div>
        </div>
      </section>
      <section id="composition" className="exp-panel exp-composition">
        <div className="exp-copy exp-copy-right">
          <p className="exp-eyebrow">03 / THE COMPOSITION</p>
          <h2>DESIGN.<br />CODE.<br /><em>IMPACT.</em></h2>
          <p>Design sets the first impression. Code brings it to life. Strategy makes it last.</p>
          <div className="exp-notes"><span>01 / DESIGN</span><span>02 / CODE</span><span>03 / GROWTH</span></div>
          <a className="exp-cta" href="/#work">Explore selected work ↗</a>
        </div>
      </section>
      <footer className="exp-footer"><span>AN EXPERIMENTAL CINEMATIC PROTOTYPE</span><span>BUILT WITH THREE.JS + GSAP</span></footer>
    </main>
  );
}
