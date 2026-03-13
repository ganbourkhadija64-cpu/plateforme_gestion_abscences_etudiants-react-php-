import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

import {
  FaChartBar,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaFileAlt,
  FaFileExport,
  FaCheckCircle,
  FaSignOutAlt
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AbsencesByClassChart from "../components/AbsencesByClassChart";
import Sidebar from "../components/Sidebar";

const COLORS = ["#0f172a", "#334155", "#ef4444", "#3b82f6"];

function AdminDashboard() {

  const [stats, setStats] = useState({
    totalAbsences: 0,
    totalJustified: 0,
    totalStudents: 0,
    totalClasses: 0,
    taux: 0
  });

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  // Protection Admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      window.location.href = "/";
    }
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    axios
      .get("http://localhost/gestion_abscences/backend/admin_dashboard.php")
      .then((res) => {
        if (res.data.success) {
          setStats({
            totalAbsences: res.data.totalAbsences,
            totalJustified: res.data.totalJustified,
            totalStudents: res.data.totalStudents,
            totalClasses: res.data.totalClasses,
            taux: res.data.taux
          });

          setBarData(res.data.topStudents);
          setPieData(res.data.absByClass);
        }
      })
      .catch((err) => {
        console.log("Dashboard error:", err);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <div>
          <div className="logo">AbsTrack</div>
<Sidebar active="dashboard" />
        </div>

        <div>
          <div className="sidebar-footer">
            ADMIN <span className="role-badge">ADMIN</span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Déconnexion
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dashboard-content">

        <h1 className="dashboard-title">Tableau de bord</h1>

        {/* STATS CARDS */}
        <div className="stats-grid">

          <div className="stat-card">
            <h4>Total absences</h4>
            <div className="stat-value">{stats.totalAbsences}</div>
            <div className="stat-sub">
              {stats.totalJustified} justifiées
            </div>
          </div>

          <div className="stat-card">
            <h4>Taux d'absentéisme</h4>
            <div className="stat-value">{stats.taux}%</div>
          </div>

          <div className="stat-card">
            <h4>Étudiants</h4>
            <div className="stat-value">{stats.totalStudents}</div>
          </div>

          <div className="stat-card">
            <h4>Classes</h4>
            <div className="stat-value">{stats.totalClasses}</div>
          </div>

        </div>

        {/* CHARTS */}
        <div className="charts-grid">

          <div className="chart-card">
            <h3>Top étudiants les plus absents</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="absences"
                  fill="#0f172a"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <AbsencesByClassChart data={pieData} />

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;