import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8"];

export default function AbsencesByClassChart({ data }) {
  // support two possible shapes:
  // - teacher endpoint returns { class, absences }
  // - admin endpoint returns { name, value }
  const dataKey = data && data.length > 0
    ? ('absences' in data[0] ? 'absences' : 'value')
    : 'value';
  const nameKey = data && data.length > 0
    ? ('class' in data[0] ? 'class' : 'name')
    : 'name';

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <h3>Absences par classe</h3>
        <div className="no-data-chart">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Absences par classe</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}