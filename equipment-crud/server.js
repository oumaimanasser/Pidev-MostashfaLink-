require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const equipmentRoutes = require('./routes/equipmentRoutes');

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware essentiels
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration CORS détaillée
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Connexion à MongoDB avec gestion d'erreur améliorée
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/equipmentDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => {
      console.error('❌ Erreur de connexion MongoDB:', err);
      process.exit(1);
    });

// Routes API
console.log('🛠️ Initialisation des routes /api/equipments');
app.use('/api/equipments', equipmentRoutes);

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Middleware de gestion d'erreurs centralisé
app.use((err, req, res, next) => {
  console.error('🔥 Erreur:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`⚡ Environnement: ${process.env.NODE_ENV || 'development'}`);
});

// Gestion propre des arrêts
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt propre du serveur');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('📦 Connexions fermées');
      process.exit(0);
    });
  });
});
