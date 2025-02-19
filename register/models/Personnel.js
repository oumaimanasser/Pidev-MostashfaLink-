const mongoose = require("mongoose");

const PersonnelSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactInfo: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  disponibilite: { type: Boolean, default: true },
  medicalHistory: { type: String, default: "" },
   medicalHistory: { type: String, default: "" },
  shiftStart: { type: Date },
  shiftEnd: { type: Date },
  isVerified: { type: Boolean, default: false }, // Ajout du champ pour la vérification
  verificationToken: { type: String }, // Stocke le jeton de vérification
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Personnel", PersonnelSchema);
