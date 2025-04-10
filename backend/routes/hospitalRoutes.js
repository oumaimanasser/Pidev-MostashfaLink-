const express = require("express");
const mongoose = require("mongoose");

const Hospital = require("../models/Hospital");
const Hospitalinfo = require("../models/Hospitalinfo");



// Middleware pour valider les ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "ID invalide" });
  }
  next();
};
const router = express.Router();
const Doctor = require('../models/Doctor');





// ➤ GET All Hospitals
router.get("/", async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ GET One Hospital with Details
router.get("/:id", validateObjectId, async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }

    // Récupérer tous les Hospitalinfo associés à cet hôpital
    const details = await Hospitalinfo.find({ idHospital: req.params.id });
    res.json({ hospital, details });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ POST Create a Hospital
router.post("/", async (req, res) => {
  try {
    const newHospital = new Hospital(req.body);
    const savedHospital = await newHospital.save();
    res.status(201).json(savedHospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ POST Add Hospital Info
// ➤ POST Add Hospital Info
// POST Add Hospital Info (Version corrigée)
router.post("/:id/info", validateObjectId, async (req, res) => {
  try {
    console.log("Requête reçue:", req.body); // Vérifier les données envoyées
    
    const { services, departments, nbrLitTotal, nbrLitDispo } = req.body;

    if (typeof nbrLitTotal !== "number" || typeof nbrLitDispo !== "number") {
      return res.status(400).json({ message: "Les nombres de lits doivent être des nombres valides" });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }

    const newInfo = new Hospitalinfo({
      idHospital: req.params.id,
      services,
      departments,
      nbrLitTotal,
      nbrLitDispo
    });

    console.log("Données à enregistrer:", newInfo); // Vérifier les valeurs avant insertion

    const savedInfo = await newInfo.save();
    res.status(201).json(savedInfo);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    res.status(500).json({ message: error.message });
  }
});

// ➤ GET All Hospital Infos
router.get("/hospitalinfoss", async (req, res) => {
  try {
    const hospitalInfos = await Hospitalinfo.find().populate("idHospital", "name address phone capacity").exec();
    if (!hospitalInfos.length) {
      return res.status(404).json({ message: "Aucune information d'hôpital trouvée." });
    }

    const response = hospitalInfos.map(info => ({
      hospital: info.idHospital,
      services: info.services,
      nbrLit: info.nbrLit,
      departments: info.departments,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des infos des hôpitaux :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// ➤ PUT Update a Hospital
router.put("/:id", validateObjectId, async (req, res) => {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedHospital) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }
    res.json(updatedHospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ PUT Update Hospital Info
// ➤ PUT Update Hospital Info
router.put("/info/:id", validateObjectId, async (req, res) => {
  try {
    const { nbrLitTotal, nbrLitDispo } = req.body;

   

    const updatedInfo = await Hospitalinfo.findByIdAndUpdate(
      req.params.id,
      { ...req.body},
      { new: true }
    );

    if (!updatedInfo) {
      return res.status(404).json({ message: "Information non trouvée" });
    }

    res.json(updatedInfo);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
// ➤ GET Statistiques des Hôpitaux
// Dans votre fichier de routes (hospitalRoutes.js)
router.get("/stats", async (req, res) => {
  try {
    const stats = await Hospitalinfo.aggregate([
      {
        $group: {
          _id: null,
          totalLits: { $sum: "$nbrLitTotal" },
          totalDispo: { $sum: "$nbrLitDispo" },
         
        }
      }
    ]);
    
    if (!stats.length) {
      return res.status(404).json({ message: "Aucune donnée disponible" });
    }

    res.json({
      totalLits: stats[0].totalLits,
      totalDispo: stats[0].totalDispo,
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// ➤ DELETE a Hospital (Cascade delete HospitalInfo)
router.delete("/:id", validateObjectId, async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }

    // Supprimer tous les Hospitalinfo associés à cet hôpital
    await Hospitalinfo.deleteMany({ idHospital: req.params.id });
    res.json({ message: "Hôpital et ses détails supprimés" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ DELETE a Hospital Info
router.delete("/info/:id", validateObjectId, async (req, res) => {
  try {
    const deletedInfo = await Hospitalinfo.findByIdAndDelete(req.params.id);
    if (!deletedInfo) return res.status(404).json({ message: "Information non trouvée" });

    res.json({ message: "Information supprimée" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ➤ POST Ajouter des informations pour un hôpital
router.post("/hospitalinfo", async (req, res) => {
  try {
    const { idHospital, services, nbrLitTotal, departments , nbrLitDispo} = req.body;

    if (!idHospital || !services || !nbrLitTotal || !departments|| !nbrLitDispo) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const hospitalExists = await Hospital.findById(idHospital);
    if (!hospitalExists) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }

    const newInfo = new Hospitalinfo({ idHospital, services, nbrLitTotal, departments,nbrLitDispo });
    const savedInfo = await newInfo.save();
    
    res.status(201).json(savedInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/:id/info", validateObjectId, async (req, res) => {
  try {
    const { services, nbrLitTotal, departments,nbrLitDispo } = req.body;

    // Vérifier si l'hôpital existe
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ message: "Hôpital non trouvé" });
    }

    // Créer un nouvel objet Hospitalinfo
    const newInfo = new Hospitalinfo({
      idHospital: req.params.id,
      services,
      nbrLitTotal,
      
      departments,
      nbrLitDispo
    });

    const savedInfo = await newInfo.save();
    res.status(201).json(savedInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// routes/hospitalRoutes.js  /hospitals/:id/info
router.get("/hospitals/:id/info", validateObjectId, async (req, res) => {
  try {
    const hospitalInfos = await Hospitalinfo.find({ idHospital: req.params.id });
    res.json(hospitalInfos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;