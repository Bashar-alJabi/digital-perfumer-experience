"use client";
import { skillGroups } from "@/lib/experience/skillGroups";
import { useChapterSelection } from "@/components/experience/useChapterSelection";
export default function TechStackSection() {
  const [active, select] = useChapterSelection("skills", skillGroups.length);
  return (
    <div className="scene-stage skills-stage">
      <div className="scene-heading">
        <div>
          <p className="eyebrow">[ THE INGREDIENTS ]</p>
          <h2>
            Digital <em>Skills</em>
          </h2>
        </div>
        <p>
          The tools, technologies, and expertise I use to design, build, and
          grow digital experiences.
        </p>
      </div>
      <div className="skills-layout">
        <div className="skill-selector" aria-label="Skill categories">
          {skillGroups.map((g, i) => (
            <button
              type="button"
              key={g.id}
              aria-pressed={active === i}
              aria-controls={"skill-" + g.id}
              onClick={() => select(i)}
            >
              <span className="skill-code">{g.code}</span>
              <span>
                {g.categoryTitle}
                <small>{g.skills.length} Skills</small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div className="skill-cabinet">
          {skillGroups.map((g, i) => (
            <article
              key={g.id}
              id={"skill-" + g.id}
              className="skill-panel"
              data-visible={active === i}
            >
              <p className="eyebrow">
                [{g.code}] {g.subtitle}
              </p>
              <h3>{g.categoryTitle}</h3>
              <p>{g.description}</p>
              <div className="skill-tags">
                {g.skills.map((s) => (
                  <span className={s.highlight ? "highlight" : ""} key={s.name}>
                    {s.highlight && <i aria-hidden="true" />}
                    {s.name}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
