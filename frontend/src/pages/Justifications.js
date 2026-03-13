import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaCheck } from "react-icons/fa";

function Justifications() {
  const [justifications, setJustifications] = useState([]);
  const [filteredJustifications, setFilteredJustifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch non-justified absences
    axios.get("http://localhost/gestion_abscences/backend/justifications.php?status=non-justified")
      .then(res => {
        if (res.data.success) {
          setJustifications(res.data.data);
          setFilteredJustifications(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching justifications:", err));

    // Fetch classes for filter
    axios.get("http://localhost/gestion_abscences/backend/classes.php")
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.data);
        }
      });
  }, []);

  // Filter justifications
  useEffect(() => {
    let result = justifications;

    if (selectedClass !== "all") {
      result = result.filter(j => j.class_name === selectedClass);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(j => 
        (j.student_name || "").toLowerCase().includes(term)
      );
    }

    setFilteredJustifications(result);
  }, [selectedClass, searchTerm, justifications]);

  const handleJustify = (id, reason) => {
    axios.put("http://localhost/gestion_abscences/backend/justifications.php", {
      id,
      justified: 1,
      justification: reason || "Justifiée par l'administrateur"
    })
      .then(res => {
        if (res.data.success) {
          setJustifications(justifications.filter(j => j.id !== id));
        }
      });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Justification des absences</h1>
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
              <th>Motif</th>
              <th className="actions-col">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredJustifications.map(just => (
              <tr key={just.id}>
                <td>{new Date(just.date).toLocaleDateString('fr-FR')}</td>
                <td className="bold">{just.student_name}</td>
                <td>{just.class_name}</td>
                <td>{just.subject_name}</td>
                <td>
                  <span className="status-badge not-justified">Non justifiée</span>
                </td>
                <td>{just.justification || '-'}</td>
                <td className="actions">
                  <button 
                    className="justify-btn"
                    onClick={() => handleJustify(just.id, just.justification)}
                  >
                    <FaCheck /> Justifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Justifications;
