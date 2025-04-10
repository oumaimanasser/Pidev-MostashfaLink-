const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
    idPlanning: Number,
    idPersonnel: Number,
    interventionType: String,
    interventionDate: Date,
    status: String
});

module.exports = mongoose.model('Planning', planningSchema);