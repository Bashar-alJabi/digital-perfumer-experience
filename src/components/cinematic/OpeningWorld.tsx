"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./opening.css";

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const COLORS=["#f36371","#ffc3d3","#262029"];
type Director={hero:number;entry:number;stage:number;anchor:[number,number];settle:[number,number];};
const INITIAL:[number,number,number][]=[[-1.75,0,.28],[0,0,1.25],[1.75,0,-.42]];

function Note({index,director,ready}:{index:number;director:React.RefObject<Director>;ready:React.RefObject<number>}){
  const group=useRef<THREE.Group>(null);
  const material=useMemo(()=>new THREE.MeshPhysicalMaterial({
    color:COLORS[index],metalness:index===2?.45:.1,roughness:.12,clearcoat:1,
    clearcoatRoughness:.08,ior:1.45,thickness:.8,transmission:index===2?0:.16,
  }),[index]);
  useFrame(({clock,camera},dt)=>{
    if(!group.current)return;
    const d=director.current;
    const c=camera as THREE.PerspectiveCamera;
    const phase=Math.min(2,Math.floor(d.stage*3));
    const local=d.stage>=1?1:d.stage*3-phase;
    const columnProgress=ease(0,1,d.entry);
    const hero=new THREE.Vector3(...INITIAL[index]);
    hero.x+=Math.sin(clock.elapsedTime*.27+index*1.7)*.07*(1-columnProgress);
    hero.y+=Math.sin(clock.elapsedTime*.3+index)*.11*(1-columnProgress);
    // All three travel BEHIND the presentation slot as a single ordered column.
    // The inactive notes are deliberately small and deep, not hanging at its edge.
    const depth=-1.2;
    const distance=c.position.z-depth;
    const halfH=Math.tan(THREE.MathUtils.degToRad(c.fov*.5))*distance;
    const halfW=halfH*c.aspect;
    const behind=new THREE.Vector3(d.anchor[0]*halfW+c.position.x,
      -d.anchor[1]*halfH+c.position.y+(.75-index*.75),depth);
    const destination=hero.clone().lerp(behind,columnProgress);
    const toWorld=(screen:[number,number],z:number)=>{
      const delta=c.position.z-z;
      const hh=Math.tan(THREE.MathUtils.degToRad(c.fov*.5))*delta;
      return new THREE.Vector3(screen[0]*hh*c.aspect+c.position.x,-screen[1]*hh+c.position.y,z);
    };
    const card=toWorld(d.anchor,2.1);
    const row=toWorld(d.settle,2.7);
    row.x+=(index-1)*.58;
    // On its own turn: approach, become card, fold back into a small note,
    // then descend into the growing horizontal three-note signature.
    let sphereSize=1;
    if(index<phase){
      destination.copy(row);
      sphereSize=.24;
    }else if(index===phase){
      const approach=ease(.015,.19,local);
      const forming=ease(.18,.34,local);
      const release=ease(.73,.95,local);
      destination.lerp(card,approach);
      destination.lerp(row,release);
      sphereSize=(1-forming)*(.9-.64*release)+release*.24;
    }else{
      sphereSize=.52;
    }
    const alpha=1-Math.exp(-Math.min(dt,.05)*7);
    group.current.position.lerp(destination,alpha);
    group.current.rotation.y+=dt*.18;
    const scale=(.69+index*.055)*sphereSize*ready.current;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x,scale,alpha));
  });
  return <group ref={group}>
    <mesh material={material}><sphereGeometry args={[.8,40,28]}/></mesh>
    <mesh position={[-.18,.23,.57]} scale={[.25,.36,.08]}>
      <sphereGeometry args={[1,16,12]}/>
      <meshBasicMaterial color="#fffaff" transparent opacity={.38} depthWrite={false}/>
    </mesh>
  </group>;
}
function Scene({director,ready}:{director:React.RefObject<Director>;ready:React.RefObject<number>}){
  const dust=useMemo(()=>{
    const array=new Float32Array(230*3);
    for(let i=0;i<230;i++){const a=i*2.399963,r=Math.sqrt((i+.5)/230)*4.2;
      array[i*3]=r*Math.cos(a);array[i*3+1]=r*Math.sin(a)*.7;array[i*3+2]=Math.sin(i*13.37)*1.5-1.5}
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(array,3));return g;
  },[]);
  useFrame(({camera,clock},dt)=>{
    const d=director.current,arrival=ease(0,1,d.entry);
    const c=camera as THREE.PerspectiveCamera;
    c.position.z=THREE.MathUtils.damp(c.position.z,9.5-arrival*1.25,2.3,dt);
    c.position.y=THREE.MathUtils.damp(c.position.y,-arrival*.26,2.3,dt);
    c.rotation.z=THREE.MathUtils.damp(c.rotation.z,arrival*.025,2.3,dt);
    c.lookAt(0,0,0);
  });
  return <>
    <ambientLight intensity={1.8}/>
    <directionalLight position={[-3,5,6]} intensity={3.1} color="#fff9fa"/>
    <pointLight position={[2,2,3]} color="#f36371" intensity={25} distance={12}/>
    <pointLight position={[-3,-1,2]} color="#ffffff" intensity={14} distance={9}/>
    {[0,1,2].map(i=><Note key={i} index={i} director={director} ready={ready}/>)}
    <points geometry={dust}>
      <pointsMaterial color="#bd6b83" size={.024} transparent opacity={.27} depthWrite={false}/>
    </points>
  </>;
}
export default function OpeningWorld(){
  const director=useRef<Director>({hero:0,entry:0,stage:0,anchor:[.44,0],settle:[.44,.64]});
  const ready=useRef(1);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const changed=()=>setReduced(media.matches);
    changed();media.addEventListener("change",changed);
    return()=>media.removeEventListener("change",changed);
  },[]);
  useEffect(()=>{
    const hero=document.getElementById("home");
    const philosophy=document.getElementById("philosophy");
    if(!hero||!philosophy)return;
    let raf=0;
    const update=()=>{
      raf=0;
      const h=innerHeight,rect=hero.getBoundingClientRect();
      const p=philosophy.getBoundingClientRect();
      const d=director.current;
      d.hero=clamp(-rect.top/Math.max(1,rect.height-h*.2));
      // Line-up starts while Hero is still pinned; no sudden crossing at boundary.
      d.entry=ease(.35,1,d.hero);
      d.stage=clamp(-p.top/Math.max(1,p.height-h));
      const slot=philosophy.querySelector<HTMLElement>("[data-philosophy-target]");
      const point=slot?.getBoundingClientRect();
      if(point){
        const cx=point.left+point.width*.5;
        d.anchor=[cx/innerWidth*2-1,(point.top+point.height*.5)/h*2-1];
        d.settle=[cx/innerWidth*2-1,(point.bottom+Math.min(55,h*.07))/h*2-1];
      }
      const show=clamp((p.bottom-h*.1)/(h*.55));
      hero.style.setProperty("--opening-progress",String(d.hero));
      hero.style.setProperty("--opening-world-visibility",String(show));
    };
    const scroll=()=>{if(!raf)raf=requestAnimationFrame(update)};
    update();window.addEventListener("scroll",scroll,{passive:true});
    window.addEventListener("resize",scroll);
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("scroll",scroll);window.removeEventListener("resize",scroll)};
  },[]);
  if(reduced)return null;
  return <div className="opening-world" aria-hidden="true">
    <div className="opening-ambient"/>
    <Canvas dpr={[1,1.5]} camera={{position:[0,0,9.5],fov:46,near:.1,far:50}}
      gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} fallback={<div/>}>
      <Scene director={director} ready={ready}/>
    </Canvas>
    <div className="opening-vignette"/>
  </div>;
}
