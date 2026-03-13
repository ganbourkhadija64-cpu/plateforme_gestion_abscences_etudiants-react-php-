import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaFileExport, FaFilePdf, FaFileCsv } from "react-icons/fa";

function Export() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportCount, setExportCount] = useState(0);

  useEffect(() => {
    axios.get("http://localhost/gestion_abscences/backend/classes.php")
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching classes:", err));

    // Check export count whenever filters change
    fetchExportCount();
  }, [selectedClass, startDate, endDate]);

  const fetchExportCount = () => {
    // re‑use the API endpoint; format parameter ignored by backend but included for clarity
    axios.post("http://localhost/gestion_abscences/backend/export.php", {
      class_id: selectedClass !== "all" ? selectedClass : null,
      start_date: startDate || null,
      end_date: endDate || null,
      format: 'json'
    })
      .then(res => {
        if (res.data.success) {
          setExportCount(res.data.count);
        }
      })
      .catch(() => {
        // ignore
      });
  };

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (selectedClass !== "all") params.append('classe_id', selectedClass);
    if (startDate) params.append('date_debut', startDate);
    if (endDate) params.append('date_fin', endDate);
    return params.toString();
  };

  const handleExport = (format) => {
    const query = buildQuery();
    if (format === 'csv') {
      window.location.href = `http://localhost/gestion_abscences/backend/export.php?${query}`;
    } else if (format === 'pdf') {
      window.location.href = `http://localhost/gestion_abscences/backend/export_pdf.php?${query}`;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Export des données</h1>
      </div>

      <div className="export-card">
        <h3>Filtres</h3>

        <div className="export-filters">
          <div className="filter-group">
            <label>Classe</label>
            <select 
              className="filter-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">Toutes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date début</label>
            <input
              type="date"
              className="filter-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date fin</label>
            <input
              type="date"
              className="filter-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="export-actions">
          <button className="export-btn csv" onClick={() => handleExport('csv')}>
            <FaFileCsv /> Exporter en CSV ({exportCount})
          </button>
          
        </div>

        <p className="export-info">
          {exportCount} absence(s) correspondent aux filtres sélectionnés
        </p>
      </div>
    </div>
  );
}

export default Export;
