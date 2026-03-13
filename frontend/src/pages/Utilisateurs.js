import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Students.css";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

function Users() {

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
    role: "enseignant"
  });

  const loadUsers = () => {
    axios.get("http://localhost/gestion_abscences/backend/users.php")
      .then(res => {
        if (res.data.success) {
          setUsers(res.data.data);
        }
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(u =>
        u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(result);

  }, [users, searchTerm]);

  const openModal = (type, user = null) => {
    setModalType(type);
    setCurrentUser(user);

    if (type === "edit") {
      setFormData({
        nom: user.nom,
        email: user.email,
        password: "",
        role: user.role
      });
    } else {
      setFormData({
        nom: "",
        email: "",
        password: "",
        role: "enseignant"
      });
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setCurrentUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {

    if (modalType === "add") {

      axios.post("http://localhost/gestion_abscences/backend/users.php", formData)
        .then(res => {
          if (res.data.success) {
            loadUsers();
            closeModal();
          }
        });

    } else if (modalType === "edit") {

      axios.put("http://localhost/gestion_abscences/backend/users.php", {
        ...formData,
        id: currentUser.id
      }).then(res => {
        if (res.data.success) {
          loadUsers();
          closeModal();
        }
      });

    }
  };

  const handleDelete = (id) => {

    if (window.confirm("Supprimer cet utilisateur ?")) {

      axios.delete("http://localhost/gestion_abscences/backend/users.php", {
        data: { id }
      }).then(res => {
        if (res.data.success) {
          setUsers(users.filter(u => u.id !== id));
        }
      });

    }

  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="page-header">
        <h1>Utilisateurs</h1>

        <button className="add-btn" onClick={() => openModal("add")}>
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
              <th>Email</th>
              <th>Role</th>
              <th>Date création</th>
              <th className="actions-col">Actions</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.map(user => (

              <tr key={user.id}>
                <td className="bold">{user.nom}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.created_at}</td>

                <td className="actions">
                  <FaEdit className="icon edit" onClick={() => openModal("edit", user)} />
                  <FaTrash className="icon delete" onClick={() => handleDelete(user.id)} />
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

            <h2>{modalType === "add" ? "Ajouter utilisateur" : "Modifier utilisateur"}</h2>

            <div className="form-group">
              <label>Nom</label>
              <input name="nom" value={formData.nom} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
            </div>

            <div className="form-group">
              <label>Role</label>

              <select name="role" value={formData.role} onChange={handleInputChange}>
                <option value="admin">Admin</option>
                <option value="enseignant">Enseignant</option>
              </select>

            </div>

            <button className="modal-submit-btn" onClick={handleSubmit}>
              {modalType === "add" ? "Ajouter" : "Modifier"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;