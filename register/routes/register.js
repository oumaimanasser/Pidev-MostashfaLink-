const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const Personnel = require("../models/Personnel");

const router = express.Router();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Route d'inscription avec vérification par e-mail
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, contactInfo, role, password } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await Personnel.findOne({ contactInfo });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Générer un token de vérification
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Créer un nouvel utilisateur
    const newUser = new Personnel({
      firstName,
      lastName,
      contactInfo,
      role,
      password,
      verificationToken,
      isVerified: false,
    });

    // Sauvegarder l'utilisateur dans la base de données
    await newUser.save();

    // Construire l'URL de vérification
    const verificationUrl = `${process.env.BASE_URL}/verify/${verificationToken}`;

    // Envoyer un e-mail de confirmation
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactInfo,
      subject: "Vérification de votre compte",
      html: `<p>Bonjour ${firstName},</p>
             <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
             <a href="${verificationUrl}">Vérifier mon compte</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Utilisateur créé. Vérifiez votre email pour activer votre compte." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
});

module.exports = router;
