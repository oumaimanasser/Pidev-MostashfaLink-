import React from "react";
import "./Hero.css";
import Arrow from "../../assests/Arrow.png"; // Corrige "assests" → "assets"
import Navbar from "../Navbar/Navbar";
import About from "../About/About";
import Contact from "../Contact/Conatct";
import Footer from "../Footer/Footer";

const Hero = () => {
  return (
    <>
      <Navbar />
      <div className="Hero container">
        <div className="Hero-text">
          <div>
            <h1>
              « Sauver une vie commence par une bonne information. 
              Avec <span style={{ color: "#2c3e50" }}>MostachfaLink</span>, chaque seconde compte. »
            </h1>
            <p>
              Notre plateforme connecte les hôpitaux, optimise la gestion des urgences 
              et améliore la coordination des soins en temps réel.
            </p>
            <button className="btn">
              Explorer <img src={Arrow} alt="flèche vers plus" />
            </button>
          </div>
        </div>
      </div>
      <About />
      <Contact />
    </>
  );
};

export default Hero;
