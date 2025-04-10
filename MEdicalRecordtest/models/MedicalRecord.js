import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
    idRecord: {
        type: Number,
        required: true,
        unique: true,
    },
    patientName: {
        type: String,
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
    vitals: {
        type: Object,
        default: {},
    },
    consultations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
    }],
}, {
    timestamps: true,
});

medicalRecordSchema.pre('save', function (next) {
    this.lastupdateDate = new Date();
    next();
});

const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;