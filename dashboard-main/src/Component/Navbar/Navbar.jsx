import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assests/logo.png"; // Assurez-vous que le chemin est correct

const Navbar = () => {
  return (
    <>
      {/* Barre de navigation principale rouge */}
      <nav className="emergency-navbar">
        <div className="left-section">
          <img src={logo} alt="Logo" className="emergency-logo" />
          <div className="urgences-section">
            <h2>URGENCES</h2>
            <span className="badge">24/7</span>
          </div>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link">ACCUEIL</Link>
          <Link to="/services" className="nav-link services">
            SERVICES<br />URGENCE
          </Link>
          <div className="nav-link waiting-time">
            <span className="clock-icon">⏱</span>
            <span>TEMPS D<br />ATTENTE</span>
          </div>
          <Link to="/find-emergency" className="nav-link find-emergency">
            TROUVER<br />UNE<br />URGENCE
          </Link>
          <Link to="/contact" className="nav-link">
            CONTACT<br />URGENT
          </Link>
          <Link to="/login" className="nav-link connexion">CONNEXION</Link>
        </div>
      </nav>

      {/* Barre des numéros d'urgence - fond noir */}
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
    </>
  );
};

export default Navbar;