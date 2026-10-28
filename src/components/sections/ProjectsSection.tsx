"use client";
import { allProjects } from "@/lib/experience/allProjects";
import { useChapterSelection } from "@/components/experience/useChapterSelection";
import Image from "next/image";
import { useState } from "react";
export default function ProjectsSection() {
  const [tab, setTab] = useState("professional");
  const projects = allProjects.filter((p) => p.type === tab);
  const [active, select] = useChapterSelection("work", projects.length);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  return (
    <div className="scene-stage gallery-stage">
      <div className="scene-heading">
        <div>
          <p className="eyebrow">[ THE COMPOSITIONS ]</p>
          <h2>
            Real-World <em>Work</em>
          </h2>
        </div>
        <div className="gallery-tabs" aria-label="Project category">
          {["professional", "personal"].map((t) => (
            <button
              type="button"
              key={t}
              aria-pressed={tab === t}
              onClick={() => {
                setTab(t);
                select(0);
              }}
            >
              {t === "professional" ? "Professional" : "Personal"} (
              {allProjects.filter((p) => p.type === t).length})
            </button>
          ))}
        </div>
      </div>
      <div className="gallery-space">
        {allProjects.map((project) => (
          <article
            className="gallery-project"
            key={project.id}
            data-visible={
              project.type === tab &&
              active === projects.findIndex((p) => p.id === project.id)
            }
            aria-label={project.title}
          >
            <div className="project-window">
              <div className="window-chrome">
                <span className="identity-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{project.category}</span>
                <span>/{project.id}</span>
              </div>
              <div className="project-image">
                {project.customImage && !errors[project.id] ? (
                  <Image
                    src={project.customImage}
                    alt={project.title}
                    fill
                    sizes="(max-width: 767px) 90vw, 58vw"
                    className="object-cover object-top"
                    onError={() =>
                      setErrors((p) => ({ ...p, [project.id]: true }))
                    }
                  />
                ) : (
                  <div className="project-monogram">
                    <span>/{project.id}</span>
                    <p>{project.title}</p>
                  </div>
                )}
                {project.link && (
                  <a
                    className="image-visit"
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={"Visit " + project.title}
                  >
                    ↗
                  </a>
                )}
              </div>
            </div>
            <div className="project-story">
              <p className="eyebrow">
                {project.category} <span>/{project.id}</span>
              </p>
              <h3>
                {project.link ? (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.title}
                  </a>
                ) : (
                  project.title
                )}
              </h3>
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}
              <div className="project-tags">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="project-links">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Live Site ↗
                  </a>
                )}
                {project.codeLink && (
                  <a
                    href={project.codeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Source Code ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="gallery-controls">
        <p className="gallery-count" aria-live="polite">
          {String(active + 1).padStart(2, "0")}{" "}
          <span>/ {String(projects.length).padStart(2, "0")}</span>
        </p>
        <div className="gallery-index" aria-label="Choose a project">
          {projects.map((p, i) => (
            <button
              type="button"
              key={p.id}
              aria-label={p.title}
              aria-pressed={i === active}
              onClick={() => select(i)}
            >
              {String(i + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className="gallery-arrows">
          <button
            type="button"
            aria-label="Previous project"
            disabled={active === 0}
            onClick={() => select(active - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next project"
            disabled={active === projects.length - 1}
            onClick={() => select(active + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
