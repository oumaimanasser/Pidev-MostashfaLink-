import Consultation from '../models/Consultation.js';
import MedicalRecord from '../models/MedicalRecord.js';

// Créer une nouvelle consultation
export const createConsultation = async (req, res) => {
    try {
        const { medicalRecordId, idConsultation, doctor, prescription, treatment } = req.body;

        // Vérifier si le dossier médical existe
        const medicalRecord = await MedicalRecord.findById(medicalRecordId);
        if (!medicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        // Créer la consultation
        const newConsultation = new Consultation({
            idConsultation,
            doctor,
            prescription,
            treatment,
            medicalRecord: medicalRecordId,
        });

        // Sauvegarder la consultation
        const savedConsultation = await newConsultation.save();

        res.status(201).json(savedConsultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir toutes les consultations pour un dossier médical spécifique
export const getConsultationsByMedicalRecord = async (req, res) => {
    try {
        const { medicalRecordId } = req.params;

        // Vérifier si le dossier médical existe
        const medicalRecord = await MedicalRecord.findById(medicalRecordId);
        if (!medicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        // Trouver toutes les consultations liées à ce dossier médical
        const consultations = await Consultation.find({ medicalRecord: medicalRecordId });

        res.status(200).json(consultations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une consultation
export const updateConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const { doctor, prescription, treatment } = req.body;

        // Trouver et mettre à jour la consultation
        const updatedConsultation = await Consultation.findByIdAndUpdate(
            id,
            { doctor, prescription, treatment },
            { new: true }
        );

        if (!updatedConsultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        res.status(200).json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une consultation
export const deleteConsultation = async (req, res) => {
    try {
        const { id } = req.params;

        // Trouver et supprimer la consultation
        const deletedConsultation = await Consultation.findByIdAndDelete(id);

        if (!deletedConsultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        res.status(200).json({ message: 'Consultation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};