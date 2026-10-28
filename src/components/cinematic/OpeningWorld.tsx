"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./opening.css";

const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const ease=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const COLORS=["#f36371","#ffc3d3","#262029"];
/** Three authored digital threads. Each filament starts at the actual 3D sphere,
 * retains a short history of its movement, and shares its exact signature color.
 * Unlike decorative tubes, the lines can't drift independently of the spheres.
 */
function Filament({index,progress,source}:{index:number;progress:React.RefObject<number>;source:React.RefObject<THREE.Vector3[]>}){
  const COUNT=56;
  const history=useRef<THREE.Vector3[]>([]);
  const line=useMemo(()=>{
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(COUNT*3),3));
    geometry.setDrawRange(0,COUNT);
    const material=new THREE.LineBasicMaterial({
      color:COLORS[index],transparent:true,opacity:0,depthWrite:false,
      blending:THREE.NormalBlending,
    });
    return new THREE.Line(geometry,material);
  },[index]);
  useFrame((_,dt)=>{
    const head=source.current[index];
    if(!head)return;
    const trail=history.current;
    if(!trail.length){
      for(let i=0;i<COUNT;i++)trail.push(head.clone());
    }
    // Time-based following avoids unstable or jagged trails when scrolling quickly.
    const follow=1-Math.exp(-Math.min(dt,.05)*11);
    trail[0].lerp(head,follow);
    for(let i=1;i<COUNT;i++){
      const drag=1-Math.exp(-Math.min(dt,.05)*(11-i*.095));
      trail[i].lerp(trail[i-1],Math.max(.07,drag));
    }
    const attr=line.geometry.getAttribute("position") as THREE.BufferAttribute;
    for(let i=0;i<COUNT;i++){
      const p=trail[i];
      attr.setXYZ(i,p.x,p.y,p.z);
    }
    attr.needsUpdate=true;
    const motion=trail[0].distanceTo(trail[COUNT-1]);
    const section=ease(0,.16,progress.current)*(1-.3*ease(.82,1,progress.current));
    (line.material as THREE.LineBasicMaterial).opacity=(.36+Math.min(.32,motion*.2))*(.55+.45*section);
  });
  return <primitive object={line}/>;
}
function Pearl({index,progress,ready,source}:{index:number;progress:React.RefObject<number>;ready:React.RefObject<number>;source:React.RefObject<THREE.Vector3[]>}){
  const root=useRef<THREE.Group>(null);
  const trail=useRef<THREE.Mesh>(null);
  const material=useMemo(()=>new THREE.MeshPhysicalMaterial({
    color:COLORS[index],metalness:index===2?.45:.1,roughness:.12,
    clearcoat:1,clearcoatRoughness:.08,ior:1.45,thickness:.8,
    transmission:index===2?.0:.16,
  }),[index]);
  useFrame(({clock},delta)=>{
    if(!root.current)return;
    const p=progress.current,entry=ease(0,.12,p),exit=ease(.34,.88,p);
    const position=new THREE.Vector3(
      (index-1)*1.75+Math.sin(clock.elapsedTime*.38+index*2)*.11,
      Math.sin(index*2.1+clock.elapsedTime*.34)*.32,
      index===1?1.25:index===2?-.42:.28
    );
    position.x+=(index-1)*exit*.72;
    position.y+=exit*(index===0?1.55:index===1?-.12:-1.65);
    position.z+=exit*(index===0?.4:index===1?-1:.8);
    const alpha=1-Math.exp(-delta*5.4);
    root.current.position.lerp(position,alpha);
    source.current[index].copy(root.current.position);
    root.current.rotation.y+=delta*.21;
    root.current.rotation.z=Math.sin(clock.elapsedTime*.34+index)*.11;
    const scale=(.69+index*.06)*(1-ease(.62,1,p)*.52)*ready.current;
    root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x,scale,alpha));
    if(trail.current){
      trail.current.scale.setScalar(1.4+entry*.25);
      (trail.current.material as THREE.MeshBasicMaterial).opacity=(.13+.08*entry)*(1-exit);
    }
  });
  return <group ref={root}>
    <mesh material={material}><sphereGeometry args={[.8,48,32]}/></mesh>
    <mesh position={[-.18,.24,.56]} scale={[.27,.4,.09]}>
      <sphereGeometry args={[1,18,12]}/><meshBasicMaterial color="#fffaff" transparent opacity={.38} depthWrite={false}/>
    </mesh>
    <mesh ref={trail} rotation={[1.14,.3,index*.45]}>
      <torusGeometry args={[1.04,.012,6,96]}/>
      <meshBasicMaterial color={index===2?"#f6bfcf":COLORS[index]} transparent opacity={.17} depthWrite={false}/>
    </mesh>
  </group>;
}
function Scene({progress,ready}:{progress:React.RefObject<number>;ready:React.RefObject<number>}){
  const cloud=useRef<THREE.Points>(null);
  const notePositions=useRef([new THREE.Vector3(-1.75,0,.28),new THREE.Vector3(0,0,1.25),new THREE.Vector3(1.75,0,-.42)]);
  const dust=useMemo(()=>{
    const positions=new Float32Array(330*3);
    for(let i=0;i<330;i++){
      const a=i*2.399963,r=Math.sqrt((i+.5)/330)*4.4;
      positions[3*i]=r*Math.cos(a);positions[3*i+1]=r*Math.sin(a)*.72;
      positions[3*i+2]=Math.sin(i*13.37)*1.9-1.2;
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(positions,3));return g;
  },[]);
  useFrame(({camera,clock},dt)=>{
    const p=progress.current;
    camera.position.z=THREE.MathUtils.damp(camera.position.z,9.5-ease(.06,.9,p)*2.15,2.8,dt);
    camera.position.y=THREE.MathUtils.damp(camera.position.y,ease(.25,.98,p)*.3,2.8,dt);
    camera.lookAt(0,0,0);
    if(cloud.current){
      cloud.current.rotation.z=clock.elapsedTime*.012;
      (cloud.current.material as THREE.PointsMaterial).opacity=.4*(1-ease(.5,.98,p))*ready.current;
    }
  });
  return <>
    <ambientLight intensity={1.8}/>
    <directionalLight position={[-3,5,6]} intensity={3.1} color="#fff9fa"/>
    <pointLight position={[2,2,3]} color="#f36371" intensity={25} distance={12}/>
    <pointLight position={[-3,-1,2]} color="#ffffff" intensity={14} distance={9}/>
    {[0,1,2].map(i=><Pearl key={i} index={i} progress={progress} ready={ready} source={notePositions}/>)}
    {[0,1,2].map(i=><Filament key={i} index={i} progress={progress} source={notePositions}/>)}
    <points ref={cloud} geometry={dust}>
      <pointsMaterial color="#bd6b83" size={.026} opacity={.35} transparent depthWrite={false}/>
    </points>
  </>;
}
export default function OpeningWorld(){
  const progress=useRef(0),ready=useRef(0);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(media.matches);
    update();media.addEventListener("change",update);
    const onReady=()=>{ready.current=1;};
    window.addEventListener("dp:opening-ready",onReady);
    const loader=document.querySelector('[aria-label="Entering Digital Perfumer"]') as HTMLElement|null;
    if(!loader||getComputedStyle(loader).display==="none")ready.current=1;
    return()=>{media.removeEventListener("change",update);window.removeEventListener("dp:opening-ready",onReady);};
  },[]);
  useEffect(()=>{
    const hero=document.getElementById("home");
    const philosophy=document.getElementById("philosophy");
    if(!hero||!philosophy)return;
    let pending=0;
    const update=()=>{
      pending=0;
      const rect=hero.getBoundingClientRect();
      const philosophyRect=philosophy.getBoundingClientRect();
      progress.current=clamp(-rect.top/Math.max(1,rect.height-window.innerHeight*.2));
      const show=clamp((philosophyRect.bottom-window.innerHeight*.1)/Math.max(1,window.innerHeight*.6));
      hero.style.setProperty("--opening-world-visibility",show.toFixed(3));
      hero.style.setProperty("--opening-progress",progress.current.toFixed(4));
    };
    const onScroll=()=>{if(!pending)pending=requestAnimationFrame(update)};
    update();
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",onScroll);
    return()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);cancelAnimationFrame(pending)};
  },[]);
  if(reduced)return null;
  return <div className="opening-world" aria-hidden="true">
    <div className="opening-ambient"/>
    <Canvas dpr={[1,1.5]} camera={{position:[0,0,9.5],fov:46,near:.1,far:50}}
      gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} fallback={<div/>}>
      <Scene progress={progress} ready={ready}/>
    </Canvas>
    <div className="opening-vignette"/>
  </div>;
}
