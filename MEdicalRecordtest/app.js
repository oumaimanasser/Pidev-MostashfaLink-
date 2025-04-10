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
import { Server } from 'socket.io';
import http from 'http';

// Importation des routes
import medicalRecordRoutes from './routes/medicalrecord.js';
import consultationRoutes from './routes/consultation.js';
import exportRoutes from './routes/exportRoutes.js';
import MedicalRecord from './models/MedicalRecord.js'; // Importez le modèle

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware CORS
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

// WebSocket
io.on('connection', (socket) => {
    console.log('Utilisateur connecté via WebSocket');
    socket.on('criticalVital', (data) => {
        console.log('Alerte critique reçue:', data);
        io.emit('vitalAlert', data);
    });
    socket.on('disconnect', () => console.log('Utilisateur déconnecté'));
});

// Route pour sauvegarder les signes vitaux
app.post('/api/vitals', async (req, res) => {
    const { idRecord, idPatient, vitals } = req.body;

    // Si idRecord est fourni, on met à jour un dossier existant
    if (idRecord) {
        try {
            const record = await MedicalRecord.findOne({ idRecord });
            if (!record) {
                return res.status(404).json({ message: 'Dossier médical non trouvé avec cet idRecord' });
            }
            record.vitals = { ...record.vitals, ...vitals };
            record.lastupdateDate = Date.now();
            await record.save();
            return res.status(200).json({ message: 'Signes vitaux ajoutés au dossier existant', record });
        } catch (error) {
            return res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
        }
    }

    // Si idRecord n'est pas fourni, on crée un nouveau dossier
    if (!idPatient || !vitals) {
        return res.status(400).json({ message: 'idPatient et signes vitaux requis pour un nouveau dossier' });
    }
    try {
        const newRecord = new MedicalRecord({
            idRecord: Date.now(), // ou une logique pour générer un idRecord unique
            idPatient,
            vitals,
        });
        await newRecord.save();
        return res.status(201).json({ message: 'Nouveau dossier créé avec signes vitaux', record: newRecord });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
    }
});

// Routes existantes
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

const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur le port ${port}`);
});

export default app;