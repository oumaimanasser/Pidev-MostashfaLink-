import React, { useState, useEffect, useCallback } from "react";
import { FaFire, FaCommentMedical, FaBell, FaPlus, FaSearch, FaExclamationTriangle, FaQrcode, FaSync } from "react-icons/fa";
import axios from "axios";
import NotificationPanel from "./NotificationPanel";
import "./EmergencyHospitals.css";
import MapComponent from "./MapComponent";
import QRCode from "react-qr-code";
import { xml2js } from "xml-js";
import { Link } from "react-router-dom";
import logo from "../assests/logo.png";
import TextToSpeech from"./TextToSpeech";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import Navbar from "./Navbar/Navbar";

const EmergencyHospitals = () => {
  // États principaux
  // Dans la section des états
const [patientRatings, setPatientRatings] = useState({});
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
  const toggleRealTimeUpdates = () => {
  setRealTimeUpdates(prev => !prev);
};
  const [classificationLoading, setClassificationLoading] = useState(false);
  const [hospitalClassifications, setHospitalClassifications] = useState([]);
const [realTimeUpdates, setRealTimeUpdates] = useState(false);
  const [language, setLanguage] = useState('fr'); // 'fr' ou 'ar'
  const translations = {
    fr: {
      dashboard: "Dashboard",
      detailedInfo: "Informations détaillées",
      hospitalList: "Liste des Hôpitaux",
      searchPlaceholder: "Rechercher un hôpital...",
      addHospital: "Ajouter un Hôpital",
      close: "Fermer",
      edit: "Modifier",
      delete: "Supprimer",
      name: "Nom",
      address: "Adresse",
      phone: "Téléphone",
      capacity: "Capacité",
      emergencyProtocol: "Protocole urgence activé",
      hospitalFull: "Hôpital complet",
      location: "Localisation",
      additionalInfo: "Informations supplémentaires",
      services: "Services",
      departments: "Départements",
      noAdditionalInfo: "Aucune information supplémentaire disponible",
      accessibilityMode: "Mode accessibilité",
      enable: "Activer",
      disable: "Désactiver",
      readAll: "Lire toute la page"
    },
    ar: {
      dashboard: "لوحة التحكم",
      detailedInfo: "معلومات مفصلة",
      hospitalList: "قائمة المستشفيات",
      searchPlaceholder: "ابحث عن مستشفى...",
      addHospital: "إضافة مستشفى",
      close: "إغلاق",
      edit: "تعديل",
      delete: "حذف",
      name: "الاسم",
      address: "العنوان",
      phone: "الهاتف",
      capacity: "السعة",
      emergencyProtocol: "تفعيل بروتوكول الطوارئ",
      hospitalFull: "المستشفى ممتلئ",
      location: "الموقع",
      additionalInfo: "معلومات إضافية",
      services: "الخدمات",
      departments: "الأقسام",
      noAdditionalInfo: "لا توجد معلومات إضافية متاحة",
      accessibilityMode: "وضع إمكانية الوصول",
      enable: "تفعيل",
      disable: "تعطيل",
      readAll: "قراءة الصفحة كاملة"
    }
  };
  const [accessibilityMode, setAccessibilityMode] = useState(false);
const [currentReading, setCurrentReading] = useState('');
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
  const [userLocation, setUserLocation] = useState(null);

  // États pour le chatbot IA amélioré
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Bonjour ! Je suis l'assistant médical virtuel. Posez-moi vos questions sur les hôpitaux ou les alertes en cours.",
      sender: "IA",
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions] = useState([
    "Quels hôpitaux ont de la capacité?",
    "Y a-t-il des alertes en cours?",
    "Quel hôpital me recommandez-vous?",
    "Activer le protocole d'urgence",
    "Où est l'hôpital le plus proche?"
  ]);

  // Fonction pour obtenir la position de l'utilisateur
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            setUserLocation(location);
            resolve(location);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("La géolocalisation n'est pas supportée par ce navigateur"));
      }
    });
  };
const fetchHospitalPrediction = async (hospitalId) => {
  try {
    const hospital = hospitals.find(h => h._id === hospitalId);
    if (!hospital) throw new Error("Hôpital non trouvé");

    const payload = {
      Hospital: hospital.name,
      Total_Beds: hospital.capacity,
      Available_Beds: Math.floor(hospital.capacity * 0.8)
    };

    const response = await axios.post('http://localhost:5001/predict', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.data) throw new Error("Réponse vide de l'API");

    const predictionMap = {
      'Low': 'Disponible',
      'Medium': 'Modéré', 
      'High': 'Saturé'
    };

    return {
      id: hospitalId,
      prediction: predictionMap[response.data.prediction] || 'Non classé',
      hospitalName: hospital.name
    };

  } catch (error) {
    console.error(`Erreur prédiction pour ${hospitalId}:`, error);
    return {
      id: hospitalId,
      prediction: 'Non classé',
      hospitalName: hospitals.find(h => h._id === hospitalId)?.name || 'Inconnu'
    };
  }
};
 // Fonction pour gérer les likes/dislikes
const handleRating = async (hospitalId, ratingType) => {
  try {
    // Mise à jour optimiste immédiate
    setHospitals(prev => prev.map(h => 
      h._id === hospitalId ? { 
        ...h, 
        likesCount: ratingType === 'likes' ? h.likesCount + 1 : h.likesCount,
        dislikesCount: ratingType === 'dislikes' ? h.dislikesCount + 1 : h.dislikesCount
      } : h
    ));

    // Envoi au backend
    const response = await axios.post(`http://localhost:3002/hospitals/${hospitalId}/rate`, { 
      ratingType: ratingType === 'likes' ? 'like' : 'dislike' 
    });

    // Mise à jour avec la réponse du serveur (au cas où les counts diffèrent)
    setHospitals(prev => prev.map(h => 
      h._id === hospitalId ? { 
        ...h, 
        likesCount: response.data.likesCount,
        dislikesCount: response.data.dislikesCount
      } : h
    ));

  } catch (err) {
    console.error("Erreur d'envoi du vote:", err);
    // Annulation de la mise à jour optimiste en cas d'erreur
    setHospitals(prev => prev.map(h => 
      h._id === hospitalId ? { 
        ...h, 
        likesCount: ratingType === 'likes' ? h.likesCount - 1 : h.likesCount,
        dislikesCount: ratingType === 'dislikes' ? h.dislikesCount - 1 : h.dislikesCount
      } : h
    ));
    addNotification("Échec de l'enregistrement de votre vote", "error");
  }
};
  // Fonction pour calculer la distance entre deux points géographiques
  const calculateDistanceBetweenPoints = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fonction pour analyser le sentiment
  const analyzeSentiment = (text) => {
    const positiveWords = ['urgence', 'aide', 'important', 'critique', 'santé', 'merci'];
    const negativeWords = ['complet', 'plein', 'pas', 'problème', 'erreur', 'urgence'];
    
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    return score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  };

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
  const getPredictionLevel = (prediction) => {
  if (prediction === 'Low' || prediction.includes('Disponible')) return 1;
  if (prediction === 'Medium' || prediction.includes('Modéré')) return 2;
  if (prediction === 'High' || prediction.includes('Saturé')) return 3;
  return 0; // Non classé
};

const getPredictionColor = (prediction) => {
  if (prediction === 'Low' || prediction.includes('Disponible')) return 'green';
  if (prediction === 'Medium' || prediction.includes('Modéré')) return 'orange';
  if (prediction === 'High' || prediction.includes('Saturé')) return 'red';
  return 'gray'; // Non classé
};

  const fetchHospitalClassifications = async () => {
  try {
    setClassificationLoading(true);
    const predictions = await Promise.all(
      hospitals.map(hospital => fetchHospitalPrediction(hospital._id))
    );

    setHospitalClassifications(predictions);

    setHospitals(prev => prev.map(hospital => {
      const prediction = predictions.find(p => p.id === hospital._id);
      return prediction ? { 
        ...hospital, 
        classification: {
          level: getPredictionLevel(prediction.prediction),
          class: prediction.prediction,
          color: getPredictionColor(prediction.prediction)
        }
      } : hospital;
    }));
  } catch (err) {
    addNotification("Erreur lors du chargement des prédictions", "error");
  } finally {
    setClassificationLoading(false);
  }
};

useEffect(() => {
  if (hospitals.length > 0) {
    fetchHospitalClassifications();
  }
}, [hospitals]);


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

    // Ajouter un message dans le chat
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Protocole d'urgence activé pour ${alert.eventname}. ${nearbyHospitals.length} hôpitaux ont augmenté leur capacité.`,
      sender: "IA",
      timestamp: new Date()
    }]);
  };

  // Fonction pour calculer la distance entre un hôpital et une alerte
  const calculateDistanceFromAlert = (hospital, alert) => {
    return Math.random() * 150;
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

  // Fonction pour générer des réponses intelligentes améliorée
  const generateAIResponse = async (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Nouveau cas pour trouver l'hôpital le plus proche
    if (lowerQuestion.includes("proche") || lowerQuestion.includes("près") || lowerQuestion.includes("près de moi")) {
      try {
        // Obtenir la position de l'utilisateur
        const userLocation = await getUserLocation();
        
        // Calculer la distance à chaque hôpital
        const hospitalsWithDistance = hospitals.map(hospital => {
          if (!hospitalLocations[hospital._id]) return { ...hospital, distance: Infinity };
          
          const [lat, lon] = hospitalLocations[hospital._id];
          const distance = calculateDistanceBetweenPoints(
            userLocation.lat, 
            userLocation.lon, 
            lat, 
            lon
          );
          return { ...hospital, distance };
        }).filter(h => !isNaN(h.distance)).sort((a, b) => a.distance - b.distance);

        if (hospitalsWithDistance.length === 0) {
          return "Je n'ai pas pu trouver d'hôpitaux à proximité. Essayez de préciser votre recherche.";
        }

        // Trouver le premier hôpital avec de la capacité
        const availableHospital = hospitalsWithDistance.find(h => h.capacity > 0);
        
        let response = `Votre position a été détectée. `;
        
        if (availableHospital) {
          response += `L'hôpital le plus proche avec de la capacité est ${availableHospital.name} à environ ${availableHospital.distance.toFixed(1)} km.`;
          
          // Si ce n'est pas le plus proche absolu, mentionner aussi le plus proche (même s'il est complet)
          if (hospitalsWithDistance[0]._id !== availableHospital._id) {
            response += `\n\n(L'hôpital le plus proche est ${hospitalsWithDistance[0].name} mais il est actuellement complet.)`;
          }
        } else {
          response += `Malheureusement, tous les hôpitaux à proximité sont complets. `;
          response += `L'hôpital le plus proche est ${hospitalsWithDistance[0].name} à environ ${hospitalsWithDistance[0].distance.toFixed(1)} km (complet).`;
        }

        return response;
      } catch (error) {
        console.error("Erreur de géolocalisation:", error);
        return "Je n'ai pas pu accéder à votre position. Assurez-vous d'avoir activé la géolocalisation et réessayez.";
      }
    }
    
    // Réponses contextuelles basées sur les données disponibles
    if (lowerQuestion.includes("capacité") || lowerQuestion.includes("lits")) {
      const totalCapacity = hospitals.reduce((sum, h) => sum + h.capacity, 0);
      const availableHospitals = hospitals.filter(h => h.capacity > 0).length;
      
      return `Capacité totale du système : ${totalCapacity} lits.
      ${availableHospitals} hôpitaux sur ${hospitals.length} ont encore de la capacité.`;
    }
    
    if (lowerQuestion.includes("urgence") || lowerQuestion.includes("urgence")) {
      const emergencyHospitals = hospitals.filter(h => h.emergencyProtocol);
      
      if (emergencyHospitals.length > 0) {
        return `Protocole d'urgence activé dans ${emergencyHospitals.length} hôpitaux:
        ${emergencyHospitals.map(h => `- ${h.name} (${h.emergencyCapacity} lits urgence)`).join('\n')}`;
      }
      return "Aucun protocole d'urgence activé actuellement.";
    }
    
    if (lowerQuestion.includes("recommand") || lowerQuestion.includes("proche")) {
      if (hospitals.length === 0) return "Aucun hôpital disponible pour recommandation.";
      
      // Tri par capacité disponible
      const recommended = [...hospitals]
        .filter(h => h.capacity > 0)
        .sort((a, b) => b.capacity - a.capacity)
        .slice(0, 3);
      
      if (recommended.length === 0) return "Tous les hôpitaux sont complets actuellement.";
      
      return `Je recommande ces hôpitaux avec capacité disponible:
      ${recommended.map(h => `- ${h.name} (${h.capacity} lits)`).join('\n')}`;
    }

    // Intégration avec les alertes catastrophes
    if (lowerQuestion.includes("alerte") || lowerQuestion.includes("catastrophe")) {
      if (disasterAlerts.length === 0) {
        return "Aucune alerte catastrophe active actuellement en Tunisie.";
      }
      
      return `Alertes actives (${disasterAlerts.length}):
      ${disasterAlerts.map(a => (
        `- ${a.eventname} (${a.alertlevel === 'red' ? '⚠️ Haute priorité' : '⚠️ Moyenne priorité'})`
      )).join('\n')}
      
      ${highRiskAlerts.length > 0 ? 
        `${highRiskAlerts.length} alertes nécessitent une action immédiate.` : 
        ''}`;
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
    
    if (lowerQuestion.includes("bonjour") || lowerQuestion.includes("salut") || lowerQuestion.includes("hello")) {
      return "Bonjour ! Comment puis-je vous aider concernant les hôpitaux aujourd'hui ?";
    }
  
    // Réponse par défaut plus informative
    return `En tant qu'assistant hospitalier IA, je peux vous aider avec:
    - Statistiques de capacité des hôpitaux
    - Recommandations d'hôpitaux
    - Alertes d'urgence
    - Distances entre établissements
    - Trouver l'hôpital le plus proche
    
    Posez-moi une question plus précise pour une réponse détaillée.`;
  };

  // Fonction pour envoyer un message améliorée
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
    
    // Analyse de sentiment
    const sentiment = analyzeSentiment(newMessage);
    if (sentiment === 'negative') {
      addNotification("Un utilisateur a exprimé une préoccupation via le chat", "warning");
    }
    
    setIsTyping(true);
    
    try {
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
      const res = await axios.get("http://localhost:3002/hospitals");
      const hospitalsData = res.data.map(h => ({ ...h, hasBeenNotified: false ,likesCount: h.likesCount || 0,
      dislikesCount: h.dislikesCount || 0}));
      
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
// Ajoutez cette fonction dans votre composant HospitalList
const getFullPageContent = () => {
  let content = "Liste des Hôpitaux. ";
  
  // Ajouter le contenu des alertes
  if (disasterAlerts.length > 0) {
    content += `Il y a ${disasterAlerts.length} alertes en cours. `;
    disasterAlerts.forEach(alert => {
      content += `Alerte ${alert.eventname}, niveau ${alert.alertlevel}. `;
    });
  } else {
    content += "Aucune alerte en cours. ";
  }
  
  // Ajouter le contenu des hôpitaux
  if (filteredHospitals.length > 0) {
    content += `Il y a ${filteredHospitals.length} hôpitaux disponibles. `;
    currentHospitals.forEach(hospital => {
      content += `Hôpital ${hospital.name}, situé à ${hospital.address}, `;
      content += `capacité ${hospital.capacity} lits. `;
      
    });
  } else {
    content += "Aucun hôpital trouvé. ";
  }
  

// Rename your existing fetchClassifications function to fetchHospitalClassifications
// Modifier la fonction fetchHospitalClassifications pour fetchHospitalPredictions
// Fonction pour obtenir les prédictions pour un hôpital spécifique
const fetchHospitalPrediction = async (hospitalId) => {
  try {
    const res = await axios.post(`http://localhost:3002/hospitals/${hospitalId}/predict`);
    
    console.log("Réponse du backend:", res.data); // Debug
    
    // Traduction des valeurs
    const predictionMap = {
      'Low': 'Disponible',
      'Medium': 'Modéré',
      'High': 'Saturé'
    };
    
    const translatedPrediction = predictionMap[res.data.prediction] || 'Non classé';
    
    return {
      id: hospitalId,
      prediction: translatedPrediction,
      hospitalName: res.data.hospital || 'Inconnu'
    };
  } catch (error) {
    console.error(`Erreur prédiction pour ${hospitalId}:`, error);
    return {
      id: hospitalId,
      prediction: 'Non classé',
      hospitalName: hospitals.find(h => h._id === hospitalId)?.name || 'Inconnu'
    };
  }
};
const fetchHospitalClassifications = async () => {
  try {
    setClassificationLoading(true);
    const predictions = await Promise.all(
      hospitals.map(hospital => fetchHospitalPrediction(hospital._id))
    );
    
    console.log("Prédictions reçues:", predictions); // Debug
    
    setHospitalClassifications(predictions);
    
    setHospitals(prev => prev.map(hospital => {
      const prediction = predictions.find(p => p.id === hospital._id);
      return prediction ? { 
        ...hospital, 
        classification: {
          level: getPredictionLevel(prediction.prediction),
          class: prediction.prediction,
          color: getPredictionColor(prediction.prediction)
        }
      } : hospital;
    }));
    
  } catch (err) {
    console.error("Erreur prédiction:", err);
    addNotification("Erreur lors du chargement des prédictions", "error");
  } finally {
    setClassificationLoading(false);
  }
};
// Fonctions utilitaires pour convertir la prédiction en niveau et couleur
const getPredictionLevel = (prediction) => {
  if (prediction === 'Low' || prediction.includes('Disponible')) return 1;
  if (prediction === 'Medium' || prediction.includes('Modéré')) return 2;
  if (prediction === 'High' || prediction.includes('Saturé')) return 3;
  return 0; // Non classé
};

const getPredictionColor = (prediction) => {
  if (prediction === 'Low' || prediction.includes('Disponible')) return 'green';
  if (prediction === 'Medium' || prediction.includes('Modéré')) return 'orange';
  if (prediction === 'High' || prediction.includes('Saturé')) return 'red';
  return 'gray'; // Non classé
};}
// Ajoutez ce bouton dans votre interface, par exemple dans le header-section
<button 
  onClick={() => setCurrentReading(getFullPageContent())}
  className="read-all-button"
  disabled={!accessibilityMode}
>
  Lire toute la page
</button>

// Modifiez le composant TextToSpeech pour qu'il lise automatiquement quand currentReading change
useEffect(() => {
  if (accessibilityMode && currentReading) {
    // Implémentation dépendra de votre composant TextToSpeech
    // Cela pourrait être une simple synthèse vocale du navigateur
    const speech = new SpeechSynthesisUtterance(currentReading);
    speech.lang = 'fr-FR';
    window.speechSynthesis.speak(speech);
  }
  
}, [currentReading, accessibilityMode]);

useEffect(() => {
  let interval;
  if (realTimeUpdates) {
    fetchHospitalClassifications();
    interval = setInterval(fetchHospitalClassifications, 30000); // Toutes les 30 secondes
  }
  return () => clearInterval(interval);
}, [realTimeUpdates]);
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
        await axios.put(`http://localhost:3002/hospitals/${editingHospital._id}`, newHospital);
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
        const res = await axios.post("http://localhost:3002/hospitals", { ...newHospital, hasBeenNotified: false });
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
        await axios.delete(`http://localhost:3002/hospitals/${id}`);
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
      const res = await axios.get(`http://localhost:3002/hospitals/hospitals/${hospital._id}/info`);
      setHospitalInfos(res.data);
      const coords = await geocodeAddress(hospital.address);
      setCoordinates(coords || null);
      
      // Lecture automatique en mode accessibilité
      if (accessibilityMode) {
        const detailsText = `
          Détails de l'hôpital ${hospital.name}.
          Adresse: ${hospital.address}.
          Téléphone: ${hospital.phone}.
          Capacité: ${hospital.capacity} lits.
          ${hospital.emergencyProtocol ? `Protocole urgence activé avec ${hospital.emergencyCapacity} lits d'urgence.` : ''}
          ${res.data.length > 0 ? 
            `Informations supplémentaires disponibles: ${res.data.map(info => 
              `Services: ${info.services}. Départements: ${info.departments}`
            ).join('. ')}` : 
            'Aucune information supplémentaire disponible.'
          }
        `;
        setCurrentReading(detailsText);
      }
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
        setLoading(true);
        await fetchHospitalsAndLocations();
        await fetchGDACSAlerts();
        await fetchHospitalClassifications();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
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
  <>
  <Navbar />

      <div className="hospital-container">
      
      <br/>
      <br/>
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

      {/* Chatbot IA amélioré */}
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
          <div className="chat-suggestions">
            <p>Essayez de demander :</p>
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                onClick={() => {
                  setNewMessage(suggestion);
                  sendMessage();
                }}
              >
                {suggestion}
              </button>
            ))}
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
                    Activer le protocole urgence
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
          
            
          <div className="language-selector">
  <button onClick={() => setLanguage('fr')}>Français</button>
</div>
          <button 
      onClick={() => setAccessibilityMode(!accessibilityMode)}
      className="accessibility-toggle"
    >
      {accessibilityMode ? 'Désactiver' : 'Activer'} mode accessibilité
    </button>
    {accessibilityMode && (
      <button 
        onClick={() => setCurrentReading(getFullPageContent())}
        className="read-all-button"
      >
        <p>Lire toute la page</p>
      </button>
       
    )}</div>
    </div>
    <div className="section-header">
  <h3>Statut des Hôpitaux</h3>


  <div className="classification-controls">
   <button 
  onClick={toggleRealTimeUpdates}
  className={`realtime-toggle ${realTimeUpdates ? 'active' : ''}`}
>
  {realTimeUpdates ? (
    <>
      <span className="realtime-indicator"></span>
      Mises à jour automatiques (ACTIVÉES)
    </>
  ) : (
    "Activer les mises à jour automatiques"
  )}
</button>
    <button 
      onClick={fetchHospitalClassifications}
      className="refresh-button"
      disabled={classificationLoading}
    >
      <FaSync /> Actualiser
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
    currentHospitals.map((hospital) => (
      <div 
        
        className={`hospital-card ${hospital.capacity === 0 ? 'completed' : ''} ${hospital.emergencyProtocol ? 'emergency' : ''}`}
         key={hospital._id} 
              onClick={() => handleSelectHospital(hospital)}
      >
        <div className={`getPredictionColor ${hospital.classification?.color || 'gray'}`}>
          {hospital.classification?.class || 'Non classé'}
        </div>
  {hospital.classification && (
  <div style={{ color: hospital.classification.color }}>
    Niveau : {hospital.classification.class}
  </div>
)}

       <div className={`classification-badge ${
  hospital.classification?.color || 
  (hospital.capacity === 0 ? 'red' : 
   hospital.capacity <= 50 ? 'orange' : 'green')
}`}>
  {hospital.classification?.class || 
   (hospital.capacity === 0 ? 'High' :
    hospital.capacity <= 50 ? 'Medium' : 'Low')}
</div>
        <h3>{hospital.name}</h3>
        <p>{hospital.address}</p>
        {hospital.capacity === 0 && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>Hôpital complet</p>
        )}
        {hospital.emergencyProtocol && (
          <p style={{ color: 'orange', fontWeight: 'bold' }}>Protocole urgence activé</p>
        )}
        <div className="hospital-actions">
          
          <button
            className="qr-button"
            onClick={(e) => {
              e.stopPropagation();
              setQrCodeData(JSON.stringify({
                id: hospital._id,
                name: hospital.name,
                address: hospital.address,
                phone: hospital.phone,
                lastUpdated: new Date().toISOString()
              }));
                  e.stopPropagation(); // Important pour éviter les conflits

              setShowQRCode(true);
            }}
            aria-label="Générer QR Code"
          >
            <FaQrcode />
            <span className="tooltip">Générer QR Code</span>
          </button>
        </div>
       <div className="rating-buttons">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleRating(hospital._id, 'likes');
    }}
    className="like-button"
    aria-label="J'aime cet hôpital"
  >
    <FaThumbsUp /> ({hospital.likesCount || 0})
  </button>
  
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleRating(hospital._id, 'dislikes');
    }}
    className="dislike-button"
    aria-label="Je n'aime pas cet hôpital"
  >
    <FaThumbsDown /> ({hospital.dislikesCount || 0})
  </button>
</div>
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
    <h3 onMouseEnter={() => accessibilityMode && setCurrentReading(`Détails de l'hôpital ${selectedHospital.name}`)}>
      Détails de Hôpital
      {accessibilityMode && <TextToSpeech text={`Détails de l'hôpital ${selectedHospital.name}`} />}
    </h3>
    
    <p onMouseEnter={() => accessibilityMode && setCurrentReading(`Nom: ${selectedHospital.name}`)}>
      <strong>Nom :</strong> {selectedHospital.name}
      {accessibilityMode && <TextToSpeech text={`Nom: ${selectedHospital.name}`} />}
    </p>
    
    <p onMouseEnter={() => accessibilityMode && setCurrentReading(`Adresse: ${selectedHospital.address}`)}>
      <strong>Adresse :</strong> {selectedHospital.address}
      {accessibilityMode && <TextToSpeech text={`Adresse: ${selectedHospital.address}`} />}
    </p>
    
    <p onMouseEnter={() => accessibilityMode && setCurrentReading(`Téléphone: ${selectedHospital.phone}`)}>
      <strong>Téléphone :</strong> {selectedHospital.phone}
      {accessibilityMode && <TextToSpeech text={`Téléphone: ${selectedHospital.phone}`} />}
    </p>
    
    <p onMouseEnter={() => accessibilityMode && setCurrentReading(`Capacité: ${selectedHospital.capacity} lits`)}>
      <strong>Capacité :</strong> {selectedHospital.capacity} lits
      {accessibilityMode && <TextToSpeech text={`Capacité: ${selectedHospital.capacity} lits`} />}
    </p>
    
    {selectedHospital.emergencyProtocol && (
      <p 
        style={{ color: 'orange', fontWeight: 'bold' }}
        onMouseEnter={() => accessibilityMode && setCurrentReading(`Protocole urgence activé. Capacité urgence: ${selectedHospital.emergencyCapacity} lits`)}
      >
        <FaExclamationTriangle /> Protocole urgence activé (Capacité urgence: {selectedHospital.emergencyCapacity} lits)
        {accessibilityMode && <TextToSpeech text={`Protocole urgence activé. Capacité urgence: ${selectedHospital.emergencyCapacity} lits`} />}
      </p>
    )}

    <h4 onMouseEnter={() => accessibilityMode && setCurrentReading("Localisation")}>
      Localisation
      {accessibilityMode && <TextToSpeech text="Localisation" />}
    </h4>
    
    {coordinates ? (
      <MapComponent position={coordinates} />
    ) : (
      <p style={{ color: "red" }} onMouseEnter={() => accessibilityMode && setCurrentReading("La localisation de cet hôpital n'est pas disponible")}>
        La localisation de cet hôpital nest pas disponible.
        {accessibilityMode && <TextToSpeech text="La localisation de cet hôpital n'est pas disponible" />}
      </p>
    )}

    <h4 onMouseEnter={() => accessibilityMode && setCurrentReading("Informations supplémentaires")}>
      Informations supplémentaires
      {accessibilityMode && <TextToSpeech text="Informations supplémentaires" />}
    </h4>
    
    {hospitalInfos.length > 0 ? (
      <div>
        <table>
          <thead>
            <tr>
              <th onMouseEnter={() => accessibilityMode && setCurrentReading("Services")}>
                Services
                {accessibilityMode && <TextToSpeech text="Services" />}
              </th>
              <th onMouseEnter={() => accessibilityMode && setCurrentReading("Départements")}>
                Départements
                {accessibilityMode && <TextToSpeech text="Départements" />}
              </th>
            </tr>
          </thead>
          <tbody>
            {hospitalInfos.map((info) => (
              <tr key={info._id}>
                <td onMouseEnter={() => accessibilityMode && setCurrentReading(`Services: ${info.services}`)}>
                  {info.services}
                  {accessibilityMode && <TextToSpeech text={`Services: ${info.services}`} />}
                </td>
                <td onMouseEnter={() => accessibilityMode && setCurrentReading(`Départements: ${info.departments}`)}>
                  {info.departments}
                  {accessibilityMode && <TextToSpeech text={`Départements: ${info.departments}`} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p onMouseEnter={() => accessibilityMode && setCurrentReading("Aucune information supplémentaire disponible")}>
        Aucune information supplémentaire disponible.
        {accessibilityMode && <TextToSpeech text="Aucune information supplémentaire disponible" />}
      </p>
    )}

    <div className="details-actions">
      <button onClick={handleCloseDetails}>
        Fermer
        {accessibilityMode && <TextToSpeech text="Bouton Fermer" />}
      </button>
    </div>
  </div>
)}
    </div>
    </>
  );
};

export default EmergencyHospitals;