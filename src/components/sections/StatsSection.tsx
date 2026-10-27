import { stats } from "@/lib/portfolio-content";
export default function StatsSection() {
  return (
    <div className="stats-layout">
      {stats.map((stat, index) => (
        <div className="stat" key={stat.label} data-stat={index}>
          <span className="stat-value">{stat.value}</span>
          <p>{stat.label}</p>
          <span className="stat-rule" aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
