const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom est obligatoire']
    },
    type: {
        type: String,
        required: [true, 'Le type est obligatoire']
    },
    capacity: {
        type: Number,
        required: [true, 'La capacité est obligatoire'],
        min: [1, 'La capacité doit être supérieure à 0']
    },
    status: {
        type: String,
        default: 'disponible',
        enum: ['disponible', 'en maintenance', 'hors service']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);