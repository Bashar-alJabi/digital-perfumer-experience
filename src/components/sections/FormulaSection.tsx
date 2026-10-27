import { formulaNotes } from "@/lib/portfolio-content";
export default function FormulaSection() {
  return (
    <div className="formula-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">COMPOSITION / 01</p>
          <h2>
            THE <em>FORMULA</em>
          </h2>
        </div>
        <p className="aside-copy">
          Three notes.
          <br />
          One digital composition.
        </p>
      </div>
      <div className="formula-composition">
        {formulaNotes.map((note, index) => (
          <div
            className={`formula-note formula-note-${index}`}
            key={note.number}
            data-formula-note={index}
          >
            <span className="eyebrow">
              {note.number} — {note.title}
            </span>
            <ul>
              {note.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="formula-bottle-label">
          <span>EAU DE</span>
          <strong>
            DIGITAL
            <br />
            PERFUMER
          </strong>
          <span>COMPOSITION No. 01</span>
        </div>
      </div>
      <div className="formula-equation">
        <p className="eyebrow">TOP + HEART + BASE</p>
        <p>DIGITAL EXPERIENCE</p>
      </div>
    </div>
  );
}
