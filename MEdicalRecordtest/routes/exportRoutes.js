import express from 'express';
import { exportMedicalRecordPDF } from '../controllers/exportController.js';

const router = express.Router();

router.get('/medical-record/:recordId/pdf', exportMedicalRecordPDF);

export default router;