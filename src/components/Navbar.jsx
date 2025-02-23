import React, { useState } from "react";
import "../styles/Navbar.css"; // Assurez-vous d'ajouter ce fichier CSS
import { FaBars, FaBell, FaEnvelope, FaCog, FaTh } from "react-icons/fa";
import { MdOutlineWbSunny, MdOutlineDarkMode } from "react-icons/md";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  return (
    <nav className="navbar">
      {/* Section gauche : Menu Burger + Liens */}
      <div className="navbar-left">
        <FaBars className="menu-icon" />
        <a href="#">Dashboard</a>
        <a href="#">Users</a>
        <a href="#">Settings</a>
      </div>

      {/* Section droite : Notifications + Profil */}
      <div className="navbar-right">
        <div className="icon-container">
          <FaBell className="icon" />
          <span className="badge red">5</span>
        </div>
        <div className="icon-container">
          <FaTh className="icon" />
          <span className="badge orange">5</span>
        </div>
        <div className="icon-container">
          <FaEnvelope className="icon" />
          <span className="badge blue">4</span>
        </div>
        <div className="icon-container" onClick={toggleDarkMode}>
          {darkMode ? <MdOutlineWbSunny className="icon" /> : <MdOutlineDarkMode className="icon" />}
        </div>
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="profile-pic" />
      </div>
    </nav>
  );
};

export default Navbar;
