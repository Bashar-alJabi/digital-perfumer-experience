const stats = [
  { label: "Years of Experience", value: "5+" },
  { label: "Brands & Businesses", value: "30+" },
  { label: "Websites Built", value: "20+" },
  { label: "Ad Campaigns", value: "15+" },
];
export default function StatsSection() {
  return (
    <div className="scene-stage impact-stage">
      <p className="eyebrow">THE RESIDUE OF GOOD WORK</p>
      <div className="achievement-grid">
        {stats.map((s, i) => (
          <div className="achievement" key={s.label}>
            <svg viewBox="0 0 260 260" aria-hidden="true">
              <circle cx="130" cy="130" r="118" />
              <circle
                className="ring-liquid"
                cx="130"
                cy="130"
                r="118"
                pathLength="1"
              />
            </svg>
            <div>
              <span>{s.value}</span>
              <p>{s.label}</p>
            </div>
            <small aria-hidden="true">0{i + 1}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
