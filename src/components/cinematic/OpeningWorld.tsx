"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import "./opening.css";

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
const COLORS=["#f36371","#ffc3d3","#262029"];
type Director={hero:number;entry:number;stage:number;anchor:[number,number];};
const INITIAL:[number,number,number][]=[[-1.75,0,.28],[0,0,1.25],[1.75,0,-.42]];

function Note({index,director,ready}:{index:number;director:React.RefObject<Director>;ready:React.RefObject<number>}){
  const group=useRef<THREE.Group>(null);
  const ring=useRef<THREE.Mesh>(null);
  const material=useMemo(()=>new THREE.MeshPhysicalMaterial({
    color:COLORS[index],metalness:index===2?.45:.1,roughness:.12,clearcoat:1,
    clearcoatRoughness:.08,ior:1.45,thickness:.8,transmission:index===2?0:.16,
  }),[index]);
  useFrame(({clock,camera},dt)=>{
    if(!group.current)return;
    const d=director.current;
    const sceneCamera=camera as THREE.PerspectiveCamera;
    const phase=Math.min(2,Math.floor(d.stage*3));
    const local=d.stage===1?1:d.stage*3-phase;
    const arrange=ease(0,1,d.entry);
    // Hero: a horizontal signature. Transition: a genuine vertical constellation,
    // ordered coral -> pink -> dark, travelling into Philosophy as a single motif.
    const hero=new THREE.Vector3(...INITIAL[index]);
    hero.x+=Math.sin(clock.elapsedTime*.28+index*1.8)*.07*(1-arrange);
    hero.y+=Math.sin(clock.elapsedTime*.33+index)*.12*(1-arrange);
    const column=new THREE.Vector3(-.15,1.9-index*1.8,.5);
    const destination=hero.clone().lerp(column,arrange);
    // Destination is the exact center of the ONE shared card slot.
    const depth=2.2;
    const distance=sceneCamera.position.z-depth;
    const halfH=Math.tan(THREE.MathUtils.degToRad(sceneCamera.fov*.5))*distance;
    const halfW=halfH*sceneCamera.aspect;
    const cardTarget=new THREE.Vector3(d.anchor[0]*halfW+sceneCamera.position.x,
      -d.anchor[1]*halfH+sceneCamera.position.y,depth);
    // Only the current sphere flies from vertical formation to its card.
    const arrival=index===phase?ease(0,.21,local):index<phase?1:0;
    if(index===phase)destination.lerp(cardTarget,arrival);
    else if(index<phase)destination.lerp(cardTarget,1);
    const unfold=index===phase?ease(.16,.36,local):index<phase?1:0;
    const visibility=index<phase?0:index===phase?1-unfold:1;
    const fadeToNext=index===phase?1-ease(.8,.97,local):1;
    const alpha=1-Math.exp(-Math.min(dt,.05)*5.8);
    group.current.position.lerp(destination,alpha);
    group.current.rotation.y+=dt*.17;
    const targetScale=(.68+index*.055)*visibility*fadeToNext*ready.current;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x,targetScale,alpha));
    if(ring.current)(ring.current.material as THREE.MeshBasicMaterial).opacity=.16*visibility*fadeToNext;
  });
  return <group ref={group}>
    <mesh material={material}><sphereGeometry args={[.8,40,28]}/></mesh>
    <mesh position={[-.18,.23,.57]} scale={[.25,.36,.08]}>
      <sphereGeometry args={[1,16,12]}/>
      <meshBasicMaterial color="#fffaff" transparent opacity={.38} depthWrite={false}/>
    </mesh>
    <mesh ref={ring} rotation={[1.14,.3,index*.45]}>
      <torusGeometry args={[1.04,.012,6,80]}/>
      <meshBasicMaterial color={COLORS[index]} transparent opacity={.16} depthWrite={false}/>
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
  const director=useRef<Director>({hero:0,entry:0,stage:0,anchor:[.44,0]});
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
      if(point)d.anchor=[(point.left+point.width*.5)/innerWidth*2-1,(point.top+point.height*.5)/h*2-1];
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
