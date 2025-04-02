const Personnel = require('../models/personnelModel');

// ➕ Créer un personnel
exports.createPersonnel = async (req, res) => {
    try {
        const personnel = new Personnel(req.body);
        await personnel.save();
        res.status(201).json(personnel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// 📥 Récupérer tous les personnels avec recherche, filtre par rôle et pagination
exports.getAllPersonnel = async (req, res) => {
    try {
        const { search = '', role = '', page = 1, limit = 5 } = req.query;

        let query = {
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { role: { $regex: search, $options: 'i' } }
            ]
        };

        if (role) {
            query = {
                $and: [query, { role: { $regex: role, $options: 'i' } }]
            };
        }

        const personnels = await Personnel.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Personnel.countDocuments(query);

        res.status(200).json({
            data: personnels,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📥 Récupérer un personnel par ID
exports.getPersonnelById = async (req, res) => {
    try {
        const personnel = await Personnel.findById(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé' });
        }
        res.status(200).json(personnel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔄 Mettre à jour un personnel
exports.updatePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé' });
        }
        res.status(200).json(personnel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ❌ Supprimer un personnel
exports.deletePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByIdAndDelete(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé' });
        }
        res.status(200).json({ message: 'Personnel supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📅 Récupérer uniquement les shifts
exports.getAllShifts = async (req, res) => {
    try {
        const shifts = await Personnel.find({}, 'firstName lastName shiftStart shiftEnd');
        res.status(200).json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
