const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Inscription d'un utilisateur
router.post("/register", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Créer un nouvel utilisateur
        const user = new User({ email, password });
        await user.save();

        res.status(201).json({
            message: "Utilisateur créé avec succès.",
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Connexion d'un utilisateur
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Vérifier si le mot de passe est correct
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Email ou mot de passe incorrect." });
        }

        // Générer un token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({
            message: "Connexion réussie.",
            token,
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
