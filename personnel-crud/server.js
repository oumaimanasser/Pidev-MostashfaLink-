const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const personnelRoutes = require('./routes/personnelRoutes');

// ➡️ Charger les variables d'environnement
dotenv.config();

// ➡️ Connexion à la base de données
connectDB();

const app = express();

// ➡️ Middleware
app.use(express.json());
app.use(cors());

// ➡️ Routes
app.use('/api/personnel', personnelRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
