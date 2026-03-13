import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarTeacher from '../components/SidebarTeacher';
import '../styles/AbsenceForm.css';

function AbsenceForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    classe_id: '',
    matiere_id: '',
    etudiant_id: '',
    debut: '08:00',
    fin: '10:00',
    statut: 'Non justifiée',
    motif: ''
  });

  const [classes, setClasses] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "enseignant") {
      navigate("/");
      return;
    }

    // Fetch form data
    const fetchFormData = async () => {
      try {
        const res = await axios.get(
          'http://localhost/gestion_abscences/backend/get_form_data.php'
        );
        
        if (res.data.success) {
          setClasses(res.data.classes);
          setMatieres(res.data.matieres);
        }
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [navigate]);

  // Fetch students when class changes
  useEffect(() => {
    if (formData.classe_id) {
      const fetchStudents = async () => {
        try {
          const res = await axios.get(
            `http://localhost/gestion_abscences/backend/get_students.php?classe_id=${formData.classe_id}`
          );
          
          if (res.data.success) {
            setStudents(res.data.students);
          }
        } catch (err) {
          console.error("Error fetching students:", err);
        }
      };

      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [formData.classe_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const user = JSON.parse(localStorage.getItem("user"));

    const submitData = {
      professeur_id: user.id,
      date: formData.date,
      classe_id: formData.classe_id,
      matiere_id: formData.matiere_id,
      etudiant_id: formData.etudiant_id,
      debut: formData.debut,
      fin: formData.fin,
      statut: formData.statut,
      motif: formData.motif
    };

    try {
      const res = await axios.post(
        'http://localhost/gestion_abscences/backend/create_absence.php',
        submitData
      );

      if (res.data.success) {
        setSuccess('Absence enregistrée avec succès!');
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          classe_id: '',
          matiere_id: '',
          etudiant_id: '',
          debut: '08:00',
          fin: '10:00',
          statut: 'Non justifiée',
          motif: ''
        });
        setStudents([]);
        
        // Redirect after 2 seconds
        setTimeout(() => navigate('/enseignant'), 2000);
      } else {
        setError(res.data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      setError('Erreur serveur');
      console.error("Error creating absence:", err);
    }
  };

  return (
    <div className="absence-form-container">
      <SidebarTeacher />
      <div className="main-content">
        <div className="form-header">
          <h1>Saisie des absences</h1>
        </div>

        <div className="form-card">
          <h2>Informations de la séance</h2>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="classe_id">Classe</label>
                  <select
                    id="classe_id"
                    name="classe_id"
                    value={formData.classe_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choisir une classe</option>
                    {classes.map((classe) => (
                      <option key={classe.id} value={classe.id}>{classe.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="matiere_id">Matière</label>
                  <select
                    id="matiere_id"
                    name="matiere_id"
                    value={formData.matiere_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choisir une matière</option>
                    {matieres.map((matiere) => (
                      <option key={matiere.id} value={matiere.id}>{matiere.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="etudiant_id">Étudiant</label>
                  <select
                    id="etudiant_id"
                    name="etudiant_id"
                    value={formData.etudiant_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choisir un étudiant</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>{student.nom}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="debut">Début</label>
                  <input
                    type="time"
                    id="debut"
                    name="debut"
                    value={formData.debut}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fin">Fin</label>
                  <input
                    type="time"
                    id="fin"
                    name="fin"
                    value={formData.fin}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="statut">Statut</label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                  >
                    <option value="Non justifiée">Non justifiée</option>
                    <option value="Justifiée">Justifiée</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="motif">Motif</label>
                  <input
                    type="text"
                    id="motif"
                    name="motif"
                    value={formData.motif}
                    onChange={handleChange}
                    placeholder="Motif (optionnel)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">Enregistrer</button>
                <button type="button" className="btn-cancel" onClick={() => navigate('/enseignant')}>Annuler</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AbsenceForm;
