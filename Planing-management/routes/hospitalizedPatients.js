const express = require('express');
const router = express.Router();
const HospitalizedPatient = require('../models/HospitalizedPatient');

// Create
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

module.exports = router;