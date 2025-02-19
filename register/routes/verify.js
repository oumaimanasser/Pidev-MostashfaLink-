const express = require("express");
const Personnel = require("../models/Personnel");

const router = express.Router();

// Route de vérification d'email
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Trouver l'utilisateur avec le token de vérification
    const user = await Personnel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Mettre à jour l'utilisateur comme vérifié
    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Votre compte a été vérifié avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

module.exports = router;
