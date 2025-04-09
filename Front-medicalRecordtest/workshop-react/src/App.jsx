import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa'; // Import de l'icône
import './App.css';

const API_URL = 'http://localhost:3001/api/medical-records';
const CONSULTATION_API_URL = 'http://localhost:3001/api/consultations';
const EXPORT_API_URL = 'http://localhost:3001/api/export';

function App() {
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
    const [editingConsultation, setEditingConsultation] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 2;
    const [expandedConsultations, setExpandedConsultations] = useState({});
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: 'Bonjour, infirmière ! Essayez "nouveau dossier", "nouvelle consultation", ou "voir dossier [ID]".' }
    ]);
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        fetchAllRecordsWithConsultations();
    }, []);

    const fetchAllRecordsWithConsultations = async () => {
        try {
            const recordsResponse = await axios.get(API_URL);
            const records = recordsResponse.data;
            const recordsWithConsultations = await Promise.all(
                records.map(async (record) => {
                    const consultationsResponse = await axios.get(`${CONSULTATION_API_URL}/${record._id}/consultations`);
                    return { ...record, consultations: consultationsResponse.data || [] };
                })
            );
            setMedicalRecords(recordsWithConsultations);
            setMessage({ text: 'Dossiers médicaux chargés avec succès', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.message}`, type: 'error' });
        }
    };

    const fetchRecordById = async () => {
        if (!searchId) return;
        try {
            const response = await axios.get(`${API_URL}/${searchId}`);
            const record = response.data;
            const consultationsResponse = await axios.get(`${CONSULTATION_API_URL}/${record._id}/consultations`);
            const recordWithConsultations = { ...record, consultations: consultationsResponse.data };
            setCurrentRecord(recordWithConsultations);
            setMedicalRecords([recordWithConsultations]);
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
            const records = response.data;
            const recordsWithConsultations = await Promise.all(
                records.map(async (record) => {
                    const consultationsResponse = await axios.get(`${CONSULTATION_API_URL}/${record._id}/consultations`);
                    return { ...record, consultations: consultationsResponse.data };
                })
            );
            setMedicalRecords(recordsWithConsultations);
            setMessage({ text: 'Dossiers médicaux du patient trouvés', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const createRecord = async () => {
        try {
            const response = await axios.post(API_URL, formData);
            const newRecord = { ...response.data, consultations: [] };
            setMedicalRecords([...medicalRecords, newRecord]);
            setMessage({ text: 'Dossier médical créé avec succès', type: 'success' });
            resetForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const updateRecord = async () => {
        try {
            const response = await axios.put(`${API_URL}/${formData.idRecord}`, formData);
            setMedicalRecords(medicalRecords.map(record => record.idRecord === formData.idRecord ? response.data : record));
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
            if (currentRecord && currentRecord.idRecord === id) setCurrentRecord(null);
            if (currentPage > Math.ceil((medicalRecords.length - 1) / recordsPerPage)) setCurrentPage(currentPage - 1);
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const createConsultation = async () => {
        try {
            const response = await axios.post(CONSULTATION_API_URL, consultationFormData);
            const updatedRecords = medicalRecords.map(record => {
                if (record._id === consultationFormData.medicalRecordId) {
                    const updatedConsultations = record.consultations ? [...record.consultations, response.data] : [response.data];
                    return { ...record, consultations: updatedConsultations };
                }
                return record;
            });
            setMedicalRecords(updatedRecords);
            setMessage({ text: 'Consultation ajoutée avec succès', type: 'success' });
            resetConsultationForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const deleteConsultation = async (consultationId, medicalRecordId) => {
        try {
            await axios.delete(`${CONSULTATION_API_URL}/${consultationId}`);
            setMedicalRecords(prevRecords =>
                prevRecords.map(record => {
                    if (record._id === medicalRecordId) {
                        return { ...record, consultations: record.consultations.filter(c => c._id !== consultationId) };
                    }
                    return record;
                })
            );
            setMessage({ text: 'Consultation supprimée avec succès', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const updateConsultation = async () => {
        try {
            const response = await axios.put(`${CONSULTATION_API_URL}/${editingConsultation._id}`, consultationFormData);
            setMedicalRecords(prevRecords =>
                prevRecords.map(record => {
                    if (record._id === consultationFormData.medicalRecordId) {
                        return {
                            ...record,
                            consultations: record.consultations.map(c => c._id === editingConsultation._id ? response.data : c)
                        };
                    }
                    return record;
                })
            );
            setMessage({ text: 'Consultation mise à jour avec succès', type: 'success' });
            resetConsultationForm();
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const handleExportPDF = async (recordId) => {
        try {
            setIsExporting(true);
            const response = await axios.get(`${EXPORT_API_URL}/medical-record/${recordId}/pdf`, { responseType: 'blob' });
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `dossier_medical_${recordId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(pdfUrl);
            setMessage({ text: 'PDF téléchargé avec succès', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur lors de l'export PDF: ${error.message}`, type: 'error' });
        } finally {
            setIsExporting(false);
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleConsultationInputChange = (e) => setConsultationFormData({ ...consultationFormData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        isEditing ? updateRecord() : createRecord();
    };
    const handleConsultationSubmit = (e) => {
        e.preventDefault();
        editingConsultation ? updateConsultation() : createConsultation();
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
    const handleEditConsultation = (consultation) => {
        setEditingConsultation(consultation);
        setConsultationFormData({
            idConsultation: consultation.idConsultation,
            consultationDate: consultation.consultationDate.split('T')[0],
            doctor: consultation.doctor,
            prescription: consultation.prescription,
            treatment: consultation.treatment,
            medicalRecordId: consultation.medicalRecord
        });
        setShowConsultationForm(true);
    };
    const resetForm = () => {
        setFormData({ idRecord: '', idPatient: '', allergies: '', medications: '', diagnostics: '' });
        setIsEditing(false);
        setCurrentRecord(null);
    };
    const resetConsultationForm = () => {
        setConsultationFormData({ idConsultation: '', consultationDate: '', doctor: '', prescription: '', treatment: '', medicalRecordId: '' });
        setEditingConsultation(null);
        setShowConsultationForm(false);
    };
    const formatDate = (dateString) => new Date(dateString).toLocaleString();
    const toggleDarkMode = () => setDarkMode(prev => !prev);
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = medicalRecords.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(medicalRecords.length / recordsPerPage);
    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const toggleConsultations = (recordId) => {
        setExpandedConsultations(prev => ({ ...prev, [recordId]: !prev[recordId] }));
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
        const input = chatInput.toLowerCase().trim();

        let botResponse = 'Je ne comprends pas. Essayez "nouveau dossier", "nouvelle consultation", ou "voir dossier [ID]".';
        if (input === 'nouveau dossier') {
            botResponse = 'Remplissez le formulaire à gauche pour créer un nouveau dossier médical.';
            setFormData({ idRecord: '', idPatient: '', allergies: '', medications: '', diagnostics: '' });
            setIsEditing(false);
        } else if (input === 'nouvelle consultation') {
            botResponse = 'Choisissez un dossier dans la liste et cliquez sur "Ajouter une consultation".';
        } else if (input.startsWith('voir dossier')) {
            const id = input.split(' ')[2];
            if (id && medicalRecords.some(r => r.idRecord.toString() === id)) {
                setSearchId(id);
                fetchRecordById();
                botResponse = `Dossier ${id} chargé dans la liste.`;
            } else {
                botResponse = `Dossier ${id} non trouvé. Vérifiez l’ID.`;
            }
        } else if (input === 'combien de dossiers') {
            botResponse = `Il y a ${medicalRecords.length} dossiers enregistrés.`;
        }

        setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
        setChatInput('');
    };

    return (
        <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
            <header className="app-header">
                <h1>Gestion des Dossiers Médicaux - Triage</h1>
                <button onClick={toggleDarkMode} className="dark-mode-toggle">
                    {darkMode ? 'Mode clair' : 'Mode sombre'}
                </button>
            </header>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ text: '', type: '' })} className="close-btn">×</button>
                </div>
            )}

            <main className="app-main">
                <section className="search-section">
                    <div className="search-container">
                        <div className="search-group">
                            <input
                                type="text"
                                list="recordSuggestions"
                                placeholder="Rechercher par ID du dossier"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                            />
                            <datalist id="recordSuggestions">
                                {medicalRecords.map(record => (
                                    <option key={record._id} value={record.idRecord.toString()} />
                                ))}
                            </datalist>
                            <button onClick={fetchRecordById}>Rechercher</button>
                        </div>
                        <div className="search-group">
                            <input
                                type="text"
                                list="patientSuggestions"
                                placeholder="Rechercher par ID du patient"
                                value={searchPatientId}
                                onChange={(e) => setSearchPatientId(e.target.value)}
                            />
                            <datalist id="patientSuggestions">
                                {[...new Set(medicalRecords.map(record => record.idPatient))].map(idPatient => (
                                    <option key={idPatient} value={idPatient.toString()} />
                                ))}
                            </datalist>
                            <button onClick={fetchRecordsByPatientId}>Rechercher</button>
                        </div>
                        <button onClick={fetchAllRecordsWithConsultations} className="reset-btn">Afficher tous les dossiers</button>
                    </div>
                </section>

                <div className="content-wrapper">
                    <section className="form-section card">
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
                                    <button type="button" onClick={resetForm} className="cancel-btn">
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    <section className="records-section">
                        <h2>Liste des dossiers médicaux ({medicalRecords.length})</h2>
                        {currentRecords.length > 0 ? (
                            <>
                                <div className="records-container">
                                    {currentRecords.map(record => (
                                        <div className="record-card card" key={record._id}>
                                            <div className="record-header">
                                                <h3>Dossier #{record.idRecord}</h3>
                                                <div className="record-actions">
                                                    <button onClick={() => handleEdit(record)} className="edit-btn">Modifier</button>
                                                    <button onClick={() => deleteRecord(record.idRecord)} className="delete-btn">Supprimer</button>
                                                    <button
                                                        onClick={() => {
                                                            setConsultationFormData({ ...consultationFormData, medicalRecordId: record._id });
                                                            setShowConsultationForm(true);
                                                        }}
                                                        className="add-consultation-btn"
                                                    >
                                                        Ajouter une consultation
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportPDF(record._id)}
                                                        disabled={isExporting}
                                                        className="export-btn"
                                                    >
                                                        {isExporting ? 'Exportation...' : 'Exporter en PDF'}
                                                    </button>
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
                                                        <>
                                                            <div className="consultation-card card">
                                                                <p><strong>Date:</strong> {formatDate(record.consultations[0].consultationDate)}</p>
                                                                <p><strong>Médecin:</strong> {record.consultations[0].doctor}</p>
                                                                <p><strong>Prescription:</strong> {record.consultations[0].prescription}</p>
                                                                <p><strong>Traitement:</strong> {record.consultations[0].treatment}</p>
                                                                <div className="consultation-actions">
                                                                    <button
                                                                        onClick={() => handleEditConsultation(record.consultations[0])}
                                                                        className="edit-btn"
                                                                    >
                                                                        Modifier
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteConsultation(record.consultations[0]._id, record._id)}
                                                                        className="delete-btn"
                                                                    >
                                                                        Supprimer
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {record.consultations.length > 1 && (
                                                                <div className="consultation-toggle">
                                                                    <button
                                                                        onClick={() => toggleConsultations(record._id)}
                                                                        className="toggle-btn"
                                                                    >
                                                                        {expandedConsultations[record._id] ? 'Masquer' : 'Voir toutes les consultations'} ▼
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {expandedConsultations[record._id] && record.consultations.slice(1).map(consultation => (
                                                                <div key={consultation._id} className="consultation-card card">
                                                                    <p><strong>Date:</strong> {formatDate(consultation.consultationDate)}</p>
                                                                    <p><strong>Médecin:</strong> {consultation.doctor}</p>
                                                                    <p><strong>Prescription:</strong> {consultation.prescription}</p>
                                                                    <p><strong>Traitement:</strong> {consultation.treatment}</p>
                                                                    <div className="consultation-actions">
                                                                        <button
                                                                            onClick={() => handleEditConsultation(consultation)}
                                                                            className="edit-btn"
                                                                        >
                                                                            Modifier
                                                                        </button>
                                                                        <button
                                                                            onClick={() => deleteConsultation(consultation._id, record._id)}
                                                                            className="delete-btn"
                                                                        >
                                                                            Supprimer
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </>
                                                    ) : (
                                                        <p>Aucune consultation enregistrée</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="pagination">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 1}
                                        className="pagination-btn"
                                    >
                                        Précédent
                                    </button>
                                    <span>Page {currentPage} / {totalPages}</span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className="pagination-btn"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="no-records">Aucun dossier médical trouvé</p>
                        )}
                    </section>
                </div>

                {showConsultationForm && (
                    <div className="modal-overlay">
                        <div className="modal card">
                            <button onClick={resetConsultationForm} className="close-modal-btn">×</button>
                            <h2>{editingConsultation ? 'Modifier une consultation' : 'Ajouter une consultation'}</h2>
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
                                    <button type="submit" className="submit-btn">
                                        {editingConsultation ? 'Mettre à jour' : 'Ajouter'}
                                    </button>
                                    <button type="button" onClick={resetConsultationForm} className="cancel-btn">
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Bouton avec icône FaRobot */}
                <button onClick={() => setShowChatbot(!showChatbot)} className="chatbot-icon-btn" title={showChatbot ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}>
                    <FaRobot size={40} color="#28a745" />
                </button>

                {showChatbot && (
                    <div className="chatbot-container">
                        <div className="chatbot-header">
                            <h3>Assistant de Triage</h3>
                            <button onClick={() => setShowChatbot(false)} className="close-btn">×</button>
                        </div>
                        <div className="chatbot-messages">
                            {chatMessages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.sender}`}>
                                    <span>{msg.text}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleChatSubmit} className="chatbot-input-form">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ex. : nouveau dossier"
                            />
                            <button type="submit">Envoyer</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;