import express from 'express';
import {
    createConsultation,
    getConsultationsByMedicalRecord,
    updateConsultation,
    deleteConsultation,
} from '../controllers/consultationController.js';

const router = express.Router();

// POST une nouvelle consultation
router.post('/', createConsultation);

// GET toutes les consultations pour un dossier médical spécifique
router.get('/:medicalRecordId/consultations', getConsultationsByMedicalRecord);

// PUT (mettre à jour) une consultation
router.put('/:id', updateConsultation);

// DELETE une consultation
router.delete('/:id', deleteConsultation);

export default router;