const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Personnel = require("../models/Personnel");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const axios = require('axios');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const twilio = require('twilio');
const secret = speakeasy.generateSecret({ length: 20 });
require("dotenv").config();

// Configuration du transporteur Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Fonction d'envoi de l'email générique
const sendEmail = async (options) => {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: options.email,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

// Fonction d'envoi de l'email de vérification
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/auth/verify/${verificationToken}`;

  await sendEmail({
    email: email,
    subject: 'Vérification de votre compte',
    html: `
      <h1>Vérification de votre compte</h1>
      <p>Bienvenue ! Pour vérifier votre compte, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="http://localhost:3000/auth/verify/${verificationToken}">Cliquez ici pour vérifier votre compte</a>

      <p>Ce lien expirera dans 1 heure.</p>
      <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
    `
  });
};

// Fonction d'inscription
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, password, role, phoneNumber } = req.body;

    // Vérifier si l'email ou le numéro de téléphone est déjà utilisé
    const existingPersonnel = await Personnel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingPersonnel) {
      return res.status(400).json({ message: "Cet email ou numéro de téléphone est déjà utilisé." });
    }

    // Générer un code de vérification
    const verificationCode = generateVerificationCode();

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const personnel = new Personnel({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      verificationCode,
      verificationCodeExpires: Date.now() + 3600000, // Expire dans 1 heure
    });

    // Sauvegarder l'utilisateur
    await personnel.save();

    // Envoyer le code de vérification par SMS
    await sendSMS({
      phoneNumber,
      message: `Votre code de vérification est : ${verificationCode}`,
    });

    res.status(201).json({
      message: "Enregistrement réussi. Un code de vérification a été envoyé par SMS.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription", error });
  }
};
// Fonction d'activation du 2FA
const activate2FA = async (req, res) => {
  const { email } = req.body;

  try {
    const personnel = await Personnel.findOne({ email });
    if (!personnel) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérification si 2FA est déjà activé
    if (personnel.twoFactorEnabled) {
      return res.status(400).json({ message: "L'authentification à deux facteurs est déjà activée" });
    }

    // Génération du secret pour le 2FA
    const secret = speakeasy.generateSecret({ length: 20 });

    // Sauvegarde du secret dans la base de données
    personnel.twoFactorSecret = secret.base32;
    await personnel.save();

    // Générer le QR Code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Réponse avec l'URL du QR code et les instructions
    res.status(200).json({
      message: "2FA activé. Scannez le QR code avec Google Authenticator.",
      qrCodeUrl: qrCodeUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'activation de 2FA", error });
  }
};

// Fonction de vérification du code 2FA lors de la connexion
const verify2FA = async (req, res) => {
  const { email, token } = req.body;

  try {
    const personnel = await Personnel.findOne({ email });
    if (!personnel) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!personnel.twoFactorEnabled) {
      return res.status(400).json({ message: "L'authentification à deux facteurs n'est pas activée" });
    }

    // Vérification du code 2FA
    const isVerified = speakeasy.totp.verify({
      secret: personnel.twoFactorSecret,
      encoding: 'base32',
      token: token,
    });

    if (!isVerified) {
      return res.status(400).json({ message: "Code 2FA incorrect ou expiré" });
    }

    // Générer un token JWT après la validation du code 2FA
    const jwtToken = jwt.sign(
      { email: personnel.email, role: personnel.role, id: personnel._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Connexion réussie avec 2FA",
      token: jwtToken,
      user: {
        id: personnel._id,
        email: personnel.email,
        role: personnel.role,
        firstName: personnel.firstName,
        lastName: personnel.lastName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification du code 2FA", error });
  }
};

// Fonction de connexion
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const personnel = await Personnel.findOne({ email });
    if (!personnel) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    if (!personnel.isVerified) {
      return res.status(400).json({ message: "Veuillez vérifier votre email avant de vous connecter" });
    }

    const isMatch = await bcrypt.compare(password, personnel.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
        { email: personnel.email, role: personnel.role, id: personnel._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token: token,
      user: {
        id: personnel._id,
        email: personnel.email,
        role: personnel.role,
        firstName: personnel.firstName,
        lastName: personnel.lastName
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion", error });
  }
};

// Fonction de vérification du compte
const verifyAccount = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const personnel = await Personnel.findOne({ email: decoded.email });

    if (!personnel) {
      return res.status(400).json({ message: "Utilisateur non trouvé" });
    }

    personnel.isVerified = true;
    personnel.verificationToken = null;
    await personnel.save();

    res.status(200).json({ message: "Compte vérifié avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lien de vérification invalide ou expiré", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // No need for captchaToken anymore

    // Vérifier si l'email existe dans la base de données
    const personnel = await Personnel.findOne({ email });

    if (!personnel) {
      return res.status(404).json({ message: "Aucun compte associé à cet email" });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    personnel.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    personnel.resetPasswordExpires = Date.now() + 3600000; // 1 heure

    await personnel.save();

    const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${resetToken}`;

    // Envoi de l'email de réinitialisation
    await sendEmail({
      email: personnel.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien expirera dans 1 heure.</p>
      `,
    });

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé." });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Une erreur est survenue.", error: error.message });
  }
};


// Fonction pour afficher le formulaire de réinitialisation du mot de passe
const showResetPasswordForm = async (req, res) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const personnel = await Personnel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!personnel) {
      return res.status(400).json({ message: "Le token de réinitialisation est invalide ou a expiré" });
    }

    res.send(`
      <h1>Réinitialisation du mot de passe</h1>
      <form action="/auth/reset-password/${token}" method="POST">
        <input type="password" name="password" placeholder="Nouveau mot de passe" required>
        <button type="submit">Réinitialiser le mot de passe</button>
      </form>
    `);
  } catch (error) {
    console.error("Erreur lors de l'affichage du formulaire de réinitialisation:", error);
    res.status(500).json({ message: "Une erreur est survenue lors de l'affichage du formulaire", error: error.message });
  }
};

// Fonction de réinitialisation du mot de passe
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const personnel = await Personnel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!personnel) {
      return res.status(400).json({ message: "Le token de réinitialisation est invalide ou a expiré" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    personnel.password = hashedPassword;
    personnel.resetPasswordToken = undefined;
    personnel.resetPasswordExpires = undefined;

    await personnel.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la réinitialisation du mot de passe.", error: error.message });
  }
};

// Mise à jour d'un utilisateur
const updatePersonnel = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (firstName) {
      personnel.firstName = firstName;
    }
    if (lastName) {
      personnel.lastName = lastName;
    }
    if (email) {
      personnel.email = email;
    }
    if (password) {
      personnel.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      personnel.role = role;
    }

    await personnel.save();

    res.status(200).json({ message: "Utilisateur mis à jour avec succès", personnel });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la mise à jour de l'utilisateur", error: error.message });
  }
};

// Fonction de suppression d'un utilisateur
const deletePersonnel = async (req, res) => {
  const { id } = req.params;

  try {
    const personnel = await Personnel.findByIdAndDelete(id);
    if (!personnel) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ message: "Une erreur est survenue lors de la suppression de l'utilisateur", error: error.message });
  }
};
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Code à 6 chiffres
};
const sendSMS = async ({ phoneNumber, message }) => {
  const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log("SMS envoyé avec succès. SID:", result.sid);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    throw error;
  }
};
const verifyCode = async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    const personnel = await Personnel.findOne({ phoneNumber });

    if (!personnel) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (personnel.verificationCode !== code) {
      return res.status(400).json({ message: "Code de vérification incorrect." });
    }

    if (personnel.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: "Le code de vérification a expiré." });
    }

    // Marquer l'utilisateur comme vérifié
    personnel.isVerified = true;
    personnel.verificationCode = null;
    personnel.verificationCodeExpires = null;
    await personnel.save();

    res.status(200).json({ message: "Compte vérifié avec succès." });
  } catch (error) {
    console.error("Erreur lors de la vérification du code:", error);
    res.status(500).json({ message: "Erreur lors de la vérification du code", error: error.message });
  }
};
// Exportation des fonctions
module.exports = {
  register,
  login,
  verifyAccount,
  forgotPassword,
  showResetPasswordForm,
  resetPassword,
  updatePersonnel,
  deletePersonnel,
  verify2FA,
  activate2FA,
  verifyCode,
  sendSMS,
};