export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}