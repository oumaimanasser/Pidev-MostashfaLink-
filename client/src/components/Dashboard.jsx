import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <button onClick={() => navigate("/hospitals")}>Hôpitaux</button>
      <button onClick={() => navigate("/hospital-info")}>Informations Hôpital</button>
    </div>
  );
};

export default Dashboard;
