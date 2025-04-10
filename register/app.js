var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config(); // Charger les variables d'environnement
const mongoose = require('mongoose');
const cors = require('cors');  // Importer le middleware CORS
// Importation des routes
const authRoutes = require("./routes/authRoutes");
var indexRouter = require('./routes/index');

const app = express();

// Configuration et middleware
app.use(cors({
  origin: 'http://localhost:3001', // Autorise uniquement votre frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Activer CORS pour toutes les origines
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
// Connexion à MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/code")
  .then(() => console.log("Connexion à MongoDB réussie.")) // Log de succès
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err)); // Log d'erreur

// Configuration du moteur de vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Définir les routes
app.use("/", indexRouter);
app.use('/auth', authRoutes);

// Gestion des erreurs 404
app.use(function(req, res, next) {
  next(createError(404, "Page non trouvée"));
});

// Gestion des erreurs globales
app.use(function(err, req, res, next) {
  // Définir les variables locales pour les messages d'erreur
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renvoyer une réponse JSON en cas d'erreur
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

// Définition du port et démarrage du serveur
var port = process.env.PORT || 3002;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
