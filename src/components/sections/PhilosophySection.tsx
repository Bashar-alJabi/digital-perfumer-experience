"use client";

import PhilosophyStage from "@/components/cinematic/PhilosophyStage";

const notes = [
  {number:"01",title:"TOP NOTES",subtitle:"First Impression — How your brand is seen",text:"Crafting bespoke brand identity, UI/UX design, visual direction, typography, and landing pages that capture immediate emotional resonance.",color:"top"},
  {number:"02",title:"HEART NOTES",subtitle:"The Experience — How your brand is experienced",text:"Transforming design into fluid digital reality through responsive frontend engineering, interactive motion, accessibility, and high performance.",color:"heart"},
  {number:"03",title:"BASE NOTES",subtitle:"Lasting Impact — How your brand grows",text:"Building lasting growth through digital strategy, advertising campaigns, SEO, conversion optimization, and continuous improvement.",color:"base"},
];
export default function PhilosophySection(){
  return <section className="philosophy-morph-section relative text-perfume-text">
    <PhilosophyStage/>
    <div className="philosophy-morph-stage">
      <div className="philosophy-morph-layout">
        <div className="philosophy-manifesto">
          <p className="dp-label font-semibold uppercase tracking-[0.4em] text-perfume-text/60">The Philosophy</p>
          <h2 className="dp-section-title mt-8 font-normal leading-[0.95] tracking-tight text-perfume-text">
            I don&apos;t build<br/><span className="text-perfume-text/40">websites.</span><br/>
            I compose<br/><span className="italic text-perfume-primary">digital scents.</span>
          </h2>
        </div>
        <div className="philosophy-morph-slot" data-philosophy-target="true">
          {notes.map((note,i)=><article key={note.number} className={`philosophy-morph-card note-${note.color}`} data-morph-index={i} aria-hidden={i!==0}>
            <div className="philosophy-morph-body">
              <span className="philosophy-morph-number" aria-hidden="true">{note.number}</span>
              <div className="philosophy-note-dots" aria-hidden="true">
                <span/><span/><span/>
              </div>
              <h3 className="dp-card-title font-normal">{note.title}</h3>
              <p className="dp-small mt-2 font-medium uppercase tracking-[0.3em]">{note.subtitle}</p>
              <p className="dp-body mt-6 max-w-md font-light leading-relaxed">{note.text}</p>
            </div>
          </article>)}
        </div>
      </div>
    </div>
  </section>;
}
