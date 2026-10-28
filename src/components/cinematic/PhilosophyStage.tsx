"use client";
import { useEffect } from "react";

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
/** Scroll drives a single physical presentation slot:
 * 0 Top unfolds, folds out; 1 Heart unfolds, folds out; 2 Base unfolds.
 * One card can ever be visible. The 3D sphere hand-off uses the same clock.
 */
export default function PhilosophyStage(){
  useEffect(()=>{
    const section=document.getElementById("philosophy");
    if(!section)return;
    const cards=Array.from(section.querySelectorAll<HTMLElement>(".philosophy-morph-card"));
    const heading=section.querySelector<HTMLElement>(".philosophy-manifesto");
    let raf=0;
    const media=matchMedia("(prefers-reduced-motion: reduce)");
    const render=()=>{
      raf=0;
      const rect=section.getBoundingClientRect();
      const progress=clamp(-rect.top/Math.max(1,rect.height-innerHeight));
      const accessible=media.matches||innerWidth<768;
      const phase=Math.min(2,Math.floor(progress*3));
      const local=progress>=1?1:progress*3-phase;
      const unfold=accessible?1:ease(.08,.3,local)*(1-ease(.73,.93,local));
      const content=accessible?1:ease(.23,.4,local)*(1-ease(.7,.86,local));
      cards.forEach((card,i)=>{
        const active=accessible||i===phase;
        card.style.setProperty("--morph-open",active?String(unfold):"0");
        card.style.setProperty("--morph-text",active?String(content):"0");
        card.style.setProperty("--morph-visibility",active?"1":"0");
        card.style.display=active?"block":"none";
        card.setAttribute("aria-hidden",String(!active));
        if(!accessible)card.style.zIndex=active?"2":"0";
      });
      section.style.setProperty("--morph-progress",String(progress));
      section.style.setProperty("--morph-index",String(phase));
      section.style.setProperty("--morph-local",String(local));
      heading?.style.setProperty("--manifesto-depth",String(accessible?0:1-ease(0,.25,progress)));
    };
    const onScroll=()=>{if(!raf)raf=requestAnimationFrame(render)};
    render();
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",onScroll);
    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll",onScroll);
      window.removeEventListener("resize",onScroll);
      cards.forEach(card=>{
        for(const name of ["--morph-open","--morph-text","--morph-visibility","display","z-index"])card.style.removeProperty(name);
        card.removeAttribute("aria-hidden");
      });
      heading?.style.removeProperty("--manifesto-depth");
    };
  },[]);
  return null;
}
