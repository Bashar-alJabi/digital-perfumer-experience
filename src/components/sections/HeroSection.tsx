"use client";
import HeroCanvas from "@/components/canvas/HeroCanvas";
import { motion } from "motion/react";
import { Component, type ReactNode, useEffect, useState } from "react";
class AtmosphereBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function HeroSection() {
  const [atmosphere, setAtmosphere] = useState(true);
  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    let visible = true;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setAtmosphere(
        visible &&
          !media.matches &&
          document.documentElement.dataset.motion !== "reduced",
      );
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(hero);
    media.addEventListener("change", update);
    addEventListener("experience-motion", update);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      removeEventListener("experience-motion", update);
    };
  }, []);
  return (
    <div className="hero-stage scene-stage">
      <AtmosphereBoundary>{atmosphere && <HeroCanvas />}</AtmosphereBoundary>
      <div className="hero-meta">
        <span>INDEPENDENT DIGITAL CRAFTSMAN</span>
        <span>DESIGN · TECHNOLOGY · GROWTH</span>
      </div>
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <div className="hero-eyebrow">
          <span className="identity-dots">
            <i />
            <i />
            <i />
          </span>
          <span>EAU DE CODE / COMPOSITION No. 01</span>
        </div>
        <h1 className="dp-hero-title">
          Digital
          <br />
          <em>Perfumer</em>
          <span className="hero-period">.</span>
        </h1>
        <p className="hero-tagline">
          Composing Digital Notes for Exceptional Brands
        </p>
        <div className="hero-actions">
          <a href="#about" className="pill pill-solid">
            Meet the Perfumer <span>↗</span>
          </a>
          <a href="#work" className="pill">
            Explore My Work <span>↗</span>
          </a>
        </div>
      </motion.div>
      <div className="hero-note-label" aria-hidden="true">
        <span>01 — TOP</span>
        <span>02 — HEART</span>
        <span>03 — BASE</span>
      </div>
      <div className="hero-fallback" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className="hero-bottom">
        <span>
          THREE NOTES.
          <br />
          ONE DIGITAL COMPOSITION.
        </span>
        <a href="#philosophy">
          SCROLL TO COMPOSE <span>↓</span>
        </a>
        <span>
          BASHAR AL-JABI
          <br />
          DIGITAL PERFUMER
        </span>
      </div>
    </div>
  );
}
