import React from "react";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} ED Admin. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
