import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarTeacher from '../components/SidebarTeacher';
import '../styles/AbsenceList.css';

function AbsenceList() {
  const navigate = useNavigate();
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: '',
    classe: 'Toutes les classes',
    matiere: 'Toutes les matières'
  });

  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "enseignant") {
      navigate("/");
      return;
    }

    // Fetch absences
    const fetchAbsences = async () => {
      try {
        const res = await axios.get(
          `http://localhost/gestion_abscences/backend/get_absences.php?user_id=${user.id}`
        );
        
        if (res.data.success) {
          setAbsences(res.data.absences);
          setFilteredAbsences(res.data.absences);

          // keep unique but we will also fetch full lists below
          const uniqueClasses = [...new Set(res.data.absences.map(a => a.classe))];
          const uniqueMatieres = [...new Set(res.data.absences.map(a => a.matiere))];
          setClasses(uniqueClasses);
          setMatieres(uniqueMatieres);
        }
      } catch (err) {
        console.error("Error fetching absences:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();

    // also populate full class/subject lists from database
    axios.get('http://localhost/gestion_abscences/backend/classes.php')
      .then(r => {
        if (r.data.success) {
          setClasses(r.data.data.map(c=>c.name));
        }
      });
    axios.get('http://localhost/gestion_abscences/backend/subjects.php')
      .then(r => {
        if (r.data.success) {
          setMatieres(r.data.data.map(m=>m.name));
        }
      });
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleSearchChange = (e) => {
    const newFilters = {
      ...filters,
      search: e.target.value
    };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (filterObj) => {
    const searchTerm = (filterObj.search || '').toLowerCase();
    const filtered = absences.filter(absence => {
      const name = (absence.etudiant || '').toLowerCase();
      const matchSearch = name.includes(searchTerm);
      const matchClasse = filterObj.classe === 'Toutes les classes' || absence.classe === filterObj.classe;
      const matchMatiere = filterObj.matiere === 'Toutes les matières' || absence.matiere === filterObj.matiere;
      return matchSearch && matchClasse && matchMatiere;
    });
    setFilteredAbsences(filtered);
  };

  const getStatusClass = (statut) => {
    return statut === 'Non justifiée' ? 'status-unjustified' : 'status-justified';
  };

  return (
    <div className="absence-list-container">
      <SidebarTeacher />
      <div className="main-content">
        <div className="list-header">
          <h1>Absences</h1>
        </div>

        <div className="filters-container">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher un étudiant..."
            value={filters.search}
            onChange={handleSearchChange}
          />
          <select
            name="classe"
            className="filter-select"
            value={filters.classe}
            onChange={handleFilterChange}
          >
            <option>Toutes les classes</option>
            {classes.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            name="matiere"
            className="filter-select"
            value={filters.matiere}
            onChange={handleFilterChange}
          >
            <option>Toutes les matières</option>
            {matieres.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table className="absences-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Étudiant</th>
                <th>Classe</th>
                <th>Matière</th>
                <th>Statut</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {filteredAbsences.map(absence => (
                <tr key={absence.id}>
                  <td className="date-cell">{absence.date}</td>
                  <td className="student-cell">{absence.etudiant}</td>
                  <td className="class-cell">{absence.classe}</td>
                  <td className="subject-cell">{absence.matiere}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(absence.statut)}`}>
                      {absence.statut}
                    </span>
                  </td>
                  <td className="reason-cell">{absence.motif}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAbsences.length === 0 && (
          <div className="no-data">
            <p>Aucune absence trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AbsenceList;
