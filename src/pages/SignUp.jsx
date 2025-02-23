import React, { useState } from "react";
import axios from "axios"; // Importer Axios
import "../styles/Auth.css"; 
import Navbar from "../components/Navbar"; // Ajuste le chemin si nécessaire
import Footer from "../components/Footer"; // Ajuste le chemin si nécessaire

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/auth/register", {
        firstName,
        lastName,
        email,
        password,
        role,
      });

      if (response.status === 201) {
        alert("Utilisateur créé avec succès");
        // Rediriger ou effectuer une autre action après l'inscription
      }
    } catch (error) {
      setError("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <label htmlFor="firstName">First Name</label>
        </div>

        <div className="input-group">
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <label htmlFor="lastName">Last Name</label>
        </div>

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

        <div className="input-group">
          <select value={role} onChange={handleRoleChange} required>
            <option value="" disabled>
              Select Role
            </option>
            <option value="Administrateur">Administrateur</option>
            <option value="Infirmier">Infirmier</option>
            <option value="Médecin">Médecin</option>
          </select>
        </div>

        <button type="submit" className="auth-btn">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
