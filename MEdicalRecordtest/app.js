import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import createError from 'http-errors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';

// Importation des routes
import medicalRecordRoutes from './routes/medicalrecord.js';
import consultationRoutes from './routes/consultation.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config(); // Charger les variables d'environnement

const app = express();

// Obtenez __dirname en utilisant import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware CORS
app.use(cors({
    origin: 'http://localhost:5173', // Autorise les requêtes depuis ton frontend (ajuste si le port change)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configuration et middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
mongoose
    .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/Medrecord", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ Connexion à MongoDB réussie."))
    .catch((err) => console.error("❌ Erreur de connexion à MongoDB:", err));

// Définir les routes
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/consultations", consultationRoutes);
app.use('/api/export', exportRoutes);

// Gestion des erreurs 404
app.use((req, res, next) => {
    next(createError(404, "Page non trouvée"));
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message,
        },
    });
});

// Définition du port et démarrage du serveur
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

export default app;