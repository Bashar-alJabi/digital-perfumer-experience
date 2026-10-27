"use client";
import { skillGroups } from "@/lib/portfolio-content";
import { setAtelier, useAtelier, seekChapterItem } from "@/lib/atelier-state";
export default function TechStackSection() {
  const { skill, enhanced } = useAtelier();
  return (
    <div className="skills-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">[ THE INGREDIENTS ]</p>
          <h2>
            Digital <em>Skills</em>
          </h2>
        </div>
        <p className="aside-copy">
          The tools, technologies, and expertise I use to design, build, and
          grow digital experiences.
        </p>
      </div>
      <div className="skills-cabinet">
        <div className="skill-selector" aria-label="Skill categories">
          {skillGroups.map((group, index) => (
            <button
              key={group.id}
              aria-pressed={skill === index}
              onClick={() => {
                setAtelier({ skill: index });
                if (enhanced) seekChapterItem("skills", index, 5);
                else
                  document
                    .getElementById(`skill-${group.id}`)
                    ?.scrollIntoView({ behavior: "instant" });
              }}
            >
              <span className="eyebrow">{group.code}</span>
              <span>
                {group.categoryTitle}
                <small>{group.skills.length} Skills</small>
              </span>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
        <div className="skill-panels">
          {skillGroups.map((group, index) => (
            <article
              id={`skill-${group.id}`}
              key={group.id}
              className="skill-panel"
              data-selected={skill === index}
            >
              <p className="eyebrow">
                [{group.code}] {group.subtitle}
              </p>
              <h3>{group.categoryTitle}</h3>
              <p>{group.description}</p>
              <ul className="skill-list">
                {group.skills.map((s) => (
                  <li key={s.name} data-highlight={s.highlight}>
                    {s.highlight && <span aria-hidden="true">✦ </span>}
                    {s.name}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
