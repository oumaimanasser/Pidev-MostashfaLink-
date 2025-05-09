import React, { useState } from "react";
import axios from "axios";
import Arrow from "../assests/Arrow.png";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Le CSS avancé que nous venons de créer

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3002/api/auth/login",
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");

    } catch (error) {
      let errorMessage = "Échec de la connexion";

      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        if (error.response.status === 403) {
          errorMessage = "Compte bloqué. Contactez l'administrateur.";
        }
      } else if (error.request) {
        errorMessage = "Pas de réponse du serveur. Vérifiez votre connexion.";
      }

      setError(errorMessage);
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgotpassword");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3002/api/auth/google";
  };

  return (
    <div className="login-page">
      {/* NavBar avec le design d'urgence */}
      <div className="emergency-navbar">
        <div className="left-section">
          <div className="logo-container">
            <span className="logo-icon">+</span>
          </div>
          <div className="urgences-section">
            <h2>URGENCES</h2>
            <span className="badge">24/7</span>
          </div>
        </div>

        <div className="nav-links">
          <button className="nav-link">ACCUEIL</button>
          <button className="nav-link services">
            SERVICES<br />D URGENCE
          </button>
          <div className="nav-link waiting-time">
            <span className="clock-icon">⏱</span>
            <span>TEMPS D<br />ATTENTE</span>
          </div>
          <button className="nav-link find-emergency">
            TROUVER<br />UNE<br />URGENCE
          </button>
          <button className="nav-link">
            CONTACT<br />URGENT
          </button>
          <button className="nav-link connexion">CONNEXION</button>
        </div>
      </div>

      {/* Barre des numéros d'urgence */}
      <div className="emergency-numbers">
        <div className="number-item">
          <span className="status-dot"></span>
          <span>SAMU: 190</span>
        </div>
        <div className="number-item">
          <span className="status-dot"></span>
          <span>Protection Civile: 198</span>
        </div>
        <div className="number-item">
          <span className="status-dot"></span>
          <span>Police: 197</span>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="login-content">
        <div className="hero-text">
          <h1>
            Tell me and I forget, teach me and I may<br />
            remember, involve me and I learn
          </h1>
          
          <button className="explore-more-btn">
            Explore-more <img src={Arrow} alt="Arrow icon" />
          </button>
        </div>

        <div className="login-form-container">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                required
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="input-box">
              <input
                required
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                />
                <label htmlFor="remember">Remember Me</label>
              </div>
              <button
                type="button"
                className="forgot-link"
                onClick={handleForgotPassword}
                disabled={loading}
              >
                Forgot Password
              </button>
            </div>
            
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Login'}
            </button>
            
            <div className="register-link">
              <p>
                Don&apos;t have an account? {" "}
                <button
                  type="button"
                  className="text-button"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  Register
                </button>
              </p>
            </div>
            
            <div className="separator">ou</div>
            
            <div className="google-login">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <span className="google-icon">G</span>
                Se connecter avec Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;