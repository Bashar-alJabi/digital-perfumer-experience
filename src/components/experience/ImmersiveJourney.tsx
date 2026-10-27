"use client";

import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Html, Sparkles, Float } from "@react-three/drei";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./journey.css";

type Chapter = { id:string; label:string; title:string; detail:string };
const chapters: Chapter[] = [
  {id:"arrival",label:"01 / THE AWAKENING",title:"DIGITAL PERFUMER",detail:"CREATIVE DEVELOPMENT · WEB DESIGN · DIGITAL STRATEGY"},
  {id:"philosophy",label:"02 / THE PHILOSOPHY",title:"EVERY EXPERIENCE HAS A SIGNATURE",detail:"I don't just build websites. I compose digital experiences."},
  {id:"formula",label:"03 / THE COMPOSITION",title:"DESIGN × CODE × IMPACT",detail:"Three notes. One complete digital composition."},
  {id:"work",label:"04 / SELECTED CREATIONS",title:"WORLDS BUILT WITH PURPOSE",detail:"Real projects. Designed, developed, and brought to life."},
  {id:"craft",label:"05 / INSIDE THE CRAFT",title:"THE ART OF ENGINEERING",detail:"The tools behind the feeling."},
  {id:"creator",label:"06 / THE CREATOR",title:"BEHIND THE EXPERIENCE",detail:"Bashar Al-Jabi — Frontend Developer, Web Designer & Digital Marketer."},
  {id:"signature",label:"07 / THE SIGNATURE",title:"LET'S COMPOSE SOMETHING EXTRAORDINARY",detail:"Every memorable experience begins with a conversation."},
];
const projects = [
  {name:"Sustayn",type:"CORPORATE DIGITAL EXPERIENCE",image:"/projects/sustayn.webp",url:"https://sustayn.co/"},
  {name:"Success School",type:"EDUCATION PLATFORM",image:"/projects/success-school.webp",url:"https://success-school.net/"},
  {name:"Formation Avenir",type:"LEARNING EXPERIENCE",image:"/projects/formation-avenir.webp",url:"https://formationavenir.com/"},
  {name:"Home of Feelings",type:"CREATIVE DEVELOPMENT",image:"/projects/home-of-feelings.webp",url:"https://home-of-feelings.vercel.app/"},
];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const windowed=(p:number,a:number,b:number,fade=.075)=>clamp((p-a)/fade)*clamp((b-p)/fade);
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const rose="#f36a83",violet="#8e8bff";

function FragranceArtifact({p,reduced}:{p:React.RefObject<number>;reduced:boolean}) {
  const group=useRef<THREE.Group>(null);
  const rings=useRef<THREE.Group>(null);
  const particles=useRef<THREE.Points>(null);
  const core=useRef<THREE.Mesh>(null);
  const count=1900;
  const {geometry,origin,target}=useMemo(()=>{
    const origin=new Float32Array(count*3),target=new Float32Array(count*3);
    for(let i=0;i<count;i++){
      const t=i/count, theta=i*2.39996323, y=1-t*2, radius=Math.sqrt(Math.max(0,1-y*y));
      const r=1.15+.18*Math.sin(i*11.24);
      origin[i*3]=radius*Math.cos(theta)*r;
      origin[i*3+1]=y*1.7;
      origin[i*3+2]=radius*Math.sin(theta)*r;
      target[i*3]=((i%50)/49-.5)*6;
      target[i*3+1]=(Math.floor(i/50)/37-.5)*3.7;
      target[i*3+2]=-.8+(i%7)*-.19;
    }
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(origin.slice(),3));
    return {geometry,origin,target};
  },[]);
  useFrame((s,d)=>{
    if(!group.current||!rings.current||!particles.current||!core.current)return;
    const progress=p.current;
    const morph=THREE.MathUtils.smoothstep(progress,.13,.31);
    const become=THREE.MathUtils.smoothstep(progress,.36,.45);
    const returnHome=THREE.MathUtils.smoothstep(progress,.84,.94);
    group.current.position.set(mix(0,-3.3,become)+3.3*returnHome,.3*Math.sin(progress*10),mix(0,-5,become)+5*returnHome);
    group.current.scale.setScalar(mix(1,.6,become)+.4*returnHome);
    group.current.rotation.y=mix(group.current.rotation.y,progress*5+(reduced?0:s.clock.elapsedTime*.035),.06);
    rings.current.rotation.z+=reduced?0:d*.06;
    rings.current.rotation.x=progress*.4;
    const mat=core.current.material as THREE.MeshPhysicalMaterial;
    mat.opacity=mix(.31,.07,morph)+.24*returnHome;
    const position=particles.current.geometry.attributes.position as THREE.BufferAttribute;
    const blend=morph*(1-returnHome);
    for(let i=0;i<count*3;i++)(position.array as Float32Array)[i]=mix(origin[i],target[i],blend);
    position.needsUpdate=true;
  });
  return <group ref={group}>
    <group>
      <mesh ref={core}>
        <cylinderGeometry args={[.9,1.1,2.8,10,1]}/>
        <meshPhysicalMaterial color="#acb7ef" metalness={.16} roughness={.09} transparent opacity={.31} transmission={.72} thickness={1.4} depthWrite={false} side={THREE.DoubleSide}/>
      </mesh>
      <mesh position={[0,1.59,0]}><cylinderGeometry args={[.4,.4,.49,10]}/><meshStandardMaterial metalness={.85} roughness={.19} color="#adb8c9"/></mesh>
      <mesh position={[0,1.87,0]}><boxGeometry args={[.94,.22,.94]}/><meshStandardMaterial metalness={.8} roughness={.2} color="#28344e"/></mesh>
      <group ref={rings}>
        {[0,1,2].map(i=><group key={i} position={[0,(i-1)*.76,0]}>
          <mesh rotation={[Math.PI/2,0,.3+i*.2]}>
            <torusGeometry args={[.56+i*.09,.028,10,110]}/>
            <meshStandardMaterial color={i===0?rose:i===1?violet:"#d1e2ff"} emissive={i===0?rose:i===1?violet:"#d1e2ff"} emissiveIntensity={2}/>
          </mesh>
          <mesh><icosahedronGeometry args={[.14+i*.05,2]}/><meshStandardMaterial color="#e3e4ff" emissive={i===0?rose:violet} emissiveIntensity={2}/></mesh>
        </group>)}
      </group>
      <points ref={particles} geometry={geometry}><pointsMaterial size={.023} color="#ffd0e3" transparent opacity={.89} sizeAttenuation depthWrite={false}/></points>
      <mesh rotation={[0,.6,.1]}><torusKnotGeometry args={[1.55,.012,160,6,2,5]}/><meshBasicMaterial color={violet} transparent opacity={.25} depthWrite={false}/></mesh>
    </group>
  </group>;
}
function SpatialPanel({title,subtitle,position,rotation=[0,0,0],color=rose}:{title:string;subtitle:string;position:[number,number,number];rotation?:[number,number,number];color?:string}){
  return <group position={position} rotation={rotation}>
    <mesh><planeGeometry args={[3.45,1.85]}/><meshPhysicalMaterial color="#172037" transparent opacity={.72} metalness={.55} roughness={.14} side={THREE.DoubleSide} depthWrite={false}/></mesh>
    <mesh position={[0,.71,.015]}><planeGeometry args={[3.15,.018]}/><meshBasicMaterial color={color}/></mesh>
    <Html transform occlude={false} distanceFactor={2.95} position={[0,0,.06]} center className="journey-spatial-html">
      <div className="journey-spatial-label"><small>COMPOSITION / DIGITAL ATELIER</small><strong>{title}</strong><span>{subtitle}</span></div>
    </Html>
  </group>;
}
function PhilosophyWorld({p}:{p:React.RefObject<number>}){
  const ref=useRef<THREE.Group>(null);
  useFrame((_,d)=>{if(!ref.current)return;const v=windowed(p.current,.13,.41,.065);ref.current.visible=v>.004;ref.current.scale.setScalar(THREE.MathUtils.damp(ref.current.scale.x,.76+.24*v,3,d));ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,-2+(1-v)*-2,3,d);});
  return <group ref={ref}>
    <SpatialPanel title="DESIGN" subtitle="Identity · Typography · UI / UX" position={[-3,1.1,-2]} rotation={[0,.22,0]}/>
    <SpatialPanel title="DEVELOPMENT" subtitle="Code · Motion · Interaction" position={[2.65,-.5,-4]} rotation={[0,-.25,0]} color={violet}/>
    <SpatialPanel title="EXPERIENCE" subtitle="Where ideas become interfaces" position={[-1,-2.3,-7]} rotation={[0,.11,0]} color="#b3cbff"/>
  </group>;
}
function CompositionWorld({p}:{p:React.RefObject<number>}){
  const root=useRef<THREE.Group>(null);
  useFrame((_,d)=>{if(!root.current)return;const v=windowed(p.current,.29,.56,.06);root.current.visible=v>.003;root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,p.current*2,2,d);root.current.scale.setScalar(THREE.MathUtils.damp(root.current.scale.x,.35+v*.65,3,d));});
  return <group ref={root} position={[0,0,-4]}>
    {[0,1,2].map(i=><group key={i} position={[0,(1-i)*1.45,0]}>
      <mesh rotation={[Math.PI/2,.1,i*.5]}><torusGeometry args={[1.6,.035,10,128]}/><meshStandardMaterial color={[rose,violet,"#b9d3ff"][i]} emissive={[rose,violet,"#b9d3ff"][i]} emissiveIntensity={1.4}/></mesh>
      <mesh><sphereGeometry args={[.26,24,24]}/><meshPhysicalMaterial color={[rose,violet,"#b9d3ff"][i]} metalness={.3} roughness={.14} emissive={[rose,violet,"#b9d3ff"][i]} emissiveIntensity={.45}/></mesh>
    </group>)}
    <Html transform position={[2.7,1.6,.4]} distanceFactor={3.2}><div className="journey-note"><b>01 / TOP NOTES</b>DESIGN</div></Html>
    <Html transform position={[-4,.15,.4]} distanceFactor={3.2}><div className="journey-note"><b>02 / HEART NOTES</b>CODE</div></Html>
    <Html transform position={[2.7,-1.55,.4]} distanceFactor={3.2}><div className="journey-note"><b>03 / BASE NOTES</b>IMPACT</div></Html>
  </group>;
}
function ProjectWorld({p}:{p:React.RefObject<number>}){
  const ref=useRef<THREE.Group>(null);
  useFrame((_,d)=>{
    if(!ref.current)return;
    const v=windowed(p.current,.43,.74,.055);
    ref.current.visible=v>.001;
    ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,-7+v*3,2.8,d);
    ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,(p.current-.57)*.95,2.3,d);
  });
  return <group ref={ref}>
    {projects.map((project,i)=>{
      const x=(i%2===0?-1:1)*2.4,y=i<2?1.55:-1.55;
      return <group key={project.name} position={[x,y,-(i%2)*1.45]} rotation={[0,i%2===0?.18:-.18,0]}>
        <mesh><planeGeometry args={[4.1,2.5]}/><meshStandardMaterial color="#182036" metalness={.4} roughness={.3} side={THREE.DoubleSide}/></mesh>
        <Html transform distanceFactor={3.45} center position={[0,0,.05]} occlude={false}>
          <a className="journey-project" href={project.url} target="_blank" rel="noopener noreferrer">
            <img src={project.image} alt="" loading="lazy"/>
            <div><small>{project.type}</small><strong>{project.name}</strong><span>EXPLORE PROJECT ↗</span></div>
          </a>
        </Html>
      </group>;
    })}
  </group>;
}
function ToolkitWorld({p}:{p:React.RefObject<number>}){
  const ref=useRef<THREE.Group>(null);
  const labels=["NEXT.JS","REACT","THREE.JS","TYPESCRIPT","UI / UX","GSAP","SEO","PERFORMANCE"];
  useFrame((state,delta)=>{
    if(!ref.current)return;
    const v=windowed(p.current,.65,.88,.05);
    ref.current.visible=v>.001;
    ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,(p.current-.71)*1.3,2,delta);
    ref.current.scale.setScalar(.6+.4*v);
  });
  return <group ref={ref} position={[0,0,-3]}>
    {labels.map((label,i)=>{
      const angle=i*Math.PI*2/labels.length, x=Math.sin(angle)*3.3,y=Math.cos(angle)*2.2;
      return <group key={label} position={[x,y,i%2?-.6:.5]}>
        <mesh><boxGeometry args={[1.7,.65,.08]}/><meshStandardMaterial color="#1a2540" metalness={.55} roughness={.25}/></mesh>
        <Html transform center position={[0,0,.052]} distanceFactor={2.3}><span className="journey-skill">{label}</span></Html>
      </group>;
    })}
    <mesh><icosahedronGeometry args={[.75,2]}/><meshPhysicalMaterial color="#a3a2fa" transparent opacity={.28} metalness={.1} roughness={.2} transmission={.6}/></mesh>
  </group>;
}
const cameraStops:[number,number,number][]=[
  [0,.1,9], [1.5,.6,6.5],[-.6,0,4.7],[0,1.2,8.5],[.2,0,9.2],[-.5,.3,7.2],[0,0,9.1],[0,0,9]
];
function CameraRig({p}:{p:React.RefObject<number>}){
  useFrame(({camera},dt)=>{
    const n=clamp(p.current)*(cameraStops.length-1),i=Math.min(Math.floor(n),cameraStops.length-2),t=THREE.MathUtils.smootherstep(n-i,0,1);
    const a=cameraStops[i],b=cameraStops[i+1];
    const dest=new THREE.Vector3(mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t));
    camera.position.lerp(dest,1-Math.exp(-dt*4.5));
    camera.lookAt(0,0,-2);
  });
  return null;
}
function Scene({p,reduced,active}:{p:React.RefObject<number>;reduced:boolean;active:number}){
  return <Canvas dpr={[1,1.65]} camera={{position:[0,0,9],fov:43}} gl={{powerPreference:"high-performance",antialias:true}} fallback={<div className="journey-fallback"/>}>
    <color attach="background" args={["#080b15"]}/>
    <fog attach="fog" args={["#080b15",12,35]}/>
    <ambientLight intensity={.75}/>
    <pointLight position={[3,4,6]} color="#fcbacf" intensity={60} distance={18}/>
    <pointLight position={[-4,-2,3]} color={violet} intensity={50} distance={17}/>
    <CameraRig p={p}/>
    <Suspense fallback={null}>
      <FragranceArtifact p={p} reduced={reduced}/>
      {active===1 && <PhilosophyWorld p={p}/>}
      {active===2 && <CompositionWorld p={p}/>}
      {active===3 && <ProjectWorld p={p}/>}
      {active===4 && <ToolkitWorld p={p}/>}
      {!reduced&&<Sparkles count={120} scale={[17,9,15]} size={1.5} speed={.13} opacity={.32} color="#a1a9ee"/>}
    </Suspense>
  </Canvas>;
}
export default function ImmersiveJourney(){
  const host=useRef<HTMLElement>(null);
  const p=useRef(0);
  const [reduce,setReduce]=useState(false);
  const [active,setActive]=useState(0);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn=()=>setReduce(media.matches);
    fn();media.addEventListener("change",fn);
    return ()=>media.removeEventListener("change",fn);
  },[]);
  useEffect(()=>{
    if(!host.current)return;
    gsap.registerPlugin(ScrollTrigger);
    const elements=Array.from(host.current.querySelectorAll<HTMLElement>(".journey-chapter"));
    const update=(progress:number)=>{
      p.current=progress;
      const index=Math.min(chapters.length-1,Math.floor(Math.max(0,progress*chapters.length-0.0001)));
      setActive(previous=>previous===index?previous:index);
      const position=Math.min(progress*chapters.length,chapters.length-.00001);
      elements.forEach((section,index)=>{
        const local=position-index;
        const inside=local>=0&&local<1;
        const fadeIn=index===0?1:THREE.MathUtils.smoothstep(local,0,.17);
        const fadeOut=index===chapters.length-1?1:1-THREE.MathUtils.smoothstep(local,.79,1);
        const visibility=inside?(reduce?1:fadeIn*fadeOut):0;
        const outgoing=local>.5;
        gsap.set(section,{
          autoAlpha:visibility,
          yPercent:reduce?0:(outgoing?-1:1)*(1-visibility)*13,
          scale:reduce?1:.88+.12*visibility,
          rotateX:reduce?0:(outgoing?8:-8)*(1-visibility),
          pointerEvents:visibility>.94?"auto":"none",
        });
        section.setAttribute("aria-hidden",visibility>.94?"false":"true");
        if(index===3) {
          const canvas=host.current?.querySelector<HTMLElement>(".journey-world");
          if(canvas) canvas.style.pointerEvents=visibility>.82?"auto":"none";
        }
      });
    };
    const trigger=ScrollTrigger.create({
      trigger:host.current,
      start:"top top",
      end:"bottom bottom",
      onUpdate:self=>update(self.progress),
      onRefresh:self=>update(self.progress),
    });
    update(trigger.progress);
    return ()=>{trigger.kill();elements.forEach(el=>gsap.set(el,{clearProps:"all"}));};
  },[reduce]);
  return <main ref={host} className="journey">
    <div className="journey-world"><Scene p={p} reduced={reduce} active={active}/></div>
    <div className="journey-vignette" aria-hidden="true"/>
    <header className="journey-nav"><a href="#arrival">DP<span>·</span></a><span>THE DIGITAL ATELIER</span><a href="/">MAIN PORTFOLIO ↗</a></header>
    <nav className="journey-progress" aria-label="Chapters">{chapters.map((c,i)=><a key={c.id} href={"#"+c.id} aria-label={c.label}><span>{String(i+1).padStart(2,"0")}</span></a>)}</nav>
    <div className="journey-scroll-track" aria-hidden="true">{chapters.map((chapter,i)=><div key={chapter.id} id={chapter.id} className="journey-scroll-anchor" style={{top:`${(i+.5)/chapters.length*100}%`}} />)}</div>
    <div className="journey-chapters">{chapters.map((chapter,i)=><section key={chapter.id} className={"journey-chapter journey-scene-"+i}>
      <div className="journey-copy">
        <p className="journey-label">{chapter.label}</p>
        <h1 className="journey-title">{i===0?<>DIGITAL<br/><em>PERFUMER.</em></>:i===2?<>DESIGN.<br/>CODE.<br/><em>IMPACT.</em></>:chapter.title}</h1>
        <p className="journey-caption">{chapter.detail}</p>
        {i===2&&<div className="journey-sub">TOP NOTES / DESIGN &nbsp; · &nbsp; HEART NOTES / DEVELOPMENT &nbsp; · &nbsp; BASE NOTES / GROWTH</div>}
        {i===3&&<p className="journey-sub">Explore the floating projects — select any screen to visit the live work.</p>}
        {i===5&&<p className="journey-sub">I combine visual storytelling, frontend engineering and digital strategy to create websites that look remarkable and perform.</p>}
        {i===6&&<div className="journey-actions"><a href="mailto:hello@digitalperfumer.example" onClick={e=>e.preventDefault()} aria-disabled="true" className="journey-disabled">CONTACT DETAILS IN PORTFOLIO</a><a href="/#contact">START A CONVERSATION ↗</a><a href="/#work">ALL PROJECTS ↗</a></div>}
      </div>
      {i===0&&<a href="#philosophy" className="journey-scroll">SCROLL TO ENTER <span>↓</span></a>}
      <div className="journey-counter">{String(i+1).padStart(2,"0")} / 07</div>
    </section>)}</div>
    <footer className="journey-footer"><span>DIGITAL PERFUMER / AN IMMERSIVE CREATIVE DEVELOPMENT EXPERIENCE</span><a href="/">BACK TO THE PORTFOLIO ↗</a></footer>
  </main>;
}
