import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Personnel.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Personnel = () => {
    const [personnels, setPersonnels] = useState([]);
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

    // 🔄 Récupérer la liste des personnels
    useEffect(() => {
        fetchPersonnel();
    }, []);

    const fetchPersonnel = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/personnel');
            setPersonnels(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des personnels', error);
        }
    };

    // ➕ Ajouter un personnel
    const addPersonnel = async () => {
        if (!newPersonnel.firstName || !newPersonnel.lastName || !newPersonnel.contactInfo || !newPersonnel.role) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5001/api/personnel', newPersonnel);
            setPersonnels([...personnels, response.data]);
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
        } catch (error) {
            console.error("Erreur lors de l'ajout du personnel", error);
        }
    };

    // ❌ Supprimer un personnel (🛠️ Correction des backticks ✅)
    const deletePersonnel = async (id) => {
        try {
            await axios.delete(`http://localhost:5001/api/personnel/${id}`);
            setPersonnels(personnels.filter(person => person._id !== id));
        } catch (error) {
            console.error('Erreur lors de la suppression du personnel', error);
        }
    };

    // 🔄 Mettre à jour le shiftStart et shiftEnd (🛠️ Correction des backticks ✅)
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

            {/* ➕ Formulaire pour ajouter un personnel */}
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
                {/* ✅ Ajout des champs calendrier */}
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

            {/* 📥 Tableau des personnels */}
            <table>
                <thead>
                <tr>
                    <th>Prénom</th>
                    <th>Nom</th>
                    <th>Contact</th>
                    <th>Rôle</th>
                    <th>Disponibilité</th>
                    <th>Historique médical</th>
                    <th>Début de service</th>
                    <th>Fin de service</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {personnels.length > 0 ? (
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
                                <button className="delete-btn" onClick={() => deletePersonnel(person._id)}>🗑️ Supprimer</button>
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
        </div>
    );
};

export default Personnel;
