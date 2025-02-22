import React from "react";
import Card from "../components/Card";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Emergency Department Dashboard</h1>
      <div className="cards">
        <Card title="User Management" count={245} />
        <Card title="Resource Management" count={120} />
        <Card title="Hospital Management" count={50} />
        <Card title="Consultation Management" count={90} />
        <Card title="Medical Records" count={300} />
      </div>
    </div>
  );
};

export default Dashboard;
