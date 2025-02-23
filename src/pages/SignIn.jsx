import React, { useState } from "react";
import axios from "axios"; // Importer Axios
import "../styles/Auth.css";
import Navbar from "../components/Navbar"; // Ajuste le chemin si nécessaire
import Footer from "../components/Footer"; // Ajuste le chemin si nécessaire

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        // Sauvegarder le token dans le localStorage ou sessionStorage
        localStorage.setItem("token", response.data.token);
        alert("Connexion réussie");
        // Rediriger ou effectuer une autre action après la connexion
      }
    } catch (error) {
      setError("Erreur lors de la connexion");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="input-group">
          <input
            type={passwordVisible ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label htmlFor="password">Password</label>
          <span className="eye-icon" onClick={togglePasswordVisibility}>
            {passwordVisible ? "🙈" : "👁️"}
          </span>
        </div>

        <button type="submit" className="auth-btn">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default SignIn;
