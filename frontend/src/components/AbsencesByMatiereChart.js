import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";

function AbsencesByMatiereChart({ teacherId }) {

  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(
      `http://localhost/gestion_abscences/backend/get_teacher_dashboard.php?teacher_id=${teacherId}`
    )
    .then(res => {
      if(res.data.success){
        setData(res.data.absencesByMatiere || []);
      }
    });
  }, [teacherId]);

  if(data.length === 0){
    return (
      <div className="chart-card">
        <h3>Absences par matière</h3>
        <div className="no-data-chart">Aucune donnée disponible</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h3>Absences par matière</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="matiere" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="absences" fill="#0f172a" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AbsencesByMatiereChart;