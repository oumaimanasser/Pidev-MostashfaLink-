const mongoose = require("mongoose");

const hospitalinfoSchema = new mongoose.Schema({
  idHospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital" },
  services: String,
  nbrLit: Number,
  departments: String,
});

module.exports = mongoose.model("Hospitalinfo", hospitalinfoSchema);
