"use client";
import { notes } from "@/lib/portfolio-content";
import { useAtelier, setAtelier, seekChapterItem } from "@/lib/atelier-state";
export default function PhilosophySection() {
  const { note, enhanced } = useAtelier();
  return (
    <div className="philosophy-layout">
      <div className="manifesto">
        <p className="eyebrow">The Philosophy</p>
        <h2>
          I don&apos;t build
          <br />
          <span className="muted">websites.</span>
          <br />I compose
          <br />
          <em>digital scents.</em>
        </h2>
      </div>
      <div className="philosophy-notes">
        {notes.map((item, index) => (
          <article
            className="philosophy-note"
            key={item.number}
            data-selected={index === note}
          >
            <button
              className="note-heading"
              onClick={() => {
                setAtelier({ note: index });
                seekChapterItem("philosophy", index, 3);
              }}
              aria-expanded={!enhanced || index === note}
            >
              <span className={`note-dot dot-${index}`} />
              <span>
                {item.number} / {item.title}
              </span>
              <span aria-hidden="true">↗</span>
            </button>
            <div className="note-detail">
              <h3>{item.subtitle}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
