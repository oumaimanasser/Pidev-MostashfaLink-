import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import "./HospitalInfo.css";
import PieChart from "./PieChart";
import { FaChartPie, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../assests/logo.png";
const HospitalInfo = () => {
  const [hospitalInfos, setHospitalInfos] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [services, setServices] = useState("");
  const [departments, setDepartments] = useState("");
  const [nbrLitTotal, setNbrLitTotal] = useState(0);
  const [nbrLitDispo, setNbrLitDispo] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [sortByDepartment, setSortByDepartment] = useState(false);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await axios.get("http://localhost:3002/hospitals");
        setHospitals(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des hôpitaux");
        console.error("Erreur:", err);
      }
    };
    fetchHospitals();
  }, []);

  const handleSelectHospital = async (hospitalId) => {
    if (!hospitalId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:3002/hospitals/hospitals/${hospitalId}/info`);
      const sortedData = sortByDepartment
        ? res.data.sort((a, b) => a.departments.localeCompare(b.departments))
        : res.data;
      setHospitalInfos(sortedData);
      setExpandedCards({});
    } catch (err) {
      setError("Erreur lors de la récupération des informations");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    setError(err.message || "Une erreur est survenue");
    console.error("Erreur:", err);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette information ?")) return;
    try {
      await axios.delete(`http://localhost:3002/hospitals/info/${id}`);
      setHospitalInfos(hospitalInfos.filter((info) => info._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  const handleEdit = (info) => {
    setIsEditing(true);
    setEditId(info._id);
    setSelectedHospital(info.idHospital);
    setServices(info.services);
    setDepartments(info.departments);
    setNbrLitTotal(info.nbrLitTotal || 0);
    setNbrLitDispo(info.nbrLitDispo || 0);
    setShowForm(true);
  };

  const toggleCardExpand = (id) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setSelectedHospital("");
    setServices("");
    setDepartments("");
    setNbrLitTotal(0);
    setNbrLitDispo(0);
    setShowForm(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = Number(nbrLitTotal);
    const dispo = Number(nbrLitDispo);
    if (isNaN(total) || isNaN(dispo)) {
      setError("Veuillez entrer des nombres valides.");
      return;
    }
    if (dispo > total) {
      setError("Les lits disponibles ne peuvent pas être supérieurs au total.");
      return;
    }
    const dataToSend = { services, departments, nbrLitTotal: total, nbrLitDispo: dispo };
    try {
      const url = isEditing
        ? `http://localhost:3002/hospitals/info/${editId}`
        : `http://localhost:3002/hospitals/${selectedHospital}/info`;
      const method = isEditing ? "put" : "post";
      await axios[method](url, dataToSend, { headers: { "Content-Type": "application/json" } });
      if (selectedHospital) {
        await handleSelectHospital(selectedHospital);
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement");
      console.error("Erreur détaillée:", err);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = hospitalInfos.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="hospital-info-container">
      <nav className="nav-bar">
        <img src={logo} alt="" className="logo" />
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
      </nav>
      <br/>
      <br/>
      <h2>Gestion Hospitalière</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="select-container">
        <label>Hôpital :</label>
        <select value={selectedHospital} onChange={(e) => handleSelectHospital(e.target.value)} disabled={loading}>
          <option value="">Sélectionnez un hôpital</option>
          {hospitals.map(hospital => (
            <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
          ))}
        </select>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="checkbox"
            checked={sortByDepartment}
            onChange={(e) => setSortByDepartment(e.target.checked)}
          />
          Trier par département
        </label>
      </div>
      <div className="action-buttons">
        <button onClick={() => setShowForm(!showForm)} className="toggle-form-btn">
          {showForm ? "Masquer Formulaire" : "Ajouter Service"}
        </button>
      </div>
      <div className="services-list">
        {loading ? (
          <div className="loading-spinner">Chargement...</div>
        ) : currentItems.length > 0 ? (
          currentItems.map(info => (
            <div key={info._id} className="service-card">
              <div className="card-header">
                <h3>{info.services}</h3>
                <h4>{info.nbrLitDispo}</h4>
                <p className="department">{info.departments}</p>
                <button onClick={() => toggleCardExpand(info._id)} className="toggle-stats-btn">
                  <FaInfoCircle /> {expandedCards[info._id] ? "Masquer" : "Afficher"} Stats
                </button>
              </div>
              {expandedCards[info._id] && (
                <div className="local-stats">
                  <div className="stats-grid">
                    <div className="stat-item"><span>Total Lits</span><strong>{info.nbrLitTotal || 0}</strong></div>
                    <div className="stat-item"><span>Disponibles</span><strong className="available">{info.nbrLitDispo || 0}</strong></div>
                    <div className="stat-item"><span>Occupés</span><strong className="occupied">{(info.nbrLitTotal || 0) - (info.nbrLitDispo || 0)}</strong></div>
                  </div>
                  <div className="mini-chart">
                    <PieChart totalLits={info.nbrLitTotal || 0} totalDispo={info.nbrLitDispo || 0} totalRestant={(info.nbrLitTotal || 0) - (info.nbrLitDispo || 0)} smallVersion={true} />
                  </div>
                </div>
              )}
              <div className="card-actions">
                <button onClick={() => handleEdit(info)} className="edit-btn">Modifier</button>
                <button onClick={() => handleDelete(info._id)} className="delete-btn">Supprimer</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data-message">Aucune donnée disponible</p>
        )}
      </div>
      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Précédent</button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={indexOfLastItem >= hospitalInfos.length}>Suivant</button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="service-form">
          <h3>{isEditing ? "Modifier l'information" : "Ajouter un Service"}</h3>
          <div className="form-group">
            <label>Hôpital :</label>
            <select value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} disabled={isEditing}>
              <option value="">Sélectionnez un hôpital</option>
              {hospitals.map(hospital => (
                <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Services :</label>
            <input type="text" value={services} onChange={(e) => setServices(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Departments :</label>
            <input type="text" value={departments} onChange={(e) => setDepartments(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nombre total de lits :</label>
            <input type="number" value={nbrLitTotal} onChange={(e) => setNbrLitTotal(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Nombre de lits disponibles :</label>
            <input type="number" value={nbrLitDispo} onChange={(e) => setNbrLitDispo(e.target.value)} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">{isEditing ? "Mettre à jour" : "Ajouter"}</button>
            <button type="button" onClick={resetForm} className="cancel-btn">Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HospitalInfo;
