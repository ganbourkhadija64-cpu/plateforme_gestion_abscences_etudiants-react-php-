import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import SidebarTeacher from "../components/SidebarTeacher";


function Absences() {
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch absences
    axios.get("http://localhost/gestion_abscences/backend/absences.php")
      .then(res => {
        if (res.data.success) {
          setAbsences(res.data.data);
          setFilteredAbsences(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching absences:", err));

    // Fetch classes for filter
    axios.get("http://localhost/gestion_abscences/backend/classes.php")
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.data);
        }
      });

    // Fetch subjects for filter
    axios.get("http://localhost/gestion_abscences/backend/subjects.php")
      .then(res => {
        if (res.data.success) {
          setSubjects(res.data.data);
        }
      });
  }, []);

  // Filter absences when filters change
  useEffect(() => {
    let result = absences;

    if (selectedClass !== "all") {
      result = result.filter(a => a.class_name === selectedClass);
    }

    if (selectedSubject !== "all") {
      result = result.filter(a => a.subject_name === selectedSubject);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => {
        const name = (a.etudiant || '').toLowerCase();
        return name.includes(term);
      });
    }

    setFilteredAbsences(result);
  }, [selectedClass, selectedSubject, searchTerm, absences]);

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette absence?")) {
      axios.delete("http://localhost/gestion_abscences/backend/absences.php", {
        data: { id }
      })
        .then(res => {
          if (res.data.success) {
            setAbsences(absences.filter(a => a.id !== id));
          }
        });
    }
  };
  const getStatusClass = (statut) => {
    return statut === 'Non justifiée' ? 'status-unjustified' : 'status-justified';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Absences</h1>
       
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select 
          className="filter-select"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">Toutes les classes</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.name}>{cls.name}</option>
          ))}
        </select>

        <select 
          className="filter-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">Toutes les matières</option>
          {subjects.map(subj => (
            <option key={subj.id} value={subj.name}>{subj.name}</option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Étudiant</th>
              <th>Classe</th>
              <th>Matière</th>
              <th>Statut</th>
              
            </tr>
          </thead>

          <tbody>
            {filteredAbsences.map(absence => (
              <tr key={absence.id}>
                <td>{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                <td className="bold">{absence.etudiant}</td>
                <td>{absence.class_name}</td>
                <td>{absence.subject_name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(absence.statut)}`}>
                      {absence.statut}
                    </span>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Absences;
