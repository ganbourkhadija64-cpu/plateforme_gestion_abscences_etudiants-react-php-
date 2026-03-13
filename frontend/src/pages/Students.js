import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus
} from "react-icons/fa";

function Students() {

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'view'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    class_id: "",
    date_of_birth: ""
  });
  const [absencesHistory, setAbsencesHistory] = useState([]);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const loadStudents = () => {
    axios.get("http://localhost/gestion_abscences/backend/students.php")
      .then(res => {
        if (res.data.success) {
          setStudents(res.data.data);
        }
      });
  };

  const loadClasses = () => {
    axios.get("http://localhost/gestion_abscences/backend/classes.php")
      .then(res => {
        if (res.data.success) setClasses(res.data.data);
      });
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  useEffect(() => {
    let result = students;
    if (selectedClassFilter !== "all") {
      result = result.filter(s => s.class_name === selectedClassFilter);
    }
    if (searchTerm) {
      result = result.filter(s =>
        s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.last_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(result);
  }, [students, selectedClassFilter, searchTerm]);

  const openModal = (type, student = null) => {
    setFormError("");
    setFormSuccess("");
    setModalType(type);
    setCurrentStudent(student);
    if (type === 'add' && classes.length === 0) {
      setFormError("Veuillez créer une classe avant d'ajouter des étudiants.");
      return;
    }
    if (type === "edit" || type === "view") {
      // fetch fresh data for selected student
      axios.get("http://localhost/gestion_abscences/backend/students.php", {
        params: { id: student.id }
      }).then(res => {
        if (res.data.success) {
          const s = res.data.data;
          setCurrentStudent(s);
          setFormData({
            first_name: s.first_name || "",
            last_name: s.last_name || "",
            email: s.email || "",
            class_id: s.class_id || "",
            date_of_birth: s.date_of_birth || ""
          });
          if (type === "view") {
            // load absence history
            axios.get("http://localhost/gestion_abscences/backend/absences.php", {
              params: { student_id: s.id }
            }).then(r => {
              if (r.data.success) setAbsencesHistory(r.data.data);
            });
          }
        }
      });
    } else {
      // add
      setFormData({ first_name: "", last_name: "", email: "", class_id: "", date_of_birth: "" });
      setAbsencesHistory([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setCurrentStudent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setFormError("");
    setFormSuccess("");
    console.log("submitting", modalType, formData);
    if (modalType === "add") {
      axios.post("http://localhost/gestion_abscences/backend/students.php", formData)
        .then(res => {
          console.log("response", res.data);
          if (res.data.success) {
            setFormSuccess("Étudiant ajouté");
            loadStudents();
            setTimeout(() => closeModal(), 500);
          } else {
            setFormError(res.data.message || "Erreur ajout");
          }
        })
        .catch(err => {
          console.error(err);
          setFormError("Erreur réseau");
        });
    } else if (modalType === "edit") {
      axios.put("http://localhost/gestion_abscences/backend/students.php", { ...formData, id: currentStudent.id })
        .then(res => {
          console.log("response", res.data);
          if (res.data && res.data.success) {
            setFormSuccess("Étudiant modifié");
            loadStudents();
            setTimeout(() => closeModal(), 500);
          } else {
            setFormError(res.data?.message || "Erreur modification");
          }
        })
        .catch(err => {
          console.error(err);
          if (err.response && err.response.data) {
            let msg = err.response.data;
            if (typeof msg === 'object') msg = JSON.stringify(msg);
            setFormError("Erreur serveur: " + msg);
          } else {
            setFormError("Erreur réseau");
          }
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant?")) {
      axios.delete("http://localhost/gestion_abscences/backend/students.php", { data: { id } })
        .then(res => {
          if (res.data.success) {
            setStudents(students.filter(s => s.id !== id));
          }
        });
    }
  };

  return (
    <div className="page-container">

      {/* HEADER */}
      <div className="page-header">
        <h1>Étudiants</h1>
        <button className="add-btn" onClick={() => openModal('add')}>
          <FaPlus /> Ajouter
        </button>
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedClassFilter}
          onChange={e => setSelectedClassFilter(e.target.value)}
        >
          <option value="all">Toutes</option>
          {classes.map(c => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Classe</th>
              <th>Email</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="bold">{student.last_name}</td>
                <td>{student.first_name}</td>
                <td>{student.class_name}</td>
                <td className="email">{student.email}</td>
                <td className="actions">
                  <FaEye className="icon view" onClick={() => openModal('view', student)} />
                  <FaEdit className="icon edit" onClick={() => openModal('edit', student)} />
                  <FaTrash className="icon delete" onClick={() => handleDelete(student.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* modal overlay */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            {modalType === 'view' && currentStudent && (
              <div className="view-container">
                <h2>{currentStudent.first_name} {currentStudent.last_name}</h2>
                <p><strong>Classe :</strong> {currentStudent.class_name}</p>
                <p><strong>Email :</strong> {currentStudent.email}</p>
                <p><strong>Né(e) le :</strong> {currentStudent.date_of_birth ? new Date(currentStudent.date_of_birth).toLocaleDateString('fr-FR') : ''}</p>
                <h3>Historique des absences ({absencesHistory.length})</h3>
                {absencesHistory.map(a => (
                  <div key={a.id} className="absence-item">
                    <span>{new Date(a.date).toLocaleDateString('fr-FR')}</span>
                    <span className={`status-badge ${a.statut === 'Justifiée' ? 'justified' : 'not-justified'}`}>{a.statut}</span>
                  </div>
                ))}
              </div>
            )}
            {(modalType === 'add' || modalType === 'edit') && (
              <div className="form-container">
                <h2>{modalType === 'add' ? 'Ajouter un étudiant' : 'Modifier un étudiant'}</h2>
                <div className="form-group">
                  <label>Nom*</label>
                  <input name="last_name" value={formData.last_name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Prénom*</label>
                  <input name="first_name" value={formData.first_name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Classe*</label>
                  <select name="class_id" value={formData.class_id} onChange={handleInputChange}>
                    <option value="">Sélectionner</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleInputChange} />
                </div>
                {formError && <div className="alert alert-error">{formError}</div>}
                {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
                <button className="modal-submit-btn" onClick={handleSubmit}>
                  {modalType === 'add' ? 'Ajouter' : 'Modifier'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Students;