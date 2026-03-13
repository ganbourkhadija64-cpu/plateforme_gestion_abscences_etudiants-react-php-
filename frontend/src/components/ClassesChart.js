import { PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  { name: "Classe A", value: 6 },
  { name: "Classe B", value: 4 },
  { name: "Classe C", value: 2 },
  { name: "Classe D", value: 2 },
];

const COLORS = ["#0f172a", "#334155", "#ef4444", "#3b82f6"];

export default function ClassesChart() {
  return (
    <div className="chart-card">
      <h3>Absences par classe</h3>
      <PieChart width={300} height={250}>
        <Pie
          data={data}
          dataKey="value"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}