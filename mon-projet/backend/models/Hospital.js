const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  capacity: Number,
});

module.exports = mongoose.model("Hospital", hospitalSchema);
