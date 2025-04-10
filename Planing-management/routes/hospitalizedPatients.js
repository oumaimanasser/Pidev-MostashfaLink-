const express = require('express');
const router = express.Router();
const HospitalizedPatient = require('../models/HospitalizedPatient');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('testEEE.pdf'));

doc.fontSize(16).text('Hello, this is a simple PDF!');
doc.end();
router.post('/add', async (req, res) => {
    const patient = new HospitalizedPatient(req.body);
    await patient.save();
    res.send(patient);
});

// Read All
router.get('/', async (req, res) => {
    const patients = await HospitalizedPatient.find();
    res.send(patients);
});

// Read One
router.get('/:id', async (req, res) => {
    const patient = await HospitalizedPatient.findById(req.params.id);
    res.send(patient);
});

// Update
router.put('/:id', async (req, res) => {
    const patient = await HospitalizedPatient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(patient);
});

// Delete
router.delete('/:id', async (req, res) => {
    await HospitalizedPatient.findByIdAndDelete(req.params.id);
    res.send({ message: 'Patient supprimé' });
});

router.get('/:id/report', async (req, res) => {
    try {
        const patient = await HospitalizedPatient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: "Patient non trouvé" });
        }

        const doc = new PDFDocument();

        // Set headers to serve the PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=rapport-${patient.idHospitalization}.pdf`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Add content to the PDF
        doc.fontSize(16).text('Rapport d’Hospitalisation');
        doc.moveDown();
        doc.text(`ID Patient : ${patient.idPatient}`);
        doc.text(`Date d'admission : ${patient.admissionDate}`);
        doc.text(`Date de sortie : ${patient.dischargeDate || 'Non sorti'}`);
        doc.text(`Chambre : ${patient.roomNumber}`);
        doc.text(`Sortie : ${patient.discharge}`);

        doc.end();

    } catch (err) {
        console.error('[Erreur générer PDF]', err);
        res.status(500).json({ error: 'Erreur génération PDF' });
    }
});



module.exports = router;