"use client";
import { useEffect } from "react";

/** Three self-contained compositions, each born from its corresponding note.
 * Scroll is the timeline. At every instant exactly one note unfolds into a card.
 */
export default function PhilosophyStage(){
  useEffect(()=>{
    const section=document.getElementById("philosophy");
    if(!section)return;
    const cards=Array.from(section.querySelectorAll<HTMLElement>(".space-y-8 > div"));
    const heading=section.querySelector<HTMLElement>(".philosophy-manifesto");
    const clamp=(v:number)=>Math.max(0,Math.min(1,v));
    const smooth=(a:number,b:number,v:number)=>{const x=clamp((v-a)/(b-a));return x*x*(3-2*x)};
    const reduced=matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0;
    const update=()=>{
      frame=0;
      const bounds=section.getBoundingClientRect();
      const range=Math.max(1,bounds.height-innerHeight);
      const progress=clamp(-bounds.top/range);
      const spread=progress*3;
      cards.forEach((card,i)=>{
        // A note approaches -> becomes a rounded luminous panel -> reveals copy
        // -> folds into a note again, ready for the next composition.
        const local=spread-i;
        const unfold=smooth(-.05,.31,local)*(1-smooth(.67,1.05,local));
        const text=smooth(.14,.43,local)*(1-smooth(.68,.92,local));
        const sphere=1-unfold;
        card.style.setProperty("--note-unfold",unfold.toFixed(4));
        card.style.setProperty("--note-text",text.toFixed(4));
        card.style.setProperty("--note-sphere",sphere.toFixed(4));
        card.style.setProperty("--note-phase",clamp(local).toFixed(4));
        card.setAttribute("data-note-active",unfold>.16?"true":"false");
      });
      const stage=smooth(0,.16,progress)*(1-smooth(.88,1,progress));
      section.style.setProperty("--philosophy-stage",stage.toFixed(4));
      if(heading){
        const tilt=progress<.5?(1-smooth(0,.24,progress)):smooth(.74,1,progress);
        heading.style.setProperty("--manifesto-depth",tilt.toFixed(4));
        heading.style.setProperty("--manifesto-orbit",(progress*35).toFixed(2));
      }
      if(reduced.matches){
        cards.forEach(card=>{card.style.setProperty("--note-unfold","1");card.style.setProperty("--note-text","1");});
        section.style.setProperty("--philosophy-stage","1");
        heading?.style.setProperty("--manifesto-depth","0");
      }
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
    update();
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule);
    return()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll",schedule);
      window.removeEventListener("resize",schedule);
      cards.forEach(card=>{["--note-unfold","--note-text","--note-sphere","--note-phase"].forEach(p=>card.style.removeProperty(p));card.removeAttribute("data-note-active")});
      section.style.removeProperty("--philosophy-stage");
      heading?.style.removeProperty("--manifesto-depth");
      heading?.style.removeProperty("--manifesto-orbit");
    };
  },[]);
  return null;
}
