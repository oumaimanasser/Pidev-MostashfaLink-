const express = require('express');
const Personnel = require('../models/Personnel');
const checkRole = require('../middleware/checkRole'); // Assure-toi d'importer le middleware
const router = express.Router();

// Exemple de route accessible uniquement par un médecin (doctor)
router.get('/doctor-dashboard', checkRole(['doctor']), (req, res) => {
    res.json({ message: "Bienvenue dans le tableau de bord du médecin", user: req.user });
});

// Exemple de route accessible uniquement par une infirmière de triage (triage nurse)
router.get('/triage-dashboard', checkRole(['triage nurse']), (req, res) => {
    res.json({ message: "Bienvenue dans le tableau de bord de l'infirmière de triage", user: req.user });
});

// Exemple de route accessible uniquement par un administrateur (admin)
router.get('/admin-dashboard', checkRole(['admin']), (req, res) => {
    res.json({ message: "Bienvenue dans le tableau de bord de l'administrateur", user: req.user });
});

// Exemple de route accessible uniquement par le chef de département (department head)
router.get('/department-head-dashboard', checkRole(['department head']), (req, res) => {
    res.json({ message: "Bienvenue dans le tableau de bord du chef de département", user: req.user });
});

module.exports = router;
