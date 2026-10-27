export default function AboutSection() {
  return (
    <div className="about-layout">
      <p className="eyebrow">About The Perfumer</p>
      <h2>
        Blending design,
        <br />
        technology, and
        <br />
        growth into{" "}
        <em>
          digital
          <br className="desktop-break" /> experiences.
        </em>
      </h2>
      <div className="about-body">
        <p>
          I’m Bashar, a Frontend Developer, Web Designer, and Digital Marketer,
          creating digital experiences where design, technology, and business
          work together.
        </p>
        <blockquote>
          A beautiful website should do more than look good. It should perform,
          connect with people, and drive results.
        </blockquote>
        <div className="social-text">
          <a
            href="https://github.com/Bashar-alJabi"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/bashar-aljabi-engineer"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
        <a href="/cv/Bashar-Aljabi_CV.pdf" download className="action-link">
          Download CV <span aria-hidden="true">↓</span>
        </a>
      </div>
    </div>
  );
}
