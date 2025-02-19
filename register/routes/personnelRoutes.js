const express = require("express");
const router = express.Router();
const Personnel = require("../models/Personnel");
const personnelSchema = require("../models/validation");
const mongoose = require("mongoose");

// Middleware de validation
const validateInput = (req, res, next) => {
  const { error } = personnelSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      message: "Données invalides",
      errors: error.details.map((err) => err.message),
    });
  }
  next();
};

// Route d'ajout
router.post("/add", validateInput, async (req, res) => {
  try {
    const personnel = new Personnel(req.body);
    await personnel.save();
    res.status(201).json({ message: "Personnel enregistré avec succès", personnel });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription", error });
  }
});

// Route de mise à jour
router.put("/update/:id", validateInput, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const personnel = await Personnel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!personnel) {
      return res.status(404).json({ message: "Personnel non trouvé" });
    }

    res.status(200).json({ message: "Personnel mis à jour avec succès", personnel });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour", error });
  }
});

// Route de suppression
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const personnel = await Personnel.findByIdAndDelete(id);

    if (!personnel) {
      return res.status(404).json({ message: "Personnel non trouvé" });
    }

    res.status(200).json({ message: "Personnel supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
});

module.exports = router;
