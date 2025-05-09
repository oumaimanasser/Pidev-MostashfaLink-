import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaSort, 
  FaFilePdf, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaTimes,
  FaSortUp,
  FaSortDown 
} from 'react-icons/fa';

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  btnAdd: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:hover': {
      backgroundColor: '#45a049'
    }
  },
  controlsSection: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '20px'
  },
  searchBox: {
    position: 'relative',
    flexGrow: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#777'
  },
  searchInput: {
    width: '100%',
    padding: '10px 10px 10px 35px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  limitSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  patientsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px'
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd',
    '&:hover': {
      backgroundColor: '#e6e6e6'
    }
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f5f5f5'
    }
  },
  tableCell: {
    padding: '12px 15px',
    textAlign: 'left',
    borderBottom: '1px solid #ddd'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  btnReport: {
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#e67e22'
    }
  },
  btnEdit: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#2980b9'
    }
  },
  btnDelete: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#c0392b'
    }
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '20px'
  },
  paginationButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#f2f2f2'
    }
  },
  activePage: {
    backgroundColor: '#4CAF50',
    color: 'white',
    borderColor: '#4CAF50'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  patientForm: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  formLabel: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  },
  formInput: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px'
  },
  btnSubmit: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#45a049'
    }
  },
  btnCancel: {
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#d32f2f'
    }
  },
  loading: {
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
    color: '#777'
  },
  errorMessage: {
    color: '#d32f2f',
    backgroundColor: '#fde8e8',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '20px'
  },
  noPatients: {
    textAlign: 'center',
    padding: '20px',
    color: '#777'
  },
  alert: {
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  alertSuccess: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  alertError: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  },
  closeAlert: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit'
  }
};
const API_BASE_URL = 'http://localhost:3002/api';
const HospitalizedPatient = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ field: 'admissionDate', direction: 'desc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const formInitialState = {
    idHospitalization: '',
    idPatient: '',
    admissionDate: '',
    dischargeDate: '',
    roomNumber: '',
    discharge: 'Hospitalized'
  };
  const [formData, setFormData] = useState(formInitialState);
 
  // Ajout de useEffect pour le chargement initial des données
  useEffect(() => {
    fetchPatients();
  }, [pagination.page, pagination.limit, searchTerm, sortConfig]);
  
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;
      const response = await axios.get(`${API_BASE_URL}/hospitalized-patients`, {
        params: {
          page,
          limit,
          search: searchTerm,
          sortField: sortConfig.field,
          sortOrder: sortConfig.direction
        }
      });
      
      setPatients(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des patients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Ajout de la fonction handleInputChange manquante
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Ajout de la fonction handleEdit manquante
  const handleEdit = (patient) => {
    // Format des dates pour l'affichage dans le formulaire
    const formattedPatient = {
      ...patient,
      admissionDate: patient.admissionDate ? new Date(patient.admissionDate).toISOString().split('T')[0] : '',
      dischargeDate: patient.dischargeDate ? new Date(patient.dischargeDate).toISOString().split('T')[0] : ''
    };
    
    setCurrentPatient(patient);
    setFormData(formattedPatient);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Formatage des dates pour le backend
      const formattedData = {
        ...formData,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : null,
        dischargeDate: formData.dischargeDate ? new Date(formData.dischargeDate) : null
      };

      if (currentPatient) {
        // Mise à jour d'un patient existant
        await axios.put(`${API_BASE_URL}/hospitalized-patients/${currentPatient._id}`, formattedData);
        setAlert({
          type: 'success',
          message: 'Patient mis à jour avec succès!'
        });
      } else {
        // Création d'un nouveau patient
        await axios.post(`${API_BASE_URL}/hospitalized-patients/add`, formattedData);
        setAlert({
          type: 'success',
          message: 'Patient ajouté avec succès!'
        });
      }
      fetchPatients();
      resetForm();
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l\'enregistrement du patient'
      });
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await axios.delete(`${API_BASE_URL}/hospitalized-patients/${id}`);
        setAlert({
          type: 'success',
          message: 'Patient supprimé avec succès!'
        });
        fetchPatients();
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Erreur lors de la suppression du patient'
        });
        console.error(err);
      }
    }
  };

  const generateReport = (id) => {
    window.open(`${API_BASE_URL}/hospitalized-patients/${id}/report`, '_blank');
  };

  const resetForm = () => {
    setFormData(formInitialState);
    setCurrentPatient(null);
    setShowForm(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 });
  };

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortConfig.field === field && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ field, direction });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleLimitChange = (e) => {
    setPagination({ ...pagination, limit: parseInt(e.target.value), page: 1 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getDischargeStatus = (status) => {
    switch(status) {
      case 'ReturnHomeOnFoot': return 'Retour à domicile à pied';
      case 'ReturnHomeByAmbulance': return 'Retour à domicile en ambulance';
      case 'Hospitalized': return 'Hospitalisé';
      default: return status || 'Inconnu';
    }
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) return <FaSort />;
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div style={styles.container}>
      {alert && (
        <div style={{...styles.alert, ...(alert.type === 'success' ? styles.alertSuccess : styles.alertError)}}>
          <span>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={styles.closeAlert}>
            <FaTimes />
          </button>
        </div>
      )}

      <div style={styles.headerSection}>
        <h1>Gestion des Patients Hospitalisés</h1>
        <button style={styles.btnAdd} onClick={() => setShowForm(true)}>
          <FaPlus /> Ajouter un Patient
        </button>
      </div>

      <div style={styles.controlsSection}>
        <div style={styles.searchBox}>
          <FaSearch style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Rechercher par ID, chambre..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.limitSelector}>
          <label>Patients par page:</label>
          <select 
            value={pagination.limit} 
            onChange={handleLimitChange}
            style={styles.formInput}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>Chargement des données...</div>
      ) : error ? (
        <div style={styles.errorMessage}>{error}</div>
      ) : patients.length === 0 ? (
        <p style={styles.noPatients}>Aucun patient hospitalisé trouvé</p>
      ) : (
        <>
          <div style={styles.tableResponsive}>
            <table style={styles.patientsTable}>
              <thead>
                <tr>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('idHospitalization')}
                  >
                    ID Hospitalisation {getSortIcon('idHospitalization')}
                  </th>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('idPatient')}
                  >
                    ID Patient {getSortIcon('idPatient')}
                  </th>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('admissionDate')}
                  >
                    Date d&apos;admission {getSortIcon('admissionDate')}
                  </th>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('dischargeDate')}
                  >
                    Date de sortie {getSortIcon('dischargeDate')}
                  </th>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('roomNumber')}
                  >
                    Chambre {getSortIcon('roomNumber')}
                  </th>
                  <th 
                    style={styles.tableHeader}
                    onClick={() => handleSort('discharge')}
                  >
                    Statut {getSortIcon('discharge')}
                  </th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{patient.idHospitalization}</td>
                    <td style={styles.tableCell}>{patient.idPatient}</td>
                    <td style={styles.tableCell}>{formatDate(patient.admissionDate)}</td>
                    <td style={styles.tableCell}>{formatDate(patient.dischargeDate)}</td>
                    <td style={styles.tableCell}>{patient.roomNumber}</td>
                    <td style={styles.tableCell}>{getDischargeStatus(patient.discharge)}</td>
                    <td style={{...styles.tableCell, ...styles.actions}}>
                      <button 
                        style={styles.btnReport}
                        onClick={() => generateReport(patient._id)}
                        title="Générer rapport"
                      >
                        <FaFilePdf />
                      </button>
                      <button 
                        style={styles.btnEdit}
                        onClick={() => handleEdit(patient)}
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        style={styles.btnDelete}
                        onClick={() => handleDelete(patient._id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.pagination}>
            <button 
              style={styles.paginationButton}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Précédent
            </button>
            
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                style={{
                  ...styles.paginationButton,
                  ...(pagination.page === page && styles.activePage)
                }}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              style={styles.paginationButton}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
            >
              Suivant
            </button>
          </div>
        </>
      )}

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.patientForm}>
            <div style={styles.formHeader}>
              <h2>{currentPatient ? 'Modifier Patient' : 'Ajouter Patient'}</h2>
              <button 
                style={{background: 'none', border: 'none', cursor: 'pointer'}}
                onClick={resetForm}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ID Hospitalisation</label>
                <input
                  type="number"
                  name="idHospitalization"
                  value={formData.idHospitalization}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>ID Patient</label>
                <input
                  type="number"
                  name="idPatient"
                  value={formData.idPatient}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Date d&apos;admission</label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Date de sortie</label>
                <input
                  type="date"
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleInputChange}
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Numéro de chambre</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>État de sortie</label>
                <select
                  name="discharge"
                  value={formData.discharge}
                  onChange={handleInputChange}
                  required
                  style={styles.formInput}
                >
                  <option value="Hospitalized">Hospitalisé</option>
                  <option value="ReturnHomeOnFoot">Retour à domicile à pied</option>
                  <option value="ReturnHomeByAmbulance">Retour à domicile en ambulance</option>
                </select>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.btnSubmit}>
                  {currentPatient ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                <button 
                  type="button" 
                  style={styles.btnCancel}
                  onClick={resetForm}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalizedPatient;