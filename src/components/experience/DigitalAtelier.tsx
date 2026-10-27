"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./atelier.css";

type Progress = { current: number };
const COLORS = ["#f36a83", "#8e8bff", "#dbe9ff"];

function Essence({ travel, reduce }: { travel: Progress; reduce: boolean }) {
  const root = useRef<THREE.Group>(null);
  const vessel = useRef<THREE.Group>(null);
  const notes = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);
  const stream = useRef<THREE.Points>(null);
  const formations = useMemo(() => {
    const n = 1600;
    const a = new Float32Array(n * 3);
    const b = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const angle = t * Math.PI * 40;
      const radius = 0.45 + 1.2 * Math.sqrt(t);
      a[i * 3] = Math.cos(angle) * radius;
      a[i * 3 + 1] = (t - .5) * 3.6;
      a[i * 3 + 2] = Math.sin(angle) * radius;
      const row = Math.floor(i / 40), col = i % 40;
      b[i * 3] = (col / 39 - .5) * 5.8;
      b[i * 3 + 1] = (row / 39 - .5) * 3.5;
      b[i * 3 + 2] = -2.5 - (row % 5) * .16;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(a.slice(), 3));
    return { geo, a, b };
  }, []);

  useFrame((state, delta) => {
    const p = travel.current;
    const ease = (a: number, b: number) => THREE.MathUtils.smoothstep(p, a, b);
    const transition = ease(.22, .57);
    const compose = ease(.61, .91);
    const damp = (from: number, to: number) => THREE.MathUtils.damp(from, to, 2.8, delta);
    if (root.current) {
      root.current.rotation.y = damp(root.current.rotation.y, p * 1.2 + (reduce ? 0 : state.clock.elapsedTime * .045));
      root.current.position.x = damp(root.current.position.x, -transition * 1.85 + compose * 1.25);
      root.current.position.z = damp(root.current.position.z, -transition * 2);
    }
    if (vessel.current) {
      vessel.current.scale.setScalar(damp(vessel.current.scale.x, 1 - transition * .65 + compose * .38));
      vessel.current.rotation.z = damp(vessel.current.rotation.z, transition * .28);
    }
    if (notes.current) {
      notes.current.rotation.y += reduce ? 0 : delta * .09;
      notes.current.scale.setScalar(damp(notes.current.scale.x, .85 + compose * .45));
    }
    if (shell.current) {
      const mat = shell.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = damp(mat.opacity, .23 * (1 - transition) + .08 * compose);
    }
    if (stream.current) {
      const attr = stream.current.geometry.attributes.position as THREE.BufferAttribute;
      const dest = formations.b, start = formations.a;
      for (let i = 0; i < attr.count; i++) {
        for (let k = 0; k < 3; k++) {
          const idx = i * 3 + k;
          attr.array[idx] = start[idx] + (dest[idx] - start[idx]) * transition;
        }
      }
      attr.needsUpdate = true;
      stream.current.rotation.z = p * .13;
    }
    const camera = state.camera as THREE.PerspectiveCamera;
    camera.position.z = damp(camera.position.z, 8.5 - ease(.06, .58) * 3.1 + compose * 1.5);
    camera.position.x = damp(camera.position.x, transition * 1.1 - compose * 1.4);
    camera.position.y = damp(camera.position.y, transition * .45 - compose * .35);
    camera.lookAt(0, 0, -transition);
  });

  return <group ref={root}>
    <group ref={vessel}>
      <mesh ref={shell}>
        <cylinderGeometry args={[.93, 1.15, 2.45, 8, 1]} />
        <meshPhysicalMaterial color="#bbbdff" metalness={.18} roughness={.06} transparent opacity={.23} depthWrite={false} side={THREE.DoubleSide} transmission={.75} thickness={.7} />
      </mesh>
      <mesh position={[0, 1.27, 0]}>
        <cylinderGeometry args={[.39, .4, .37, 8]} />
        <meshStandardMaterial color="#bdc4db" metalness={.95} roughness={.18} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <boxGeometry args={[.9, .18, .9]} />
        <meshStandardMaterial color="#202b42" metalness={.82} roughness={.2} />
      </mesh>
      <mesh position={[0, -.08, .98]}>
        <planeGeometry args={[1.55, 1.08]} />
        <meshBasicMaterial color="#131a2b" transparent opacity={.63} depthWrite={false} />
      </mesh>
      {Array.from({length: 8}, (_, i) => <mesh key={i} rotation={[0, i*Math.PI/4, 0]}>
        <torusGeometry args={[1.16, .012, 6, 70, Math.PI]} />
        <meshBasicMaterial color={i%2 ? "#f36a83" : "#8e8bff"} transparent opacity={.42} />
      </mesh>)}
      <group ref={notes}>
        {[0,1,2].map((i) => <group key={i} position={[0, (i-1)*.67, 0]}>
          <mesh rotation={[Math.PI/2,0,i*.8]}><torusGeometry args={[.69+i*.12,.04,8,90]} /><meshStandardMaterial color={COLORS[i]} emissive={COLORS[i]} emissiveIntensity={1.7} metalness={.35} roughness={.22}/></mesh>
          <mesh><icosahedronGeometry args={[.2+i*.06,1]}/><meshStandardMaterial color={COLORS[i]} emissive={COLORS[i]} emissiveIntensity={2}/></mesh>
        </group>)}
      </group>
    </group>
    <points ref={stream} geometry={formations.geo}>
      <pointsMaterial size={.027} color="#ffa3c4" sizeAttenuation transparent opacity={.85} depthWrite={false} />
    </points>
  </group>;
}

function InterfaceWorld({ travel }: { travel: Progress }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_,delta) => {
    if (!group.current) return;
    const p = THREE.MathUtils.smoothstep(travel.current, .31, .64);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z,-8+p*5,2,delta);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x,3-p*2.2,2,delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y,-.5+p*.45,2,delta);
    group.current.visible = p > .04;
  });
  return <group ref={group}>
    {[0,1,2,3,4].map((i) => <group key={i} position={[(i%3-1)*2.15,(Math.floor(i/3)-.35)*1.75,-i*.7]}>
      <mesh><boxGeometry args={[1.84,1.22,.055]}/><meshStandardMaterial color="#152139" metalness={.65} roughness={.23} transparent opacity={.92}/></mesh>
      <mesh position={[0,.45,.043]}><planeGeometry args={[1.54,.065]}/><meshBasicMaterial color={COLORS[i%3]}/></mesh>
      {[0,1,2].map(j=><mesh key={j} position={[-.35,.13-j*.22,.045]}><planeGeometry args={[j===0? .84:1.13,.042]}/><meshBasicMaterial color={j===0?"#ddeafa":"#667b9f"} transparent opacity={.78}/></mesh>)}
      <mesh position={[.43,-.45,.05]}><planeGeometry args={[.42,.12]}/><meshBasicMaterial color="#f36a83" transparent opacity={.72}/></mesh>
    </group>)}
  </group>;
}

function Stage({ travel, reduce }: { travel: Progress; reduce: boolean }) {
  return <Canvas dpr={[1,1.6]} camera={{position:[0,0,8.5],fov:44}} gl={{alpha:false,antialias:true,powerPreference:"high-performance"}} fallback={<div className="atelier-fallback"/>}>
    <color attach="background" args={["#080b15"]}/>
    <fog attach="fog" args={["#080b15",11,29]}/>
    <ambientLight intensity={.58}/>
    <spotLight position={[3,7,6]} color="#ffc4d7" intensity={85} angle={.48} penumbra={1}/>
    <pointLight position={[-4,1,3]} color="#7777ff" intensity={65} distance={15}/>
    <pointLight position={[2,-4,2]} color="#f36a83" intensity={40} distance={13}/>
    <Suspense fallback={null}>
      <Float speed={reduce?0:.6} rotationIntensity={0} floatIntensity={reduce?0:.11}><Essence travel={travel} reduce={reduce}/></Float>
      <InterfaceWorld travel={travel}/>
      {!reduce && <Sparkles count={80} size={2} opacity={.27} scale={[12,8,12]} speed={.12} color="#9da1ff"/>}
    </Suspense>
  </Canvas>;
}

export default function DigitalAtelier() {
  const host = useRef<HTMLDivElement>(null);
  const travel = useRef(0);
  const [reduced,setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn=()=>setReduced(m.matches);
    fn();m.addEventListener("change",fn);
    return ()=>m.removeEventListener("change",fn);
  },[]);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!host.current) return;
    const t=ScrollTrigger.create({trigger:host.current,start:"top top",end:"bottom bottom",onUpdate:self=>{travel.current=self.progress}});
    return ()=>t.kill();
  },[]);
  return <main ref={host} className="atelier" id="top">
    <div className="atelier-stage" aria-hidden="true"><Stage travel={travel} reduce={reduced}/></div>
    <div className="atelier-vignette" aria-hidden="true"/>
    <header className="atelier-header"><a href="#top">DP<span>·</span></a><div>THE DIGITAL ATELIER <small>EXPERIMENT 002</small></div><a href="/">MAIN PORTFOLIO ↗</a></header>
    <section className="atelier-chapter atelier-intro">
      <div className="atelier-topline">BASHAR AL-JABI / CREATIVE DEVELOPER</div>
      <div className="atelier-intro-title"><p>CRAFTED IN CODE. COMPOSED WITH PURPOSE.</p><h1>DIGITAL<br/><em>PERFUMER.</em></h1><div className="atelier-lead">I design, develop, and compose memorable digital experiences — one note at a time.</div></div>
      <a className="atelier-scroll" href="#philosophy">SCROLL TO DISCOVER <span>↓</span></a>
      <p className="atelier-index">01 / THE AWAKENING</p>
    </section>
    <section className="atelier-chapter atelier-chapter-two" id="philosophy">
      <div className="atelier-narrative"><span className="atelier-kicker">02 / THE PHILOSOPHY</span><h2>NOT JUST<br/>WEBSITES.<br/><em>DIGITAL SCENTS.</em></h2><p>First impressions are designed. Experiences are engineered. The most memorable brands leave a lasting digital signature.</p><div className="atelier-keywords"><span>VISUAL IDENTITY</span><span>INTERACTION DESIGN</span><span>FRONTEND ENGINEERING</span></div></div>
    </section>
    <section className="atelier-chapter atelier-chapter-three" id="formula">
      <div className="atelier-narrative"><span className="atelier-kicker">03 / THE FORMULA</span><h2>THREE NOTES.<br/><em>ONE DIGITAL<br/>COMPOSITION.</em></h2><div className="atelier-formula"><div><b>01 / TOP NOTES</b><strong>DESIGN</strong><span>Identity · UI/UX · Visual Direction</span></div><div><b>02 / HEART NOTES</b><strong>CODE</strong><span>Frontend · Interaction · Accessibility</span></div><div><b>03 / BASE NOTES</b><strong>IMPACT</strong><span>Strategy · Performance · Growth</span></div></div><a className="atelier-action" href="/#work">EXPLORE MY REAL WORK ↗</a></div>
    </section>
    <footer className="atelier-footer"><span>DIGITAL PERFUMER — CINEMATIC DEVELOPMENT STUDY</span><a href="/">BACK TO PORTFOLIO ↗</a></footer>
  </main>;
}
