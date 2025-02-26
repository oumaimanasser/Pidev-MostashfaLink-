const express = require('express');
const mongoose = require('mongoose');
const hospitalizedPatientsRouter = require('./routes/hospitalizedPatients');
const planningRouter = require('./routes/planning');
const cors = require('cors');  // Importer le package cors
const app = express();
// Middleware pour parser le JSON
app.use(express.json());
app.use(cors());

// Utiliser CORS pour autoriser les requêtes venant de React (http://localhost:3000)
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],  // Ajoute localhost:5173 ici
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
// Middleware pour parser le JSON
app.use(express.json());

// Connexion à MongoDB


mongoose.connect('mongodb://localhost/hospitalDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => console.error('Erreur de connexion à MongoDB :', err));


// Routes
app.use('/hospitalized-patients', hospitalizedPatientsRouter);
app.use('/planning', planningRouter);

module.exports = app;