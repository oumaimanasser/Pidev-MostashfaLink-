import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import "./HospitalizedPatients.css";

const HospitalizedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [newPatient, setNewPatient] = useState({
    idHospitalization: "",
    idPatient: "",
    admissionDate: "",
    dischargeDate: "",
    roomNumber: "",
    discharge: "No",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/hospitalized-patients");
      setPatients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
    }
  };

  const handleChange = (e) => {
    setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/hospitalized-patients", newPatient);
      fetchPatients();
      setShowModal(false);
      setNewPatient({
        idHospitalization: "",
        idPatient: "",
        admissionDate: "",
        dischargeDate: "",
        roomNumber: "",
        discharge: "No",
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setSelectedPatient({ ...selectedPatient, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/hospitalized-patients/${selectedPatient._id}`, selectedPatient);
      fetchPatients();
      setShowEditModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  return (
    <div className="hospital-management">
      <h1>Gestion des Patients Hospitalisés</h1>
      <h1>Gestion des Patients Hospitalisés</h1>

{/* Cartes de Statistiques */}
<div className="stats-container">
  <div className="stat-card">
    <i className="fas fa-procedures"></i>
    <p>Patients hospitalisés</p>
    <h2>{patients.length}</h2>
  </div>
  <div className="stat-card">
    <i className="fas fa-user-md"></i>
    <p>Interventions planifiées</p>
    <h2>12</h2>
  </div>
  <div className="stat-card">
    <i className="fas fa-ambulance"></i>
    <p>Sorties prévues</p>
    <h2>5</h2>
  </div>
</div>
      {/* Bouton Ajouter */}
      <div className="add-patient">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Ajouter un Patient
        </Button>
      </div>

      {/* Tableau des Patients */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID Hospitalization</th>
            <th>ID Patient</th>
            <th>Admission Date</th>
            <th>Discharge Date</th>
            <th>Room Number</th>
            <th>Discharge</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.idHospitalization}</td>
              <td>{patient.idPatient}</td>
              <td>{new Date(patient.admissionDate).toLocaleDateString()}</td>
              <td>{new Date(patient.dischargeDate).toLocaleDateString()}</td>
              <td>{patient.roomNumber}</td>
              <td>{patient.discharge}</td>
              <td>
                <Button variant="warning" onClick={() => handleEditClick(patient)}>Modifier</Button>{' '}
                <Button variant="danger">Supprimer</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Ajouter */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Ajouter un Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>ID Hospitalization</Form.Label>
              <Form.Control type="text" name="idHospitalization" value={newPatient.idHospitalization} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>ID Patient</Form.Label>
              <Form.Control type="text" name="idPatient" value={newPatient.idPatient} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date Admission</Form.Label>
              <Form.Control type="date" name="admissionDate" value={newPatient.admissionDate} onChange={handleChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Date Sortie</Form.Label>
              <Form.Control type="date" name="dischargeDate" value={newPatient.dischargeDate} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Numéro de Chambre</Form.Label>
              <Form.Control type="text" name="roomNumber" value={newPatient.roomNumber} onChange={handleChange} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sortie</Form.Label>
              <Form.Select name="discharge" value={newPatient.discharge} onChange={handleChange}>
                <option value="No">Non</option>
                <option value="Yes">Oui</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">Ajouter</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Modifier */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier un Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Form onSubmit={handleEditSubmit}>
              <Form.Group>
                <Form.Label>ID Hospitalization</Form.Label>
                <Form.Control type="text" name="idHospitalization" value={selectedPatient.idHospitalization} onChange={handleEditChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>ID Patient</Form.Label>
                <Form.Control type="text" name="idPatient" value={selectedPatient.idPatient} onChange={handleEditChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>Date Admission</Form.Label>
                <Form.Control type="date" name="admissionDate" value={selectedPatient.admissionDate} onChange={handleEditChange} required />
              </Form.Group>
              <Form.Group>
                <Form.Label>Date Sortie</Form.Label>
                <Form.Control type="date" name="dischargeDate" value={selectedPatient.dischargeDate} onChange={handleEditChange} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Numéro de Chambre</Form.Label>
                <Form.Control type="text" name="roomNumber" value={selectedPatient.roomNumber} onChange={handleEditChange} />
              </Form.Group>
              <Button variant="success" type="submit">Mettre à jour</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HospitalizedPatients;
