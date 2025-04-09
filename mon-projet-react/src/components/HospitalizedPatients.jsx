// eslint-disable-next-line no-unused-vars
import React from 'react';
import axios from "axios";
import { Table, Button, Modal, Form, Badge, Spinner } from "react-bootstrap";
import { FaProcedures, FaUserMd, FaAmbulance, FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import "./HospitalizedPatients.css";

const HospitalizedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
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

  useEffect(() => {
    const results = patients.filter(patient =>
      patient.idPatient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.idHospitalization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPatients(results);
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/hospitalized-patients");
      setPatients(response.data);
      setFilteredPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des patients:", error);
      setLoading(false);
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

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce patient hospitalisé ?")) {
      try {
        await axios.delete(`http://localhost:5000/hospitalized-patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (discharge) => {
    return discharge === "Yes" ? 
      <Badge bg="success">Sorti</Badge> : 
      <Badge bg="warning" text="dark">Hospitalisé</Badge>;
  };

  return (
    <div className="hospital-management-container">
      <div className="hospital-header">
        <h1><FaProcedures /> Gestion des Patients Hospitalisés</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par ID patient, ID hospitalisation ou chambre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Nouvelle Hospitalisation
          </Button>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon">
            <FaProcedures />
          </div>
          <div className="stat-content">
            <h3>Patients hospitalisés</h3>
            <p>{patients.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserMd />
          </div>
          <div className="stat-content">
            <h3>En soins intensifs</h3>
            <p>{patients.filter(p => p.roomNumber && p.roomNumber.startsWith('ICU')).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaAmbulance />
          </div>
          <div className="stat-content">
            <h3>Sorties aujourd'hui</h3>
            <p>
              {patients.filter(p => {
                const today = new Date().toISOString().split('T')[0];
                return p.dischargeDate && p.dischargeDate.split('T')[0] === today;
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Tableau des Patients */}
      <div className="patients-table-container">
        {loading ? (
          <div className="loading-spinner">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Chargement...</span>
            </Spinner>
          </div>
        ) : (
          <Table striped bordered hover responsive className="patients-table">
            <thead>
              <tr>
                <th>ID Hospitalisation</th>
                <th>ID Patient</th>
                <th>Date Admission</th>
                <th>Date Sortie</th>
                <th>Chambre</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.idHospitalization}</td>
                    <td>{patient.idPatient}</td>
                    <td>{formatDate(patient.admissionDate)}</td>
                    <td>{formatDate(patient.dischargeDate)}</td>
                    <td>{patient.roomNumber || 'N/A'}</td>
                    <td>{getStatusBadge(patient.discharge)}</td>
                    <td className="actions-cell">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditClick(patient)}>
                        <FaEdit /> Modifier
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(patient._id)}>
                        <FaTrash /> Supprimer
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    Aucun patient trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Modal Ajouter */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaPlus /> Nouvelle Hospitalisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>ID Hospitalisation</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="idHospitalization" 
                    value={newPatient.idHospitalization} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>ID Patient</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="idPatient" 
                    value={newPatient.idPatient} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date Admission</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    name="admissionDate" 
                    value={newPatient.admissionDate} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Date Sortie (optionnelle)</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    name="dischargeDate" 
                    value={newPatient.dischargeDate} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Numéro de Chambre</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="roomNumber" 
                    value={newPatient.roomNumber} 
                    onChange={handleChange} 
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Statut</Form.Label>
                  <Form.Select name="discharge" value={newPatient.discharge} onChange={handleChange}>
                    <option value="No">Hospitalisé</option>
                    <option value="Yes">Sorti</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>
            
            <div className="form-footer">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal Modifier */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title><FaEdit /> Modifier Hospitalisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <Form onSubmit={handleEditSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>ID Hospitalisation</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="idHospitalization" 
                      value={selectedPatient.idHospitalization} 
                      onChange={handleEditChange} 
                      required 
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>ID Patient</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="idPatient" 
                      value={selectedPatient.idPatient} 
                      onChange={handleEditChange} 
                      required 
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date Admission</Form.Label>
                    <Form.Control 
                      type="datetime-local" 
                      name="admissionDate" 
                      value={selectedPatient.admissionDate} 
                      onChange={handleEditChange} 
                      required 
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Date Sortie</Form.Label>
                    <Form.Control 
                      type="datetime-local" 
                      name="dischargeDate" 
                      value={selectedPatient.dischargeDate} 
                      onChange={handleEditChange} 
                    />
                  </Form.Group>
                </div>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Numéro de Chambre</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="roomNumber" 
                      value={selectedPatient.roomNumber} 
                      onChange={handleEditChange} 
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Statut</Form.Label>
                    <Form.Select name="discharge" value={selectedPatient.discharge} onChange={handleEditChange}>
                      <option value="No">Hospitalisé</option>
                      <option value="Yes">Sorti</option>
                    </Form.Select>
                  </Form.Group>
                </div>
              </div>
              
              <div className="form-footer">
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit">
                  Mettre à jour
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default HospitalizedPatients;