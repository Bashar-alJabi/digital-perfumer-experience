import { formulaNotes } from "@/lib/experience/formulaNotes";
export default function FormulaSection() {
  return (
    <div className="scene-stage formula-stage">
      <div className="scene-heading">
        <div>
          <p className="eyebrow">COMPOSITION / 01</p>
          <h2>
            THE <em>FORMULA</em>
          </h2>
        </div>
        <p>
          Three notes.
          <br />
          One digital composition.
        </p>
      </div>
      <div className="formula-layout">
        <div className="formula-ingredients">
          {formulaNotes.map((n) => (
            <div className="formula-ingredient" key={n.number}>
              <span>{n.number}</span>
              <h3>{n.title}</h3>
              <p>
                {n.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </p>
            </div>
          ))}
        </div>
        <div className="bottle-space">
          <div className="bottle-fallback" aria-hidden="true">
            <div />
          </div>
          <div className="bottle-label">
            <p>EAU DE</p>
            <h3>
              DIGITAL
              <br />
              PERFUMER
            </h3>
            <span className="identity-dots">
              <i />
              <i />
              <i />
            </span>
            <p>COMPOSITION No. 01</p>
          </div>
        </div>
        <div className="formula-result">
          <span>TOP + HEART + BASE</span>
          <h3>
            DIGITAL
            <br /> <em>EXPERIENCE</em>
          </h3>
        </div>
      </div>
    </div>
  );
}
