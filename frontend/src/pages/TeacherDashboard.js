import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaBook, FaUsers, FaUserPlus } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import SidebarTeacher from "../components/SidebarTeacher";
import "../styles/TeacherDashboard.css";
import AbsencesByMatiereChart from "../components/AbsencesByMatiereChart";
import AbsencesByClassChart from "../components/AbsencesByClassChart";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalAbsences: 0,
    totalMatieres: 0,
    totalEtudiants: 0,
  });

  const [absencesByMatiere, setAbsencesByMatiere] = useState([]);
  const [absencesByClass, setAbsencesByClass] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "enseignant") {
      navigate("/");
      return;
    }

    axios
      .get(
        `http://localhost/gestion_abscences/backend/get_teacher_dashboard.php?teacher_id=${user.id}`
      )
      .then((res) => {
        if (res.data.success) {
          setDashboardData({
            totalAbsences: res.data.totalAbsences,
            totalMatieres: res.data.totalMatieres,
            totalEtudiants: res.data.totalEtudiants,
          });

          setAbsencesByMatiere(res.data.absencesByMatiere);
          if (res.data.absencesByClass) {
            setAbsencesByClass(res.data.absencesByClass);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [navigate]);
const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div className="teacher-layout">
      <SidebarTeacher />

      <div className="teacher-content">
        <div className="dashboard-header">
          <h1>Mon tableau de bord</h1>
          <button
            className="btn-primary"
            onClick={() => navigate("/enseignant/saisie")}
          >
            <FaUserPlus style={{ marginRight: 8 }} />
            Saisir des absences
          </button>
        </div>

        {loading ? (
          <div>Chargement...</div>
        ) : (
          <>
            <div className="stats-grid">
                  <div className="card">
                <div>
                  <p className="card-title">Mes absences relevées</p>
                  <h2>{dashboardData.totalAbsences}</h2>
                </div>
                <span className="card-icon">
                  <FaUser />
                </span>
              </div>

              <div className="card">
                <div>
                  <p className="card-title">Mes matières</p>
                  <h2>{dashboardData.totalMatieres}</h2>
                </div>
                <span className="card-icon">
                  <FaBook />
                </span>
              </div>

              <div className="card">
                <div>
                  <p className="card-title">Mes étudiants</p>
                  <h2>{dashboardData.totalEtudiants}</h2>
                </div>
                <span className="card-icon">
                  <FaUsers />
                </span>
              </div>
            </div>

            
            <div className="charts-grid">
              <AbsencesByMatiereChart teacherId={user.id} />
              <AbsencesByClassChart data={absencesByClass} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;