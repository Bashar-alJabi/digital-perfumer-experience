"use client";
import { useEffect, useRef } from "react";

/** A single, section-local signature thread. SVG coordinates are always measured
 * relative to Philosophy, not viewport pixels inside a scrolling container.
 */
export default function PhilosophyStage(){
  const paths=useRef<(SVGPathElement|null)[]>([]);
  useEffect(()=>{
    const section=document.getElementById("philosophy");
    if(!section)return;
    const cards=Array.from(section.querySelectorAll<HTMLElement>(".space-y-8 > div"));
    const heading=section.querySelector<HTMLElement>("h2");
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const clamp=(v:number)=>Math.max(0,Math.min(1,v));
    const ease=(v:number)=>{const t=clamp(v);return t*t*(3-2*t)};
    let frame=0;
    const update=()=>{
      frame=0;
      const sectionRect=section.getBoundingClientRect();
      const height=innerHeight;
      const anchors=cards.map((card,i)=>{
        const name=["Top Note","Heart Note","Base Note"][i];
        const dot=card.querySelector<HTMLElement>(`[title="${name}"]`);
        const r=(dot??card).getBoundingClientRect();
        return {x:r.left+r.width/2-sectionRect.left,y:r.top+r.height/2-sectionRect.top};
      });
      const cardReveals=cards.map((card,i)=>{
        const r=card.getBoundingClientRect();
        const progress=ease((height*.83-r.top)/(height*.48));
        const focus=1-Math.min(1,Math.abs(r.top+r.height*.5-height*.52)/(height*.8));
        card.style.setProperty("--cn-card-appear",progress.toFixed(3));
        card.style.setProperty("--cn-card-focus",Math.max(0,focus).toFixed(3));
        card.style.setProperty("--cn-note-highlight",Math.max(0,focus*progress).toFixed(3));
        const depth=(1-progress);
        card.style.setProperty("--cn-depth",depth.toFixed(3));
        card.classList.toggle("cn-note-illuminated",focus>.45&&progress>.6);
        // The first note arrives, then the heart, then the base.
        return progress;
      });
      const entered=ease((height*.82-sectionRect.top)/(height*.7));
      section.style.setProperty("--philosophy-progress",entered.toFixed(3));
      if(heading&&!reduced.matches){
        const intro=1-entered;
        heading.style.transform=`perspective(1300px) translate3d(0,${(intro*68).toFixed(1)}px,${(-intro*140).toFixed(1)}px) rotateX(${(intro*12).toFixed(1)}deg)`;
        heading.style.opacity=String(Math.max(.15,entered));
      }
      // A line only draws after its destination note is introduced.
      const targets=[anchors[1],anchors[2]];
      paths.current.forEach((path,i)=>{
        const from=anchors[i]??anchors[2],to=targets[i];
        if(!path||!from||!to)return;
        const sign=i===2?1:-1;
        const bend=Math.min(90,Math.abs(to.y-from.y)*.19);
        path.setAttribute("d",`M ${from.x} ${from.y} C ${from.x+sign*bend} ${from.y+(to.y-from.y)*.36}, ${to.x+sign*bend} ${from.y+(to.y-from.y)*.68}, ${to.x} ${to.y}`);
        const length=path.getTotalLength();
        const amount=ease((cardReveals[i+1]-.2)/.75);
        path.style.strokeDasharray=String(length);
        path.style.strokeDashoffset=String(length*(1-amount));
        path.style.opacity=String(reduced.matches?0:.72);
      });
    };
    const tick=()=>{if(!frame)frame=requestAnimationFrame(update)};
    tick();
    window.addEventListener("scroll",tick,{passive:true});
    window.addEventListener("resize",tick);
    return()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",tick);window.removeEventListener("resize",tick);
      heading?.style.removeProperty("transform");heading?.style.removeProperty("opacity");
      cards.forEach(card=>{card.style.removeProperty("--cn-card-appear");card.style.removeProperty("--cn-card-focus");card.style.removeProperty("--cn-note-highlight");card.style.removeProperty("--cn-depth");card.classList.remove("cn-note-illuminated")});
      section.style.removeProperty("--philosophy-progress");
    };
  },[]);
  return <svg className="philosophy-connection" aria-hidden="true" focusable="false">
    <path ref={e=>{paths.current[0]=e}} stroke="#f36371"/>
    <path ref={e=>{paths.current[1]=e}} stroke="#ffc3d3"/>
  </svg>;
}
