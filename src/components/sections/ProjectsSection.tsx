"use client";
import Image from "next/image";
import { allProjects } from "@/lib/portfolio-content";
import { setAtelier, useAtelier, seekChapterItem } from "@/lib/atelier-state";

export default function ProjectsSection() {
  const { collection, project: selected } = useAtelier();
  const projects = allProjects.filter((project) => project.type === collection);
  const project = projects[Math.min(selected, projects.length - 1)];
  function choose(index: number) {
    setAtelier({ project: index });
    seekChapterItem("work", index, projects.length);
  }
  return (
    <div className="projects-layout">
      <div className="section-heading">
        <div>
          <p className="eyebrow">[ THE COMPOSITIONS ]</p>
          <h2>
            Real-World <em>Work</em>
          </h2>
        </div>
        <div className="collection-tabs" aria-label="Project collection">
          {(["professional", "personal"] as const).map((type) => (
            <button
              key={type}
              aria-pressed={collection === type}
              onClick={() => {
                setAtelier({ collection: type, project: 0 });
                seekChapterItem(
                  "work",
                  0,
                  allProjects.filter((p) => p.type === type).length,
                );
              }}
            >
              {type === "professional" ? "Professional" : "Personal"} (
              {allProjects.filter((p) => p.type === type).length})
            </button>
          ))}
        </div>
      </div>
      <div className="project-exhibit" aria-live="polite">
        <div className="project-info" key={project.id}>
          <span className="eyebrow">
            {project.category} <span className="project-id">/{project.id}</span>
          </span>
          <h3>{project.title}</h3>
          {project.description && (
            <p className="project-description">{project.description}</p>
          )}
          <ul className="project-tags">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <div className="project-links">
            {project.link && (
              <a
                className="action-link"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Site <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.codeLink && (
              <a
                className="action-link secondary"
                href={project.codeLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source Code <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
        <a
          className="project-image"
          href={project.link || project.codeLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${project.title}`}
        >
          {project.customImage ? (
            <Image
              src={project.customImage}
              alt={project.title}
              fill
              sizes="(max-width: 900px) 90vw, 52vw"
              className="project-screenshot"
            />
          ) : (
            <span className="project-monogram">{project.title}</span>
          )}
          <span className="project-image-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      </div>
      <div className="gallery-controls">
        <div className="gallery-position">
          <span>{String(projects.indexOf(project) + 1).padStart(2, "0")}</span>
          <span>/ {String(projects.length).padStart(2, "0")}</span>
        </div>
        <div className="gallery-titles" aria-label="Choose a project">
          {projects.map((p, index) => (
            <button
              key={p.id}
              aria-label={p.title}
              aria-pressed={p.id === project.id}
              onClick={() => choose(index)}
            >
              {p.id}
            </button>
          ))}
        </div>
        <div className="gallery-arrows">
          <button
            aria-label="Previous project"
            disabled={selected === 0}
            onClick={() => choose(selected - 1)}
          >
            ←
          </button>
          <button
            aria-label="Next project"
            disabled={selected >= projects.length - 1}
            onClick={() => choose(selected + 1)}
          >
            →
          </button>
        </div>
      </div>
      <noscript>
        <div className="project-index">
          {allProjects.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.category}</p>
              <p>{item.description}</p>
              <p>{item.tags.join(" · ")}</p>
              {item.link && <a href={item.link}>Live Site ↗</a>}{" "}
              {item.codeLink && <a href={item.codeLink}>Source Code ↗</a>}
            </article>
          ))}
        </div>
      </noscript>
    </div>
  );
}
