"use client";
import { useEffect } from "react";

/** A shared viewport clock for real Philosophy text/cards. Scroll remains reversible;
 * original words and interactive cards are never cloned into a competing canvas.
 */
export default function PhilosophyStage(){
  useEffect(()=>{
    const section=document.getElementById("philosophy");
    if(!section)return;
    const title=section.querySelector<HTMLElement>("h2");
    const cards=Array.from(section.querySelectorAll<HTMLElement>(".space-y-8 > div"));
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const clamp=(v:number)=>Math.max(0,Math.min(1,v));
    const update=()=>{
      frame=0;
      const h=window.innerHeight;
      const r=section.getBoundingClientRect();
      const prog=clamp((h*.88-r.top)/(h*.68));
      section.style.setProperty("--philosophy-progress",prog.toFixed(3));
      if(title&&!reduced.matches){
        const intro=1-prog;
        title.style.setProperty("transform",`perspective(1300px) translate3d(0,${(intro*70).toFixed(1)}px,${(-intro*180).toFixed(1)}px) rotateX(${(intro*15).toFixed(1)}deg)`);
        title.style.setProperty("opacity",Math.max(.08,prog).toFixed(3));
      }else if(title){
        title.style.removeProperty("transform");title.style.removeProperty("opacity");
      }
      cards.forEach((card,i)=>{
        const bounds=card.getBoundingClientRect();
        const appear=clamp((h*.9-bounds.top)/(h*.46));
        card.style.setProperty("--cn-card-appear",appear.toFixed(3));
        card.style.setProperty("--cn-card-focus",(1-Math.min(1,Math.abs((bounds.top+bounds.height/2)/h-.5)*1.7)).toFixed(3));
      });
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);
    return()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",schedule);
      window.removeEventListener("resize",schedule);
      title?.style.removeProperty("transform");
      title?.style.removeProperty("opacity");
      cards.forEach(c=>{c.style.removeProperty("--cn-card-appear");c.style.removeProperty("--cn-card-focus")});
      section.style.removeProperty("--philosophy-progress");
    };
  },[]);
  return null;
}
