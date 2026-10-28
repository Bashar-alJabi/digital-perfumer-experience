"use client";

import { useEffect, useRef, useState } from "react";
import SignatureWorld, { CHAPTERS, type JourneyState, type ChapterId } from "./SignatureWorld";
import "./cinematic.css";

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(a:number,b:number,x:number)=>{
  const t=clamp((x-a)/(b-a));
  return t*t*(3-2*t);
};
const viewportPoint=(el:Element):[number,number]=>{
  const rect=el.getBoundingClientRect();
  return [((rect.left+rect.width/2)/window.innerWidth-.5)*2,
    ((rect.top+rect.height/2)/window.innerHeight-.5)*2];
};
function visibleElements(selector:string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(el=>{
    const rect=el.getBoundingClientRect();
    return rect.width>2&&rect.height>2&&getComputedStyle(el).visibility!=="hidden";
  });
}
function locate(id:ChapterId):[number,number][]{
  if(id==="home")return visibleElements('#home [title$="Note - Head"], #home [title$="Note - Body"], #home [title$="Note - Soul"]').slice(0,3).map(viewportPoint);
  if(id==="philosophy")return visibleElements("#philosophy .space-y-8 > div").slice(0,3).map(viewportPoint);
  if(id==="formula"){
    const bottle=visibleElements('#formula [class*="h-117"], #formula [class*="h-105"]')[0];
    return bottle?[viewportPoint(bottle)]:[[0,0]];
  }
  if(id==="impact")return visibleElements("#impact .aspect-square").slice(0,4).map(viewportPoint);
  if(id==="work"){
    const candidates=visibleElements("#work .dp-card-title");
    const closest=candidates.sort((a,b)=>{
      const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();
      const distance=(r:DOMRect)=>Math.abs(r.top+r.height/2-window.innerHeight*.5)+Math.abs(r.left+r.width/2-window.innerWidth*.5)*.35;
      return distance(ra)-distance(rb);
    })[0];
    return closest?[viewportPoint(closest)]:[[0,0]];
  }
  if(id==="contact"){
    const heading=visibleElements("#contact h2")[0];
    if(heading){const [x,y]=viewportPoint(heading);return [[x+.18,y+.13],[x+.24,y+.13],[x+.3,y+.13]];}
  }
  return [];
}
const resting:JourneyState={
  chapter:0,local:0,dark:0,ready:0,pointer:[0,0],targets:[],
};
export default function CinematicDirector(){
  const flow=useRef<JourneyState>({...resting});
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const check=()=>setReduced(media.matches);
    check();media.addEventListener("change",check);
    return()=>media.removeEventListener("change",check);
  },[]);
  useEffect(()=>{
    const main=document.querySelector<HTMLElement>("main.cinematic-site");
    if(!main)return;
    const sections=CHAPTERS.map(id=>document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const headings=sections.map(section=>section.querySelector<HTMLElement>("h1, h2"));
    let frame=0;
    let running=true;
    let currentActive=-1;
    let readyFrame=0;
    let handoff=true;
    const startReady=()=>{
      if(!handoff)return;
      handoff=false;
      const start=performance.now();
      const step=(now:number)=>{
        if(!running)return;
        flow.current.ready=smooth(0,900,now-start);
        if(flow.current.ready<1)readyFrame=requestAnimationFrame(step);
      };
      readyFrame=requestAnimationFrame(step);
    };
    window.addEventListener("dp:loader-handoff",startReady);
    const render=()=>{
      frame=0;
      if(!running)return;
      const h=window.innerHeight;
      const anchor=h*.5;
      const rects=sections.map(el=>el.getBoundingClientRect());
      let active=rects.findIndex(rect=>rect.top<=anchor&&rect.bottom>=anchor);
      if(active<0)active=rects.findIndex(rect=>rect.top>anchor);
      if(active<0)active=sections.length-1;
      const rect=rects[active];
      const local=clamp((anchor-rect.top)/Math.max(1,rect.height));
      const id=CHAPTERS[active];
      flow.current.chapter=active;
      flow.current.local=local;
      flow.current.targets=locate(id);
      const memory=rects[6];
      const arrival=smooth(-h*.4,h*.75,h*.5-memory.top);
      const departure=smooth(-h*.3,h*.7,memory.bottom-h*.5);
      const dark=arrival*departure;
      flow.current.dark=dark;
      main.style.setProperty("--cn-dark",dark.toFixed(3));
      main.classList.toggle("cn-in-memory",dark>.45);
      if(active!==currentActive){
        currentActive=active;
        main.dataset.activeChapter=id;
      }
      sections.forEach((section,i)=>{
        const heading=headings[i];
        if(!heading)return;
        const r=rects[i];
        // Original text stays in the document and remains accessible.
        // Its three-dimensional entrance and exit follows the same section clock as WebGL.
        const enter=i===0?1:smooth(-h*.2,h*.65,h*.78-r.top);
        const leave=smooth(-h*.25,h*.55,h*.53-r.bottom);
        const t=enter*(1-leave);
        if(reduced){
          heading.style.transform="";
          heading.style.opacity="";
          heading.style.filter="";
        }else{
          const before=(1-enter),after=leave;
          const z=-170*before-145*after;
          const y=62*before-95*after;
          const x=(i%2?1:-1)*(35*before+55*after);
          const rx=17*before-11*after;
          const ry=(i%2?1:-1)*(-12*before+13*after);
          heading.style.transform=`perspective(1300px) translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
          heading.style.opacity=t.toFixed(3);
          heading.style.filter=`blur(${((1-t)*2.4).toFixed(2)}px)`;
        }
      });
      // Animate existing note cards, instead of drawing fake 3D UI cards on top.
      const noteCards=visibleElements("#philosophy .space-y-8 > div");
      noteCards.forEach((card,i)=>{
        const r=card.getBoundingClientRect();
        const intensity=active===1?1-Math.min(1,Math.abs(r.top+r.height/2-anchor)/h):0;
        card.style.setProperty("--cn-note-glow",Math.max(0,intensity*.7).toFixed(3));
        card.classList.toggle("cn-note-current",active===1&&intensity>.3);
      });
      // A corresponding real circle gets the energy when the original stats arrive.
      const circles=visibleElements("#impact .aspect-square");
      circles.forEach((circle,i)=>{
        const v=active===4?smooth(i*.12,i*.12+.37,local):0;
        circle.style.setProperty("--cn-circle-progress",v.toFixed(3));
      });
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};
    const pointer=(event:PointerEvent)=>{
      flow.current.pointer=[(event.clientX/window.innerWidth-.5)*2,(event.clientY/window.innerHeight-.5)*2];
    };
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);
    window.addEventListener("pointermove",pointer,{passive:true});
    schedule();
    // In case a fast navigation or React remount missed the loading handoff.
    if(document.querySelector('[aria-label="Entering Digital Perfumer"]')===null)startReady();
    return()=>{
      running=false;
      cancelAnimationFrame(frame);cancelAnimationFrame(readyFrame);
      window.removeEventListener("scroll",schedule);
      window.removeEventListener("resize",schedule);
      window.removeEventListener("pointermove",pointer);
      window.removeEventListener("dp:loader-handoff",startReady);
      main.style.removeProperty("--cn-dark");
      main.classList.remove("cn-in-memory");
      headings.forEach(el=>{if(!el)return;el.style.removeProperty("transform");el.style.removeProperty("opacity");el.style.removeProperty("filter");});
    };
  },[reduced]);
  return <div className="cn-scene" aria-hidden="true">
    <div className="cn-ambient cn-ambient-day"/>
    <div className="cn-ambient cn-ambient-night"/>
    <SignatureWorld flow={flow} reduced={reduced}/>
    <div className="cn-light-leak"/>
    <div className="cn-grain"/>
  </div>;
}
