import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <h2>ED Admin</h2>
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
  <Link to="/user-management">User Management</Link>
  <ul>
    <li><Link to="/sign-in">Sign In</Link></li>
    <li><Link to="/sign-up">Sign Up</Link></li>
    <li><Link to="/Dashboard">Dashboard</Link></li>
  </ul>
</li>

        <li><Link to="/resource-management">Resource Management</Link></li>
        <li><Link to="/hospital-management">Hospital Management</Link></li>
        <li><Link to="/consultation-management">Consultation Management</Link></li>
        <li><Link to="/medical-records">Medical Records</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
