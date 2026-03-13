import "../styles/dashboard.css";
import { NavLink } from "react-router-dom";
import { 
  FaChartBar, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaFileAlt,
  FaFileExport,
  FaCheckCircle,
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";

export default function Sidebar() {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <div>
        <div className="logo">🎓Abs Manag</div>

        <div className="sidebar-menu">

          <NavLink 
            to="/admin"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaChartBar /> Tableau de bord
          </NavLink>

          <NavLink 
            to="/admin/absences"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaFileAlt /> Absences
          </NavLink>

          <NavLink 
            to="/admin/students"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaUserGraduate /> Étudiants
          </NavLink>

          <NavLink 
            to="/admin/classes"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaChalkboardTeacher /> Classes
          </NavLink>

          <NavLink 
            to="/admin/subjects"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaBook /> Matières
          </NavLink>

          <NavLink 
            to="/admin/justifications"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaCheckCircle /> Justifications
          </NavLink>

          <NavLink 
            to="/admin/export"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaFileExport /> Export
          </NavLink>
          
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => 
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <FaUser /> Utilisateurs
          </NavLink>

        </div>
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
  );
}