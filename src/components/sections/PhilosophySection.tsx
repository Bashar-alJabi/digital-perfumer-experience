import { notes } from "@/lib/experience/notes";
export default function PhilosophySection() {
  return (
    <div className="scene-stage philosophy-stage">
      <div className="manifesto">
        <p className="eyebrow">The Philosophy</p>
        <h2>
          I don&apos;t build
          <br />
          <span>websites.</span>
          <br />I compose
          <br />
          <em>digital scents.</em>
        </h2>
        <div className="note-index" aria-hidden="true">
          01 / 02 / 03 <span>THE ART OF COMPOSITION</span>
        </div>
      </div>
      <div className="notes-presentation">
        {notes.map((note, i) => (
          <article
            className={"note-card note-" + i}
            key={note.number}
            aria-label={note.title}
          >
            <div className="card-top">
              <span className="identity-dots">
                <i />
                <i />
                <i />
              </span>
              <span>{note.number} / 03</span>
            </div>
            <h3>{note.title}</h3>
            <p className="note-subtitle">{note.subtitle}</p>
            <p className="note-description">{note.text}</p>
            <span className="card-foot" aria-hidden="true">
              DIGITAL PERFUMER —{" "}
              {
                [
                  "THE FIRST IMPRESSION",
                  "THE LIVING EXPERIENCE",
                  "THE LASTING IMPACT",
                ][i]
              }
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
