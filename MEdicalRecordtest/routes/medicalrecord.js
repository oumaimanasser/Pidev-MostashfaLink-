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

router.get('/', getAllMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.get('/patient/:patientName', getMedicalRecordsByPatientId);
router.post('/', createMedicalRecord);
router.put('/:id', updateMedicalRecord);
router.delete('/:id', deleteMedicalRecord);

export default router;