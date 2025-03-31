const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactInfo: { type: String, required: true },
    role: { type: String, required: true },
    disponibility: { type: Boolean, default: true },
    medicalHistory: { type: String },
    createdAt: { type: Date, default: Date.now },
    shiftStart: { type: Date },
    shiftEnd: { type: Date }
});

const Personnel = mongoose.model('Personnel', personnelSchema);

module.exports = Personnel;

