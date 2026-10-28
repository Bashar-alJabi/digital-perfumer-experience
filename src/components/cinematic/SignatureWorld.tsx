"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** One continuous visual language: the three notes change purpose with each chapter.
 * Nothing here renders project cards or duplicate copy: the original DOM owns both.
 */
export type ChapterId = "home"|"philosophy"|"formula"|"about"|"impact"|"work"|"memory"|"skills"|"contact";
export const CHAPTERS: ChapterId[] = ["home","philosophy","formula","about","impact","work","memory","skills","contact"];
export type JourneyState = {
  chapter: number;
  local: number;
  dark: number;
  ready: number;
  pointer: [number,number];
  targets: [number,number][]; // viewport-normalized coordinates for original design elements
};
const cl=(x:number)=>THREE.MathUtils.clamp(x,0,1);
const smooth=(a:number,b:number,v:number)=>THREE.MathUtils.smoothstep(v,a,b);
const morph=(a:number,b:number,t:number)=>THREE.MathUtils.lerp(a,b,t);
const NOTE_COLORS=["#f36371","#ffe1e7","#242029"];
const PROFILE=[
  new THREE.Vector2(0,-.91),new THREE.Vector2(.24,-.88),new THREE.Vector2(.46,-.69),
  new THREE.Vector2(.54,-.33),new THREE.Vector2(.53,-.04),new THREE.Vector2(.42,.29),
  new THREE.Vector2(.27,.52),new THREE.Vector2(.13,.79),new THREE.Vector2(0,.96),
];
const tmp=new THREE.Vector3();
function worldPoint(x:number,y:number,aspect:number):[number,number] {
  const height=7.8;
  return [x*height*aspect*.5,-y*height*.5];
}
function destination(ch:number,i:number,local:number,aspect:number,targets:[number,number][]):[number,number,number] {
  const offset=i-1;
  // Targets are measured from real DOM positions. No imaginary interface cards.
  if(ch===0) {
    const t=targets[i] ?? [offset*.047,-.12];
    const [x,y]=worldPoint(t[0],t[1],aspect);
    return [x+offset*.1,y+.12,0.5];
  }
  if(ch===1) {
    const t=targets[i] ?? [.48,offset*.31];
    const [x,y]=worldPoint(t[0],t[1],aspect);
    return [x-.9,y,.25+i*.17];
  }
  if(ch===2) {
    const t=targets[0]??[0,0];
    const [x,y]=worldPoint(t[0],t[1],aspect);
    const release=smooth(.6,.95,local);
    return [x+offset*morph(.9,.13,release),y+2.4-i*1.2-release*.6,morph(.6,0,release)];
  }
  if(ch===3) return [2.25+offset*.18, .25+offset*.22, offset*.12];
  if(ch===4) {
    const t=targets[i]??[offset*.35,0];
    const [x,y]=worldPoint(t[0],t[1],aspect);
    return [x+.28*Math.cos(local*Math.PI*2+i*2),y+.28*Math.sin(local*Math.PI*2+i*2),.3];
  }
  if(ch===5) {
    const t=targets[0]??[0,0];
    const [x,y]=worldPoint(t[0],t[1],aspect);
    return [x+offset*1.9,y+(i===1?.95:-.8),-.25];
  }
  if(ch===6) return [offset*2.5+Math.sin(local*7+i*2)*.6, Math.sin(i*2.2+local*8)*2.2, -1+i*.34];
  if(ch===7) return [Math.cos(i*2.09+local*4)*2.6,Math.sin(i*2.09+local*4)*1.8,.2];
  const t=targets[i]??[offset*.1,0];
  const [x,y]=worldPoint(t[0],t[1],aspect);
  return [x,y,.65];
}
function Note({idx,flow,reduce}:{idx:number;flow:React.RefObject<JourneyState>;reduce:boolean}) {
  const group=useRef<THREE.Group>(null);
  const glass=useMemo(()=>new THREE.MeshPhysicalMaterial({
    color:NOTE_COLORS[idx], metalness:idx===2?.5:.04,roughness:.12,
    clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.8, transmission:0,
    thickness:.65,ior:1.45,depthWrite:false,
  }),[idx]);
  const core=useMemo(()=>new THREE.MeshStandardMaterial({
    color:NOTE_COLORS[idx],emissive:NOTE_COLORS[idx],emissiveIntensity:idx===2?.15:.62,
    metalness:.15,roughness:.27,transparent:true,opacity:.85,
  }),[idx]);
  useFrame(({clock,viewport},dt)=>{
    const g=group.current;
    if(!g)return;
    const f=flow.current;
    const aspect=viewport.aspect;
    const current=destination(f.chapter,idx,f.local,aspect,f.targets);
    const blend=smooth(.77,.99,f.local);
    const next=destination(Math.min(8,f.chapter+1),idx,0,aspect,f.targets);
    const a=morph(current[0],next[0],blend),b=morph(current[1],next[1],blend),c=morph(current[2],next[2],blend);
    const alpha=1-Math.exp(-dt*(reduce?12:5.5));
    const wiggle=reduce?0:Math.sin(clock.elapsedTime*.78+idx*2.15)*.075;
    g.position.lerp(tmp.set(a,b+wiggle,c),alpha);
    g.rotation.z=morph(g.rotation.z,reduce?0:Math.sin(clock.elapsedTime*.38+idx)*.23,alpha);
    g.rotation.y=morph(g.rotation.y,(f.chapter===6?f.local*2.1:clock.elapsedTime*.15)*(reduce?0:1),alpha);
    let scale=f.chapter===0? .17+smooth(.03,.45,f.local)*.22
      :f.chapter===1?.3
      :f.chapter===2?.34
      :f.chapter===3?(idx===1?1.05:.12)
      :f.chapter===4?.18
      :f.chapter===5?.21
      :f.chapter===6?.14
      :f.chapter===7?.23:.22;
    scale*=f.ready;
    g.scale.setScalar(morph(g.scale.x,scale,alpha));
    const material=(g.children[0] as THREE.Mesh).material as THREE.Material;
    material.visible=f.ready>.01;
  });
  return <group ref={group}>
    <mesh material={glass}>
      <latheGeometry args={[PROFILE,32]}/>
    </mesh>
    <mesh material={core} scale={[.51,.65,.51]}><sphereGeometry args={[.7,24,16]}/></mesh>
    <mesh scale={[.47,.75,.47]} position={[-.12,.04,.23]}>
      <sphereGeometry args={[.47,20,12]}/>
      <meshBasicMaterial color="#fffafd" transparent opacity={idx===2?.02:.19} depthWrite={false}/>
    </mesh>
  </group>;
}
function Ribbon({index,flow}:{index:number;flow:React.RefObject<JourneyState>}) {
  const ref=useRef<THREE.Mesh>(null);
  const geo=useMemo(()=>{
    const pts:THREE.Vector3[]=[];
    for(let j=0;j<120;j++){
      const t=j/119*Math.PI*2;
      const r=1.05+.19*Math.sin(t*3+index*2);
      pts.push(new THREE.Vector3(
        Math.cos(t+index*.42)*r,
        Math.sin(t)*(.7+.1*index),
        Math.sin(t*2+index*2)*.37,
      ));
    }
    const curve=new THREE.CatmullRomCurve3(pts,true,"centripetal");
    return new THREE.TubeGeometry(curve,144,.014,5,true);
  },[index]);
  useFrame(({clock},dt)=>{
    const g=ref.current;
    if(!g)return;
    const f=flow.current;
    const desired=f.chapter===2?smooth(.05,.4,f.local)*(1-smooth(.85,1,f.local))
      :f.chapter===3?1:f.chapter===4?.4:f.chapter===7?.9:0;
    const m=g.material as THREE.MeshBasicMaterial;
    m.opacity=morph(m.opacity,desired*.4,.07);
    g.visible=m.opacity>.004;
    g.rotation.y+=dt*(f.chapter===3?.4:.16);
    g.rotation.z=clock.elapsedTime*.045+index*2;
    g.position.x=f.chapter===3?2.2:0;
  });
  return <mesh ref={ref} geometry={geo}>
    <meshBasicMaterial color={NOTE_COLORS[index]} transparent opacity={0} depthWrite={false}/>
  </mesh>;
}
function StatsOrbits({flow}:{flow:React.RefObject<JourneyState>}) {
  const items=useRef<(THREE.Mesh|null)[]>([]);
  useFrame(({viewport},dt)=>{
    const f=flow.current;
    const on=f.chapter===4;
    items.current.forEach((obj,i)=>{
      if(!obj)return;
      const target=f.targets[i]??[(i-1.5)*.23,0];
      const [x,y]=worldPoint(target[0],target[1],viewport.aspect);
      obj.position.lerp(tmp.set(x,y,-.7),1-Math.exp(-dt*6));
      const mat=obj.material as THREE.MeshBasicMaterial;
      mat.opacity=morph(mat.opacity,on?.2:0,.09);
      obj.visible=mat.opacity>.003;
      const grow=on?smooth(i*.13,i*.13+.35,f.local):0;
      obj.scale.setScalar(morph(obj.scale.x,.25+grow*.85,.11));
      obj.rotation.z=f.local*Math.PI*1.7+i;
    });
  });
  return <group>{[0,1,2,3].map((i)=><mesh key={i} ref={r=>{items.current[i]=r}}>
    <torusGeometry args={[1,.013,5,128,Math.PI*1.88]}/>
    <meshBasicMaterial color={i%2?"#d991a8":"#f36371"} transparent opacity={0} depthWrite={false}/>
  </mesh>)}</group>;
}
function MemoryDust({flow,reduced}:{flow:React.RefObject<JourneyState>;reduced:boolean}) {
  const ref=useRef<THREE.Points>(null);
  const geo=useMemo(()=>{
    const p=new Float32Array(380*3);
    for(let i=0;i<380;i++){
      const a=i*2.39996323,r=Math.sqrt(i/380)*5;
      p[i*3]=Math.cos(a)*r;
      p[i*3+1]=Math.sin(a)*r*.75;
      p[i*3+2]=Math.sin(i*1.37)*2-1.7;
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(p,3));return g;
  },[]);
  useFrame((_,dt)=>{
    if(!ref.current)return;
    const f=flow.current;
    const m=ref.current.material as THREE.PointsMaterial;
    const target=f.chapter===6?smooth(.02,.45,f.local)*.86:f.chapter===7?.2:0;
    m.opacity=morph(m.opacity,target,.075);
    ref.current.visible=m.opacity>.006;
    ref.current.rotation.z+=reduced?0:dt*.042;
    ref.current.scale.setScalar(morph(ref.current.scale.x,f.chapter===6?1.2:1,.06));
  });
  return <points ref={ref} geometry={geo}>
    <pointsMaterial size={.032} color="#ffd0df" transparent opacity={0} sizeAttenuation depthWrite={false}/>
  </points>;
}
function FrameEnergy({flow}:{flow:React.RefObject<JourneyState>}) {
  const ref=useRef<THREE.Group>(null);
  useFrame(({viewport},dt)=>{
    if(!ref.current)return;
    const f=flow.current;
    const target=f.targets[0]??[0,0], [x,y]=worldPoint(target[0],target[1],viewport.aspect);
    ref.current.position.lerp(tmp.set(x,y,-1),1-Math.exp(-dt*5));
    const active=f.chapter===5;
    const grow=active?.7+smooth(.1,.65,f.local)*.45:.2;
    ref.current.scale.setScalar(morph(ref.current.scale.x,grow,.1));
    ref.current.visible=active;
    ref.current.rotation.y=morph(ref.current.rotation.y,active?(f.local-.5)*.34:0,.08);
  });
  return <group ref={ref}>
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(4.4,2.8,.28)]}/>
      <lineBasicMaterial color="#f36371" transparent opacity={.56} depthWrite={false}/>
    </lineSegments>
    <mesh position={[0,1.42,.12]}>
      <boxGeometry args={[.52,.025,.025]}/>
      <meshBasicMaterial color="#fff1f5" transparent opacity={.64}/>
    </mesh>
  </group>;
}

/** Light stems connect the original Philosophy cards to their note, not to invented 3D cards. */
function NoteStems({flow}:{flow:React.RefObject<JourneyState>}) {
  const stems=useMemo(()=>[0,1,2].map(i=>{
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute("position",new THREE.BufferAttribute(new Float32Array(42*3),3));
    const material=new THREE.LineBasicMaterial({color:NOTE_COLORS[i],transparent:true,opacity:0,depthWrite:false});
    return new THREE.Line(geometry,material);
  }),[]);
  useFrame(({viewport})=>{
    const f=flow.current;
    const strength=f.chapter===1?smooth(.01,.24,f.local)*(1-smooth(.88,1,f.local)):0;
    stems.forEach((line,i)=>{
      const target=f.targets[i]??[.4,(i-1)*.32];
      const [x,y]=worldPoint(target[0],target[1],viewport.aspect);
      const pts=line.geometry.getAttribute("position") as THREE.BufferAttribute;
      for(let j=0;j<42;j++){
        const t=j/41;
        const curve= Math.sin(t*Math.PI);
        pts.setXYZ(j,
          morph(-1.9,x-.38,t)+curve*(i-1)*.55,
          morph(2.4,y,t)+curve*.6,
          morph(-1.5,.25,t)-curve*.7);
      }
      pts.needsUpdate=true;
      (line.material as THREE.LineBasicMaterial).opacity=strength*.38;
      line.visible=strength>.01;
    });
  });
  return <>{stems.map((line,i)=><primitive key={i} object={line}/>)}</>;
}
/** The actual Skills section summons a filament network from the dispersed memory dust. */
function SkillLoom({flow}:{flow:React.RefObject<JourneyState>}) {
  const root=useRef<THREE.Group>(null);
  const lines=useMemo(()=>{
    const nodes:Array<[number,number,number]>=[];
    for(let i=0;i<27;i++){
      const ring=i%3,angle=i*.72;
      nodes.push([Math.cos(angle)*(1.4+ring*.85),Math.sin(angle)*(1.1+ring*.54),(i%5)*-.32]);
    }
    const coords:number[]=[];
    nodes.forEach((node,i)=>{
      const next=nodes[(i+3)%nodes.length];
      coords.push(...node,...next);
      if(i%3===0)coords.push(...node,...nodes[(i+7)%nodes.length]);
    });
    const g=new THREE.BufferGeometry();
    g.setAttribute("position",new THREE.Float32BufferAttribute(coords,3));
    return {g,vertices:coords.length/3,nodes};
  },[]);
  useFrame((_,dt)=>{
    if(!root.current)return;
    const f=flow.current;
    const strength=f.chapter===7?smooth(0,.35,f.local)*(1-smooth(.88,1,f.local)):0;
    root.current.visible=strength>.004;
    root.current.position.x=THREE.MathUtils.damp(root.current.position.x,.65,2.1,dt);
    root.current.rotation.y+=(strength?dt*.06:0);
    const mesh=root.current.children[0] as THREE.LineSegments;
    const material=mesh.material as THREE.LineBasicMaterial;
    material.opacity=morph(material.opacity,strength*.48,.08);
    lines.g.setDrawRange(0,Math.floor(lines.vertices*strength/2)*2);
  });
  return <group ref={root} position={[.65,0,-2]}>
    <lineSegments geometry={lines.g}>
      <lineBasicMaterial color="#e4a9bf" transparent opacity={0} depthWrite={false}/>
    </lineSegments>
    {lines.nodes.filter((_,i)=>i%2===0).map((pos,i)=><mesh key={i} position={pos}>
      <sphereGeometry args={[.052,10,8]}/>
      <meshBasicMaterial color={i%3===0?"#f36371":"#d9b4d4"}/>
    </mesh>)}
  </group>;
}

function AtelierScene({flow,reduced}:{flow:React.RefObject<JourneyState>;reduced:boolean}) {
  useFrame(({camera},dt)=>{
    const f=flow.current;
    const x=f.chapter===1?-.3:f.chapter===3?-.8:f.chapter===6?.4:0;
    camera.position.x=morph(camera.position.x,x+f.pointer[0]*(reduced?0:.06),1-Math.exp(-dt*1.8));
    camera.position.y=morph(camera.position.y,f.chapter===2?.22:0,1-Math.exp(-dt*1.8));
    camera.position.z=morph(camera.position.z,9.4-(f.chapter===6?.9:.2)-Math.sin(f.local*Math.PI)*.38,1-Math.exp(-dt*2));
    camera.lookAt(0,0,0);
  });
  return <>
    <ambientLight intensity={1.2}/>
    <directionalLight color="#ffffff" position={[-3,5,7]} intensity={2.7}/>
    <pointLight color="#f36371" position={[2,3,3]} intensity={30} distance={14}/>
    <pointLight color="#b4a0ff" position={[-3,-2,2]} intensity={20} distance={12}/>
    {[0,1,2].map(i=><Note key={i} idx={i} flow={flow} reduce={reduced}/>)}
    {[0,1,2].map(i=><Ribbon key={i} index={i} flow={flow}/>)}
    <NoteStems flow={flow}/>
    <StatsOrbits flow={flow}/>
    <MemoryDust flow={flow} reduced={reduced}/>
    <SkillLoom flow={flow}/>
    <FrameEnergy flow={flow}/>
  </>;
}
export default function SignatureWorld({flow,reduced}:{flow:React.RefObject<JourneyState>;reduced:boolean}) {
  if(reduced)return null;
  return <div className="cn-webgl" aria-hidden="true">
    <Canvas dpr={[1,1.35]} camera={{fov:44,position:[0,0,9.2],near:.1,far:60}} gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} fallback={<div/>}>
      <AtelierScene flow={flow} reduced={reduced}/>
    </Canvas>
  </div>;
}
