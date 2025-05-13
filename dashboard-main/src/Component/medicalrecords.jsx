import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaRobot } from 'react-icons/fa';
import io from 'socket.io-client';
import './medicalrecords.css';
import symptomsData from './SymptomsOutput.json';
import { Link } from "react-router-dom";
import logo from "../assests/logo.png";
import TextToSpeech from"./TextToSpeech";
const API_URL = 'http://localhost:3002/api/medicalrecords';
const CONSULTATION_API_URL = 'http://localhost:3002/api/consultations';
const EXPORT_API_URL = 'http://localhost:3002/api/export';
const socket = io('http://localhost:3002');

function App() {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [allRecords, setAllRecords] = useState([]);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [searchPatientName, setSearchPatientName] = useState('');
    const [filterCreationDate, setFilterCreationDate] = useState('');
    const [formData, setFormData] = useState({
        patientName: '',
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
        { sender: 'bot', text: 'Bonjour, infirmière ! Essayez "nouveau dossier", "nouvelle consultation", "voir patient [nom]", "signes vitaux", ou "cls" pour effacer.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatbotState, setChatbotState] = useState({
        askingVitals: false,
        askingRecord: false,
        currentQuestionIndex: 0,
        vitalResponses: {},
        recordId: null,
    });

    const vitalQuestions = symptomsData.filter(q =>
        ['Age', 'Temp', 'SBP', 'DBP'].includes(q.name)
    );

    const frenchVitalQuestions = {
        'Age': 'Quel est votre âge ?',
        'Temp': 'Quelle est votre température (prise avec un thermomètre auriculaire, en °F) ?',
        'SBP': 'Quelle est votre tension artérielle systolique (le chiffre du haut, ex. 120 dans 120/80) ?',
        'DBP': 'Quelle est votre tension artérielle diastolique (le chiffre du bas, ex. 80 dans 120/80) ?'
    };

    useEffect(() => {
        fetchAllRecordsWithConsultations();

        socket.on('vitalAlert', (data) => {
            setMessage({ text: data.message, type: 'error' });
        });

        return () => socket.off('vitalAlert');
    }, []);

    const fetchAllRecordsWithConsultations = async () => {
        try {
            const recordsResponse = await axios.get(API_URL);
            const records = recordsResponse.data;
            const recordsWithConsultations = await Promise.all(
                records.map(async (record) => {
                    try {
                        const consultationsResponse = await axios.get(`${CONSULTATION_API_URL}?medicalRecordId=${record._id}`);
                        return { ...record, consultations: consultationsResponse.data || [] };
                    } catch (error) {
                        console.error(`Erreur lors de la récupération des consultations pour le dossier ${record._id}:`, error);
                        return { ...record, consultations: [] };
                    }
                })
            );
            setAllRecords(recordsWithConsultations);
            setMedicalRecords(recordsWithConsultations);
        } catch (error) {
            setMessage({ text: `Erreur: ${error.message}`, type: 'error' });
        }
    };

    const fetchRecordsByPatientName = async () => {
        if (!searchPatientName) {
            applyFilters();
            return;
        }
        try {
            // Option 1: Utiliser la fonction de filtrage local au lieu d'un appel API séparé
            if (allRecords.length > 0) {
                const filteredRecords = allRecords.filter(record => 
                    record.patientName.toLowerCase().includes(searchPatientName.toLowerCase())
                );
                setMedicalRecords(filteredRecords);
                if (filteredRecords.length > 0) {
                    setMessage({ text: `${filteredRecords.length} dossier(s) médical(aux) trouvé(s)`, type: 'success' });
                } else {
                    setMessage({ text: `Aucun dossier trouvé pour "${searchPatientName}"`, type: 'warning' });
                }
            } else {
                // Si allRecords est vide, on fait un appel général et on filtre après
                const response = await axios.get(API_URL);
                const records = response.data;
                const recordsWithConsultations = await Promise.all(
                    records.map(async (record) => {
                        const consultationsResponse = await axios.get(`${CONSULTATION_API_URL}?medicalRecordId=${record._id}`);
                        return { ...record, consultations: consultationsResponse.data || [] };
                    })
                );
                
                const filteredRecords = recordsWithConsultations.filter(record => 
                    record.patientName.toLowerCase().includes(searchPatientName.toLowerCase())
                );
                
                setAllRecords(recordsWithConsultations);
                setMedicalRecords(filteredRecords);
                
                if (filteredRecords.length > 0) {
                    setMessage({ text: `${filteredRecords.length} dossier(s) médical(aux) trouvé(s)`, type: 'success' });
                } else {
                    setMessage({ text: `Aucun dossier trouvé pour "${searchPatientName}"`, type: 'warning' });
                }
            }
        } catch (error) {
            setMessage({ text: `Erreur lors de la recherche: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const applyFilters = () => {
        let filteredRecords = [...allRecords];

        // Filtrer par date de création
        if (filterCreationDate) {
            const selectedDate = new Date(filterCreationDate);
            selectedDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit
            console.log('Date sélectionnée pour filtrage:', selectedDate.toISOString().split('T')[0]);

            filteredRecords = filteredRecords.filter(record => {
                const creationDate = new Date(record.creationDate);
                creationDate.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit
                console.log('Date de création du dossier:', creationDate.toISOString().split('T')[0]);
                return creationDate.getTime() === selectedDate.getTime();
            });

            if (filteredRecords.length === 0) {
                setMessage({ text: 'Aucun dossier trouvé pour cette date', type: 'warning' });
            } else {
                setMessage({ text: `${filteredRecords.length} dossier(s) trouvé(s) pour cette date`, type: 'success' });
            }
        }

        // Filtrer par nom du patient
        if (searchPatientName) {
            filteredRecords = filteredRecords.filter(record =>
                record.patientName.toLowerCase().includes(searchPatientName.toLowerCase())
            );
        }

        setMedicalRecords(filteredRecords);
        setCurrentPage(1); // Réinitialiser la pagination
    };

    const createRecord = async () => {
        try {
            const response = await axios.post(API_URL, formData);
            const newRecord = { ...response.data, consultations: [] };
            setAllRecords([...allRecords, newRecord]);
            setMedicalRecords([...medicalRecords, newRecord]);
            setMessage({ text: 'Dossier médical créé avec succès', type: 'success' });
            resetForm();
            applyFilters(); // Réappliquer les filtres après création
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const updateRecord = async () => {
        try {
            const response = await axios.put(`${API_URL}/${currentRecord.idRecord}`, formData);
            const updatedRecord = response.data;
            setAllRecords(allRecords.map(record => record.idRecord === currentRecord.idRecord ? updatedRecord : record));
            setMedicalRecords(medicalRecords.map(record => record.idRecord === currentRecord.idRecord ? updatedRecord : record));
            setMessage({ text: 'Dossier médical mis à jour avec succès', type: 'success' });
            setIsEditing(false);
            resetForm();
            applyFilters(); // Réappliquer les filtres après mise à jour
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const deleteRecord = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setAllRecords(allRecords.filter(record => record.idRecord !== id));
            setMedicalRecords(medicalRecords.filter(record => record.idRecord !== id));
            setMessage({ text: 'Dossier médical supprimé avec succès', type: 'success' });
            if (currentRecord && currentRecord.idRecord === id) setCurrentRecord(null);
            if (currentPage > Math.ceil((medicalRecords.length - 1) / recordsPerPage)) setCurrentPage(currentPage - 1);
            applyFilters(); // Réappliquer les filtres après suppression
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
            setAllRecords(updatedRecords);
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
            const updatedRecords = medicalRecords.map(record => {
                if (record._id === medicalRecordId) {
                    return { ...record, consultations: record.consultations.filter(c => c._id !== consultationId) };
                }
                return record;
            });
            setAllRecords(updatedRecords);
            setMedicalRecords(updatedRecords);
            setMessage({ text: 'Consultation supprimée avec succès', type: 'success' });
        } catch (error) {
            setMessage({ text: `Erreur: ${error.response?.data?.message || error.message}`, type: 'error' });
        }
    };

    const updateConsultation = async () => {
        try {
            const response = await axios.put(`${CONSULTATION_API_URL}/${editingConsultation._id}`, consultationFormData);
            const updatedRecords = medicalRecords.map(record => {
                if (record._id === consultationFormData.medicalRecordId) {
                    return {
                        ...record,
                        consultations: record.consultations.map(c => c._id === editingConsultation._id ? response.data : c)
                    };
                }
                return record;
            });
            setAllRecords(updatedRecords);
            setMedicalRecords(updatedRecords);
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
            patientName: record.patientName,
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
        setFormData({ patientName: '', allergies: '', medications: '', diagnostics: '' });
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

    const saveVitalsToRecord = async (idRecord, vitals) => {
        try {
            const response = await axios.post('http://localhost:3002/api/vitals', {
                idRecord: idRecord || undefined,
                patientName: formData.patientName || 'Inconnu',
                vitals,
            });
            if (idRecord) {
                setMedicalRecords((prev) =>
                    prev.map((record) =>
                        record.idRecord === idRecord ? { ...record, vitals: { ...record.vitals, ...vitals } } : record
                    )
                );
                setAllRecords((prev) =>
                    prev.map((record) =>
                        record.idRecord === idRecord ? { ...record, vitals: { ...record.vitals, ...vitals } } : record
                    )
                );
            } else {
                setMedicalRecords((prev) => [...prev, response.data.record]);
                setAllRecords((prev) => [...prev, response.data.record]);
            }
            applyFilters(); // Réappliquer les filtres après ajout des signes vitaux
            return response.data.message;
        } catch (error) {
            return `Erreur lors de la sauvegarde : ${error.message}`;
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        setChatMessages((prev) => [...prev, { sender: 'user', text: chatInput }]);
        const input = chatInput.toLowerCase().trim();

        let botResponse = '';

        if (input === 'cls') {
            setChatMessages([{ sender: 'bot', text: 'Nouvelle conversation démarrée. Comment puis-je vous aider ?' }]);
            setChatbotState({ askingVitals: false, askingRecord: false, currentQuestionIndex: 0, vitalResponses: {}, recordId: null });
            botResponse = '';
        } else if (chatbotState.askingRecord) {
            if (input === 'oui') {
                botResponse = 'Veuillez entrer l ID du dossier médical (idRecord) :';
                setChatbotState((prev) => ({ ...prev, askingRecord: true, askingVitals: false }));
            } else if (input === 'non') {
                botResponse = frenchVitalQuestions['Age'];
                setChatbotState((prev) => ({ ...prev, askingRecord: false, askingVitals: true, currentQuestionIndex: 0 }));
            } else if (!chatbotState.askingVitals && !isNaN(input)) {
                const idRecord = parseInt(input);
                const record = allRecords.find((r) => r.idRecord === idRecord);
                if (record) {
                    botResponse = frenchVitalQuestions['Age'];
                    setChatbotState((prev) => ({
                        ...prev,
                        askingRecord: false,
                        askingVitals: true,
                        currentQuestionIndex: 0,
                        recordId: idRecord,
                    }));
                } else {
                    botResponse = 'Dossier non trouvé. Voulez-vous créer un nouveau dossier ? (Oui/Non)';
                }
            } else {
                botResponse = 'Répondez par "Oui" ou "Non", ou entrez un ID valide.';
            }
        } else if (chatbotState.askingVitals) {
            const currentQuestion = vitalQuestions[chatbotState.currentQuestionIndex];
            const response = parseFloat(chatInput);

            if (!isNaN(response) && response >= currentQuestion.min && response <= currentQuestion.max) {
                setChatbotState((prev) => ({
                    ...prev,
                    vitalResponses: { ...prev.vitalResponses, [currentQuestion.name]: response },
                }));

                if (chatbotState.currentQuestionIndex < vitalQuestions.length - 1) {
                    const nextQuestion = vitalQuestions[chatbotState.currentQuestionIndex + 1];
                    botResponse = frenchVitalQuestions[nextQuestion.name];
                    setChatbotState((prev) => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
                } else {
                    const vitals = { ...chatbotState.vitalResponses, [currentQuestion.name]: response };
                    const { Age, Temp, SBP, DBP } = vitals;
                    botResponse = `Résumé de vos signes vitaux :\nÂge : ${Age} ans\nTempérature : ${Temp} °F\nTension : ${SBP}/${DBP} mmHg`;

                    if (Temp > 100.4) {
                        botResponse += '\n⚠️ Température élevée, possible fièvre.';
                        socket.emit('criticalVital', { message: 'Température critique détectée !', vitals });
                    }
                    if (SBP >= 130 || DBP >= 80) {
                        botResponse += '\n⚠️ Tension élevée, consultez un médecin.';
                        socket.emit('criticalVital', { message: 'Tension artérielle élevée détectée !', vitals });
                    } else if (SBP < 90 || DBP < 60) {
                        botResponse += '\n⚠️ Tension basse, attention.';
                        socket.emit('criticalVital', { message: 'Tension artérielle basse détectée !', vitals });
                    } else {
                        botResponse += '\nTout semble normal.';
                    }

                    const saveResult = await saveVitalsToRecord(chatbotState.recordId, vitals);
                    botResponse += `\n${saveResult}`;

                    setChatbotState({ askingVitals: false, askingRecord: false, currentQuestionIndex: 0, vitalResponses: {}, recordId: null });
                }
            } else {
                botResponse = `Valeur invalide pour "${frenchVitalQuestions[currentQuestion.name]}". Entrez un nombre entre ${currentQuestion.min} et ${currentQuestion.max}.`;
            }
        } else if (input === 'nouveau dossier') {
            botResponse = 'Remplissez le formulaire à gauche pour créer un nouveau dossier médical.';
            setFormData({ patientName: '', allergies: '', medications: '', diagnostics: '' });
            setIsEditing(false);
        } else if (input === 'nouvelle consultation') {
            botResponse = 'Choisissez un dossier dans la liste et cliquez sur "Ajouter une consultation".';
        } else if (input.startsWith('voir patient')) {
            const name = input.split(' ').slice(2).join(' ');
            if (name && allRecords.some(r => r.patientName.toLowerCase() === name.toLowerCase())) {
                setSearchPatientName(name);
                fetchRecordsByPatientName();
                botResponse = `Dossiers pour ${name} chargés dans la liste.`;
            } else {
                botResponse = `Aucun dossier trouvé pour ${name}.`;
            }
        } else if (input === 'combien de dossiers') {
            botResponse = `Il y a ${allRecords.length} dossiers enregistrés.`;
        } else if (input === 'signes vitaux') {
            botResponse = 'Avez-vous déjà un dossier médical ? (Oui/Non)';
            setChatbotState((prev) => ({ ...prev, askingRecord: true }));
        } else {
            botResponse = 'Je ne comprends pas. Essayez "nouveau dossier", "nouvelle consultation", "voir patient [nom]", "signes vitaux", ou "cls".';
        }

        if (botResponse) {
            setChatMessages((prev) => [...prev, { sender: 'bot', text: botResponse }]);
        }
        setChatInput('');
    };

    return (
        <>
         <nav className="nav-bar">
                <img src={logo} alt="" className="logo" />
                <Link to="/dashboard" className="nav-link"> Dashboard</Link>
              </nav>
              <br/>
              <br/>
              <br/>
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
                                type="date"
                                value={filterCreationDate}
                                onChange={(e) => {
                                    setFilterCreationDate(e.target.value);
                                    applyFilters(); // Appliquer le filtre immédiatement
                                }}
                                placeholder="Filtrer par date de création"
                            />
                            <button onClick={() => { setFilterCreationDate(''); applyFilters(); }}>Réinitialiser</button>
                        </div>
                        <div className="search-group">
                            <input
                                type="text"
                                list="patientSuggestions"
                                placeholder="Rechercher par nom du patient"
                                value={searchPatientName}
                                onChange={(e) => {
                                    setSearchPatientName(e.target.value);
                                    applyFilters(); // Appliquer le filtre immédiatement
                                }}
                            />
                            <datalist id="patientSuggestions">
                                {[...new Set(allRecords.map(record => record.patientName))].map(patientName => (
                                    <option key={patientName} value={patientName} />
                                ))}
                            </datalist>
                            <button onClick={fetchRecordsByPatientName}>Rechercher</button>
                        </div>
                        <button onClick={fetchAllRecordsWithConsultations} className="reset-btn">Afficher tous les dossiers</button>
                    </div>
                </section>

                <div className="content-wrapper">
                    <section className="form-section card">
                        <h2>{isEditing ? 'Modifier un dossier médical' : 'Créer un nouveau dossier médical'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nom du patient:</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
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
                                                <p><strong>Nom du patient:</strong> {record.patientName}</p>
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
                                                    <h4>Signes vitaux</h4>
                                                    {record.vitals ? (
                                                        <ul>
                                                            <li>Âge: {record.vitals.Age}</li>
                                                            <li>Température: {record.vitals.Temp} °F</li>
                                                            <li>Tension: {record.vitals.SBP}/{record.vitals.DBP} mmHg</li>
                                                        </ul>
                                                    ) : (
                                                        <p>Aucun signe vital enregistré</p>
                                                    )}
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
                                placeholder="Ex. : signes vitaux"
                            />
                            <button type="submit">Envoyer</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
        </>
    );
}

export default App;