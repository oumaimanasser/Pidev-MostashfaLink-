const mongoose = require('mongoose');

const hospitalizedPatientSchema = new mongoose.Schema({
    idHospitalization: Number,
    idPatient: Number,
    admissionDate: Date,
    dischargeDate: Date,
    roomNumber: String,
    discharge: String
});

module.exports = mongoose.model('HospitalizedPatient', hospitalizedPatientSchema);