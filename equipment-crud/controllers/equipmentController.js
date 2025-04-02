const PDFDocument = require('pdfkit');
const Equipment = require('../models/Equipment');

// 📄 Génération de la liste PDF
const generateEquipmentList = async (req, res) => {
    try {
        const equipments = await Equipment.find().lean();

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=equipements.pdf');

        doc.font('Helvetica-Bold')
            .fontSize(20)
            .text('LISTE DES ÉQUIPEMENTS', { align: 'center' })
            .moveDown();

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

// ➕ Ajouter un équipement
const createEquipment = async (req, res) => {
    try {
        const newEquipment = await Equipment.create(req.body);
        res.status(201).json(newEquipment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 📥 Récupérer tous les équipements avec recherche + pagination
const getAllEquipment = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 5 } = req.query;

        const query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } }
            ]
        };

        const equipments = await Equipment.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Equipment.countDocuments(query);

        res.json({
            data: equipments,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📥 Récupérer un équipement par ID
const getEquipmentById = async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json({ message: 'Équipement non trouvé' });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔄 Modifier un équipement
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

// ❌ Supprimer un équipement
const deleteEquipment = async (req, res) => {
    try {
        const deletedEquipment = await Equipment.findByIdAndDelete(req.params.id);
        if (!deletedEquipment) return res.status(404).json({ message: 'Équipement non trouvé' });
        res.json({ message: 'Équipement supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    generateEquipmentList
};
