import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

const Card = ({ title, count }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p><strong>{count}</strong> Total</p>
      <Link to="#" className="details">View Details</Link>
    </div>
  );
};

export default Card;
