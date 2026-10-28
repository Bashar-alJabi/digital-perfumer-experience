"use client";
import { useEffect } from "react";

/** One card at a time, driven by a single reversible scroll timeline.
 * Explicit active index and display prevent the later DOM cards from
 * covering the first card while its sphere is expanding.
 */
export default function PhilosophyStage(){
  useEffect(()=>{
    const stage=document.getElementById("philosophy");
    if(!stage)return;
    const cards=Array.from(stage.querySelectorAll<HTMLElement>(".note-morph-card"));
    const manifesto=stage.querySelector<HTMLElement>(".philosophy-manifesto");
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const clamp=(v:number)=>Math.max(0,Math.min(1,v));
    const smooth=(a:number,b:number,v:number)=>{
      const x=clamp((v-a)/(b-a));
      return x*x*(3-2*x);
    };
    let raf=0;
    const render=()=>{
      raf=0;
      const bounds=stage.getBoundingClientRect();
      const progress=clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
      const index=Math.min(2,Math.floor(progress*3));
      const phase=progress===1?1:progress*3-index;
      const accessible=reduced.matches || innerWidth<768;
      cards.forEach((card,i)=>{
        if(accessible){
          card.style.removeProperty("display");
          card.style.removeProperty("opacity");
          card.style.removeProperty("visibility");
          card.style.removeProperty("z-index");
          card.style.setProperty("--note-unfold","1");
          card.style.setProperty("--note-text","1");
          card.setAttribute("data-note-active","true");
          return;
        }
        const active=i===index;
        // Exactly one visible card; each has a complete birth, hold and dissolve.
        const unfold=smooth(.025,.30,phase)*(1-smooth(.79,.99,phase));
        const text=smooth(.29,.43,phase)*(1-smooth(.72,.91,phase));
        const presence=smooth(0,.075,phase)*(1-smooth(.92,1,phase));
        card.style.display=active?"block":"none";
        card.style.visibility=active?"visible":"hidden";
        card.style.opacity=active?String(presence):"0";
        card.style.zIndex=active?"5":"0";
        card.style.setProperty("--note-unfold",unfold.toFixed(4));
        card.style.setProperty("--note-text",text.toFixed(4));
        card.setAttribute("data-note-active",String(active&&unfold>.95));
      });
      if(manifesto){
        const start=smooth(0,.13,progress);
        const end=smooth(.84,1,progress);
        const depth=1-start+end;
        manifesto.style.setProperty("--manifesto-depth",clamp(depth).toFixed(4));
        manifesto.style.setProperty("--manifesto-orbit",(progress*20).toFixed(2));
      }
      stage.style.setProperty("--philosophy-stage",progress.toFixed(4));
    };
    const tick=()=>{if(!raf)raf=requestAnimationFrame(render)};
    tick();
    window.addEventListener("scroll",tick,{passive:true});
    window.addEventListener("resize",tick);
    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll",tick);
      window.removeEventListener("resize",tick);
      cards.forEach(card=>{
        for(const key of ["display","visibility","opacity","z-index","--note-unfold","--note-text"]){
          card.style.removeProperty(key);
        }
        card.removeAttribute("data-note-active");
      });
      manifesto?.style.removeProperty("--manifesto-depth");
      manifesto?.style.removeProperty("--manifesto-orbit");
      stage.style.removeProperty("--philosophy-stage");
    };
  },[]);
  return null;
}
