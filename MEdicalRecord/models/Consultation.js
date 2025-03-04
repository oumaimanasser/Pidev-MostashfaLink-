import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
    idConsultation: {
        type: Number,
        required: true,
        unique: true,
    },
    consultationDate: {
        type: Date,
        default: Date.now,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    doctor: {
        type: String,
        required: true,
    },
    prescription: {
        type: String,
        default: '',
    },
    treatment: {
        type: String,
        default: '',
    },
    medicalRecord: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalRecord', // Référence au dossier médical
        required: true,
    },
}, {
    timestamps: true,
});

// Mettre à jour la date de création avant de sauvegarder
consultationSchema.pre('save', function (next) {
    this.creationDate = new Date();
    next();
});

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;