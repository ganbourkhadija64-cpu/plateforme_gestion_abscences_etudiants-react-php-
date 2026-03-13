import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function Classes() {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'add'|'edit'|'view'
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);

  const loadClasses = () => {
    axios.get("http://localhost/gestion_abscences/backend/classes.php")
      .then(res => {
        if (res.data.success) {
          setClasses(res.data.data);
        }
      })
      .catch(err => console.error("Error fetching classes:", err));
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    let result = classes;
    if (searchTerm) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredClasses(result);
  }, [classes, searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette classe?")) {
      axios.delete("http://localhost/gestion_abscences/backend/classes.php", {
        data: { id }
      })
        .then(res => {
          if (res.data.success) {
            setClasses(classes.filter(c => c.id !== id));
          }
        });
    }
  };

  const openModal = (type, cls = null) => {
    setModalType(type);
    setCurrentClass(cls);
    if (type === "edit" || type === "view") {
      axios.get("http://localhost/gestion_abscences/backend/classes.php", {
        params: { id: cls.id }
      }).then(res => {
        if (res.data.success) {
          const c = res.data.data;
          setFormData({ name: c.name || "", description: c.description || "" });
          setCurrentClass(c);
          // for view we could load student list if needed
        }
      });
    } else {
      setFormData({ name: "", description: "" });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setCurrentClass(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (modalType === "add") {
      axios.post("http://localhost/gestion_abscences/backend/classes.php", formData)
        .then(res => {
          if (res.data.success) {
            loadClasses();
            closeModal();
          }
        });
    } else if (modalType === "edit") {
      axios.put("http://localhost/gestion_abscences/backend/classes.php", { ...formData, id: currentClass.id })
        .then(res => {
          if (res.data.success) {
            loadClasses();
            closeModal();
          }
        });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Classes / Groupes</h1>
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
              <th>Nom</th>
              <th>Description</th>
              <th>Étudiants</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredClasses.map(cls => (
              <tr key={cls.id}>
                <td className="bold">{cls.name}</td>
                <td>{cls.description}</td>
                <td>{cls.student_count}</td>
                <td className="actions">
                  <FaEye className="icon view" onClick={() => openModal('view', cls)} />
                  <FaEdit className="icon edit" onClick={() => openModal('edit', cls)} />
                  <FaTrash className="icon delete" onClick={() => handleDelete(cls.id)} />
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
                <h2>{modalType === 'add' ? 'Ajouter une classe' : 'Modifier une classe'}</h2>
                <div className="form-group">
                  <label>Nom*</label>
                  <input name="name" value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input name="description" value={formData.description} onChange={handleInputChange} />
                </div>
                <button className="modal-submit-btn" onClick={handleSubmit}>
                  {modalType === 'add' ? 'Ajouter' : 'Modifier'}
                </button>
              </div>
            )}
            {modalType === 'view' && currentClass && (
              <div className="view-container">
                <h2>{currentClass.name}</h2>
                <p><strong>Description :</strong> {currentClass.description}</p>
                <p><strong>Étudiants :</strong> {currentClass.student_count}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Classes;
