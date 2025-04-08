const mongoose = require("mongoose");

const hospitalInfoSchema = new mongoose.Schema({
  idHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
  services: { type: String, required: true },
  departments: { type: String, required: true },
  nbrLitTotal: { type: Number, required: true },
  nbrLitDispo: { type: Number, required: true }
});

module.exports = mongoose.model("Hospitalinfo", hospitalInfoSchema);
