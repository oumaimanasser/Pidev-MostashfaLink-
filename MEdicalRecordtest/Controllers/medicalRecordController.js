import MedicalRecord from '../models/MedicalRecord.js';

export const getAllMedicalRecords = async (req, res) => {
    try {
        const medicalRecords = await MedicalRecord.find();
        res.status(200).json(medicalRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMedicalRecordById = async (req, res) => {
    try {
        const medicalRecord = await MedicalRecord.findOne({ idRecord: req.params.id });
        if (!medicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json(medicalRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMedicalRecordsByPatientId = async (req, res) => {
    try {
        const medicalRecords = await MedicalRecord.find({ patientName: req.params.patientName });
        if (medicalRecords.length === 0) {
            return res.status(404).json({ message: 'No medical records found for this patient' });
        }
        res.status(200).json(medicalRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createMedicalRecord = async (req, res) => {
    try {
        const existingRecord = await MedicalRecord.findOne({ idRecord: req.body.idRecord });
        if (existingRecord) {
            return res.status(400).json({ message: 'A medical record with this ID already exists' });
        }
        const newMedicalRecord = new MedicalRecord(req.body);
        const savedMedicalRecord = await newMedicalRecord.save();
        res.status(201).json(savedMedicalRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateMedicalRecord = async (req, res) => {
    try {
        const updatedMedicalRecord = await MedicalRecord.findOneAndUpdate(
            { idRecord: req.params.id },
            { ...req.body, lastupdateDate: new Date() },
            { new: true }
        );
        if (!updatedMedicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json(updatedMedicalRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteMedicalRecord = async (req, res) => {
    try {
        const deletedMedicalRecord = await MedicalRecord.findOneAndDelete({ idRecord: req.params.id });
        if (!deletedMedicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};