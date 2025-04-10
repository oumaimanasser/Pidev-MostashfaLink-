const express = require("express");
const { register, login, verifyAccount, forgotPassword, showResetPasswordForm,deletePersonnel, resetPassword, updatePersonnel, verify2FA, activate2FA ,verifyCode,sendSMS} = require('../controllers/authController');
const { body } = require("express-validator");
const authenticateJWT = require("../middleware/authenticateJWT");
const router = express.Router();
const twilio = require('twilio');
const { Code } = require("mongodb");
require("dotenv").config();

// Validation pour l'inscription


// Routes publiques
router.post('/register', register);
router.get("/register/verify/:token", verifyAccount);
router.post("/forgot-password", forgotPassword);

// Ajoutez cette route GET pour afficher le formulaire de réinitialisation
router.get("/reset-password/:token", showResetPasswordForm);
router.post('/login', login);
// Route POST pour traiter la soumission du formulaire
router.post("/reset-password/:token", resetPassword);

// Route protégée (exemple)
router.get("/protected-route", authenticateJWT, (req, res) => {
  res.status(200).json({
    message: "Vous êtes connecté et votre JWT est valide.",
    user: req.user,
  });

});
router.put("/update/:id", authenticateJWT, updatePersonnel);

// Suppression d'un utilisateur
router.delete("/delete/:id", authenticateJWT, deletePersonnel);
router.post('/activate-2fa', activate2FA);
router.post('/verify-Code', verifyCode);
router.post("/sendSMS", sendSMS);
module.exports = router;