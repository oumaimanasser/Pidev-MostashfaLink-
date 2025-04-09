import express from 'express';
import {
    getAllMedicalRecords,
    getMedicalRecordById,
    getMedicalRecordsByPatientId,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
} from '../controllers/medicalRecordController.js';

const router = express.Router();

// GET tous les dossiers médicaux
router.get('/', getAllMedicalRecords);

// GET un dossier médical par ID
router.get('/:id', getMedicalRecordById);

// GET les dossiers médicaux par ID de patient
router.get('/patient/:patientId', getMedicalRecordsByPatientId);

// POST un nouveau dossier médical
router.post('/', createMedicalRecord);

// PUT (mettre à jour) un dossier médical
router.put('/:id', updateMedicalRecord);

// DELETE un dossier médical
router.delete('/:id', deleteMedicalRecord);

export default router;