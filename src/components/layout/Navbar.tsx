"use client";
import { useEffect, useRef, useState } from "react";
import { chapters, useAtelier } from "@/lib/atelier-state";
const links = [
  ["Philosophy", "#philosophy"],
  ["About", "#about"],
  ["Work", "#work"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { chapter } = useAtelier();
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <header className="site-header">
      <nav aria-label="Main navigation">
        <div className="brand">
          <a href="#home" aria-label="Back to top" className="brand-mark">
            <i />
            <i />
            <i />
          </a>
          <a href="#about" className="brand-name">
            <span>Bashar</span>
            <small>Eau De Code</small>
          </a>
        </div>
        <div className="desktop-nav">
          {links.map(([name, href]) => (
            <a
              key={href}
              href={href}
              aria-current={
                href === `#${chapters[chapter].id}` ? "location" : undefined
              }
            >
              {name}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <span className="availability">
            <i />
            Available
          </span>
          <a href="#contact" className="nav-cta">
            Start a Project <span aria-hidden="true">↗</span>
          </a>
        </div>
        <button
          ref={toggle}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label="Toggle Navigation Menu"
        >
          <span>{open ? "×" : "☰"}</span>
        </button>
      </nav>
      {open && (
        <div id="mobile-navigation" className="mobile-nav">
          {links.map(([name, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {name}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)}>
            Start a Project →
          </a>
        </div>
      )}
    </header>
  );
}
