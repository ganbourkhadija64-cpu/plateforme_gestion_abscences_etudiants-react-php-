import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost/gestion_abscences/backend/login.php",
        {
          email: email.trim(),
          password: password.trim(),
        }
      );

      if (res.data.success) {
        // Save user
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Redirect by role
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/enseignant/mes-absences");
        }
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">🎓</div>

        <h1>Gestion des Absences</h1>
        <p>Connectez-vous à votre compte</p>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@school.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        
      </div>
    </div>
  );
}

export default Login;