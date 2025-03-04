import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Configuration de l'URL de base pour les requêtes API
const API_URL = 'http://localhost:3001/api/medical-records';
const CONSULTATION_API_URL = 'http://localhost:3001/api/consultations';

function App() {
    // États pour la gestion des données
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [searchId, setSearchId] = useState('');
    const [searchPatientId, setSearchPatientId] = useState('');
    const [formData, setFormData] = useState({
        idRecord: '',
        idPatient: '',
        allergies: '',
        medications: '',
        diagnostics: ''
    });
    const [consultationFormData, setConsultationFormData] = useState({
        idConsultation: '',
        consultationDate: '',
        doctor: '',
        prescription: '',
        treatment: '',
        medicalRecordId: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [showConsultationForm, setShowConsultationForm] = useState(false);

    // Chargement initial des dossiers médicaux
    useEffect(() => {
        fetchAllRecords();
    }, []);

    // Fonctions pour les requêtes API
    const fetchAllRecords = async () => {
        try {
            const response = await axios.get(API_URL);
            setMedicalRecords(response.data);
            setMessage({ text: 'Dossiers médicaux chargés avec succès', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const fetchRecordById = async () => {
        if (!searchId) return;

        try {
            const response = await axios.get(`${API_URL}/${searchId}`);
            setCurrentRecord(response.data);
            setMedicalRecords([response.data]);
            setMessage({ text: 'Dossier médical trouvé', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
            setCurrentRecord(null);
        }
    };

    const fetchRecordsByPatientId = async () => {
        if (!searchPatientId) return;

        try {
            const response = await axios.get(`${API_URL}/patient/${searchPatientId}`);
            setMedicalRecords(response.data);
            setMessage({ text: 'Dossiers médicaux du patient trouvés', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const createRecord = async () => {
        try {
            const response = await axios.post(API_URL, formData);
            setMedicalRecords([...medicalRecords, response.data]);
            setMessage({ text: 'Dossier médical créé avec succès', type: 'success' });
            resetForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const updateRecord = async () => {
        try {
            const response = await axios.put(`${API_URL}/${formData.idRecord}`, formData);
            setMedicalRecords(
                medicalRecords.map(record =>
                    record.idRecord === formData.idRecord ? response.data : record
                )
            );
            setMessage({ text: 'Dossier médical mis à jour avec succès', type: 'success' });
            setIsEditing(false);
            resetForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const deleteRecord = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setMedicalRecords(medicalRecords.filter(record => record.idRecord !== id));
            setMessage({ text: 'Dossier médical supprimé avec succès', type: 'success' });

            if (currentRecord && currentRecord.idRecord === id) {
                setCurrentRecord(null);
            }
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const createConsultation = async () => {
        try {
            const response = await axios.post(CONSULTATION_API_URL, consultationFormData);
            setMedicalRecords(
                medicalRecords.map(record =>
                    record._id === consultationFormData.medicalRecordId
                        ? { ...record, consultations: [...record.consultations, response.data] }
                        : record
                )
            );
            setMessage({ text: 'Consultation ajoutée avec succès', type: 'success' });
            resetConsultationForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    // Gestionnaires d'événements
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleConsultationInputChange = (e) => {
        const { name, value } = e.target;
        setConsultationFormData({ ...consultationFormData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateRecord();
        } else {
            createRecord();
        }
    };

    const handleConsultationSubmit = (e) => {
        e.preventDefault();
        createConsultation();
    };

    const handleEdit = (record) => {
        setFormData({
            idRecord: record.idRecord,
            idPatient: record.idPatient,
            allergies: record.allergies,
            medications: record.medications,
            diagnostics: record.diagnostics
        });
        setIsEditing(true);
        setCurrentRecord(record);
    };

    const resetForm = () => {
        setFormData({
            idRecord: '',
            idPatient: '',
            allergies: '',
            medications: '',
            diagnostics: ''
        });
        setIsEditing(false);
        setCurrentRecord(null);
    };

    const resetConsultationForm = () => {
        setConsultationFormData({
            idConsultation: '',
            consultationDate: '',
            doctor: '',
            prescription: '',
            treatment: '',
            medicalRecordId: ''
        });
        setShowConsultationForm(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Gestion des Dossiers Médicaux</h1>
            </header>

            {message.text && (
                <div className={`alert ${message.type}`}>
                    {message.text}
                    <button className="close-btn" onClick={() => setMessage({ text: '', type: '' })}>×</button>
                </div>
            )}

            <main className="app-main">
                <section className="search-section">
                    <div className="search-container">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Rechercher par ID du dossier"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                            <button onClick={fetchRecordById}>Rechercher</button>
                        </div>

                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Rechercher par ID du patient"
                                value={searchPatientId}
                                onChange={(e) => setSearchPatientId(e.target.value)}
                            />
                            <button onClick={fetchRecordsByPatientId}>Rechercher</button>
                        </div>

                        <button className="reset-btn" onClick={fetchAllRecords}>Afficher tous les dossiers</button>
                    </div>
                </section>

                <div className="content-wrapper">
                    <section className="form-section">
                        <h2>{isEditing ? 'Modifier un dossier médical' : 'Créer un nouveau dossier médical'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>ID du dossier:</label>
                                <input
                                    type="number"
                                    name="idRecord"
                                    value={formData.idRecord}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing}
                                />
                            </div>

                            <div className="form-group">
                                <label>ID du patient:</label>
                                <input
                                    type="number"
                                    name="idPatient"
                                    value={formData.idPatient}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Allergies:</label>
                                <textarea
                                    name="allergies"
                                    value={formData.allergies}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Médicaments:</label>
                                <textarea
                                    name="medications"
                                    value={formData.medications}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Diagnostics:</label>
                                <textarea
                                    name="diagnostics"
                                    value={formData.diagnostics}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-buttons">
                                <button type="submit" className="submit-btn">
                                    {isEditing ? 'Mettre à jour' : 'Créer'}
                                </button>
                                {isEditing && (
                                    <button type="button" className="cancel-btn" onClick={resetForm}>
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="records-section">
                        <h2>Liste des dossiers médicaux ({medicalRecords.length})</h2>
                        {medicalRecords.length > 0 ? (
                            <div className="records-container">
                                {medicalRecords.map((record) => (
                                    <div className="record-card" key={record._id}>
                                        <div className="record-header">
                                            <h3>Dossier #{record.idRecord}</h3>
                                            <div className="record-actions">
                                                <button className="edit-btn" onClick={() => handleEdit(record)}>Modifier</button>
                                                <button className="delete-btn" onClick={() => deleteRecord(record.idRecord)}>Supprimer</button>
                                                <button className="add-consultation-btn" onClick={() => {
                                                    setConsultationFormData({ ...consultationFormData, medicalRecordId: record._id });
                                                    setShowConsultationForm(true);
                                                }}>Ajouter une consultation</button>
                                            </div>
                                        </div>
                                        <div className="record-details">
                                            <p><strong>Patient ID:</strong> {record.idPatient}</p>
                                            <p><strong>Créé le:</strong> {formatDate(record.creationDate)}</p>
                                            <p><strong>Dernière mise à jour:</strong> {formatDate(record.lastupdateDate)}</p>

                                            <div className="record-section">
                                                <h4>Allergies</h4>
                                                <p>{record.allergies || 'Aucune allergie enregistrée'}</p>
                                            </div>

                                            <div className="record-section">
                                                <h4>Médicaments</h4>
                                                <p>{record.medications || 'Aucun médicament enregistré'}</p>
                                            </div>

                                            <div className="record-section">
                                                <h4>Diagnostics</h4>
                                                <p>{record.diagnostics || 'Aucun diagnostic enregistré'}</p>
                                            </div>

                                            <div className="record-section">
                                                <h4>Consultations</h4>
                                                {record.consultations && record.consultations.length > 0 ? (
                                                    record.consultations.map((consultation) => (
                                                        <div key={consultation._id} className="consultation-card">
                                                            <p><strong>Date:</strong> {formatDate(consultation.consultationDate)}</p>
                                                            <p><strong>Médecin:</strong> {consultation.doctor}</p>
                                                            <p><strong>Prescription:</strong> {consultation.prescription}</p>
                                                            <p><strong>Traitement:</strong> {consultation.treatment}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>Aucune consultation enregistrée</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-records">Aucun dossier médical trouvé</p>
                        )}
                    </section>
                </div>

                {showConsultationForm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <button
                                className="close-modal-btn"
                                onClick={resetConsultationForm}
                            >
                                ×
                            </button>
                            <h2>Ajouter une consultation</h2>
                            <form onSubmit={handleConsultationSubmit}>
                                <div className="form-group">
                                    <label>ID de la consultation:</label>
                                    <input
                                        type="number"
                                        name="idConsultation"
                                        value={consultationFormData.idConsultation}
                                        onChange={handleConsultationInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date de la consultation:</label>
                                    <input
                                        type="date"
                                        name="consultationDate"
                                        value={consultationFormData.consultationDate}
                                        onChange={handleConsultationInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Médecin:</label>
                                    <input
                                        type="text"
                                        name="doctor"
                                        value={consultationFormData.doctor}
                                        onChange={handleConsultationInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Prescription:</label>
                                    <textarea
                                        name="prescription"
                                        value={consultationFormData.prescription}
                                        onChange={handleConsultationInputChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Traitement:</label>
                                    <textarea
                                        name="treatment"
                                        value={consultationFormData.treatment}
                                        onChange={handleConsultationInputChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="form-buttons">
                                    <button type="submit" className="submit-btn">Ajouter</button>
                                    <button type="button" className="cancel-btn" onClick={resetConsultationForm}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;