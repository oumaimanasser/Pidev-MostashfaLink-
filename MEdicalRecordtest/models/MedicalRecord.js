import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    idRecord: {
        type: Number,
        required: true,
        unique: true,
    },
    idPatient: {
        type: String, // Changé en String pour correspondre à app.js et éviter conflits
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    lastupdateDate: {
        type: Date,
        default: Date.now,
    },
    allergies: {
        type: String,
        default: '',
    },
    medications: {
        type: String,
        default: '',
    },
    diagnostics: {
        type: String,
        default: '',
    },
    vitals: { // Ajouté pour la sauvegarde des signes vitaux
        type: Object,
        default: {},
    },
    consultations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation', // Référence au modèle Consultation
    }],
}, {
    timestamps: true,
});

// Mettre à jour la date de dernière modification avant de sauvegarder
medicalRecordSchema.pre('save', function (next) {
    this.lastupdateDate = new Date();
    next();
});

// Éviter la redéfinition du modèle
const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;