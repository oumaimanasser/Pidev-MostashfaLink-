import React, { useState, useEffect, useCallback } from "react";
import { FaFire, FaCommentMedical, FaBell, FaPlus, FaSearch, FaExclamationTriangle, FaQrcode } from "react-icons/fa";
import axios from "axios";
import NotificationPanel from "./NotificationPanel";
import "./HospitalList.css";
import MapComponent from "./MapComponent";
import QRCode from "react-qr-code";
import { xml2js } from "xml-js";

const HospitalList = () => {
  // États principaux
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalInfos, setHospitalInfos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    phone: "",
    capacity: 0,
  });
  const [coordinates, setCoordinates] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hospitalsPerPage] = useState(5);
  const [notifications, setNotifications] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [hospitalLocations, setHospitalLocations] = useState({});
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");
  const [disasterAlerts, setDisasterAlerts] = useState([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState([]);

  // États pour le chatbot IA
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant médical virtuel. Posez-moi vos questions sur les hôpitaux.",
      sender: "IA",
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fonction pour ajouter une notification
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
  };

  // Fonction pour supprimer une notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchGDACSAlerts = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://www.gdacs.org/xml/rss.xml",
        {
          params: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            alertlevel: "orange,red"
          },
          headers: {
            'Accept': 'application/xml'
          }
        }
      );
  
      const result = xml2js(response.data, { compact: true });
      const items = result.rss.channel.item;
      const alertsArray = Array.isArray(items) ? items : [items];
  
      const formattedAlerts = alertsArray.map(item => ({
        eventid: item.guid._text,
        eventname: item.title._text,
        eventtype: item.category._text.toLowerCase(),
        alertlevel: item['gdacs:alertlevel']._text,
        country: item['gdacs:country']._text,
        fromdate: item.pubDate._text,
        episodecountry: item['gdacs:episodecountry']._text || ''
      })).filter(alert => 
        alert.country.toLowerCase().includes('tunisia') || 
        alert.episodecountry.toLowerCase().includes('tunisia')
      );
  
      setDisasterAlerts(formattedAlerts);
      setHighRiskAlerts(formattedAlerts.filter(alert => alert.alertlevel === 'red'));
      
      return formattedAlerts;
    } catch (err) {
      console.error("Erreur GDACS API:", err);
      return [];
    }
  }, []);

  // Fonction pour activer le protocole d'urgence
  const activateEmergencyProtocol = (alert) => {
    const nearbyHospitals = hospitals.filter(hospital => {
      const distance = calculateDistanceFromAlert(hospital, alert);
      return distance < 100; // Rayon de 100km
    });

    setHospitals(prev => prev.map(h => 
      nearbyHospitals.some(nh => nh._id === h._id) 
        ? { 
            ...h, 
            emergencyCapacity: h.capacity + 50,
            emergencyProtocol: true
          } 
        : h
    ));

    addNotification(
      `Protocole d'urgence activé pour ${alert.eventname}. ${nearbyHospitals.length} hôpitaux en alerte.`,
      "emergency"
    );
  };

  // Fonction pour calculer la distance entre un hôpital et une alerte
  const calculateDistanceFromAlert = (hospital, alert) => {
    return Math.random() * 150;
  };

  // Fonction pour générer des réponses intelligentes
  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("catastrophe") || lowerQuestion.includes("alerte")) {
      if (disasterAlerts.length === 0) {
        return "Aucune alerte catastrophe active actuellement.";
      }
      return `Alertes en cours : ${disasterAlerts.map(a => 
        `${a.eventname} (${a.alertlevel})`
      ).join(', ')}. Voir le panneau d'alertes pour détails.`;
    }
    
    if (lowerQuestion.includes("bonjour") || lowerQuestion.includes("salut") || lowerQuestion.includes("hello")) {
      return "Bonjour ! Comment puis-je vous aider concernant les hôpitaux aujourd'hui ?";
    }
  
    if (lowerQuestion.includes("distance") || lowerQuestion.includes("loin") || lowerQuestion.includes("temps")) {
      const hospitalsInQuestion = hospitals.filter(h => 
        lowerQuestion.includes(h.name.toLowerCase())
      );
      
      if (hospitalsInQuestion.length >= 2) {
        const distance = calculateDistance(hospitalsInQuestion[0]._id, hospitalsInQuestion[1]._id);
        return distance 
          ? `La distance entre ${hospitalsInQuestion[0].name} et ${hospitalsInQuestion[1].name} est d'environ ${distance} km.`
          : "Distance non disponible";
      }
      
      return "Je peux vous informer sur les distances entre hôpitaux. Mentionnez deux hôpitaux dans votre question.";
    }
  
    return `Je suis un assistant spécialisé dans les informations hospitalières. Voici ce que je peux faire :
    - Donner des informations sur les lits disponibles
    - Indiquer les distances entre hôpitaux
    - Fournir les services disponibles
    - Afficher les alertes catastrophes
    
    Comment puis-je vous aider précisément ?`;
  };

  // Fonction pour envoyer un message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const userMessage = {
      id: Date.now(),
      text: newMessage,
      timestamp: new Date(),
      sender: "Vous"
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    
    setIsTyping(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = await generateAIResponse(newMessage);
      const iaMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        timestamp: new Date(),
        sender: "IA"
      };
      setMessages(prev => [...prev, iaMessage]);
    } catch (err) {
      console.error("Erreur génération réponse IA:", err);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Désolé, une erreur s'est produite. Veuillez reformuler votre question.",
        timestamp: new Date(),
        sender: "IA"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Chargement initial des hôpitaux et géocodage
  const fetchHospitalsAndLocations = async () => {
    try {
      const res = await axios.get("http://localhost:5000/hospitals");
      const hospitalsData = res.data.map(h => ({ ...h, hasBeenNotified: false }));
      
      const locations = {};
      for (const hospital of hospitalsData) {
        const coords = await geocodeAddress(hospital.address);
        if (coords) {
          locations[hospital._id] = coords;
        }
      }
      
      setHospitalLocations(locations);
      setHospitals(hospitalsData);
      
      hospitalsData.forEach(hospital => {
        if (hospital.capacity === 0) {
          addNotification(`L'hôpital "${hospital.name}" est complet`, "warning");
        }
      });
    } catch (err) {
      setError("Erreur lors du chargement des hôpitaux.");
      addNotification("Erreur lors du chargement des hôpitaux", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour calculer la distance entre deux hôpitaux
  const calculateDistance = (hospital1Id, hospital2Id) => {
    if (!hospitalLocations[hospital1Id] || !hospitalLocations[hospital2Id]) {
      return null;
    }
    
    const [lat1, lon1] = hospitalLocations[hospital1Id];
    const [lat2, lon2] = hospitalLocations[hospital2Id];
    
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  // Vérifier les hôpitaux complets
  useEffect(() => {
    hospitals.forEach(hospital => {
      if (hospital.capacity === 0 && !hospital.hasBeenNotified) {
        addNotification(`L'hôpital "${hospital.name}" est complet`, "warning");
        setHospitals(prev => prev.map(h => 
          h._id === hospital._id ? { ...h, hasBeenNotified: true } : h
        ));
      }
    });
  }, [hospitals]);

  // Pagination
  const indexOfLastHospital = currentPage * hospitalsPerPage;
  const indexOfFirstHospital = indexOfLastHospital - hospitalsPerPage;
  const currentHospitals = hospitals.slice(indexOfFirstHospital, indexOfLastHospital);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleChange = (e) => {
    setNewHospital({ ...newHospital, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingHospital) {
      try {
        await axios.put(`http://localhost:5000/hospitals/${editingHospital._id}`, newHospital);
        setHospitals(prevHospitals =>
          prevHospitals.map((h) => (h._id === editingHospital._id ? { ...h, ...newHospital, hasBeenNotified: false } : h))
        );
        setEditingHospital(null);
        addNotification("Hôpital mis à jour avec succès", "success");
      } catch (err) {
        addNotification("Erreur lors de la mise à jour de l'hôpital", "error");
      }
    } else {
      try {
        const res = await axios.post("http://localhost:5000/hospitals", { ...newHospital, hasBeenNotified: false });
        setHospitals([...hospitals, res.data]);
        addNotification("Hôpital ajouté avec succès", "success");
      } catch (err) {
        addNotification("Erreur lors de l'ajout de l'hôpital", "error");
      }
    }
    setShowForm(false);
    setNewHospital({ name: "", address: "", phone: "", capacity: 0 });
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setNewHospital(hospital);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet hôpital ?")) {
      try {
        await axios.delete(`http://localhost:5000/hospitals/${id}`);
        setHospitals(hospitals.filter((h) => h._id !== id));
        addNotification("Hôpital supprimé avec succès", "success");
      } catch (err) {
        addNotification("Erreur lors de la suppression de l'hôpital", "error");
      }
    }
  };

  const handleSelectHospital = async (hospital) => {
    setSelectedHospital(hospital);
    try {
      const res = await axios.get(`http://localhost:5000/hospitals/hospitals/${hospital._id}/info`);
      setHospitalInfos(res.data);
      const coords = await geocodeAddress(hospital.address);
      setCoordinates(coords || null);
    } catch (err) {
      console.error("Erreur lors de la récupération des informations :", err);
    }
  };

  const handleCloseDetails = () => {
    setSelectedHospital(null);
    setHospitalInfos([]);
    setCoordinates(null);
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return [parseFloat(lat), parseFloat(lon)];
      }
    } catch (err) {
      console.error("Erreur lors du géocodage :", err);
    }
    return null;
  };

  // Chargement initial des données
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchHospitalsAndLocations();
        await fetchGDACSAlerts();
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchGDACSAlerts, 3600000);
    return () => clearInterval(interval);
  }, []);

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-spinner">Chargement en cours...</div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="hospital-container">
      {/* Modal QR Code */}
      {showQRCode && (
        <div className="qr-modal-overlay">
          <div className="qr-modal-content">
            <h3>QR Code - {JSON.parse(qrCodeData)?.name || "Hôpital"}</h3>
            <div className="qr-code-wrapper">
              <QRCode 
                value={qrCodeData} 
                size={256}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <button 
              onClick={() => setShowQRCode(false)}
              className="close-button"
            >
              Fermer
            </button>
          </div>
        </div>
      )} 

      {/* Badge de notification */}
      <div 
        className={`notification-badge ${notifications.length > 0 ? 'active' : ''}`} 
        onClick={() => setShowNotificationPanel(!showNotificationPanel)}
      >
        <FaBell />
        {notifications.length > 0 && <span>{notifications.length}</span>}
      </div>

      {/* Panel de notifications */}
      {showNotificationPanel && (
        <NotificationPanel 
          notifications={notifications} 
          onClose={() => setShowNotificationPanel(false)}
          onRemove={removeNotification}
        />
      )}

      {/* Bouton flottant pour le chatbot */}
      <div 
        className="chat-float-button" 
        onClick={() => setShowChat(!showChat)}
      >
        <FaCommentMedical />
      </div>

      {/* Chatbot IA */}
      {showChat && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Assistant Hospitalier IA</h3>
            <button onClick={() => setShowChat(false)}>×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender === "IA" ? 'ia-message' : 'user-message'}`}>
                <div className="message-content">
                  {msg.sender === "IA" && (
                    <div className="ia-avatar">IA</div>
                  )}
                  <div className="message-text">
                    <p>{msg.text}</p>
                    <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message ia-message">
                <div className="message-content">
                  <div className="ia-avatar">IA</div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Posez votre question sur les hôpitaux..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Panneau d'alertes GDACS */}
      <div className="alerts-panel">
        <h3>
          <FaFire /> Alertes Incendies en Tunisie
          {disasterAlerts.length > 0 && 
            <span className="alert-badge">{disasterAlerts.length}</span>
          }
        </h3>
        
        {disasterAlerts.length === 0 ? (
          <p>Aucun incendie signalé récemment en Tunisie</p>
        ) : (
          <ul>
            {disasterAlerts.map(alert => (
              <li key={alert.eventid} className={`alert-${alert.alertlevel}`}>
                <div className="alert-header">
                  <FaFire className="fire-icon" />
                  <strong>{alert.eventname}</strong> 
                  <span className={`alert-level ${alert.alertlevel}`}>
                    ({alert.alertlevel === 'red' ? 'Haute' : 'Moyenne'} gravité)
                  </span>
                </div>
                <p><strong>Lieu:</strong> {alert.episodecountry || alert.country}</p>
                <p><strong>Date:</strong> {new Date(alert.fromdate).toLocaleString()}</p>
                {alert.alertlevel === "red" && (
                  <button 
                    onClick={() => activateEmergencyProtocol(alert)}
                    className="emergency-btn"
                  >
                    Activer le protocole d'urgence
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="header-section">
        <h2>Liste des Hôpitaux</h2>
        <div className="search-add-container">
          <div className="search-bar-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un hôpital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-bar"
            />
          </div>
          <button 
            className="add-button" 
            onClick={() => { setShowForm(!showForm); setEditingHospital(null); }}
          >
            <FaPlus /> {showForm ? "Fermer" : "Ajouter un Hôpital"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-popup">
          <h3>{editingHospital ? "Modifier l'Hôpital" : "Ajouter un Hôpital"}</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name" 
              placeholder="Nom de l'hôpital" 
              value={newHospital.name} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="address" 
              placeholder="Adresse complète" 
              value={newHospital.address} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="phone" 
              placeholder="Numéro de téléphone" 
              value={newHospital.phone} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="number" 
              name="capacity" 
              placeholder="Capacité (nombre de lits)" 
              value={newHospital.capacity} 
              onChange={handleChange} 
              required 
              min="0"
            />
            <div className="form-actions">
              <button type="submit">
                {editingHospital ? "Enregistrer" : "Ajouter"}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingHospital(null);
                  setNewHospital({ name: "", address: "", phone: "", capacity: 0 });
                }}
                className="cancel-button"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="hospital-list">
        {filteredHospitals.length > 0 ? (
          currentHospitals.map((h) => (
            <div 
              className={`hospital-card ${h.capacity === 0 ? 'completed' : ''} ${h.emergencyProtocol ? 'emergency' : ''}`} 
              key={h._id} 
              onClick={() => handleSelectHospital(h)}
            >
              <h3>{h.name}</h3>
              <p>{h.address}</p>
              {h.capacity === 0 && <p style={{ color: 'red', fontWeight: 'bold' }}>Hôpital complet</p>}
              {h.emergencyProtocol && <p style={{ color: 'orange', fontWeight: 'bold' }}>Protocole d'urgence activé</p>}
              <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEdit(h); }}>Modifier</button>
              <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(h._id); }}>Supprimer</button>
              <button
                className="qr-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQrCodeData(JSON.stringify({
                    id: h._id,
                    name: h.name,
                    address: h.address,
                    phone: h.phone,
                    lastUpdated: new Date().toISOString()
                  }, null, 2));
                  setShowQRCode(true);
                }}
                aria-label="Générer QR Code"
              >
                <FaQrcode />
                <span className="tooltip">Générer QR Code</span>
              </button>
            </div>
          ))
        ) : (
          <p>Aucun hôpital trouvé.</p>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredHospitals.length / hospitalsPerPage) }, (_, index) => (
          <button key={index} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? "active" : ""}>
            {index + 1}
          </button>
        ))}
      </div>

      {selectedHospital && (
        <div className="hospital-details">
          <h3>Détails de l'Hôpital</h3>
          <p><strong>Nom :</strong> {selectedHospital.name}</p>
          <p><strong>Adresse :</strong> {selectedHospital.address}</p>
          <p><strong>Téléphone :</strong> {selectedHospital.phone}</p>
          <p><strong>Capacité :</strong> {selectedHospital.capacity} lits</p>
          {selectedHospital.emergencyProtocol && (
            <p style={{ color: 'orange', fontWeight: 'bold' }}>
              <FaExclamationTriangle /> Protocole d'urgence activé (Capacité d'urgence: {selectedHospital.emergencyCapacity} lits)
            </p>
          )}

          <h4>Localisation</h4>
          {coordinates ? (
            <MapComponent position={coordinates} />
          ) : (
            <p style={{ color: "red" }}>La localisation de cet hôpital n'est pas disponible.</p>
          )}

          <h4>Informations supplémentaires</h4>
          {hospitalInfos.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Services</th>
                  <th>Départements</th>
                </tr>
              </thead>
              <tbody>
                {hospitalInfos.map((info) => (
                  <tr key={info._id}>
                    <td>{info.services}</td>
                    <td>{info.departments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucune information supplémentaire disponible.</p>
          )}

          <button onClick={handleCloseDetails}>Fermer</button>
        </div>
      )}
    </div>
  );
};

export default HospitalList;