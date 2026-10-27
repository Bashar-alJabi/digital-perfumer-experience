export default function HeroSection() {
  return (
    <div className="hero-layout">
      <div className="hero-topline">
        <span>Digital Perfumer</span>
        <span>By Bashar Al-Jabi</span>
      </div>
      <div className="hero-copy">
        <div className="signature-notes" aria-label="Top, Heart, Base notes">
          <i title="Top Note - Head" />
          <i title="Heart Note - Body" />
          <i title="Base Note - Soul" />
        </div>
        <h1>
          Digital <em>Perfumer</em>
          <span className="hero-period" aria-hidden="true">
            .
          </span>
        </h1>
        <p className="hero-tagline">
          Composing Digital Notes for Exceptional Brands
        </p>
        <p className="hero-profession">
          Frontend Developer, Web Designer, and Digital Marketer
        </p>
        <div className="hero-actions">
          <a href="#about" className="action-link">
            Meet the Perfumer <span aria-hidden="true">↗</span>
          </a>
          <a href="#work" className="action-link secondary">
            Explore My Work <span aria-hidden="true">↘</span>
          </a>
        </div>
      </div>
      <div className="hero-bottomline">
        <span>TOP / HEART / BASE</span>
        <a href="#philosophy" aria-label="Scroll to discover">
          <span className="scroll-mouse" />↓
        </a>
        <span>Eau De Code</span>
      </div>
    </div>
  );
}
