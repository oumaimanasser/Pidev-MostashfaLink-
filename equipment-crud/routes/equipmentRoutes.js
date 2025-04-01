const express = require("express");
const router = express.Router();
const {
    createEquipment,
    getAllEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    generateEquipmentList
} = require("../controllers/equipmentController");

// Route pour le PDF (doit être avant les routes avec paramètres)
router.get("/pdf", generateEquipmentList);

// Routes CRUD
router.post("/", createEquipment);
router.get("/", getAllEquipment);
router.get("/:id", getEquipmentById);
router.put("/:id", updateEquipment);
router.delete("/:id", deleteEquipment);

module.exports = router;