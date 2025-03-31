import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Equipment.css';

const Equipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [newEquipment, setNewEquipment] = useState({ name: '', type: '', capacity: '' });

    useEffect(() => {
        fetchEquipments();
    }, []);

    const fetchEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/equipments');
            setEquipments(response.data);
        } catch (error) {
            console.error('Erreur récupération équipements', error);
        }
    };

    const addEquipment = async () => {
        if (!newEquipment.name || !newEquipment.type || !newEquipment.capacity) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/equipments', newEquipment);
            setEquipments([...equipments, response.data]);
            setNewEquipment({ name: '', type: '', capacity: '' });
        } catch (error) {
            console.error("Erreur ajout équipement", error);
        }
    };

    const deleteEquipment = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/equipments/${id}`);
            setEquipments(equipments.filter((equip) => equip._id !== id));
        } catch (error) {
            console.error("Erreur suppression équipement", error);
        }
    };

    const downloadPDF = async () => {
        try {
            const timestamp = new Date().getTime();
            const url = `http://localhost:5000/api/equipments/pdf?t=${timestamp}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/pdf' },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erreur de téléchargement');
            }

            const blob = await response.blob();
            if (blob.size === 0) {
                throw new Error('Le fichier PDF est vide');
            }

            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = 'equipements.pdf';

            document.body.appendChild(a);
            a.click();

            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
            }, 100);

        } catch (error) {
            console.error('Échec du téléchargement:', error);
            alert(`Erreur: ${error.message}`);
        }
    };

    return (
        <div className="equipment-container">
            <h2>Gestion des équipements</h2>

            <button onClick={downloadPDF} className="add-btn" style={{ marginBottom: '20px' }}>
                📄 Télécharger la liste (PDF)
            </button>

            <div className="form">
                <input
                    type="text"
                    placeholder="Nom"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                    required
                />
                <input
                    type="text"
                    placeholder="Type"
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Capacité"
                    value={newEquipment.capacity}
                    onChange={(e) => setNewEquipment({ ...newEquipment, capacity: e.target.value })}
                    required
                />
                <button className="add-btn" onClick={addEquipment}>➕ Ajouter</button>
            </div>

            <table>
                <thead>
                <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Capacité</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {equipments.length > 0 ? (
                    equipments.map((equip) => (
                        <tr key={equip._id}>
                            <td>{equip.name}</td>
                            <td>{equip.type}</td>
                            <td>{equip.capacity}</td>
                            <td>
                                <button className="delete-btn" onClick={() => deleteEquipment(equip._id)}>
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4">Aucun équipement enregistré</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default Equipment;