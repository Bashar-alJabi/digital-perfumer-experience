"use client";
import { useAtelier, setAtelier, seekChapterItem } from "@/lib/atelier-state";
export default function ScentMemorySection() {
  const { memory } = useAtelier();
  return (
    <div className="memory-layout">
      <div className="memory-statements">
        <div className="memory-statement" data-selected={memory === 0}>
          <p className="eyebrow">Scent Memory</p>
          <h2>
            SOME DIGITAL
            <br />
            EXPERIENCES
            <br />
            <span className="muted">ARE SEEN.</span>
          </h2>
        </div>
        <div className="memory-statement" data-selected={memory === 1}>
          <p className="eyebrow">Scent Memory</p>
          <h2>
            OTHERS
            <br />
            <em>ARE REMEMBERED.</em>
          </h2>
        </div>
        <div className="memory-statement" data-selected={memory === 2}>
          <p className="eyebrow">The Difference</p>
          <h2>
            THAT&apos;S THE DIFFERENCE
            <br />
            <span className="muted">BETWEEN A WEBSITE</span>
            <br />
            AND A <em>DIGITAL EXPERIENCE.</em>
          </h2>
        </div>
      </div>
      <div className="memory-controls" aria-label="Scent memory statements">
        {[
          "SOME DIGITAL EXPERIENCES ARE SEEN.",
          "OTHERS ARE REMEMBERED.",
          "THAT'S THE DIFFERENCE BETWEEN A WEBSITE AND A DIGITAL EXPERIENCE.",
        ].map((text, index) => (
          <button
            aria-label={text}
            aria-pressed={memory === index}
            key={text}
            onClick={() => {
              setAtelier({ memory: index });
              seekChapterItem("memory", index, 3);
            }}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
