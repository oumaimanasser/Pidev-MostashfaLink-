import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Equipment.css';

const Equipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [newEquipment, setNewEquipment] = useState({ name: '', type: '', capacity: '' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchEquipments();
    }, [page]);

    const fetchEquipments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/equipments', {
                params: { search, page, limit: 5 }
            });
            setEquipments(response.data.data);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erreur récupération équipements', error);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchEquipments();
    };

    const addEquipment = async () => {
        if (!newEquipment.name || !newEquipment.type || !newEquipment.capacity) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5000/api/equipments', newEquipment);
            setNewEquipment({ name: '', type: '', capacity: '' });
            fetchEquipments(); // Recharge la liste
        } catch (error) {
            console.error("Erreur ajout équipement", error);
        }
    };

    const deleteEquipment = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/equipments/${id}`);
            fetchEquipments(); // Recharge la liste après suppression
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

            if (!response.ok) throw new Error('Erreur lors du téléchargement');

            const blob = await response.blob();
            if (blob.size === 0) throw new Error('Fichier vide');

            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = 'equipements.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);

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

            {/* 🔍 Zone de recherche */}
            <div className="form">
                <input
                    type="text"
                    placeholder="🔍 Rechercher par nom ou type"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button className="add-btn" onClick={handleSearch}>🔍 Rechercher</button>
            </div>

            {/* ➕ Formulaire d'ajout */}
            <div className="form">
                <input
                    type="text"
                    placeholder="Nom"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Type"
                    value={newEquipment.type}
                    onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Capacité"
                    value={newEquipment.capacity}
                    onChange={(e) => setNewEquipment({ ...newEquipment, capacity: e.target.value })}
                />
                <button className="add-btn" onClick={addEquipment}>➕ Ajouter</button>
            </div>

            {/* 📋 Tableau des équipements */}
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
                {Array.isArray(equipments) && equipments.length > 0 ? (

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
                        <td colSpan="4">Aucun équipement trouvé</td>
                    </tr>
                )}
                </tbody>
            </table>

            {/* 🔁 Pagination */}
            <div style={{ marginTop: '20px' }}>
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                >
                    ◀ Précédent
                </button>
                <span style={{ margin: '0 10px' }}>Page {page} / {totalPages}</span>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                >
                    Suivant ▶
                </button>
            </div>
        </div>
    );
};

export default Equipment;
