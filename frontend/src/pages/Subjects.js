import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [formData, setFormData] = useState({ name: "", teacher_id: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const loadSubjects = () => {
    axios.get("http://localhost/gestion_abscences/backend/subjects.php")
      .then(res => {
        if (res.data.success) {
          setSubjects(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching subjects:", err));
  };

  useEffect(() => {
    loadSubjects();

    // Fetch teachers for reference 
    axios.get("http://localhost/gestion_abscences/backend/teachers.php")
      .then(res => {
        if (res.data?.success) {
          setTeachers(res.data.data);
        }
      })
      .catch(() => {
        // Teachers API may not exist yet
      });
  }, []);

  useEffect(() => {
    let result = subjects;
    if (searchTerm) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredSubjects(result);
  }, [subjects, searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette matière?")) {
      axios.delete("http://localhost/gestion_abscences/backend/subjects.php", {
        data: { id }
      })
        .then(res => {
          if (res.data.success) {
            setSubjects(subjects.filter(s => s.id !== id));
          }
        });
    }
  };

  const openModal = (type, subj = null) => {
    setModalType(type);
    setCurrentSubject(subj);
    if (type === 'edit' || type === 'view') {
      axios.get("http://localhost/gestion_abscences/backend/subjects.php", {
        params: { id: subj.id }
      }).then(res => {
        if (res.data.success) {
          const s = res.data.data;
          setFormData({ name: s.name || "", teacher_id: s.teacher_id || "" });
          setCurrentSubject(s);
        }
      });
    } else {
      setFormData({ name: "", teacher_id: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setCurrentSubject(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (modalType === 'add') {
      axios.post("http://localhost/gestion_abscences/backend/subjects.php", formData)
        .then(res => {
          if (res.data.success) {
            loadSubjects();
            closeModal();
          }
        });
    } else if (modalType === 'edit') {
      axios.put("http://localhost/gestion_abscences/backend/subjects.php", { ...formData, id: currentSubject.id })
        .then(res => {
          if (res.data.success) {
            loadSubjects();
            closeModal();
          }
        });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Matières</h1>
        <button className="add-btn" onClick={() => openModal('add')}>
          <FaPlus /> Ajouter
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher..."
          className="search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th>Coefficient</th>
              <th>Enseignant</th>
              <th>Classes</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredSubjects.map(subject => (
              <tr key={subject.id}>
                <td className="bold">{subject.name}</td>
                <td>{subject.coefficient}</td>
                <td>{subject.teacher_name || '-'}</td>
                <td>
                  <span className="class-badge">Classes</span>
                </td>
                <td className="actions">
                  <FaEye className="icon view" onClick={() => openModal('view', subject)} />
                  <FaEdit className="icon edit" onClick={() => openModal('edit', subject)} />
                  <FaTrash className="icon delete" onClick={() => handleDelete(subject.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            {(modalType === 'add' || modalType === 'edit') && (
              <div className="form-container">
                <h2>{modalType === 'add' ? 'Ajouter une matière' : 'Modifier une matière'}</h2>
                <div className="form-group">
                  <label>Nom</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Enseignant</label>
                  <select name="teacher_id" value={formData.teacher_id} onChange={handleInputChange}>
                    <option value="">Aucun</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                  </select>
                </div>
                <button className="modal-submit-btn" onClick={handleSubmit}>
                  {modalType === 'add' ? 'Ajouter' : 'Modifier'}
                </button>
              </div>
            )}
            {modalType === 'view' && currentSubject && (
              <div className="view-container">
                <h2>{currentSubject.name}</h2>
                <p><strong>Enseignant :</strong> {currentSubject.teacher_name || '-'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Subjects;
