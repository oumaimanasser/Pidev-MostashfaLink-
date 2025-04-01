const PDFDocument = require('pdfkit');
const Equipment = require('../models/Equipment');

// Fonction de génération PDF
const generateEquipmentList = async (req, res) => {
    try {
        const equipments = await Equipment.find().lean();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=equipements.pdf');

        // En-tête
        doc.font('Helvetica-Bold')
            .fontSize(20)
            .text('LISTE DES ÉQUIPEMENTS', { align: 'center' })
            .moveDown();

        // Tableau
        let y = 150;
        equipments.forEach(equip => {
            doc.font('Helvetica')
                .fontSize(12)
                .text(`${equip.name || '-'}`, 50, y)
                .text(`${equip.type || '-'}`, 200, y)
                .text(`${equip.status || '-'}`, 350, y);
            y += 30;
        });

        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).send('Erreur de génération');
    }
};

// Fonctions CRUD de base
const createEquipment = async (req, res) => {
    try {
        const newEquipment = await Equipment.create(req.body);
        res.status(201).json(newEquipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllEquipment = async (req, res) => {
    try {
        const equipments = await Equipment.find();
        res.json(equipments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Équipement non trouvé' });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateEquipment = async (req, res) => {
    try {
        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEquipment) return res.status(404).json({ message: 'Équipement non trouvé' });
        res.json(updatedEquipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEquipment = async (req, res) => {
    try {
        const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!deletedEquipment) return res.status(404).json({ message: 'Équipement non trouvé' });
        res.json({ message: 'Équipement supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export de toutes les fonctions
module.exports = {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    generateEquipmentList
};