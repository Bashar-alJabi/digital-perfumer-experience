"use client";
import { useEffect } from "react";

/** Three cards remain in normal document flow. Each card assembles in place,
 * sequentially, when its own marker enters the cinematic viewport.
 */
export default function PhilosophyStage(){
  useEffect(()=>{
    const section=document.getElementById("philosophy");
    if(!section)return;
    const cards=Array.from(section.querySelectorAll<HTMLElement>(".note-morph-card"));
    const manifesto=section.querySelector<HTMLElement>(".philosophy-manifesto");
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    const clamp=(v:number)=>Math.max(0,Math.min(1,v));
    const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x)};
    let frame=0;
    const render=()=>{
      frame=0;
      const h=innerHeight;
      const mobile=innerWidth<768||reduced.matches;
      const r=section.getBoundingClientRect();
      const entered=ease((h*.88-r.top)/(h*.72));
      section.style.setProperty("--philosophy-stage",entered.toFixed(4));
      cards.forEach((card,i)=>{
        const box=card.getBoundingClientRect();
        // One ordered stage per card: 0->1. Retain the fully formed previous cards.
        const t=mobile?1:ease((h*.86-box.top)/(h*.58));
        const previous=i===0?1:ease((h*.48-cards[i-1].getBoundingClientRect().top)/(h*.55));
        const progress=i===0?t:Math.min(t,previous);
        const text=mobile?1:ease((progress-.53)/.33);
        card.style.setProperty("--note-unfold",progress.toFixed(4));
        card.style.setProperty("--note-text",text.toFixed(4));
        card.style.setProperty("--note-visible","1");
        card.style.removeProperty("display");
        card.style.removeProperty("visibility");
        card.style.removeProperty("opacity");
        card.style.removeProperty("z-index");
        card.removeAttribute("data-note-active");
      });
      if(manifesto){
        const depth=mobile?0:1-entered;
        manifesto.style.setProperty("--manifesto-depth",depth.toFixed(4));
      }
    };
    const tick=()=>{if(!frame)frame=requestAnimationFrame(render)};
    tick();window.addEventListener("scroll",tick,{passive:true});window.addEventListener("resize",tick);
    return()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",tick);window.removeEventListener("resize",tick);
      cards.forEach(card=>{["--note-unfold","--note-text","--note-visible"].forEach(key=>card.style.removeProperty(key));});
      section.style.removeProperty("--philosophy-stage");
      manifesto?.style.removeProperty("--manifesto-depth");
    };
  },[]);
  return null;
}
