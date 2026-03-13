import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Benali Ahmed", absences: 3 },
  { name: "Djamel Karim", absences: 2 },
  { name: "El Fassi Nadia", absences: 1 },
];

export default function StudentsChart() {
  return (
    <div className="chart-card">
      <h3>Top étudiants les plus absents</h3>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="absences" fill="#1e293b" />
      </BarChart>
    </div>
  );
}