import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTh, FaUserPlus, FaClipboardList, FaSignOutAlt ,FaTachometerAlt } from 'react-icons/fa';
import '../styles/SidebarTeacher.css';

function SidebarTeacher() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar">

      <div className="logo">
        🎓 Abs Manag
      </div>

      <div className="nav-section">
        <p className="nav-title">Navigation</p>


        <button 
          className={`nav-item ${isActive('/teacher/dashboard')}`}
          onClick={() => navigate('/teacher/dashboard')}
        >
          <FaTh/> Dashboard
        </button>

        <button 
          className={`nav-item ${isActive('/enseignant/mes-absences')}`}
          onClick={() => navigate('/enseignant/mes-absences')}
        >
          <FaClipboardList /> Mes absences
        </button>

        <button 
          className={`nav-item ${isActive('/enseignant/saisie')}`}
          onClick={() => navigate('/enseignant/saisie')}
        >
          <FaUserPlus /> Saisie absences
        </button>

        
      </div>

      <div className="sidebar-footer">
        <div>
          <p className="username">{user?.nom}</p>
          <span className="role-badge">ENSEIGNANT</span>
        </div>

        <button className="logout-btn" onClick={logout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>

    </div>
  );
}

export default SidebarTeacher;