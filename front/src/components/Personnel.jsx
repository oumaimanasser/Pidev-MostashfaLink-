import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Personnel.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Personnel = () => {
    const [personnels, setPersonnels] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [newPersonnel, setNewPersonnel] = useState({
        firstName: '',
        lastName: '',
        contactInfo: '',
        role: '',
        disponibility: true,
        medicalHistory: '',
        shiftStart: '',
        shiftEnd: ''
    });

    useEffect(() => {
        fetchPersonnel();
    }, [page]);

    const fetchPersonnel = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/personnel', {
                params: { search, role: selectedRole, page, limit: 5 }
            });
            setPersonnels(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erreur lors de la récupération des personnels', error);
        }
    };

    const addPersonnel = async () => {
        const { firstName, lastName, contactInfo, role } = newPersonnel;
        if (!firstName || !lastName || !contactInfo || !role) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        try {
            await axios.post('http://localhost:5001/api/personnel', newPersonnel);
            setNewPersonnel({
                firstName: '',
                lastName: '',
                contactInfo: '',
                role: '',
                disponibility: true,
                medicalHistory: '',
                shiftStart: '',
                shiftEnd: ''
            });
            fetchPersonnel();
        } catch (error) {
            console.error("Erreur lors de l'ajout du personnel", error);
        }
    };

    const deletePersonnel = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/personnel/${id}`);
            fetchPersonnel();
        } catch (error) {
            console.error('Erreur lors de la suppression du personnel', error);
        }
    };

    const updatePersonnel = async (id, updatedField) => {
        try {
            const response = await axios.put(`http://localhost:5001/api/personnel/${id}`, updatedField);
            setPersonnels(personnels.map((person) =>
                person._id === id ? { ...person, ...response.data } : person
            ));
        } catch (error) {
            console.error("Erreur lors de la mise à jour du personnel", error);
        }
    };

    return (
        <div className="personnel-container">
            <h2>Gestion des personnels</h2>

            {/* 🔍 Barre de recherche et tri par rôle */}
            <div className="form">
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom ou rôle"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    value={selectedRole}
                    onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setPage(1);
                        fetchPersonnel();
                    }}
                    style={{ padding: '8px', borderRadius: '4px' }}
                >
                    <option value="">Tous les rôles</option>
                    <option value="Médecin">Médecin</option>
                    <option value="Infirmier">Infirmier</option>
                    <option value="Technicien">Technicien</option>
                    <option value="Autre">Autre</option>
                </select>
                <button className="add-btn" onClick={() => { setPage(1); fetchPersonnel(); }}>
                    🔍 Rechercher
                </button>
            </div>

            {/* ➕ Formulaire d'ajout */}
            <div className="form">
                <input
                    type="text"
                    placeholder="Prénom"
                    value={newPersonnel.firstName}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, firstName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Nom"
                    value={newPersonnel.lastName}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, lastName: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Contact"
                    value={newPersonnel.contactInfo}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, contactInfo: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Rôle"
                    value={newPersonnel.role}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, role: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Historique médical"
                    value={newPersonnel.medicalHistory}
                    onChange={(e) => setNewPersonnel({ ...newPersonnel, medicalHistory: e.target.value })}
                />
                <DatePicker
                    selected={newPersonnel.shiftStart ? new Date(newPersonnel.shiftStart) : null}
                    onChange={(date) => setNewPersonnel({ ...newPersonnel, shiftStart: date })}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Début de service"
                />
                <DatePicker
                    selected={newPersonnel.shiftEnd ? new Date(newPersonnel.shiftEnd) : null}
                    onChange={(date) => setNewPersonnel({ ...newPersonnel, shiftEnd: date })}
                    showTimeSelect
                    dateFormat="Pp"
                    placeholderText="Fin de service"
                />
                <button className="add-btn" onClick={addPersonnel}>➕ Ajouter</button>
            </div>

            {/* 📋 Tableau */}
            <table>
                <thead>
                <tr>
                    <th>Prénom</th>
                    <th>Nom</th>
                    <th>Contact</th>
                    <th>Rôle</th>
                    <th>Disponibilité</th>
                    <th>Historique médical</th>
                    <th>Début</th>
                    <th>Fin</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(personnels) && personnels.length > 0 ? (
                    personnels.map((person) => (
                        <tr key={person._id}>
                            <td>{person.firstName}</td>
                            <td>{person.lastName}</td>
                            <td>{person.contactInfo}</td>
                            <td>{person.role}</td>
                            <td>{person.disponibility ? '✅' : '❌'}</td>
                            <td>{person.medicalHistory || 'N/A'}</td>
                            <td>
                                <DatePicker
                                    selected={person.shiftStart ? new Date(person.shiftStart) : null}
                                    onChange={(date) =>
                                        updatePersonnel(person._id, { shiftStart: date })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                />
                            </td>
                            <td>
                                <DatePicker
                                    selected={person.shiftEnd ? new Date(person.shiftEnd) : null}
                                    onChange={(date) =>
                                        updatePersonnel(person._id, { shiftEnd: date })
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                />
                            </td>
                            <td>
                                <button className="delete-btn" onClick={() => deletePersonnel(person._id)}>🗑️</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9">Aucun personnel trouvé</td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 🔁 Pagination */}
            <div style={{ marginTop: '20px' }}>
                <button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1}>
                    ◀ Précédent
                </button>
                <span style={{ margin: '0 10px' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                    Suivant ▶
                </button>
            </div>
        </div>
    );
};

export default Personnel;
